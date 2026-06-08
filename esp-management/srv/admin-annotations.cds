using AdminService from './services';

// ============================================================
// FORECAST CYCLE ANNOTATIONS
// ============================================================

annotate AdminService.ForecastCycles with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Forecast Cycle',
      TypeNamePlural: 'Forecast Cycles',
      Title: { Value: name },
      Description: { Value: code }
    },
    SelectionFields: [
      code, year, isCurrent
    ],
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: year, Label: 'Year', Position: 30 },
      { Value: startDate, Label: 'Start Date', Position: 40 },
      { Value: endDate, Label: 'End Date', Position: 50 },
      { Value: isCurrent, Label: 'Current', Position: 60 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Cycle Details', Target: '@UI.FieldGroup#CycleDetails', ID: 'CycleDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Exchange Rates', Target: 'exchangeRates/@UI.LineItem', ID: 'ExchangeRatesList' }
    ],
    FieldGroup#CycleDetails: {
      Data: [
        { Value: code, Label: 'Code' },
        { Value: name, Label: 'Name' },
        { Value: year, Label: 'Year' },
        { Value: startDate, Label: 'Start Date' },
        { Value: endDate, Label: 'End Date' },
        { Value: isCurrent, Label: 'Current Cycle' }
      ]
    }
  }
);

annotate AdminService.ExchangeRates with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Exchange Rate',
      TypeNamePlural: 'Exchange Rates'
    },
    LineItem: [
      { Value: sourceCurrency_code, Label: 'From', Position: 10 },
      { Value: targetCurrency_code, Label: 'To', Position: 20 },
      { Value: rate, Label: 'Rate', Position: 30 },
      { Value: validFrom, Label: 'Valid From', Position: 40 },
      { Value: validTo, Label: 'Valid To', Position: 50 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Rate Details', Target: '@UI.FieldGroup#RateDetails', ID: 'RateDetailsFacet' }
    ],
    FieldGroup#RateDetails: {
      Data: [
        { Value: forecastCycle_ID, Label: 'Forecast Cycle' },
        { Value: sourceCurrency_code, Label: 'Source Currency' },
        { Value: targetCurrency_code, Label: 'Target Currency' },
        { Value: rate, Label: 'Exchange Rate' },
        { Value: validFrom, Label: 'Valid From' },
        { Value: validTo, Label: 'Valid To' }
      ]
    }
  }
);

// ============================================================
// BUSINESS PLAN ANNOTATIONS
// ============================================================

annotate AdminService.BusinessPlans with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Business Plan',
      TypeNamePlural: 'Business Plans',
      Title: { Value: description },
      Description: { Value: version }
    },
    SelectionFields: [
      year, version, status
    ],
    LineItem: [
      { Value: year, Label: 'Year', Position: 10 },
      { Value: version, Label: 'Version', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 },
      { Value: status, Label: 'Status', Position: 40 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Plan Details', Target: '@UI.FieldGroup#PlanDetails', ID: 'PlanDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Plan Lines (by Dimension)', Target: 'lines/@UI.LineItem', ID: 'PlanLinesList' }
    ],
    FieldGroup#PlanDetails: {
      Data: [
        { Value: year, Label: 'Fiscal Year' },
        { Value: version, Label: 'Version' },
        { Value: description, Label: 'Description' },
        { Value: status, Label: 'Status' }
      ]
    }
  }
);

