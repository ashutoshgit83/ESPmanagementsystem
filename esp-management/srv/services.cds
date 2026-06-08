using { esp.management as db } from '../db/schema';
using from './annotations';
using from './value-helps';
using from './admin-annotations';
using from './admin-value-helps';
using from './auth-annotations';
using from './status-value-helps';
using from './notes-annotations';
using from './reporting-annotations';

// ============================================================
// MASTER DATA SERVICE
// Supplier & Customer CRUD, Org hierarchy
// ============================================================
@impl: './master-data-service.js'
service MasterDataService @(path: '/odata/v4/master-data') {

  @odata.draft.enabled
  entity Suppliers as projection on db.Suppliers;
  entity SupplierContacts as projection on db.SupplierContacts;
  entity SupplierClassifications as projection on db.SupplierClassifications;

  @odata.draft.enabled
  entity Customers as projection on db.Customers;
  // Linked entities for Customer Object Page (read-only)
  @readonly entity CustomerOrderItems as projection on db.PurchaseOrderItems;
  @readonly entity CustomerAllocationSplits as projection on db.AllocationSplits;

  // Notes (for Supplier/Customer Object Pages)
  entity Notes as projection on db.Notes;

  // Dropdown value list entities
  @readonly entity SupplierClassificationValues as select from db.SupplierClassificationCodes;
  @readonly entity LocationClassificationValues as select from db.LocationClassificationCodes;
  @readonly entity ExceptionScenarioValues as select from db.ExceptionScenarioCodes;

  @readonly
  entity ChapterDomains as projection on db.ChapterDomains;
  @readonly
  entity ChapterAreas as projection on db.ChapterAreas;
  @readonly
  entity ResourcePools as projection on db.ResourcePools;
  @readonly
  entity CostCenters as projection on db.CostCenters;
}

// ============================================================
// ORDER SERVICE
// Purchase Order lifecycle management
// ============================================================
@impl: './order-service.js'
service OrderService @(path: '/odata/v4/orders') {

  @odata.draft.enabled
  entity PurchaseOrders as projection on db.PurchaseOrders {
    *,
    virtual null as statusCriticality : Integer
  };
  entity PurchaseOrderItems as projection on db.PurchaseOrderItems;

  // Value helps
  @readonly entity OrderTypes as projection on db.OrderTypes;
  @readonly entity ItemTypes as projection on db.ItemTypes;
  @readonly entity ServiceLevels as projection on db.ServiceLevels;
  @readonly entity UnitsOfMeasure as projection on db.UnitsOfMeasure;
  @readonly entity Suppliers as projection on db.Suppliers;
  @readonly entity ChapterAreas as projection on db.ChapterAreas;
  @readonly entity Customers as projection on db.Customers;

  // Notes (for PO Object Page)
  entity Notes as projection on db.Notes;

  // Actions for status transitions
  action submitPurchaseOrder(poId: UUID) returns PurchaseOrders;
  action approvePurchaseOrder(poId: UUID) returns PurchaseOrders;
  action rejectPurchaseOrder(poId: UUID) returns PurchaseOrders;
  action closePurchaseOrder(poId: UUID) returns PurchaseOrders;
  action cancelPurchaseOrder(poId: UUID) returns PurchaseOrders;
}

// ============================================================
// CONSUMPTION SERVICE
// Allocation & resource tracking
// ============================================================
@impl: './consumption-service.js'
service ConsumptionService @(path: '/odata/v4/consumption') {

  @odata.draft.enabled
  entity ConsumptionAllocations as projection on db.ConsumptionAllocations;
  entity AllocationSplits as projection on db.AllocationSplits;

  @odata.draft.enabled
  entity Consultants as projection on db.Consultants;

  // Value helps
  @readonly entity PurchaseOrderItems as projection on db.PurchaseOrderItems;
  @readonly entity ChapterAreas as projection on db.ChapterAreas;
  @readonly entity ResourcePools as projection on db.ResourcePools;
  @readonly entity CostCenters as projection on db.CostCenters;
  @readonly entity Customers as projection on db.Customers;
}

