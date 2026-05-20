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
      supplierNumber, supplierName, country_code, hcbLcb, tier, isOem, isRateCard
    ],
    LineItem: [
      { Value: supplierNumber, Label: 'Supplier No.', Position: 10 },
      { Value: supplierName, Label: 'Supplier Name', Position: 20 },
      { Value: country_code, Label: 'Country', Position: 30 },
      { Value: hcbLcb, Label: 'HCB/LCB', Position: 40 },
      { Value: tier, Label: 'Tier', Position: 50 },
      { Value: isOem, Label: 'OEM', Position: 60 },
      { Value: isRateCard, Label: 'Rate Card', Position: 70 },
      { Value: primaryContactName, Label: 'Contact', Position: 80 }
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
        { Value: isOem, Label: 'OEM Supplier' },
        { Value: isRateCard, Label: 'Rate Card' },
        { Value: rateCardScope, Label: 'Rate Card Scope' },
        { Value: hcbLcb, Label: 'HCB/LCB' },
        { Value: tier, Label: 'Tier' }
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
      { $Type: 'UI.ReferenceFacet', Label: 'General Information', Target: '@UI.FieldGroup#General', ID: 'GeneralFacet' }
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
      invoiceNumber, supplier_ID, status, invoiceDate, sourceSystem
    ],
    LineItem: [
      { Value: invoiceNumber, Label: 'Invoice No.', Position: 10 },
      { Value: invoiceDate, Label: 'Date', Position: 20 },
      { Value: supplier.supplierName, Label: 'Supplier', Position: 30 },
      { Value: netValue, Label: 'Net Value', Position: 40 },
      { Value: grossValue, Label: 'Gross Value', Position: 50 },
      { Value: currency_code, Label: 'Currency', Position: 60 },
      { Value: status, Label: 'Status', Position: 70, Criticality: statusCriticality },
      { Value: sourceSystem, Label: 'Source', Position: 80 }
    ],
    Facets: [
      { $Type: 'UI.ReferenceFacet', Label: 'Invoice Details', Target: '@UI.FieldGroup#InvoiceDetails', ID: 'InvoiceDetailsFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Financial', Target: '@UI.FieldGroup#Financial', ID: 'FinancialFacet' },
      { $Type: 'UI.ReferenceFacet', Label: 'Invoice Lines', Target: 'lines/@UI.LineItem', ID: 'LinesList' }
    ],
    FieldGroup#InvoiceDetails: {
      Data: [
        { Value: invoiceNumber, Label: 'Invoice Number' },
        { Value: invoiceDate, Label: 'Invoice Date' },
        { Value: supplier_ID, Label: 'Supplier' },
        { Value: status, Label: 'Status' },
        { Value: sourceSystem, Label: 'Source System' }
      ]
    },
    FieldGroup#Financial: {
      Data: [
        { Value: netValue, Label: 'Net Value' },
        { Value: taxValue, Label: 'Tax Value' },
        { Value: grossValue, Label: 'Gross Value' },
        { Value: currency_code, Label: 'Currency' }
      ]
    }
  }
);

annotate InvoiceService.InvoiceLines with @(
  UI: {
    LineItem: [
      { Value: lineNumber, Label: 'Line', Position: 10 },
      { Value: description, Label: 'Description', Position: 20 },
      { Value: quantity, Label: 'Quantity', Position: 30 },
      { Value: unitPrice, Label: 'Unit Price', Position: 40 },
      { Value: netValue, Label: 'Net Value', Position: 50 },
      { Value: currency_code, Label: 'Currency', Position: 60 }
    ]
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
      { $Type: 'UI.ReferenceFacet', Label: 'Customer Splits', Target: 'splits/@UI.LineItem', ID: 'SplitsList' }
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
    }
  }
);

annotate ConsumptionService.AllocationSplits with @(
  UI: {
    LineItem: [
      { Value: customer.customerName, Label: 'Customer', Position: 10 },
      { Value: splitPercentage, Label: 'Split %', Position: 20 },
      { Value: fteShare, Label: 'FTE Share', Position: 30 },
      { Value: valueShare, Label: 'Value Share', Position: 40 }
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
      { $Type: 'UI.ReferenceFacet', Label: 'Consultant Details', Target: '@UI.FieldGroup#ConsultantDetails', ID: 'ConsultantFacet' }
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
