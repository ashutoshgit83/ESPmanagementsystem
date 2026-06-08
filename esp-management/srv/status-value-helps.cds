using OrderService from './services';
using InvoiceService from './services';
using MasterDataService from './services';
using ConsumptionService from './services';
using AdminService from './services';

// ============================================================
// FIXED VALUE DROPDOWNS (small value sets shown as ComboBox)
// @Common.ValueListWithFixedValues = renders as dropdown
// ============================================================

// --- Purchase Orders ---
annotate OrderService.PurchaseOrders with {
  status @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'PurchaseOrders',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'status' }]
  };
  sourceSystem @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'PurchaseOrders',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: sourceSystem, ValueListProperty: 'sourceSystem' }]
  };
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

annotate OrderService.PurchaseOrderItems with {
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

// --- Invoices ---
annotate InvoiceService.Invoices with {
  status @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Invoices',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'status' }]
  };
  sourceSystem @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Invoices',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: sourceSystem, ValueListProperty: 'sourceSystem' }]
  };
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

annotate InvoiceService.InvoiceLines with {
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

// --- Suppliers (fixed value fields as dropdowns) ---
annotate MasterDataService.Suppliers with {
  classificationAttribute @( 
    Common.Label: 'Classification',
    Common.ValueListWithFixedValues,
    Common.ValueList: {
      Label: 'Classification',
      CollectionPath: 'SupplierClassificationValues',
      Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: classificationAttribute, ValueListProperty: 'code' }]
    }
  );
  locationClassification @(
    Common.Label: 'Location Classification',
    Common.ValueListWithFixedValues,
    Common.ValueList: {
      Label: 'Location Classification',
      CollectionPath: 'LocationClassificationValues',
      Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: locationClassification, ValueListProperty: 'code' }]
    }
  );
  exceptionScenario @(
    Common.Label: 'Exception Scenario',
    Common.ValueListWithFixedValues,
    Common.ValueList: {
      Label: 'Exception Scenario',
      CollectionPath: 'ExceptionScenarioValues',
      Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: exceptionScenario, ValueListProperty: 'code' }]
    }
  );
  hcbLcb @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'LocationClassificationValues',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: hcbLcb, ValueListProperty: 'code' }]
  };
  tier @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Suppliers',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: tier, ValueListProperty: 'tier' }]
  };
  rateCardScope @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Suppliers',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: rateCardScope, ValueListProperty: 'rateCardScope' }]
  };
};

// --- Supplier Classifications ---
annotate MasterDataService.SupplierClassifications with {
  classificationType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'SupplierClassifications',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: classificationType, ValueListProperty: 'classificationType' }]
  };
};

// --- Notes ---
annotate AdminService.Notes with {
  noteType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Notes',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: noteType, ValueListProperty: 'noteType' }]
  };
  entityType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Notes',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: entityType, ValueListProperty: 'entityType' }]
  };
};

// --- Import Batches ---
annotate AdminService.ImportBatches with {
  sourceSystem @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'ImportBatches',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: sourceSystem, ValueListProperty: 'sourceSystem' }]
  };
  status @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'ImportBatches',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'status' }]
  };
};

// --- Business Plans ---
annotate AdminService.BusinessPlans with {
  status @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'BusinessPlans',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'status' }]
  };
};

// --- PO Items (few values = dropdown) ---
annotate OrderService.PurchaseOrderItems with {
  itemType @Common.ValueListWithFixedValues;
  serviceLevel @Common.ValueListWithFixedValues;
  unitOfMeasure @Common.ValueListWithFixedValues;
};

// --- Forecasts ---
annotate AdminService.Forecasts with {
  status @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Forecasts',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'status' }]
  };
};

// ============================================================
// NOTES UI ANNOTATIONS
// ============================================================

annotate AdminService.Notes with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Note',
      TypeNamePlural: 'Notes',
      Title: { Value: subject },
      Description: { Value: noteType }
    },
    LineItem: [
      { Value: noteType, Label: 'Type', Position: 10 },
      { Value: subject, Label: 'Subject', Position: 20 },
      { Value: createdByName, Label: 'Created By', Position: 30 },
      { Value: createdAt, Label: 'Date', Position: 40 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Note Details', Target: '@UI.FieldGroup#NoteDetails', ID: 'NoteDetailsFacet' }
    ],
    FieldGroup#NoteDetails: {
      Data: [
        { Value: noteType, Label: 'Type' },
        { Value: subject, Label: 'Subject' },
        { Value: content, Label: 'Content' },
        { Value: entityType, Label: 'Related Entity Type' },
        { Value: entityId, Label: 'Related Entity ID' },
        { Value: createdByName, Label: 'Created By' }
      ]
    }
  }
);
