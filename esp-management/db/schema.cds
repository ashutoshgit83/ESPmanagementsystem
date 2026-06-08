namespace esp.management;

using { cuid, managed, Currency, Country } from '@sap/cds/common';

// ============================================================
// REFERENCE DATA / CODE LISTS
// ============================================================

entity OrderTypes : cuid {
  code        : String(20);
  name        : String(100);
  description : String(500);
}

entity ItemTypes : cuid {
  code        : String(20);
  name        : String(100);
  description : String(500);
}

entity ServiceLevels : cuid {
  code        : String(20);
  name        : String(100);
  description : String(500);
}

entity UnitsOfMeasure : cuid {
  code        : String(10);
  name        : String(50);
}

// ============================================================
// DROPDOWN CODE LISTS (for fixed value helps)
// ============================================================

entity SupplierClassificationCodes {
  key code : String(30);
  description : String(100);
}

entity LocationClassificationCodes {
  key code : String(10);
  description : String(100);
}

entity ExceptionScenarioCodes {
  key code : String(80);
  description : String(200);
}

// ============================================================
// ORGANIZATIONAL STRUCTURE
// ============================================================

entity ChapterDomains : cuid, managed {
  code         : String(20);
  name         : String(200);
  description  : String(500);
  chapterAreas : Composition of many ChapterAreas on chapterAreas.domain = $self;
}

entity ChapterAreas : cuid, managed {
  code          : String(20);
  name          : String(200);
  description   : String(500);
  domain        : Association to ChapterDomains;
  resourcePools : Composition of many ResourcePools on resourcePools.chapterArea = $self;
}

entity ResourcePools : cuid, managed {
  code        : String(20);
  name        : String(200);
  description : String(500);
  chapterArea : Association to ChapterAreas;
}

entity CostCenters : cuid, managed {
  code        : String(20);
  name        : String(200);
  region      : String(50);
  country     : Country;
}

// ============================================================
// SUPPLIER MASTER DATA
// ============================================================

entity Suppliers : cuid, managed {
  supplierNumber         : String(20);
  supplierName           : String(200);
  isOem                  : Boolean default false;
  isRateCard             : Boolean default false;
  rateCardScope          : String(20);   // Global / Regional
  country                : Country;
  hcbLcb                 : String(10);   // HCB / LCB
  billingEntityCountry   : Country;
  serviceDeliveryCountry : Country;
  tier                   : String(20);   // Platinum / Gold / Silver
  classificationAttribute : String(30); // Rate Card Global, Rate Card Regional, OEM, Tender/Fixed
  locationClassification : String(10);  // HCB / LCB
  exceptionScenario      : String(80);  // Exception: ordered from HCB, delivered at LCB
  primaryContactName     : String(200);
  primaryContactEmail    : String(200);
  contacts               : Composition of many SupplierContacts
                             on contacts.supplier = $self;
  classifications        : Composition of many SupplierClassifications
                             on classifications.supplier = $self;
  purchaseOrders         : Association to many PurchaseOrders
                             on purchaseOrders.supplier = $self;
  invoices               : Association to many Invoices
                             on invoices.supplier = $self;
}

entity SupplierContacts : cuid, managed {
  supplier    : Association to Suppliers;
  firstName   : String(100);
  lastName    : String(100);
  email       : String(200);
  phone       : String(50);
  role        : String(100);
  isPrimary   : Boolean default false;
}

entity SupplierClassifications : cuid, managed {
  supplier          : Association to Suppliers;
  classificationType : String(50);  // OEM, RateCard, Tier, HCB/LCB
  classificationValue : String(100);
  validFrom         : Date;
  validTo           : Date;
}

// ============================================================
// CUSTOMER MASTER DATA
// ============================================================

entity Customers : cuid, managed {
  customerNumber : String(20);
  customerName   : String(200);
  country        : Country;
  contactName    : String(200);
  contactEmail   : String(200);
  isActive       : Boolean default true;
  // Back-associations: linked orders and consumption allocations
  orderItems     : Association to many PurchaseOrderItems
                     on orderItems.targetCustomer = $self;
  allocationSplits : Association to many AllocationSplits
                     on allocationSplits.customer = $self;
}

// ============================================================
// PURCHASE ORDER MANAGEMENT
// ============================================================

