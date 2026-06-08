using MasterDataService from './services';
using OrderService from './services';
using ConsumptionService from './services';
using InvoiceService from './services';

// ============================================================
// SUPPLIER ANNOTATIONS (MasterDataService)
// ============================================================

annotate MasterDataService.Suppliers with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Supplier',
      TypeNamePlural: 'Suppliers',
      Title: { Value: supplierName },
      Description: { Value: supplierNumber }
    },
    SelectionFields: [
      supplierNumber, supplierName, classificationAttribute, locationClassification, country_code, tier, exceptionScenario
    ],
    LineItem: [
      { Value: supplierNumber, Label: 'Supplier No.', Position: 10 },
      { Value: supplierName, Label: 'Supplier Name', Position: 20 },
      { Value: country_code, Label: 'Country', Position: 30 },
      { Value: hcbLcb, Label: 'HCB/LCB', Position: 40 },
      { Value: tier, Label: 'Tier', Position: 50 },
      { Value: classificationAttribute, Label: 'Classification', Position: 60 },
      { Value: locationClassification, Label: 'Location', Position: 70 },
      { Value: exceptionScenario, Label: 'Exception', Position: 80 },
      { Value: primaryContactName, Label: 'Contact', Position: 90 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'General Information', Target: '@UI.FieldGroup#General', ID: 'GeneralFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Classification', Target: '@UI.FieldGroup#Classification', ID: 'ClassificationFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Contact', Target: '@UI.FieldGroup#Contact', ID: 'ContactFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Contacts', Target: 'contacts/@UI.LineItem', ID: 'ContactsList' },
      { $Type: 'UI.ReferenceFacet', Label: 'Classifications', Target: 'classifications/@UI.LineItem', ID: 'ClassificationsList' }
    ],
    FieldGroup#General: {
      Data: [
        { Value: supplierNumber, Label: 'Supplier Number' },
        { Value: supplierName, Label: 'Supplier Name' },
        { Value: country_code, Label: 'Country' },
        { Value: billingEntityCountry_code, Label: 'Billing Entity Country' },
        { Value: serviceDeliveryCountry_code, Label: 'Service Delivery Country' }
      ]
    },
    FieldGroup#Classification: {
      Data: [
        { Value: classificationAttribute, Label: 'Classification' },
        { Value: locationClassification, Label: 'Location Classification' },
        { Value: country_code, Label: 'Country' },
        { Value: hcbLcb, Label: 'HCB/LCB (Legacy)' },
        { Value: tier, Label: 'Tier' },
        { Value: isOem, Label: 'OEM Supplier' },
        { Value: isRateCard, Label: 'Rate Card' },
        { Value: rateCardScope, Label: 'Rate Card Scope' },
        { Value: exceptionScenario, Label: 'Exception Scenario' }
      ]
    },
    FieldGroup#Contact: {
      Data: [
        { Value: primaryContactName, Label: 'Primary Contact' },
        { Value: primaryContactEmail, Label: 'Email' }
      ]
    }
  }
);

annotate MasterDataService.SupplierContacts with @(
  UI: {
    LineItem: [
      { Value: firstName, Label: 'First Name', Position: 10 },
      { Value: lastName, Label: 'Last Name', Position: 20 },
      { Value: email, Label: 'Email', Position: 30 },
      { Value: phone, Label: 'Phone', Position: 40 },
      { Value: role, Label: 'Role', Position: 50 },
      { Value: isPrimary, Label: 'Primary', Position: 60 }
    ]
  }
);

annotate MasterDataService.SupplierClassifications with @(
  UI: {
    LineItem: [
      { Value: classificationType, Label: 'Type', Position: 10 },
      { Value: classificationValue, Label: 'Value', Position: 20 },
      { Value: validFrom, Label: 'Valid From', Position: 30 },
      { Value: validTo, Label: 'Valid To', Position: 40 }
    ]
  }
);

// ============================================================
// CUSTOMER ANNOTATIONS (MasterDataService)
// ============================================================

