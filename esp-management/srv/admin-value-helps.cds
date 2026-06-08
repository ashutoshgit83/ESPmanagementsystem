using AdminService from './services';

// ============================================================
// VALUE HELPS - AdminService
// ============================================================

// PlanLines value helps
annotate AdminService.PlanLines with {
  chapterArea @Common: {
    Text: chapterArea.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ChapterAreas',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: chapterArea_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' }
      ]
    }
  };
  customer @Common: {
    Text: customer.customerName, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'Customers',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: customer_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'customerName' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'customerNumber' }
      ]
    }
  };
  supplier @Common: {
    Text: supplier.supplierName, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'Suppliers',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: supplier_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'supplierName' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'supplierNumber' }
      ]
    }
  };
  costCenter @Common: {
    Text: costCenter.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'CostCenters',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: costCenter_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' }
      ]
    }
  };
};

// PlanLines additional dimension value helps
annotate AdminService.PlanLines with {
  resourcePool @Common: {
    Text: resourcePool.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ResourcePools',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: resourcePool_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
  contractType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'PlanLines',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: contractType, ValueListProperty: 'contractType' }]
  };
  serviceType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'PlanLines',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: serviceType, ValueListProperty: 'serviceType' }]
  };
  region @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'PlanLines',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: region, ValueListProperty: 'region' }]
  };
};

// ForecastLines value helps
annotate AdminService.ForecastLines with {
  resourcePool @Common: {
    Text: resourcePool.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ResourcePools',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: resourcePool_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
  contractType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'ForecastLines',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: contractType, ValueListProperty: 'contractType' }]
  };
  serviceType @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'ForecastLines',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: serviceType, ValueListProperty: 'serviceType' }]
  };
  region @Common.ValueListWithFixedValues @Common.ValueList: {
    CollectionPath: 'ForecastLines',
    Parameters: [{ $Type: 'Common.ValueListParameterOut', LocalDataProperty: region, ValueListProperty: 'region' }]
  };
  chapterArea @Common: {
    Text: chapterArea.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ChapterAreas',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: chapterArea_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' }
      ]
    }
  };
  customer @Common: {
    Text: customer.customerName, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'Customers',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: customer_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'customerName' }
      ]
    }
  };
  supplier @Common: {
    Text: supplier.supplierName, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'Suppliers',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: supplier_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'supplierName' }
      ]
    }
  };
  costCenter @Common: {
    Text: costCenter.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'CostCenters',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: costCenter_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
};

// Forecasts value help for forecastCycle
annotate AdminService.Forecasts with {
  forecastCycle @Common: {
    Text: forecastCycle.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ForecastCycles',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: forecastCycle_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' }
      ]
    }
  };
};
