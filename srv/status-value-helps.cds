using OrderService from './services';
using InvoiceService from './services';
using MasterDataService from './services';
using ConsumptionService from './services';

// ============================================================
// FIXED VALUE LISTS FOR STATUS FIELDS
// ============================================================

annotate OrderService.PurchaseOrders with {
  status @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'PurchaseOrders',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: status, ValueListProperty: 'status' }]
  };
  sourceSystem @Common.ValueListWithFixedValues;
};

annotate InvoiceService.Invoices with {
  status @Common.ValueListWithFixedValues;
  sourceSystem @Common.ValueListWithFixedValues;
};

// ============================================================
// CURRENCY VALUE HELPS (standard @sap/cds/common exposes these)
// ============================================================

annotate OrderService.PurchaseOrders with {
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

annotate OrderService.PurchaseOrderItems with {
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

annotate InvoiceService.Invoices with {
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

annotate InvoiceService.InvoiceLines with {
  currency @Common: { Label: 'Currency', Text: currency.name, TextArrangement: #TextOnly };
};

// ============================================================
// NOTES ENTITY - Common annotations for reuse
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

using AdminService from './services';
