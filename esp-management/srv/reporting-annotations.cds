using ReportingService from './services';

// ============================================================
// FINANCIAL CONTROLLING & REPORTING ANNOTATIONS
// Multi-dimensional reporting views
// ============================================================

annotate ReportingService.PlanLines with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Plan Line (BP vs CFC vs Actuals)',
      TypeNamePlural: 'Financial Controlling Report',
      Title: { Value: chapterArea.name },
      Description: { Value: supplier.supplierName }
    },
    SelectionFields: [
      chapterArea_ID, supplier_ID, customer_ID, serviceType, contractType,
      resourcePool_ID, costCenter_ID, region, country_code
    ],
    LineItem: [
      { Value: chapterArea.name, Label: 'Chapter Area', Position: 10 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 20 },
      { Value: customer.customerName, Label: 'Customer', Position: 30 },
      { Value: serviceType, Label: 'Service Type', Position: 40 },
      { Value: contractType, Label: 'Contract Type', Position: 50 },
      { Value: resourcePool.name, Label: 'Resource Pool', Position: 60 },
      { Value: costCenter.name, Label: 'Cost Center', Position: 70 },
      { Value: region, Label: 'Region', Position: 80 },
      { Value: country_code, Label: 'Country', Position: 90 },
      { Value: plannedValue, Label: 'BP Value (EUR)', Position: 100 },
      { Value: plannedFte, Label: 'BP FTE', Position: 110 },
      { Value: hourlyRate, Label: 'Rate (EUR/h)', Position: 120 },
      { Value: currency_code, Label: 'Currency', Position: 130 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Reporting Dimensions', Target: '@UI.FieldGroup#Dimensions', ID: 'DimensionsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Financial Metrics (BP)', Target: '@UI.FieldGroup#BPMetrics', ID: 'BPMetricsFacet' }
    ],
    FieldGroup#Dimensions: {
      Data: [
        { Value: chapterArea.name, Label: 'Chapter Area' },
        { Value: supplier.supplierName, Label: 'Supplier' },
        { Value: customer.customerName, Label: 'Customer' },
        { Value: serviceType, Label: 'Service Type' },
        { Value: contractType, Label: 'Contract Type' },
        { Value: resourcePool.name, Label: 'Resource Pool' },
        { Value: costCenter.name, Label: 'Cost Center' },
        { Value: region, Label: 'Region' },
        { Value: country_code, Label: 'Country' }
      ]
    },
    FieldGroup#BPMetrics: {
      Data: [
        { Value: plannedValue, Label: 'Business Plan Value' },
        { Value: plannedFte, Label: 'Business Plan FTE' },
        { Value: hourlyRate, Label: 'Hourly Rate (EUR/h)' },
        { Value: currency_code, Label: 'Currency' }
      ]
    }
  }
);

annotate ReportingService.ForecastLines with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Forecast Line',
      TypeNamePlural: 'CFC Forecast Lines'
    },
    SelectionFields: [
      chapterArea_ID, supplier_ID, customer_ID, serviceType, contractType, region
    ],
    LineItem: [
      { Value: chapterArea.name, Label: 'Chapter Area', Position: 10 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 20 },
      { Value: customer.customerName, Label: 'Customer', Position: 30 },
      { Value: serviceType, Label: 'Service Type', Position: 40 },
      { Value: contractType, Label: 'Contract Type', Position: 50 },
      { Value: region, Label: 'Region', Position: 60 },
      { Value: forecastValue, Label: 'CFC Value (EUR)', Position: 70 },
      { Value: forecastFte, Label: 'CFC FTE', Position: 80 },
      { Value: hourlyRate, Label: 'Rate (EUR/h)', Position: 90 }
    ]
  }
);

annotate ReportingService.ForecastCycles with @(
  UI: {
    LineItem: [
      { Value: code, Label: 'Cycle', Position: 10 },
      { Value: name, Label: 'Name', Position: 20 },
      { Value: year, Label: 'Year', Position: 30 },
      { Value: startDate, Label: 'Start', Position: 40 },
      { Value: endDate, Label: 'End', Position: 50 },
      { Value: isCurrent, Label: 'Active', Position: 60 }
    ]
  }
);

annotate ReportingService.ExchangeRates with @(
  UI: {
    LineItem: [
      { Value: sourceCurrency_code, Label: 'From', Position: 10 },
      { Value: targetCurrency_code, Label: 'To', Position: 20 },
      { Value: rate, Label: 'Rate', Position: 30 },
      { Value: validFrom, Label: 'Valid From', Position: 40 },
      { Value: validTo, Label: 'Valid To', Position: 50 }
    ]
  }
);

// Value helps for ReportingService PlanLines filters
annotate ReportingService.PlanLines with {
  serviceType @Common.ValueListWithFixedValues;
  contractType @Common.ValueListWithFixedValues;
  region @Common.ValueListWithFixedValues;
  chapterArea @Common: { Text: chapterArea.name, TextArrangement: #TextFirst };
  supplier @Common: { Text: supplier.supplierName, TextArrangement: #TextFirst };
  customer @Common: { Text: customer.customerName, TextArrangement: #TextFirst };
  resourcePool @Common: { Text: resourcePool.name, TextArrangement: #TextFirst };
  costCenter @Common: { Text: costCenter.name, TextArrangement: #TextFirst };
};