entity PurchaseOrders : cuid, managed {
  poNumber          : String(30);
  issueDate         : Date;
  cid3Number        : String(30);
  orderType         : Association to OrderTypes;
  supplier          : Association to Suppliers;
  deliveryStartDate : Date;
  deliveryEndDate   : Date;
  validityStartDate : Date;
  validityEndDate   : Date;
  issuingChapterArea : Association to ChapterAreas;
  status            : String(20) default 'Draft';  // Draft/Pending/Active/Closed/Cancelled
  sourceSystem      : String(20);  // CID3 / MyBuy / Manual
  totalNetValue     : Decimal(15,2);
  currency          : Currency;
  items             : Composition of many PurchaseOrderItems
                        on items.purchaseOrder = $self;
}

entity PurchaseOrderItems : cuid, managed {
  purchaseOrder     : Association to PurchaseOrders;
  poItemNumber      : String(10);
  itemType          : Association to ItemTypes;
  serviceLevel      : Association to ServiceLevels;
  volume            : Decimal(12,2);
  unitOfMeasure     : Association to UnitsOfMeasure;
  unitPrice         : Decimal(12,2);
  netValue          : Decimal(15,2);
  currency          : Currency;
  targetCustomer    : Association to Customers;
  customerContact   : String(200);
  consumptionAllocations : Composition of many ConsumptionAllocations
                             on consumptionAllocations.poItem = $self;
  invoiceLines      : Association to many InvoiceLines
                        on invoiceLines.poItem = $self;
}

// ============================================================
// CONSUMPTION & RESOURCE TRACKING
// ============================================================

entity Consultants : cuid, managed {
  firstName     : String(100);
  lastName      : String(100);
  email         : String(200);
  supplierRef   : Association to Suppliers;
  skillProfile  : String(500);
  isActive      : Boolean default true;
  // Back-association: allocations where this consultant is assigned
  allocations   : Association to many ConsumptionAllocations
                    on allocations.consultant = $self;
}

entity ConsumptionAllocations : cuid, managed {
  poItem                : Association to PurchaseOrderItems;
  consumingChapterArea  : Association to ChapterAreas;
  resourcePool          : Association to ResourcePools;
  costCenter            : Association to CostCenters;
  plwProjectNumber      : String(30);
  plannedStartDate      : Date;
  plannedEndDate        : Date;
  actualStartDate       : Date;
  actualEndDate         : Date;
  plannedFte            : Decimal(8,2);
  actualFte             : Decimal(8,2);
  consumedVolume        : Decimal(12,2);
  consumedValue         : Decimal(15,2);
  consultant            : Association to Consultants;
  splits                : Composition of many AllocationSplits
                            on splits.allocation = $self;
}

entity AllocationSplits : cuid, managed {
  allocation     : Association to ConsumptionAllocations;
  customer       : Association to Customers;
  splitPercentage : Decimal(5,2);
  fteShare       : Decimal(8,2);
  valueShare     : Decimal(15,2);
}

// ============================================================
// INVOICING
// ============================================================

entity Invoices : cuid, managed {
  invoiceNumber  : String(30);
  invoiceDate    : Date;
  supplier       : Association to Suppliers;
  currency       : Currency;
  netValue       : Decimal(15,2);
  taxValue       : Decimal(15,2);
  grossValue     : Decimal(15,2);
  status         : String(20) default 'Received';  // Received/PendingApproval/Approved/Rejected/Paid
  sourceSystem   : String(20);  // PICOS / SAP / Manual
  lines          : Composition of many InvoiceLines
                     on lines.invoice = $self;
}

entity InvoiceLines : cuid, managed {
  invoice        : Association to Invoices;
  lineNumber     : String(10);
  poItem         : Association to PurchaseOrderItems;
  allocation     : Association to ConsumptionAllocations;
  description    : String(500);
  quantity       : Decimal(12,2);
  unitPrice      : Decimal(12,2);
  netValue       : Decimal(15,2);
  currency       : Currency;
}

// ============================================================
// FINANCIAL PLANNING & FORECASTING
// ============================================================

entity ForecastCycles : cuid, managed {
  code          : String(20);   // CFC1, CFC2, etc.
  name          : String(100);
  year          : Integer;
  startDate     : Date;
  endDate       : Date;
  isCurrent     : Boolean default false;
  exchangeRates : Composition of many ExchangeRates
                    on exchangeRates.forecastCycle = $self;
}