annotate AdminService.PlanLines with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Plan Line',
      TypeNamePlural: 'Plan Lines'
    },
    LineItem: [
      { Value: chapterArea.name, Label: 'Chapter Area', Position: 10 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 20 },
      { Value: customer.customerName, Label: 'Customer', Position: 30 },
      { Value: serviceType, Label: 'Service Type', Position: 40 },
      { Value: contractType, Label: 'Contract Type', Position: 50 },
      { Value: resourcePool.name, Label: 'Resource Pool', Position: 60 },
      { Value: region, Label: 'Region', Position: 70 },
      { Value: plannedValue, Label: 'Planned Value', Position: 80 },
      { Value: plannedFte, Label: 'Planned FTE', Position: 90 },
      { Value: hourlyRate, Label: 'Hourly Rate', Position: 100 },
      { Value: currency_code, Label: 'Currency', Position: 110 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Dimensions', Target: '@UI.FieldGroup#Dimensions', ID: 'DimensionsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Financials & FTE', Target: '@UI.FieldGroup#Financials', ID: 'FinancialsFacet' }
    ],
    FieldGroup#Dimensions: {
      Data: [
        { Value: chapterArea_ID, Label: 'Chapter Area' },
        { Value: supplier_ID, Label: 'Supplier' },
        { Value: customer_ID, Label: 'Customer' },
        { Value: costCenter_ID, Label: 'Cost Center' },
        { Value: resourcePool_ID, Label: 'Resource Pool' },
        { Value: serviceType, Label: 'Service Type' },
        { Value: contractType, Label: 'Contract Type' },
        { Value: region, Label: 'Region' },
        { Value: country_code, Label: 'Country' }
      ]
    },
    FieldGroup#Financials: {
      Data: [
        { Value: plannedValue, Label: 'Planned Value' },
        { Value: plannedFte, Label: 'Planned FTE' },
        { Value: hourlyRate, Label: 'Hourly Rate (EUR/h)' },
        { Value: currency_code, Label: 'Currency' }
      ]
    }
  }
);

// ============================================================
// FORECAST ANNOTATIONS
// ============================================================

annotate AdminService.Forecasts with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Forecast',
      TypeNamePlural: 'Forecasts',
      Title: { Value: description },
      Description: { Value: version }
    },
    SelectionFields: [
      forecastCycle_ID, year, version, status
    ],
    LineItem: [
      { Value: forecastCycle.name, Label: 'Cycle', Position: 10 },
      { Value: year, Label: 'Year', Position: 20 },
      { Value: version, Label: 'Version', Position: 30 },
      { Value: description, Label: 'Description', Position: 40 },
      { Value: status, Label: 'Status', Position: 50 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Forecast Details', Target: '@UI.FieldGroup#ForecastDetails', ID: 'ForecastDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Forecast Lines (by Dimension)', Target: 'lines/@UI.LineItem', ID: 'ForecastLinesList' }
    ],
    FieldGroup#ForecastDetails: {
      Data: [
        { Value: forecastCycle_ID, Label: 'Forecast Cycle' },
        { Value: year, Label: 'Year' },
        { Value: version, Label: 'Version' },
        { Value: description, Label: 'Description' },
        { Value: status, Label: 'Status' }
      ]
    }
  }
);

annotate AdminService.ForecastLines with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Forecast Line',
      TypeNamePlural: 'Forecast Lines'
    },
    LineItem: [
      { Value: chapterArea.name, Label: 'Chapter Area', Position: 10 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 20 },
      { Value: customer.customerName, Label: 'Customer', Position: 30 },
      { Value: serviceType, Label: 'Service Type', Position: 40 },
      { Value: contractType, Label: 'Contract Type', Position: 50 },
      { Value: resourcePool.name, Label: 'Resource Pool', Position: 60 },
      { Value: region, Label: 'Region', Position: 70 },
      { Value: forecastValue, Label: 'Forecast Value', Position: 80 },
      { Value: forecastFte, Label: 'Forecast FTE', Position: 90 },
      { Value: hourlyRate, Label: 'Hourly Rate', Position: 100 },
      { Value: currency_code, Label: 'Currency', Position: 110 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Dimensions', Target: '@UI.FieldGroup#Dimensions', ID: 'DimensionsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Financials & FTE', Target: '@UI.FieldGroup#Financials', ID: 'FinancialsFacet' }
    ],
    FieldGroup#Dimensions: {
      Data: [
        { Value: chapterArea_ID, Label: 'Chapter Area' },
        { Value: supplier_ID, Label: 'Supplier' },
        { Value: customer_ID, Label: 'Customer' },
        { Value: costCenter_ID, Label: 'Cost Center' },
        { Value: resourcePool_ID, Label: 'Resource Pool' },
        { Value: serviceType, Label: 'Service Type' },
        { Value: contractType, Label: 'Contract Type' },
        { Value: region, Label: 'Region' },
        { Value: country_code, Label: 'Country' }
      ]
    },
    FieldGroup#Financials: {
      Data: [
        { Value: forecastValue, Label: 'Forecast Value' },
        { Value: forecastFte, Label: 'Forecast FTE' },
        { Value: hourlyRate, Label: 'Hourly Rate (EUR/h)' },
        { Value: currency_code, Label: 'Currency' }
      ]
    }
  }
);