// ============================================================
// INVOICE SERVICE
// Invoice registration and management
// ============================================================
@impl: './invoice-service.js'
service InvoiceService @(path: '/odata/v4/invoices') {

  @odata.draft.enabled
  entity Invoices as projection on db.Invoices {
    *,
    virtual null as statusCriticality : Integer
  };
  entity InvoiceLines as projection on db.InvoiceLines {
    *,
    virtual null as poNavigationUrl : String
  };

  // Value helps and navigation targets
  @readonly entity Suppliers as projection on db.Suppliers;
  @readonly entity PurchaseOrders as projection on db.PurchaseOrders;
  @readonly entity PurchaseOrderItems as projection on db.PurchaseOrderItems;
  @readonly entity ConsumptionAllocations as projection on db.ConsumptionAllocations;

  // Notes (for Invoice Object Page)
  entity Notes as projection on db.Notes;

  // Actions for approval workflow
  action submitForApproval(invoiceId: UUID) returns Invoices;
  action approveInvoice(invoiceId: UUID) returns Invoices;
  action rejectInvoice(invoiceId: UUID) returns Invoices;
  action markAsPaid(invoiceId: UUID) returns Invoices;
}

// ============================================================
// REPORTING SERVICE (Read-only)
// Analytics, KPIs, Financial Comparisons
// ============================================================
service ReportingService @(path: '/odata/v4/reporting') {

  @readonly entity Suppliers as projection on db.Suppliers;
  @readonly entity Customers as projection on db.Customers;
  @readonly entity PurchaseOrders as projection on db.PurchaseOrders;
  @readonly entity PurchaseOrderItems as projection on db.PurchaseOrderItems;
  @readonly entity ConsumptionAllocations as projection on db.ConsumptionAllocations;
  @readonly entity Invoices as projection on db.Invoices;
  @readonly entity InvoiceLines as projection on db.InvoiceLines;
  @readonly entity ChapterAreas as projection on db.ChapterAreas;
  @readonly entity BusinessPlans as projection on db.BusinessPlans;
  @readonly entity PlanLines as projection on db.PlanLines;
  @readonly entity Forecasts as projection on db.Forecasts;
  @readonly entity ForecastLines as projection on db.ForecastLines;
  @readonly entity ForecastCycles as projection on db.ForecastCycles;
  @readonly entity ExchangeRates as projection on db.ExchangeRates;
}

// ============================================================
// ADMIN SERVICE
// Configuration, Import, Audit
// ============================================================
@impl: './admin-service.js'
service AdminService @(path: '/odata/v4/admin') {

  // Financial Planning
  @odata.draft.enabled
  entity BusinessPlans as projection on db.BusinessPlans;
  entity PlanLines as projection on db.PlanLines;

  @odata.draft.enabled
  entity Forecasts as projection on db.Forecasts;
  entity ForecastLines as projection on db.ForecastLines;

  @odata.draft.enabled
  entity ForecastCycles as projection on db.ForecastCycles;
  entity ExchangeRates as projection on db.ExchangeRates;

  // Integration & Import (no draft - managed programmatically)
  entity ImportBatches as projection on db.ImportBatches;
  entity SourceSystemRecords as projection on db.SourceSystemRecords;

  // Governance
  entity Notes as projection on db.Notes;
  entity Attachments as projection on db.Attachments;
  @readonly entity AuditLogs as projection on db.AuditLogs;

  // Reference data management
  @odata.draft.enabled entity OrderTypes as projection on db.OrderTypes;
  @odata.draft.enabled entity ItemTypes as projection on db.ItemTypes;
  @odata.draft.enabled entity ServiceLevels as projection on db.ServiceLevels;
  @odata.draft.enabled entity UnitsOfMeasure as projection on db.UnitsOfMeasure;

  // Org hierarchy management
  @odata.draft.enabled entity ChapterDomains as projection on db.ChapterDomains;
  entity ChapterAreas as projection on db.ChapterAreas;
  entity ResourcePools as projection on db.ResourcePools;

  @odata.draft.enabled entity CostCenters as projection on db.CostCenters;

  // Value-help entities for financial planning
  @readonly entity Suppliers as projection on db.Suppliers;
  @readonly entity Customers as projection on db.Customers;
}
