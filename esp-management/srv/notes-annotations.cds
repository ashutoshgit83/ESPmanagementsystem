using OrderService from './services';
using InvoiceService from './services';
using MasterDataService from './services';

// ============================================================
// NOTES ANNOTATIONS (shown on Object Pages)
// Polymorphic linking: entityType + entityId
// ============================================================

// Notes in OrderService
annotate OrderService.Notes with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Note',
      TypeNamePlural: 'Notes & Feedback'
    },
    LineItem: [
      { Value: noteType, Label: 'Type', Position: 10 },
      { Value: subject, Label: 'Subject', Position: 20 },
      { Value: content, Label: 'Content', Position: 30 },
      { Value: createdByName, Label: 'Created By', Position: 40 },
      { Value: createdAt, Label: 'Date', Position: 50 }
    ],
    SelectionFields: [ noteType, entityType, createdByName ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Note Details', Target: '@UI.FieldGroup#NoteContent', ID: 'NoteContentFacet' }
    ],
    FieldGroup#NoteContent: {
      Data: [
        { Value: noteType, Label: 'Type' },
        { Value: subject, Label: 'Subject' },
        { Value: content, Label: 'Content' },
        { Value: entityType, Label: 'Related Entity' },
        { Value: entityId, Label: 'Entity ID' },
        { Value: createdByName, Label: 'Created By' },
        { Value: createdAt, Label: 'Created On' }
      ]
    }
  }
);

annotate OrderService.Notes with {
  noteType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Notes',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: noteType, ValueListProperty: 'noteType' }]
  };
};

// Notes in InvoiceService
annotate InvoiceService.Notes with @(
  UI: {
    LineItem: [
      { Value: noteType, Label: 'Type', Position: 10 },
      { Value: subject, Label: 'Subject', Position: 20 },
      { Value: content, Label: 'Content', Position: 30 },
      { Value: createdByName, Label: 'Created By', Position: 40 },
      { Value: createdAt, Label: 'Date', Position: 50 }
    ]
  }
);

annotate InvoiceService.Notes with {
  noteType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Notes',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: noteType, ValueListProperty: 'noteType' }]
  };
};

// Notes in MasterDataService
annotate MasterDataService.Notes with @(
  UI: {
    LineItem: [
      { Value: noteType, Label: 'Type', Position: 10 },
      { Value: subject, Label: 'Subject', Position: 20 },
      { Value: content, Label: 'Content', Position: 30 },
      { Value: createdByName, Label: 'Created By', Position: 40 },
      { Value: createdAt, Label: 'Date', Position: 50 }
    ]
  }
);

annotate MasterDataService.Notes with {
  noteType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'Notes',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: noteType, ValueListProperty: 'noteType' }]
  };
};
