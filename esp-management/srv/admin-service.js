const cds = require('@sap/cds');
const { logCreate } = require('./lib/audit-log');
const { validateRequired, validatePositive, validateDateRange } = require('./lib/validations');

class AdminServiceHandler extends cds.ApplicationService {
  init() {
    const { ForecastCycles, ExchangeRates, BusinessPlans, Forecasts,
            ImportBatches, Notes, ChapterDomains, CostCenters } = this.entities;

    // ================================================================
    // FORECAST CYCLE VALIDATIONS
    // ================================================================

    this.before('CREATE', ForecastCycles, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'code', label: 'Cycle Code' },
        { field: 'name', label: 'Cycle Name' },
        { field: 'year', label: 'Year' }
      ], req);

      validateDateRange(data, 'startDate', 'endDate', 'Cycle period', req);
    });

    this.before(['CREATE', 'UPDATE'], ForecastCycles, async (req) => {
      const data = req.data;

      // If setting as current, unset all others for the same year
      if (data.isCurrent === true && data.year) {
        await UPDATE(ForecastCycles)
          .set({ isCurrent: false })
          .where({ year: data.year, isCurrent: true });
      }
    });

    // ================================================================
    // EXCHANGE RATE VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'UPDATE'], ExchangeRates, (req) => {
      const data = req.data;

      validatePositive(data, [
        { field: 'rate', label: 'Exchange Rate' }
      ], req);

      validateDateRange(data, 'validFrom', 'validTo', 'Rate validity', req);

      // Source and target currency must differ
      if (data.sourceCurrency_code && data.targetCurrency_code &&
          data.sourceCurrency_code === data.targetCurrency_code) {
        req.error(400, 'Source and target currencies must be different', 'targetCurrency_code');
      }
    });

    this.before('CREATE', ExchangeRates, (req) => {
      validateRequired(req.data, [
        { field: 'forecastCycle_ID', label: 'Forecast Cycle' },
        { field: 'sourceCurrency_code', label: 'Source Currency' },
        { field: 'targetCurrency_code', label: 'Target Currency' },
        { field: 'rate', label: 'Rate' }
      ], req);
    });

    // ================================================================
    // BUSINESS PLAN VALIDATIONS
    // ================================================================

    this.before('CREATE', BusinessPlans, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'year', label: 'Year' },
        { field: 'version', label: 'Version' }
      ], req);

      if (!data.status) data.status = 'Draft';
    });

    // ================================================================
    // FORECAST VALIDATIONS
    // ================================================================

    this.before('CREATE', Forecasts, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'forecastCycle_ID', label: 'Forecast Cycle' },
        { field: 'year', label: 'Year' },
        { field: 'version', label: 'Version' }
      ], req);

      if (!data.status) data.status = 'Draft';
    });

    // ================================================================
    // IMPORT BATCH VALIDATIONS
    // ================================================================

    this.before('CREATE', ImportBatches, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'batchName', label: 'Batch Name' },
        { field: 'sourceSystem', label: 'Source System' }
      ], req);

      // Valid source systems
      const validSources = ['CID3', 'MyBuy', 'PICOS', 'SAP', 'Manual'];
      if (data.sourceSystem && !validSources.includes(data.sourceSystem)) {
        req.error(400, `Source system must be one of: ${validSources.join(', ')}`, 'sourceSystem');
      }

      // Default values
      if (!data.status) data.status = 'Pending';
      if (!data.importDate) data.importDate = new Date().toISOString();
      if (!data.totalRecords) data.totalRecords = 0;
      if (!data.successCount) data.successCount = 0;
      if (!data.errorCount) data.errorCount = 0;
    });

    // ================================================================
    // NOTES VALIDATIONS
    // ================================================================

    this.before('CREATE', Notes, (req) => {
      const data = req.data;
      validateRequired(data, [
        { field: 'entityType', label: 'Entity Type' },
        { field: 'entityId', label: 'Entity ID' },
        { field: 'content', label: 'Content' }
      ], req);

      // Valid note types
      const validNoteTypes = ['Internal', 'CustomerFeedback', 'Collaboration'];
      if (data.noteType && !validNoteTypes.includes(data.noteType)) {
        req.error(400, `Note type must be one of: ${validNoteTypes.join(', ')}`, 'noteType');
      }

      // Default note type
      if (!data.noteType) data.noteType = 'Internal';

      // Set created by name from user context
      if (!data.createdByName) {
        data.createdByName = req.user?.id || 'Unknown';
      }
    });

    // ================================================================
    // CHAPTER DOMAIN / ORG HIERARCHY VALIDATIONS
    // ================================================================

    this.before('CREATE', ChapterDomains, (req) => {
      validateRequired(req.data, [
        { field: 'code', label: 'Domain Code' },
        { field: 'name', label: 'Domain Name' }
      ], req);
    });

    this.before('CREATE', CostCenters, (req) => {
      validateRequired(req.data, [
        { field: 'code', label: 'Cost Center Code' },
        { field: 'name', label: 'Cost Center Name' }
      ], req);
    });

    // ================================================================
    // AUDIT LOGGING
    // ================================================================

    this.after('CREATE', ImportBatches, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'ImportBatch', entityId: data.ID, description: `Import batch '${data.batchName}' from ${data.sourceSystem}`, req });
      }
    });

    this.after('CREATE', ForecastCycles, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'ForecastCycle', entityId: data.ID, description: `Cycle ${data.code} (${data.year}) created`, req });
      }
    });

    return super.init();
  }
}

module.exports = AdminServiceHandler;
