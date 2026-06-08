const cds = require('@sap/cds');
const { logCreate, logStatusChange, logFieldChanges } = require('./lib/audit-log');
const {
  PO_STATUS_TRANSITIONS,
  isValidTransition,
  validateRequired,
  validatePositive,
  validateDateRange
} = require('./lib/validations');

class OrderServiceHandler extends cds.ApplicationService {
  init() {
    const { PurchaseOrders, PurchaseOrderItems } = this.entities;

    // ================================================================
    // PURCHASE ORDER VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'SAVE'], PurchaseOrders, (req) => {
      const data = req.data;

      // Required fields
      validateRequired(data, [
        { field: 'poNumber', label: 'PO Number' },
        { field: 'supplier_ID', label: 'Supplier' },
        { field: 'orderType_ID', label: 'Order Type' }
      ], req);

      // Default status on creation
      if (!data.status) data.status = 'Draft';

      // Only Draft status allowed on creation
      if (data.status && data.status !== 'Draft') {
        req.error(400, 'New purchase orders must start in Draft status', 'status');
      }

      // Date validations
      validateDateRange(data, 'deliveryStartDate', 'deliveryEndDate', 'Delivery dates', req);
      validateDateRange(data, 'validityStartDate', 'validityEndDate', 'Validity dates', req);
    });

    this.before('UPDATE', PurchaseOrders, async (req) => {
      const data = req.data;
      const ID = data.ID;

      if (ID && data.status) {
        // Load current record to check status transitions
        const current = await SELECT.one.from(PurchaseOrders).where({ ID });
        if (current && current.status !== data.status) {
          if (!isValidTransition(current.status, data.status, PO_STATUS_TRANSITIONS)) {
            req.error(400, `Cannot transition from '${current.status}' to '${data.status}'. Allowed: ${PO_STATUS_TRANSITIONS[current.status].join(', ') || 'none'}`, 'status');
          }
        }

        // Prevent editing of closed/cancelled orders
        if (current && (current.status === 'Closed' || current.status === 'Cancelled')) {
          req.error(400, `Cannot modify a ${current.status} purchase order`);
        }
      }

      // Date validations
      if (data.deliveryStartDate || data.deliveryEndDate) {
        validateDateRange(data, 'deliveryStartDate', 'deliveryEndDate', 'Delivery dates', req);
      }
      if (data.validityStartDate || data.validityEndDate) {
        validateDateRange(data, 'validityStartDate', 'validityEndDate', 'Validity dates', req);
      }
    });

    // ================================================================
    // PO ITEM VALIDATIONS & COMPUTED FIELDS
    // ================================================================

    this.before(['CREATE', 'UPDATE', 'NEW', 'PATCH', 'SAVE'], PurchaseOrderItems, async (req) => {
      const data = req.data;

      // Validate positive values
      validatePositive(data, [
        { field: 'volume', label: 'Volume' },
        { field: 'unitPrice', label: 'Unit Price' },
        { field: 'netValue', label: 'Net Value' }
      ], req);

      // Auto-compute net value if volume and unit price are provided
      if (data.volume != null && data.unitPrice != null) {
        data.netValue = Number(data.volume) * Number(data.unitPrice);
      }
    });

    // Also compute on SAVE of root entity (draft activation)
    this.before('SAVE', PurchaseOrders, async (req) => {
      const data = req.data;
      if (data.items && data.items.length > 0) {
        let total = 0;
        for (const item of data.items) {
          if (item.volume != null && item.unitPrice != null) {
            item.netValue = Number(item.volume) * Number(item.unitPrice);
          }
          total += Number(item.netValue) || 0;
        }
        data.totalNetValue = total;
      }
    });

    // ================================================================
    // AUTO-COMPUTE PO TOTAL NET VALUE (after item changes)
    // ================================================================

    this.after(['CREATE', 'UPDATE', 'DELETE'], PurchaseOrderItems, async (_, req) => {
      // Recalculate PO total when items change
      const poItemData = req.data;
      if (!poItemData || !poItemData.purchaseOrder_ID) return;

      const poId = poItemData.purchaseOrder_ID;
      const items = await SELECT.from(PurchaseOrderItems).where({ purchaseOrder_ID: poId });
      const total = items.reduce((sum, item) => sum + (Number(item.netValue) || 0), 0);

      await UPDATE(PurchaseOrders).set({ totalNetValue: total }).where({ ID: poId });
    });

    // ================================================================
    // STATUS CRITICALITY (virtual field for UI coloring)
    // ================================================================

    this.after('READ', PurchaseOrders, (results) => {
      const items = Array.isArray(results) ? results : [results];
      for (const po of items) {
        if (!po) continue;
        switch (po.status) {
          case 'Active':    po.statusCriticality = 3; break; // Green
          case 'Draft':     po.statusCriticality = 2; break; // Yellow
          case 'Pending':   po.statusCriticality = 2; break; // Yellow
          case 'Closed':    po.statusCriticality = 0; break; // Neutral
          case 'Cancelled': po.statusCriticality = 1; break; // Red
          default:          po.statusCriticality = 0;
        }
      }
    });

    // ================================================================
    // STATUS TRANSITION ACTIONS
    // ================================================================

    this.on('submitPurchaseOrder', async (req) => {
      const { poId } = req.data;
      const po = await SELECT.one.from(PurchaseOrders).where({ ID: poId });

      if (!po) return req.error(404, 'Purchase order not found');
      if (po.status !== 'Draft') {
        return req.error(400, `Cannot submit: PO is in '${po.status}' status. Must be 'Draft'.`);
      }

      // Validate PO has at least one item before submission
      const itemCount = await SELECT.one.from(PurchaseOrderItems)
        .columns('count(*) as cnt').where({ purchaseOrder_ID: poId });
      if (!itemCount || itemCount.cnt === 0) {
        return req.error(400, 'Cannot submit: PO must have at least one line item');
      }

      await UPDATE(PurchaseOrders).set({ status: 'Pending' }).where({ ID: poId });
      await logStatusChange({ entityType: 'PurchaseOrder', entityId: poId, oldStatus: 'Draft', newStatus: 'Pending', req });

      return SELECT.one.from(PurchaseOrders).where({ ID: poId });
    });

    this.on('approvePurchaseOrder', async (req) => {
      const { poId } = req.data;
      const po = await SELECT.one.from(PurchaseOrders).where({ ID: poId });

      if (!po) return req.error(404, 'Purchase order not found');
      if (po.status !== 'Pending') {
        return req.error(400, `Cannot approve: PO is in '${po.status}' status. Must be 'Pending'.`);
      }

      // Validate PO has at least one item
      const itemCount = await SELECT.one.from(PurchaseOrderItems)
        .columns('count(*) as cnt').where({ purchaseOrder_ID: poId });
      if (!itemCount || itemCount.cnt === 0) {
        return req.error(400, 'Cannot approve: PO must have at least one line item');
      }

      await UPDATE(PurchaseOrders).set({ status: 'Active' }).where({ ID: poId });
      await logStatusChange({ entityType: 'PurchaseOrder', entityId: poId, oldStatus: 'Pending', newStatus: 'Active', req });

      return SELECT.one.from(PurchaseOrders).where({ ID: poId });
    });

    this.on('rejectPurchaseOrder', async (req) => {
      const { poId } = req.data;
      const po = await SELECT.one.from(PurchaseOrders).where({ ID: poId });

      if (!po) return req.error(404, 'Purchase order not found');
      if (po.status !== 'Pending') {
        return req.error(400, `Cannot reject: PO is in '${po.status}' status. Must be 'Pending'.`);
      }

      await UPDATE(PurchaseOrders).set({ status: 'Draft' }).where({ ID: poId });
      await logStatusChange({ entityType: 'PurchaseOrder', entityId: poId, oldStatus: 'Pending', newStatus: 'Draft', req });

      return SELECT.one.from(PurchaseOrders).where({ ID: poId });
    });

    this.on('closePurchaseOrder', async (req) => {
      const { poId } = req.data;
      const po = await SELECT.one.from(PurchaseOrders).where({ ID: poId });

      if (!po) return req.error(404, 'Purchase order not found');
      if (po.status !== 'Active') {
        return req.error(400, `Cannot close: PO is in '${po.status}' status. Must be 'Active'.`);
      }

      await UPDATE(PurchaseOrders).set({ status: 'Closed' }).where({ ID: poId });
      await logStatusChange({ entityType: 'PurchaseOrder', entityId: poId, oldStatus: 'Active', newStatus: 'Closed', req });

      return SELECT.one.from(PurchaseOrders).where({ ID: poId });
    });

    this.on('cancelPurchaseOrder', async (req) => {
      const { poId } = req.data;
      const po = await SELECT.one.from(PurchaseOrders).where({ ID: poId });

      if (!po) return req.error(404, 'Purchase order not found');
      if (!['Draft', 'Pending'].includes(po.status)) {
        return req.error(400, `Cannot cancel: PO is in '${po.status}' status. Must be 'Draft' or 'Pending'.`);
      }

      await UPDATE(PurchaseOrders).set({ status: 'Cancelled' }).where({ ID: poId });
      await logStatusChange({ entityType: 'PurchaseOrder', entityId: poId, oldStatus: po.status, newStatus: 'Cancelled', req });

      return SELECT.one.from(PurchaseOrders).where({ ID: poId });
    });

    // ================================================================
    // NOTES - auto-populate createdByName
    // ================================================================

    const { Notes } = this.entities;
    this.before('CREATE', Notes, (req) => {
      if (!req.data.createdByName) {
        req.data.createdByName = req.user?.id || 'Unknown';
      }
    });

    this.after('CREATE', Notes, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'Note', entityId: data.ID, description: `Note [${data.noteType}] on ${data.entityType}: ${data.subject}`, req });
      }
    });

    // ================================================================
    // AUDIT LOGGING FOR CREATE
    // ================================================================

    this.after('CREATE', PurchaseOrders, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'PurchaseOrder', entityId: data.ID, description: `PO ${data.poNumber} created`, req });
      }
    });

    return super.init();
  }
}

module.exports = OrderServiceHandler;
