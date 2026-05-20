const cds = require('@sap/cds');
const { logCreate, logStatusChange } = require('./lib/audit-log');
const {
  INVOICE_STATUS_TRANSITIONS,
  isValidTransition,
  validateRequired,
  validatePositive
} = require('./lib/validations');

class InvoiceServiceHandler extends cds.ApplicationService {
  init() {
    const { Invoices, InvoiceLines, PurchaseOrderItems } = this.entities;

    // ================================================================
    // INVOICE HEADER VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'SAVE'], Invoices, (req) => {
      const data = req.data;

      validateRequired(data, [
        { field: 'invoiceNumber', label: 'Invoice Number' },
        { field: 'invoiceDate', label: 'Invoice Date' },
        { field: 'supplier_ID', label: 'Supplier' },
        { field: 'currency_code', label: 'Currency' }
      ], req);

      validatePositive(data, [
        { field: 'netValue', label: 'Net Value' },
        { field: 'taxValue', label: 'Tax Value' },
        { field: 'grossValue', label: 'Gross Value' }
      ], req);

      // Default status
      if (!data.status) data.status = 'Received';

      // Only Received status allowed on creation
      if (data.status && data.status !== 'Received') {
        req.error(400, 'New invoices must start in Received status', 'status');
      }

      // Auto-compute gross value if net and tax are provided
      if (data.netValue != null && data.taxValue != null && data.grossValue == null) {
        data.grossValue = Number(data.netValue) + Number(data.taxValue);
      }
    });

    // Compute gross value and validate over-billing on SAVE (draft activation)
    this.before('SAVE', Invoices, async (req) => {
      const data = req.data;
      // Auto-compute gross
      if (data.netValue != null && data.taxValue != null) {
        data.grossValue = Number(data.netValue) + Number(data.taxValue);
      }
      // Sum lines into header if lines exist
      if (data.lines && data.lines.length > 0) {
        let linesTotal = 0;
        for (const line of data.lines) {
          if (line.quantity != null && line.unitPrice != null) {
            line.netValue = Number(line.quantity) * Number(line.unitPrice);
          }
          linesTotal += Number(line.netValue) || 0;

          // Over-billing check for each line linked to a PO item
          if (line.poItem_ID) {
            const poItem = await SELECT.one.from(PurchaseOrderItems).where({ ID: line.poItem_ID });
            if (poItem) {
              // Get ALL existing active invoice lines for this PO item (excluding this invoice's lines)
              const existingLines = await SELECT.from(InvoiceLines).where({
                poItem_ID: line.poItem_ID,
                invoice_ID: { '!=': data.ID }
              });
              const alreadyInvoiced = existingLines.reduce((sum, l) => sum + (Number(l.netValue) || 0), 0);
              const poItemValue = Number(poItem.netValue) || 0;
              const thisLineValue = Number(line.netValue) || 0;
              const totalAfter = alreadyInvoiced + thisLineValue;

              if (poItemValue > 0 && totalAfter > poItemValue) {
                const remaining = poItemValue - alreadyInvoiced;
                req.error(400,
                  `Over-billing on line ${line.lineNumber || '?'}: PO Item value ${poItemValue}, already invoiced ${alreadyInvoiced.toFixed(2)}, remaining ${remaining.toFixed(2)}. This line (${thisLineValue.toFixed(2)}) exceeds capacity.`,
                  `lines/netValue`
                );
              }
            }
          }
        }
        data.netValue = linesTotal;
        data.grossValue = linesTotal + (Number(data.taxValue) || 0);
      }
    });

    this.before('UPDATE', Invoices, async (req) => {
      const data = req.data;
      const ID = data.ID;

      if (ID && data.status) {
        const current = await SELECT.one.from(Invoices).where({ ID });
        if (current && current.status !== data.status) {
          if (!isValidTransition(current.status, data.status, INVOICE_STATUS_TRANSITIONS)) {
            req.error(400, `Cannot transition from '${current.status}' to '${data.status}'. Allowed: ${INVOICE_STATUS_TRANSITIONS[current.status].join(', ') || 'none'}`, 'status');
          }
        }

        // Prevent editing of paid invoices
        if (current && current.status === 'Paid') {
          req.error(400, 'Cannot modify a paid invoice');
        }
      }

      // Recompute gross value if net or tax changed
      if (data.netValue != null || data.taxValue != null) {
        const current = ID ? await SELECT.one.from(Invoices).where({ ID }) : null;
        const netVal = data.netValue != null ? Number(data.netValue) : (current ? Number(current.netValue) : 0);
        const taxVal = data.taxValue != null ? Number(data.taxValue) : (current ? Number(current.taxValue) : 0);
        data.grossValue = netVal + taxVal;
      }
    });

    // ================================================================
    // INVOICE LINE VALIDATIONS & OVER-BILLING PREVENTION
    // ================================================================

    this.before(['CREATE', 'UPDATE'], InvoiceLines, async (req) => {
      const data = req.data;

      validatePositive(data, [
        { field: 'quantity', label: 'Quantity' },
        { field: 'unitPrice', label: 'Unit Price' },
        { field: 'netValue', label: 'Net Value' }
      ], req);

      // Auto-compute line net value
      if (data.quantity != null && data.unitPrice != null && data.netValue == null) {
        data.netValue = Number(data.quantity) * Number(data.unitPrice);
      }

      // Over-billing validation: check if invoice line exceeds remaining PO item value
      if (data.poItem_ID) {
        await this._validateOverBilling(data, req);
      }
    });

    // ================================================================
    // AUTO-COMPUTE INVOICE TOTAL (sum of lines)
    // ================================================================

    this.after(['CREATE', 'UPDATE', 'DELETE'], InvoiceLines, async (_, req) => {
      const lineData = req.data;
      if (!lineData || !lineData.invoice_ID) return;

      const invoiceId = lineData.invoice_ID;
      const lines = await SELECT.from(InvoiceLines).where({ invoice_ID: invoiceId });
      const total = lines.reduce((sum, line) => sum + (Number(line.netValue) || 0), 0);

      // Update invoice net value from lines
      const invoice = await SELECT.one.from(Invoices).where({ ID: invoiceId });
      if (invoice) {
        const taxValue = Number(invoice.taxValue) || 0;
        await UPDATE(Invoices).set({
          netValue: total,
          grossValue: total + taxValue
        }).where({ ID: invoiceId });
      }
    });

    // ================================================================
    // STATUS CRITICALITY
    // ================================================================

    this.after('READ', Invoices, (results) => {
      const items = Array.isArray(results) ? results : [results];
      for (const inv of items) {
        if (!inv) continue;
        switch (inv.status) {
          case 'Approved':        inv.statusCriticality = 3; break;
          case 'Paid':            inv.statusCriticality = 3; break;
          case 'Received':        inv.statusCriticality = 2; break;
          case 'PendingApproval': inv.statusCriticality = 2; break;
          case 'Rejected':        inv.statusCriticality = 1; break;
          default:                inv.statusCriticality = 0;
        }
      }
    });

    // ================================================================
    // APPROVAL WORKFLOW ACTIONS
    // ================================================================

    this.on('submitForApproval', async (req) => {
      const { invoiceId } = req.data;
      const invoice = await SELECT.one.from(Invoices).where({ ID: invoiceId });

      if (!invoice) return req.error(404, 'Invoice not found');
      if (invoice.status !== 'Received') {
        return req.error(400, `Cannot submit: Invoice is in '${invoice.status}' status. Must be 'Received'.`);
      }

      // Validate invoice has at least one line
      const lineCount = await SELECT.one.from(InvoiceLines)
        .columns('count(*) as cnt').where({ invoice_ID: invoiceId });
      if (!lineCount || lineCount.cnt === 0) {
        return req.error(400, 'Cannot submit: Invoice must have at least one line item');
      }

      await UPDATE(Invoices).set({ status: 'PendingApproval' }).where({ ID: invoiceId });
      await logStatusChange({ entityType: 'Invoice', entityId: invoiceId, oldStatus: 'Received', newStatus: 'PendingApproval', req });

      return SELECT.one.from(Invoices).where({ ID: invoiceId });
    });

    this.on('approveInvoice', async (req) => {
      const { invoiceId } = req.data;
      const invoice = await SELECT.one.from(Invoices).where({ ID: invoiceId });

      if (!invoice) return req.error(404, 'Invoice not found');
      if (invoice.status !== 'PendingApproval') {
        return req.error(400, `Cannot approve: Invoice is in '${invoice.status}' status. Must be 'PendingApproval'.`);
      }

      // Validate invoice has at least one line
      const lineCount = await SELECT.one.from(InvoiceLines)
        .columns('count(*) as cnt').where({ invoice_ID: invoiceId });
      if (!lineCount || lineCount.cnt === 0) {
        return req.error(400, 'Cannot approve: Invoice must have at least one line item');
      }

      await UPDATE(Invoices).set({ status: 'Approved' }).where({ ID: invoiceId });
      await logStatusChange({ entityType: 'Invoice', entityId: invoiceId, oldStatus: 'PendingApproval', newStatus: 'Approved', req });

      return SELECT.one.from(Invoices).where({ ID: invoiceId });
    });

    this.on('rejectInvoice', async (req) => {
      const { invoiceId } = req.data;
      const invoice = await SELECT.one.from(Invoices).where({ ID: invoiceId });

      if (!invoice) return req.error(404, 'Invoice not found');
      if (invoice.status !== 'PendingApproval') {
        return req.error(400, `Cannot reject: Invoice is in '${invoice.status}' status. Must be 'PendingApproval'.`);
      }

      await UPDATE(Invoices).set({ status: 'Rejected' }).where({ ID: invoiceId });
      await logStatusChange({ entityType: 'Invoice', entityId: invoiceId, oldStatus: 'PendingApproval', newStatus: 'Rejected', req });

      return SELECT.one.from(Invoices).where({ ID: invoiceId });
    });

    this.on('markAsPaid', async (req) => {
      const { invoiceId } = req.data;
      const invoice = await SELECT.one.from(Invoices).where({ ID: invoiceId });

      if (!invoice) return req.error(404, 'Invoice not found');
      if (invoice.status !== 'Approved') {
        return req.error(400, `Cannot mark as paid: Invoice is in '${invoice.status}' status. Must be 'Approved'.`);
      }

      await UPDATE(Invoices).set({ status: 'Paid' }).where({ ID: invoiceId });
      await logStatusChange({ entityType: 'Invoice', entityId: invoiceId, oldStatus: 'Approved', newStatus: 'Paid', req });

      return SELECT.one.from(Invoices).where({ ID: invoiceId });
    });

    // ================================================================
    // AUDIT LOGGING
    // ================================================================

    this.after('CREATE', Invoices, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'Invoice', entityId: data.ID, description: `Invoice ${data.invoiceNumber} created`, req });
      }
    });

    return super.init();
  }

  // ================================================================
  // PRIVATE: Over-billing validation
  // ================================================================

  async _validateOverBilling(lineData, req) {
    const { PurchaseOrderItems, InvoiceLines } = this.entities;

    const poItem = await SELECT.one.from(PurchaseOrderItems).where({ ID: lineData.poItem_ID });
    if (!poItem) {
      req.error(400, 'Referenced PO Item does not exist', 'poItem_ID');
      return;
    }

    // Get all existing invoice lines for this PO item (excluding current line if updating)
    let existingLines = await SELECT.from(InvoiceLines).where({ poItem_ID: lineData.poItem_ID });
    if (lineData.ID) {
      existingLines = existingLines.filter(l => l.ID !== lineData.ID);
    }

    const alreadyInvoiced = existingLines.reduce((sum, l) => sum + (Number(l.netValue) || 0), 0);
    const thisLineValue = Number(lineData.netValue) || (Number(lineData.quantity || 0) * Number(lineData.unitPrice || 0));
    const totalAfter = alreadyInvoiced + thisLineValue;
    const poItemValue = Number(poItem.netValue) || 0;

    if (poItemValue > 0 && totalAfter > poItemValue) {
      const remaining = poItemValue - alreadyInvoiced;
      req.error(400,
        `Over-billing detected: PO Item value is ${poItemValue}, already invoiced ${alreadyInvoiced.toFixed(2)}, remaining ${remaining.toFixed(2)}. This line (${thisLineValue.toFixed(2)}) exceeds the remaining amount.`,
        'netValue'
      );
    }
  }
}

module.exports = InvoiceServiceHandler;
