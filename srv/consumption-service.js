const cds = require('@sap/cds');
const { logCreate } = require('./lib/audit-log');
const {
  validateRequired,
  validatePositive,
  validateDateRange,
  validatePercentage
} = require('./lib/validations');

class ConsumptionServiceHandler extends cds.ApplicationService {
  init() {
    const { ConsumptionAllocations, AllocationSplits, Consultants, PurchaseOrderItems } = this.entities;

    // ================================================================
    // CONSUMPTION ALLOCATION VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'UPDATE'], ConsumptionAllocations, async (req) => {
      const data = req.data;

      // Validate positive values
      validatePositive(data, [
        { field: 'plannedFte', label: 'Planned FTE' },
        { field: 'actualFte', label: 'Actual FTE' },
        { field: 'consumedVolume', label: 'Consumed Volume' },
        { field: 'consumedValue', label: 'Consumed Value' }
      ], req);

      // Date validations
      validateDateRange(data, 'plannedStartDate', 'plannedEndDate', 'Planned dates', req);
      validateDateRange(data, 'actualStartDate', 'actualEndDate', 'Actual dates', req);

      // Validate against PO Item capacity (remaining volume/value)
      if (data.poItem_ID && (data.consumedVolume != null || data.consumedValue != null)) {
        await this._validateCapacity(data, req);
      }

      // Auto-compute consumed value from volume and PO item unit price
      if (data.poItem_ID && data.consumedVolume != null && data.consumedValue == null) {
        const poItem = await SELECT.one.from(PurchaseOrderItems).where({ ID: data.poItem_ID });
        if (poItem && poItem.unitPrice) {
          data.consumedValue = Number(data.consumedVolume) * Number(poItem.unitPrice);
        }
      }
    });

    this.before(['CREATE', 'SAVE'], ConsumptionAllocations, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'poItem_ID', label: 'PO Item' },
        { field: 'consumingChapterArea_ID', label: 'Consuming Chapter Area' },
        { field: 'resourcePool_ID', label: 'Resource Pool' },
        { field: 'costCenter_ID', label: 'Cost Center' }
      ], req);
    });

    // ================================================================
    // ALLOCATION SPLIT VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'UPDATE'], AllocationSplits, async (req) => {
      const data = req.data;

      // Validate percentage range
      validatePercentage(data, 'splitPercentage', 'Split Percentage', req);

      validatePositive(data, [
        { field: 'fteShare', label: 'FTE Share' },
        { field: 'valueShare', label: 'Value Share' }
      ], req);

      // Validate total splits don't exceed 100%
      if (data.allocation_ID && data.splitPercentage != null) {
        await this._validateTotalSplitPercentage(data, req);
      }
    });

    this.before('CREATE', AllocationSplits, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'allocation_ID', label: 'Allocation' },
        { field: 'customer_ID', label: 'Customer' },
        { field: 'splitPercentage', label: 'Split Percentage' }
      ], req);
    });

    // ================================================================
    // AUTO-COMPUTE SPLIT VALUES (after allocation changes)
    // ================================================================

    this.after(['CREATE', 'UPDATE'], AllocationSplits, async (result, req) => {
      if (!result || !result.allocation_ID) return;

      // Recalculate FTE and value shares based on percentage
      const allocation = await SELECT.one.from(ConsumptionAllocations)
        .where({ ID: result.allocation_ID });

      if (allocation) {
        const splits = await SELECT.from(AllocationSplits)
          .where({ allocation_ID: result.allocation_ID });

        for (const split of splits) {
          const pct = Number(split.splitPercentage) / 100;
          const fteShare = (Number(allocation.actualFte) || Number(allocation.plannedFte) || 0) * pct;
          const valueShare = (Number(allocation.consumedValue) || 0) * pct;

          await UPDATE(AllocationSplits).set({
            fteShare: Math.round(fteShare * 100) / 100,
            valueShare: Math.round(valueShare * 100) / 100
          }).where({ ID: split.ID });
        }
      }
    });

    // ================================================================
    // CONSULTANT VALIDATIONS
    // ================================================================

    this.before('CREATE', Consultants, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'firstName', label: 'First Name' },
        { field: 'lastName', label: 'Last Name' }
      ], req);

      if (!data.isActive && data.isActive !== false) data.isActive = true;
    });

    // ================================================================
    // AUDIT LOGGING
    // ================================================================

    this.after('CREATE', ConsumptionAllocations, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'ConsumptionAllocation', entityId: data.ID, description: `Allocation for project ${data.plwProjectNumber || 'N/A'} created`, req });
      }
    });

    this.after('CREATE', Consultants, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'Consultant', entityId: data.ID, description: `Consultant ${data.firstName} ${data.lastName} created`, req });
      }
    });

    return super.init();
  }

  // ================================================================
  // PRIVATE: Validate consumption doesn't exceed PO item capacity
  // ================================================================

  async _validateCapacity(data, req) {
    const { PurchaseOrderItems, ConsumptionAllocations } = this.entities;

    const poItem = await SELECT.one.from(PurchaseOrderItems).where({ ID: data.poItem_ID });
    if (!poItem) return;

    // Get all existing allocations for this PO item (excluding current)
    let existingAllocations = await SELECT.from(ConsumptionAllocations)
      .where({ poItem_ID: data.poItem_ID });
    if (data.ID) {
      existingAllocations = existingAllocations.filter(a => a.ID !== data.ID);
    }

    // Volume check
    if (data.consumedVolume != null && poItem.volume) {
      const alreadyConsumed = existingAllocations.reduce((sum, a) => sum + (Number(a.consumedVolume) || 0), 0);
      const totalAfter = alreadyConsumed + Number(data.consumedVolume);
      const poVolume = Number(poItem.volume);

      if (totalAfter > poVolume * 1.1) { // Allow 10% overrun with warning
        if (totalAfter > poVolume * 1.2) { // Block at 20% overrun
          req.error(400,
            `Consumption volume (${totalAfter}) exceeds PO Item capacity (${poVolume}) by more than 20%`,
            'consumedVolume'
          );
        } else {
          req.warn(200,
            `Warning: Consumption volume (${totalAfter}) exceeds PO Item planned volume (${poVolume})`
          );
        }
      }
    }

    // Value check
    if (data.consumedValue != null && poItem.netValue) {
      const alreadyConsumedValue = existingAllocations.reduce((sum, a) => sum + (Number(a.consumedValue) || 0), 0);
      const totalValueAfter = alreadyConsumedValue + Number(data.consumedValue);
      const poValue = Number(poItem.netValue);

      if (totalValueAfter > poValue) {
        req.warn(200,
          `Warning: Total consumed value (${totalValueAfter.toFixed(2)}) exceeds PO Item value (${poValue.toFixed(2)})`
        );
      }
    }
  }

  // ================================================================
  // PRIVATE: Validate total split percentage doesn't exceed 100%
  // ================================================================

  async _validateTotalSplitPercentage(data, req) {
    const { AllocationSplits } = this.entities;

    let existingSplits = await SELECT.from(AllocationSplits)
      .where({ allocation_ID: data.allocation_ID });

    // Exclude current record if updating
    if (data.ID) {
      existingSplits = existingSplits.filter(s => s.ID !== data.ID);
    }

    const existingTotal = existingSplits.reduce((sum, s) => sum + (Number(s.splitPercentage) || 0), 0);
    const newTotal = existingTotal + Number(data.splitPercentage);

    if (newTotal > 100) {
      req.error(400,
        `Total split percentage (${newTotal}%) exceeds 100%. Currently allocated: ${existingTotal}%, maximum remaining: ${100 - existingTotal}%`,
        'splitPercentage'
      );
    }
  }
}

module.exports = ConsumptionServiceHandler;