entity ExchangeRates : cuid, managed {
  forecastCycle   : Association to ForecastCycles;
  sourceCurrency  : Currency;
  targetCurrency  : Currency;
  rate            : Decimal(12,6);
  validFrom       : Date;
  validTo         : Date;
}

entity BusinessPlans : cuid, managed {
  year        : Integer;
  version     : String(20);
  description : String(500);
  status      : String(20) default 'Draft';
  lines       : Composition of many PlanLines
                  on lines.businessPlan = $self;
}

entity PlanLines : cuid, managed {
  businessPlan  : Association to BusinessPlans;
  chapterArea   : Association to ChapterAreas;
  customer      : Association to Customers;
  supplier      : Association to Suppliers;
  costCenter    : Association to CostCenters;
  resourcePool  : Association to ResourcePools;
  serviceType   : String(50);     // T&M, Fixed Price, etc.
  contractType  : String(30);     // Standard T&M, Premium T&M, Fixed Price, Frame
  region        : String(50);     // EMEA, APAC, Americas
  country       : Country;
  plannedValue  : Decimal(15,2);
  plannedFte    : Decimal(8,2);
  hourlyRate    : Decimal(12,2);  // Planned hourly rate
  currency      : Currency;
}

entity Forecasts : cuid, managed {
  forecastCycle : Association to ForecastCycles;
  year          : Integer;
  version       : String(20);
  description   : String(500);
  status        : String(20) default 'Draft';
  lines         : Composition of many ForecastLines
                    on lines.forecast = $self;
}

entity ForecastLines : cuid, managed {
  forecast      : Association to Forecasts;
  chapterArea   : Association to ChapterAreas;
  customer      : Association to Customers;
  supplier      : Association to Suppliers;
  costCenter    : Association to CostCenters;
  resourcePool  : Association to ResourcePools;
  serviceType   : String(50);     // T&M, Fixed Price, etc.
  contractType  : String(30);     // Standard T&M, Premium T&M, Fixed Price, Frame
  region        : String(50);     // EMEA, APAC, Americas
  country       : Country;
  forecastValue : Decimal(15,2);
  forecastFte   : Decimal(8,2);
  hourlyRate    : Decimal(12,2);  // Forecast hourly rate
  currency      : Currency;
}

// ============================================================
// GOVERNANCE: NOTES, ATTACHMENTS, AUDIT
// ============================================================

entity Notes : cuid, managed {
  entityType    : String(50);   // Supplier, PurchaseOrder, Invoice, etc.
  entityId      : String(36);   // UUID of the linked entity
  noteType      : String(50);   // Internal / CustomerFeedback / Collaboration
  subject       : String(200);
  content       : LargeString;
  createdByName : String(200);
}

entity Attachments : cuid, managed {
  entityType    : String(50);
  entityId      : String(36);
  fileName      : String(500);
  mimeType      : String(100);
  fileSize      : Integer;
  content       : LargeBinary;
  description   : String(500);
}

entity AuditLogs : cuid {
  timestamp     : Timestamp;
  entityType    : String(50);
  entityId      : String(36);
  action        : String(20);   // Create / Update / Delete / Approve / Reject
  fieldName     : String(100);
  oldValue      : String(1000);
  newValue      : String(1000);
  changedBy     : String(200);
  changedAt     : Timestamp;
}

// ============================================================
// INTEGRATION & DATA INGESTION
// ============================================================

entity ImportBatches : cuid, managed {
  batchName     : String(200);
  sourceSystem  : String(50);   // CID3 / MyBuy / PICOS / Manual
  importDate    : Timestamp;
  status        : String(20);   // Pending / Processing / Completed / Failed
  totalRecords  : Integer;
  successCount  : Integer;
  errorCount    : Integer;
  importedBy    : String(200);
  logMessages   : LargeString;
  records       : Composition of many SourceSystemRecords
                    on records.importBatch = $self;
}

entity SourceSystemRecords : cuid {
  importBatch       : Association to ImportBatches;
  sourceRecordId    : String(100);
  sourceSystem      : String(50);
  extractDate       : Timestamp;
  entityType        : String(50);
  entityId          : String(36);
  rawData           : LargeString;
  status            : String(20);  // Mapped / Error / Skipped
  errorMessage      : String(1000);
}