// ============================================================
// IMPORT BATCH ANNOTATIONS
// ============================================================

annotate AdminService.ImportBatches with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Import Batch',
      TypeNamePlural: 'Import Batches',
      Title: { Value: batchName },
      Description: { Value: sourceSystem }
    },
    SelectionFields: [
      sourceSystem, status, importedBy
    ],
    LineItem: [
      { Value: batchName, Label: 'Batch Name', Position: 10 },
      { Value: sourceSystem, Label: 'Source System', Position: 20 },
      { Value: importDate, Label: 'Import Date', Position: 30 },
      { Value: status, Label: 'Status', Position: 40 },
      { Value: totalRecords, Label: 'Total Records', Position: 50 },
      { Value: successCount, Label: 'Success', Position: 60 },
      { Value: errorCount, Label: 'Errors', Position: 70 },
      { Value: importedBy, Label: 'Imported By', Position: 80 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Batch Details', Target: '@UI.FieldGroup#BatchDetails', ID: 'BatchDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Records', Target: 'records/@UI.LineItem', ID: 'RecordsList' }
    ],
    FieldGroup#BatchDetails: {
      Data: [
        { Value: batchName, Label: 'Batch Name' },
        { Value: sourceSystem, Label: 'Source System' },
        { Value: importDate, Label: 'Import Date' },
        { Value: status, Label: 'Status' },
        { Value: totalRecords, Label: 'Total Records' },
        { Value: successCount, Label: 'Success Count' },
        { Value: errorCount, Label: 'Error Count' },
        { Value: importedBy, Label: 'Imported By' },
        { Value: logMessages, Label: 'Log Messages' }
      ]
    }
  }
);

annotate AdminService.SourceSystemRecords with @(
  UI: {
    LineItem: [
      { Value: sourceRecordId, Label: 'Source Record ID', Position: 10 },
      { Value: sourceSystem, Label: 'Source', Position: 20 },
      { Value: entityType, Label: 'Entity Type', Position: 30 },
      { Value: status, Label: 'Status', Position: 40 },
      { Value: errorMessage, Label: 'Error', Position: 50 }
    ]
  }
);

// ============================================================
// AUDIT LOG ANNOTATIONS
// ============================================================

annotate AdminService.AuditLogs with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Audit Log Entry',
      TypeNamePlural: 'Audit Trail',
      Title: { Value: action },
      Description: { Value: entityType }
    },
    SelectionFields: [
      entityType, action, changedBy, entityId, fieldName
    ],
    LineItem: [
      { Value: timestamp, Label: 'Timestamp', Position: 10 },
      { Value: entityType, Label: 'Entity Type', Position: 20 },
      { Value: entityId, Label: 'Entity ID', Position: 30 },
      { Value: action, Label: 'Action', Position: 40 },
      { Value: fieldName, Label: 'Field', Position: 50 },
      { Value: oldValue, Label: 'Old Value', Position: 60 },
      { Value: newValue, Label: 'New Value', Position: 70 },
      { Value: changedBy, Label: 'Changed By', Position: 80 },
      { Value: changedAt, Label: 'Changed At', Position: 90 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Audit Entry Details', Target: '@UI.FieldGroup#AuditDetails', ID: 'AuditDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Change Details', Target: '@UI.FieldGroup#ChangeDetails', ID: 'ChangeDetailsFacet' }
    ],
    FieldGroup#AuditDetails: {
      Data: [
        { Value: timestamp, Label: 'Event Timestamp' },
        { Value: entityType, Label: 'Entity Type' },
        { Value: entityId, Label: 'Entity ID' },
        { Value: action, Label: 'Action Performed' },
        { Value: changedBy, Label: 'Performed By' },
        { Value: changedAt, Label: 'Recorded At' }
      ]
    },
    FieldGroup#ChangeDetails: {
      Data: [
        { Value: fieldName, Label: 'Field Changed' },
        { Value: oldValue, Label: 'Previous Value' },
        { Value: newValue, Label: 'New Value' }
      ]
    }
  }
);