annotate MasterDataService.Customers with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Customer',
      TypeNamePlural: 'Customers',
      Title: { Value: customerName },
      Description: { Value: customerNumber }
    },
    SelectionFields: [
      customerNumber, customerName, country_code, isActive
    ],
    LineItem: [
      { Value: customerNumber, Label: 'Customer No.', Position: 10 },
      { Value: customerName, Label: 'Customer Name', Position: 20 },
      { Value: country_code, Label: 'Country', Position: 30 },
      { Value: contactName, Label: 'Contact', Position: 40 },
      { Value: contactEmail, Label: 'Email', Position: 50 },
      { Value: isActive, Label: 'Active', Position: 60 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'General Information', Target: '@UI.FieldGroup#General', ID: 'GeneralFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Linked Purchase Order Items', Target: 'orderItems/@UI.LineItem', ID: 'OrderItemsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Customer Allocation Splits (Frame Orders)', Target: 'allocationSplits/@UI.LineItem', ID: 'AllocationSplitsFacet' }
    ],
    FieldGroup#General: {
      Data: [
        { Value: customerNumber, Label: 'Customer Number' },
        { Value: customerName, Label: 'Customer Name' },
        { Value: country_code, Label: 'Country' },
        { Value: contactName, Label: 'Contact Person' },
        { Value: contactEmail, Label: 'Contact Email' },
        { Value: isActive, Label: 'Active' }
      ]
    }
  }
);

// Customer-linked PO Items (shown on Customer Object Page)
annotate MasterDataService.CustomerOrderItems with @(
  UI: {
    LineItem: [
      { Value: poItemNumber, Label: 'Item', Position: 10 },
      { Value: purchaseOrder.poNumber, Label: 'PO Number', Position: 20 },
      { Value: itemType.name, Label: 'Type', Position: 30 },
      { Value: serviceLevel.name, Label: 'Service Level', Position: 40 },
      { Value: volume, Label: 'Volume', Position: 50 },
      { Value: unitPrice, Label: 'Rate', Position: 60 },
      { Value: netValue, Label: 'Net Value', Position: 70 },
      { Value: currency_code, Label: 'Currency', Position: 80 }
    ]
  }
);

// Customer Allocation Splits (multi-customer allocation for Frame Orders)
annotate MasterDataService.CustomerAllocationSplits with @(
  UI: {
    LineItem: [
      { Value: splitPercentage, Label: 'Split %', Position: 10 },
      { Value: fteShare, Label: 'FTE Share', Position: 20 },
      { Value: valueShare, Label: 'Value Share (EUR)', Position: 30 },
      { Value: allocation.plwProjectNumber, Label: 'Project', Position: 40 },
      { Value: allocation.consumedValue, Label: 'Total Consumed', Position: 50 },
      { Value: allocation.plannedFte, Label: 'Planned FTE', Position: 60 },
      { Value: allocation.actualFte, Label: 'Actual FTE', Position: 70 }
    ]
  }
);

// ============================================================
// PURCHASE ORDER ANNOTATIONS (OrderService)
// ============================================================

annotate OrderService.PurchaseOrders with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Purchase Order',
      TypeNamePlural: 'Purchase Orders',
      Title: { Value: poNumber },
      Description: { Value: supplier.supplierName }
    },
    SelectionFields: [
      poNumber, supplier_ID, status, orderType_ID, issuingChapterArea_ID, sourceSystem
    ],
    LineItem: [
      { Value: poNumber, Label: 'PO Number', Position: 10 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 20 },
      { Value: orderType.name, Label: 'Order Type', Position: 30 },
      { Value: status, Label: 'Status', Position: 40, Criticality: statusCriticality },
      { Value: totalNetValue, Label: 'Net Value', Position: 50 },
      { Value: currency_code, Label: 'Currency', Position: 60 },
      { Value: deliveryStartDate, Label: 'Start', Position: 70 },
      { Value: deliveryEndDate, Label: 'End', Position: 80 },
      { Value: sourceSystem, Label: 'Source', Position: 90 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Order Details', Target: '@UI.FieldGroup#OrderDetails', ID: 'OrderDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Dates & Validity', Target: '@UI.FieldGroup#Dates', ID: 'DatesFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Financial', Target: '@UI.FieldGroup#Financial', ID: 'FinancialFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Line Items', Target: 'items/@UI.LineItem', ID: 'ItemsList' }
    ],
    FieldGroup#OrderDetails: {
      Data: [
        { Value: poNumber, Label: 'PO Number' },
        { Value: cid3Number, Label: 'CID3 Reference' },
        { Value: orderType_ID, Label: 'Order Type' },
        { Value: supplier_ID, Label: 'Supplier' },
        { Value: issuingChapterArea_ID, Label: 'Issuing Chapter Area' },
        { Value: status, Label: 'Status' },
        { Value: sourceSystem, Label: 'Source System' }
      ]
    },
    FieldGroup#Dates: {
      Data: [
        { Value: issueDate, Label: 'Issue Date' },
        { Value: deliveryStartDate, Label: 'Delivery Start' },
        { Value: deliveryEndDate, Label: 'Delivery End' },
        { Value: validityStartDate, Label: 'Validity Start' },
        { Value: validityEndDate, Label: 'Validity End' }
      ]
    },
    FieldGroup#Financial: {
      Data: [
        { Value: totalNetValue, Label: 'Total Net Value' },
        { Value: currency_code, Label: 'Currency' }
      ]
    }
  }
);

