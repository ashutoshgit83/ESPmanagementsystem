using OrderService from './services';
using InvoiceService from './services';
using ConsumptionService from './services';
using MasterDataService from './services';

// ============================================================
// VALUE HELPS - OrderService
// ============================================================

annotate OrderService.PurchaseOrders with {
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
  orderType @Common: {
    Text: orderType.name, TextArrangement: #TextOnly,
    ValueList: {
      CollectionPath: 'OrderTypes',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: orderType_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
  issuingChapterArea @Common: {
    Text: issuingChapterArea.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ChapterAreas',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: issuingChapterArea_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' }
      ]
    }
  };
};

annotate OrderService.PurchaseOrderItems with {
  itemType @Common: {
    Text: itemType.name, TextArrangement: #TextOnly,
    ValueList: {
      CollectionPath: 'ItemTypes',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: itemType_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
  serviceLevel @Common: {
    Text: serviceLevel.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ServiceLevels',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: serviceLevel_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' }
      ]
    }
  };
  unitOfMeasure @Common: {
    Text: unitOfMeasure.name, TextArrangement: #TextOnly,
    ValueList: {
      CollectionPath: 'UnitsOfMeasure',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: unitOfMeasure_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
  targetCustomer @Common: {
    Text: targetCustomer.customerName, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'Customers',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: targetCustomer_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'customerName' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'customerNumber' }
      ]
    }
  };
};

// ============================================================
// VALUE HELPS - InvoiceService
// ============================================================

annotate InvoiceService.Invoices with {
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
};

annotate InvoiceService.InvoiceLines with {
  poItem @Common: {
    Label: 'PO Item',
    Text: poItem.poItemNumber, TextArrangement: #TextFirst,
    ValueList: {
      Label: 'Select PO Item',
      CollectionPath: 'PurchaseOrderItems',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: poItem_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'poItemNumber' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'netValue' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'volume' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'unitPrice' }
      ]
    }
  };
  allocation @Common: {
    Label: 'Consumption Allocation',
    Text: allocation.plwProjectNumber, TextArrangement: #TextFirst,
    ValueList: {
      Label: 'Select Allocation',
      CollectionPath: 'ConsumptionAllocations',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: allocation_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'plwProjectNumber' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'consumedValue' }
      ]
    }
  };
};

// ============================================================
// VALUE HELPS - ConsumptionService
// ============================================================

annotate ConsumptionService.ConsumptionAllocations with {
  consumingChapterArea @Common: {
    Text: consumingChapterArea.name, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'ChapterAreas',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: consumingChapterArea_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
      ]
    }
  };
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
  consultant @Common: {
    Text: consultant.lastName, TextArrangement: #TextFirst,
    ValueList: {
      CollectionPath: 'Consultants',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: consultant_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'lastName' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'firstName' }
      ]
    }
  };
};

annotate ConsumptionService.AllocationSplits with {
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
};

// ============================================================
// VALUE HELPS - MasterDataService
// ============================================================

annotate MasterDataService.Suppliers with {
  country @Common: { Label: 'Country' };
  billingEntityCountry @Common: { Label: 'Billing Entity Country' };
  serviceDeliveryCountry @Common: { Label: 'Service Delivery Country' };
};
