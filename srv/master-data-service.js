const cds = require('@sap/cds');
const { logCreate, logFieldChanges } = require('./lib/audit-log');
const { validateRequired } = require('./lib/validations');

class MasterDataServiceHandler extends cds.ApplicationService {
  init() {
    const { Suppliers, SupplierContacts, SupplierClassifications, Customers } = this.entities;

    // ================================================================
    // SUPPLIER VALIDATIONS (SAVE = draft activation)
    // ================================================================

    this.before(['CREATE', 'SAVE'], Suppliers, (req) => {
      const data = req.data;

      validateRequired(data, [
        { field: 'supplierNumber', label: 'Supplier Number' },
        { field: 'supplierName', label: 'Supplier Name' },
        { field: 'country_code', label: 'Country' }
      ], req);

      // Rate card scope is required if isRateCard is true
      if (data.isRateCard && !data.rateCardScope) {
        req.error(400, 'Rate Card Scope (Global/Regional) is required when supplier is flagged as Rate Card', 'rateCardScope');
      }

      // Validate rate card scope values
      if (data.rateCardScope && !['Global', 'Regional'].includes(data.rateCardScope)) {
        req.error(400, 'Rate Card Scope must be either "Global" or "Regional"', 'rateCardScope');
      }

      // Validate HCB/LCB
      if (data.hcbLcb && !['HCB', 'LCB'].includes(data.hcbLcb)) {
        req.error(400, 'HCB/LCB classification must be "HCB" or "LCB"', 'hcbLcb');
      }

      // Validate tier
      if (data.tier && !['Platinum', 'Gold', 'Silver'].includes(data.tier)) {
        req.error(400, 'Tier must be "Platinum", "Gold", or "Silver"', 'tier');
      }

      // Email format validation
      if (data.primaryContactEmail && !this._isValidEmail(data.primaryContactEmail)) {
        req.error(400, 'Invalid email format for primary contact', 'primaryContactEmail');
      }
    });

    this.before('UPDATE', Suppliers, async (req) => {
      const data = req.data;

      // Rate card consistency check
      if (data.isRateCard === true && !data.rateCardScope) {
        // Check if existing record has rateCardScope
        if (data.ID) {
          const existing = await SELECT.one.from(Suppliers).where({ ID: data.ID });
          if (existing && !existing.rateCardScope) {
            req.error(400, 'Rate Card Scope is required when enabling Rate Card flag', 'rateCardScope');
          }
        }
      }

      if (data.rateCardScope && !['Global', 'Regional'].includes(data.rateCardScope)) {
        req.error(400, 'Rate Card Scope must be either "Global" or "Regional"', 'rateCardScope');
      }

      if (data.hcbLcb && !['HCB', 'LCB'].includes(data.hcbLcb)) {
        req.error(400, 'HCB/LCB classification must be "HCB" or "LCB"', 'hcbLcb');
      }

      if (data.tier && !['Platinum', 'Gold', 'Silver'].includes(data.tier)) {
        req.error(400, 'Tier must be "Platinum", "Gold", or "Silver"', 'tier');
      }

      if (data.primaryContactEmail && !this._isValidEmail(data.primaryContactEmail)) {
        req.error(400, 'Invalid email format for primary contact', 'primaryContactEmail');
      }
    });

    // ================================================================
    // SUPPLIER CONTACT VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'UPDATE'], SupplierContacts, (req) => {
      const data = req.data;

      if (data.email && !this._isValidEmail(data.email)) {
        req.error(400, 'Invalid email format', 'email');
      }
    });

    this.before('CREATE', SupplierContacts, (req) => {
      validateRequired(req.data, [
        { field: 'firstName', label: 'First Name' },
        { field: 'lastName', label: 'Last Name' }
      ], req);
    });

    // ================================================================
    // SUPPLIER CLASSIFICATION VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'UPDATE'], SupplierClassifications, (req) => {
      const data = req.data;

      if (data.validFrom && data.validTo) {
        if (new Date(data.validFrom) > new Date(data.validTo)) {
          req.error(400, 'Valid From must be before Valid To', 'validFrom');
        }
      }

      // Validate classification types
      const validTypes = ['OEM', 'RateCard', 'Tier', 'HCB/LCB', 'Tender', 'Fixed'];
      if (data.classificationType && !validTypes.includes(data.classificationType)) {
        req.error(400, `Classification type must be one of: ${validTypes.join(', ')}`, 'classificationType');
      }
    });

    // ================================================================
    // CUSTOMER VALIDATIONS
    // ================================================================

    this.before(['CREATE', 'SAVE'], Customers, (req) => {
      const data = req.data;

      validateRequired(data, [
        { field: 'customerNumber', label: 'Customer Number' },
        { field: 'customerName', label: 'Customer Name' }
      ], req);

      if (data.contactEmail && !this._isValidEmail(data.contactEmail)) {
        req.error(400, 'Invalid email format for contact', 'contactEmail');
      }

      // Default isActive
      if (data.isActive === undefined) data.isActive = true;
    });

    this.before('UPDATE', Customers, (req) => {
      const data = req.data;
      if (data.contactEmail && !this._isValidEmail(data.contactEmail)) {
        req.error(400, 'Invalid email format for contact', 'contactEmail');
      }
    });

    // ================================================================
    // AUDIT LOGGING
    // ================================================================

    this.after('CREATE', Suppliers, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'Supplier', entityId: data.ID, description: `Supplier ${data.supplierName} (${data.supplierNumber}) created`, req });
      }
    });

    this.after('CREATE', Customers, async (data, req) => {
      if (data.ID) {
        await logCreate({ entityType: 'Customer', entityId: data.ID, description: `Customer ${data.customerName} (${data.customerNumber}) created`, req });
      }
    });

    this.after('UPDATE', Suppliers, async (data, req) => {
      if (data.ID) {
        // Log key field changes
        const fields = ['supplierName', 'hcbLcb', 'tier', 'isRateCard', 'rateCardScope', 'isOem'];
        const changes = {};
        for (const field of fields) {
          if (data[field] !== undefined) {
            changes[field] = { oldValue: '(previous)', newValue: data[field] };
          }
        }
        if (Object.keys(changes).length > 0) {
          await logFieldChanges({ entityType: 'Supplier', entityId: data.ID, changes, req });
        }
      }
    });

    return super.init();
  }

  // ================================================================
  // PRIVATE UTILITIES
  // ================================================================

  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

module.exports = MasterDataServiceHandler;