annotate OrderService.PurchaseOrderItems with @(
  UI: {
    HeaderInfo: {
      TypeName: 'PO Item',
      TypeNamePlural: 'PO Items',
      Title: { Value: poItemNumber }
    },
    LineItem: [
      { Value: poItemNumber, Label: 'Item', Position: 10 },
      { Value: itemType.name, Label: 'Type', Position: 20 },
      { Value: serviceLevel.name, Label: 'Service Level', Position: 30 },
      { Value: volume, Label: 'Volume', Position: 40 },
      { Value: unitOfMeasure.name, Label: 'UoM', Position: 50 },
      { Value: unitPrice, Label: 'Unit Price', Position: 60 },
      { Value: netValue, Label: 'Net Value', Position: 70 },
      { Value: currency_code, Label: 'Currency', Position: 80 },
      { Value: targetCustomer.customerName, Label: 'Customer', Position: 90 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Item Details', Target: '@UI.FieldGroup#ItemDetails', ID: 'ItemDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Consumption Allocations', Target: 'consumptionAllocations/@UI.LineItem', ID: 'AllocationsList' }
    ],
    FieldGroup#ItemDetails: {
      Data: [
        { Value: poItemNumber, Label: 'Item Number' },
        { Value: itemType_ID, Label: 'Item Type' },
        { Value: serviceLevel_ID, Label: 'Service Level' },
        { Value: volume, Label: 'Volume' },
        { Value: unitOfMeasure_ID, Label: 'Unit of Measure' },
        { Value: unitPrice, Label: 'Unit Price' },
        { Value: netValue, Label: 'Net Value' },
        { Value: currency_code, Label: 'Currency' },
        { Value: targetCustomer_ID, Label: 'Target Customer' },
        { Value: customerContact, Label: 'Customer Contact' }
      ]
    }
  }
);

// ============================================================
// INVOICE ANNOTATIONS (InvoiceService)
// ============================================================

annotate InvoiceService.Invoices with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Invoice',
      TypeNamePlural: 'Invoices',
      Title: { Value: invoiceNumber },
      Description: { Value: supplier.supplierName }
    },
    SelectionFields: [
      invoiceNumber, supplier_ID, status, invoiceDate, sourceSystem, currency_code
    ],
    LineItem: [
      { Value: invoiceNumber, Label: 'Invoice No.', Position: 10 },
      { Value: invoiceDate, Label: 'Date', Position: 20 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 30 },
      { Value: netValue, Label: 'Net Value', Position: 40 },
      { Value: taxValue, Label: 'Tax', Position: 50 },
      { Value: grossValue, Label: 'Gross Value', Position: 60 },
      { Value: currency_code, Label: 'Currency', Position: 70 },
      { Value: status, Label: 'Status', Position: 80, Criticality: statusCriticality },
      { Value: sourceSystem, Label: 'Source', Position: 90 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Invoice Details', Target: '@UI.FieldGroup#InvoiceDetails', ID: 'InvoiceDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Status & Lifecycle', Target: '@UI.FieldGroup#StatusLifecycle', ID: 'StatusLifecycleFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Financial Summary', Target: '@UI.FieldGroup#Financial', ID: 'FinancialFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Invoice Lines (linked to PO Items)', Target: 'lines/@UI.LineItem', ID: 'LinesList' }
    ],
    FieldGroup#InvoiceDetails: {
      Data: [
        { Value: invoiceNumber, Label: 'Invoice Number' },
        { Value: invoiceDate, Label: 'Invoice Date' },
        { Value: supplier_ID, Label: 'Supplier' },
        { Value: sourceSystem, Label: 'Source System' }
      ]
    },
    FieldGroup#StatusLifecycle: {
      Data: [
        { Value: status, Label: 'Current Status', Criticality: statusCriticality },
        { Value: createdAt, Label: 'Created On' },
        { Value: createdBy, Label: 'Created By' },
        { Value: modifiedAt, Label: 'Last Modified' },
        { Value: modifiedBy, Label: 'Modified By' }
      ]
    },
    FieldGroup#Financial: {
      Data: [
        { Value: netValue, Label: 'Net Value (sum of lines)' },
        { Value: taxValue, Label: 'Tax Value' },
        { Value: grossValue, Label: 'Gross Value (Net + Tax)' },
        { Value: currency_code, Label: 'Currency' }
      ]
    }
  }
);