annotate AdminService.AuditLogs with {
  entityType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'AuditLogs',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: entityType, ValueListProperty: 'entityType' }]
  };
  action @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'AuditLogs',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: action, ValueListProperty: 'action' }]
  };
};

// ============================================================
// CHAPTER DOMAINS / ORG HIERARCHY ANNOTATIONS
// ============================================================

annotate AdminService.ChapterDomains with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Chapter Domain',
      TypeNamePlural: 'Chapter Domains',
      Title: { Value: name },
      Description: { Value: code }
    },
    SelectionFields: [ code, name ],
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Domain Details', Target: '@UI.FieldGroup#DomainDetails', ID: 'DomainDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Chapter Areas', Target: 'chapterAreas/@UI.LineItem', ID: 'ChapterAreasList' }
    ],
    FieldGroup#DomainDetails: {
      Data: [
        { Value: code, Label: 'Code' },
        { Value: name, Label: 'Name' },
        { Value: description, Label: 'Description' }
      ]
    }
  }
);

annotate AdminService.ChapterAreas with @(
  UI: {
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 }
    ]
  }
);

annotate AdminService.ResourcePools with @(
  UI: {
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 }
    ]
  }
);

annotate AdminService.CostCenters with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Cost Center',
      TypeNamePlural: 'Cost Centers',
      Title: { Value: name },
      Description: { Value: code }
    },
    SelectionFields: [ code, name, region ],
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: region, Label: 'Region', Position: 30 },
      { Value: country_code, Label: 'Country', Position: 40 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Cost Center Details', Target: '@UI.FieldGroup#CostCenterDetails', ID: 'CostCenterDetailsFacet' }
    ],
    FieldGroup#CostCenterDetails: {
      Data: [
        { Value: code, Label: 'Code' },
        { Value: name, Label: 'Name' },
        { Value: region, Label: 'Region' },
        { Value: country_code, Label: 'Country' }
      ]
    }
  }
);

// ============================================================
// ORDER TYPES / REFERENCE DATA ANNOTATIONS
// ============================================================

annotate AdminService.OrderTypes with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Order Type',
      TypeNamePlural: 'Order Types',
      Title: { Value: name },
      Description: { Value: code }
    },
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Details', Target: '@UI.FieldGroup#Details', ID: 'DetailsFacet' }
    ],
    FieldGroup#Details: {
      Data: [
        { Value: code, Label: 'Code' },
        { Value: name, Label: 'Name' },
        { Value: description, Label: 'Description' }
      ]
    }
  }
);

annotate AdminService.ItemTypes with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Item Type',
      TypeNamePlural: 'Item Types',
      Title: { Value: name },
      Description: { Value: code }
    },
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Details', Target: '@UI.FieldGroup#Details', ID: 'DetailsFacet' }
    ],
    FieldGroup#Details: {
      Data: [
        { Value: code, Label: 'Code' },
        { Value: name, Label: 'Name' },
        { Value: description, Label: 'Description' }
      ]
    }
  }
);

annotate AdminService.ServiceLevels with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Service Level',
      TypeNamePlural: 'Service Levels',
      Title: { Value: name },
      Description: { Value: code }
    },
    LineItem: [
      { Value: code, Label: 'Code', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: description, Label: 'Description', Position: 30 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Details', Target: '@UI.FieldGroup#Details', ID: 'DetailsFacet' }
    ],
    FieldGroup#Details: {
      Data: [
        { Value: code, Label: 'Code' },
        { Value: name, Label: 'Name' },
        { Value: description, Label: 'Description' }
      ]
    }
  }
);
