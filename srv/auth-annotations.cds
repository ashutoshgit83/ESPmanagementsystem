using MasterDataService from './services';
using OrderService from './services';
using ConsumptionService from './services';
using InvoiceService from './services';
using ReportingService from './services';
using AdminService from './services';

// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) ANNOTATIONS
// Maps to xs-security.json scopes / role-collections
// ============================================================

// MasterDataService:
//   - Members can read (own area data)
//   - Managers can read
//   - GPM has full read
//   - Admin has full CRUD
annotate MasterDataService with @(requires: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice', 'SystemAdmin']);
annotate MasterDataService.Suppliers with @(restrict: [
  { grant: ['READ'], to: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate MasterDataService.Customers with @(restrict: [
  { grant: ['READ'], to: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);

// OrderService:
//   - Members can create orders and read
//   - Managers can approve/reject + read all
//   - GPM has read
//   - Admin has full CRUD
annotate OrderService with @(requires: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice', 'SystemAdmin']);
annotate OrderService.PurchaseOrders with @(restrict: [
  { grant: ['READ', 'CREATE', 'UPDATE'], to: ['ChapterAreaMember'] },
  { grant: ['READ', 'CREATE', 'UPDATE'], to: ['ChapterAreaManager'] },
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate OrderService.PurchaseOrderItems with @(restrict: [
  { grant: ['READ', 'CREATE', 'UPDATE'], to: ['ChapterAreaMember'] },
  { grant: ['READ', 'CREATE', 'UPDATE'], to: ['ChapterAreaManager'] },
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);

// ConsumptionService:
//   - Members can create/update allocations
//   - Managers can read + manage
//   - GPM read only
//   - Admin full CRUD
annotate ConsumptionService with @(requires: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice', 'SystemAdmin']);
annotate ConsumptionService.ConsumptionAllocations with @(restrict: [
  { grant: ['READ', 'CREATE', 'UPDATE'], to: ['ChapterAreaMember'] },
  { grant: ['READ', 'CREATE', 'UPDATE', 'DELETE'], to: ['ChapterAreaManager'] },
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);

// InvoiceService:
//   - Members can read invoices
//   - Managers can approve/reject
//   - GPM read
//   - Admin full CRUD
annotate InvoiceService with @(requires: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice', 'SystemAdmin']);
annotate InvoiceService.Invoices with @(restrict: [
  { grant: ['READ'], to: ['ChapterAreaMember'] },
  { grant: ['READ', 'CREATE', 'UPDATE'], to: ['ChapterAreaManager'] },
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);

// ReportingService:
//   - Read-only for all roles (GPM & Manager get full views, Members see own area)
annotate ReportingService with @(requires: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice', 'SystemAdmin']);

// AdminService:
//   - GPM can read analytics/config data
//   - Admin has full CRUD
annotate AdminService with @(requires: ['GPM_Backoffice', 'SystemAdmin']);
annotate AdminService.ImportBatches with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate AdminService.AuditLogs with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice', 'SystemAdmin'] }
]);
annotate AdminService.ForecastCycles with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate AdminService.BusinessPlans with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate AdminService.ChapterDomains with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate AdminService.CostCenters with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate AdminService.OrderTypes with @(restrict: [
  { grant: ['READ'], to: ['GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
annotate AdminService.Notes with @(restrict: [
  { grant: ['READ', 'CREATE'], to: ['ChapterAreaMember', 'ChapterAreaManager', 'GPM_Backoffice'] },
  { grant: ['*'], to: ['SystemAdmin'] }
]);