annotate InvoiceService.InvoiceLines with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Invoice Line',
      TypeNamePlural: 'Invoice Lines'
    },
    LineItem: [
      { Value: lineNumber, Label: 'Line', Position: 10 },
      { Value: description, Label: 'Description', Position: 20 },
      { Value: poItem.poItemNumber, Label: 'PO Item', Position: 30 },
      { $Type: 'UI.DataFieldWithUrl', Value: poItem.purchaseOrder.poNumber, Label: 'PO Number (navigate)', Url: poNavigationUrl, Position: 40 },
      { Value: quantity, Label: 'Quantity', Position: 50 },
      { Value: unitPrice, Label: 'Unit Price', Position: 60 },
      { Value: netValue, Label: 'Net Value', Position: 70 },
      { Value: currency_code, Label: 'Currency', Position: 80 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Line Details', Target: '@UI.FieldGroup#LineDetails', ID: 'LineDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'PO Item Linkage', Target: '@UI.FieldGroup#POLinkage', ID: 'POLinkageFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Consumption Allocation', Target: '@UI.FieldGroup#AllocationLink', ID: 'AllocationLinkFacet' }
    ],
    FieldGroup#LineDetails: {
      Data: [
        { Value: lineNumber, Label: 'Line Number' },
        { Value: description, Label: 'Description' },
        { Value: quantity, Label: 'Quantity' },
        { Value: unitPrice, Label: 'Unit Price' },
        { Value: netValue, Label: 'Net Value' },
        { Value: currency_code, Label: 'Currency' }
      ]
    },
    FieldGroup#POLinkage: {
      Data: [
        { Value: poItem_ID, Label: 'PO Item' },
        { Value: poItem.poItemNumber, Label: 'PO Item Number' },
        { Value: poItem.purchaseOrder.poNumber, Label: 'Purchase Order' },
        { Value: poItem.netValue, Label: 'PO Item Total Value' },
        { Value: poItem.volume, Label: 'PO Item Volume' },
        { Value: poItem.unitPrice, Label: 'PO Item Rate' }
      ]
    },
    FieldGroup#AllocationLink: {
      Data: [
        { Value: allocation_ID, Label: 'Consumption Allocation' },
        { Value: allocation.plwProjectNumber, Label: 'Project' },
        { Value: allocation.consumingChapterArea.name, Label: 'Chapter Area' },
        { Value: allocation.consumedValue, Label: 'Consumed Value' },
        { Value: allocation.actualFte, Label: 'Actual FTE' }
      ]
    }
  }
);

// ============================================================
// CONSUMPTION ANNOTATIONS (ConsumptionService)
// ============================================================

annotate ConsumptionService.ConsumptionAllocations with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Consumption Allocation',
      TypeNamePlural: 'Consumption Allocations',
      Title: { Value: plwProjectNumber },
      Description: { Value: consumingChapterArea.name }
    },
    SelectionFields: [
      consumingChapterArea_ID, resourcePool_ID, costCenter_ID, consultant_ID
    ],
    LineItem: [
      { Value: consumingChapterArea.name, Label: 'Chapter Area', Position: 10 },
      { Value: resourcePool.name, Label: 'Resource Pool', Position: 20 },
      { Value: costCenter.name, Label: 'Cost Center', Position: 30 },
      { Value: plwProjectNumber, Label: 'Project', Position: 40 },
      { Value: plannedFte, Label: 'Planned FTE', Position: 50 },
      { Value: actualFte, Label: 'Actual FTE', Position: 60 },
      { Value: consumedVolume, Label: 'Consumed Vol.', Position: 70 },
      { Value: consumedValue, Label: 'Consumed Value', Position: 80 },
      { Value: consultant.lastName, Label: 'Consultant', Position: 90 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Allocation Details', Target: '@UI.FieldGroup#AllocationDetails', ID: 'AllocationDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Planning', Target: '@UI.FieldGroup#Planning', ID: 'PlanningFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Actuals', Target: '@UI.FieldGroup#Actuals', ID: 'ActualsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Customer Splits', Target: 'splits/@UI.LineItem', ID: 'SplitsList' },
      { $Type: 'UI.ReferenceFacet', Label: 'Consultant Assignment', Target: '@UI.FieldGroup#ConsultantAssignment', ID: 'ConsultantAssignmentFacet' }
    ],
    FieldGroup#AllocationDetails: {
      Data: [
        { Value: poItem_ID, Label: 'PO Item' },
        { Value: consumingChapterArea_ID, Label: 'Chapter Area' },
        { Value: resourcePool_ID, Label: 'Resource Pool' },
        { Value: costCenter_ID, Label: 'Cost Center' },
        { Value: plwProjectNumber, Label: 'Project Number' },
        { Value: consultant_ID, Label: 'Consultant' }
      ]
    },
    FieldGroup#Planning: {
      Data: [
        { Value: plannedStartDate, Label: 'Planned Start' },
        { Value: plannedEndDate, Label: 'Planned End' },
        { Value: plannedFte, Label: 'Planned FTE' }
      ]
    },
    FieldGroup#Actuals: {
      Data: [
        { Value: actualStartDate, Label: 'Actual Start' },
        { Value: actualEndDate, Label: 'Actual End' },
        { Value: actualFte, Label: 'Actual FTE' },
        { Value: consumedVolume, Label: 'Consumed Volume' },
        { Value: consumedValue, Label: 'Consumed Value' }
      ]
    },
    FieldGroup#ConsultantAssignment: {
      Data: [
        { Value: consultant_ID, Label: 'Consultant' },
        { Value: consultant.firstName, Label: 'First Name' },
        { Value: consultant.lastName, Label: 'Last Name' },
        { Value: consultant.email, Label: 'Email' },
        { Value: consultant.supplierRef.supplierName, Label: 'Supplier' },
        { Value: consultant.skillProfile, Label: 'Skills' }
      ]
    }
  }
);

annotate ConsumptionService.AllocationSplits with @(
  UI: {
    LineItem: [
      { Value: customer.customerName, Label: 'Customer', Position: 10 },
      { Value: customer.customerNumber, Label: 'Customer No.', Position: 20 },
      { Value: splitPercentage, Label: 'Split %', Position: 30 },
      { Value: fteShare, Label: 'FTE Share', Position: 40 },
      { Value: valueShare, Label: 'Value Share (EUR)', Position: 50 }
    ]
  }
);

annotate ConsumptionService.Consultants with @(
  UI: {
    HeaderInfo: {
      TypeName: 'Consultant',
      TypeNamePlural: 'Consultants',
      Title: { Value: lastName },
      Description: { Value: firstName }
    },
    SelectionFields: [
      lastName, firstName, supplierRef_ID, isActive
    ],
    LineItem: [
      { Value: firstName, Label: 'First Name', Position: 10 },
      { Value: lastName, Label: 'Last Name', Position: 20 },
      { Value: email, Label: 'Email', Position: 30 },
      { Value: supplierRef.supplierName, Label: 'Supplier', Position: 40 },
      { Value: skillProfile, Label: 'Skills', Position: 50 },
      { Value: isActive, Label: 'Active', Position: 60 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Consultant Details', Target: '@UI.FieldGroup#ConsultantDetails', ID: 'ConsultantFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Customer Assignments', Target: 'allocations/@UI.LineItem#ConsultantAllocations', ID: 'CustomerAssignmentsFacet' }
    ],
    FieldGroup#ConsultantDetails: {
      Data: [
        { Value: firstName, Label: 'First Name' },
        { Value: lastName, Label: 'Last Name' },
        { Value: email, Label: 'Email' },
        { Value: supplierRef_ID, Label: 'Supplier' },
        { Value: skillProfile, Label: 'Skill Profile' },
        { Value: isActive, Label: 'Active' }
      ]
    }
  }
);

// Consultant's customer assignments (shown on Consultant Object Page)
annotate ConsumptionService.ConsumptionAllocations with @(
  UI.LineItem#ConsultantAllocations: [
    { Value: consumingChapterArea.name, Label: 'Chapter Area', Position: 10 },
    { Value: plwProjectNumber, Label: 'Project', Position: 20 },
    { Value: plannedStartDate, Label: 'Start', Position: 30 },
    { Value: plannedEndDate, Label: 'End', Position: 40 },
    { Value: plannedFte, Label: 'Planned FTE', Position: 50 },
    { Value: actualFte, Label: 'Actual FTE', Position: 60 },
    { Value: consumedValue, Label: 'Consumed Value', Position: 70 }
  ]
);
