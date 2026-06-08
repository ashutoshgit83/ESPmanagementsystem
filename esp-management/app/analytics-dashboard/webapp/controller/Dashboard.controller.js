sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
  "use strict";

  return Controller.extend("esp.analytics.controller.Dashboard", {

    onInit: function() {
      this._oDashboardModel = new JSONModel({
        kpis: {},
        charts: {},
        tables: {},
        drillDown: { visible: false, title: "", data: [] },
        bpCfcActuals: []
      });
      this.getView().setModel(this._oDashboardModel, "dashboard");
      this._loadDashboardData();
    },

    onRefresh: function() {
      this._loadDashboardData();
      MessageToast.show("Dashboard refreshed");
    },

    // ================================================================
    // EXPORT FUNCTIONS
    // ================================================================
    _downloadCSV: function(data, headers, filename) {
      var csv = headers.join(";") + "\n";
      data.forEach(function(row) {
        csv += headers.map(function(h) { return row[h] != null ? String(row[h]).replace(/;/g, ",") : ""; }).join(";") + "\n";
      });
      var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename + "_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
      MessageToast.show("Exported: " + filename);
    },

    onExportOrders: function() {
      var data = this._oDashboardModel.getProperty("/tables/activeOrders") || [];
      this._downloadCSV(data, ["poNumber", "supplierName", "orderType", "totalNetValue", "currency", "status", "deliveryEndDate"], "esp_orders");
    },

    onExportInvoices: function() {
      var data = (this._rawInvoices || []).map(function(inv) {
        return { invoiceNumber: inv.invoiceNumber, date: inv.invoiceDate, supplier: inv.supplier ? inv.supplier.supplierName : "", netValue: inv.netValue, status: inv.status, currency: inv.currency_code };
      });
      this._downloadCSV(data, ["invoiceNumber", "date", "supplier", "netValue", "status", "currency"], "esp_invoices");
    },

    onExportConsumption: function() {
      var data = (this._rawAllocations || []).map(function(a) {
        return { area: a.consumingChapterArea ? a.consumingChapterArea.name : "", project: a.plwProjectNumber, plannedFte: a.plannedFte, actualFte: a.actualFte, consumedValue: a.consumedValue };
      });
      this._downloadCSV(data, ["area", "project", "plannedFte", "actualFte", "consumedValue"], "esp_consumption");
    },

    onExportComparison: function() {
      var data = this._oDashboardModel.getProperty("/bpCfcActuals") || [];
      this._downloadCSV(data, ["area", "bp", "cfc", "actuals", "variance"], "esp_bp_cfc_actuals");
    },

    onExportAll: function() {
      this.onExportOrders();
      var that = this;
      setTimeout(function() { that.onExportInvoices(); }, 500);
      setTimeout(function() { that.onExportConsumption(); }, 1000);
      setTimeout(function() { that.onExportComparison(); }, 1500);
    },

    onExportDrillDown: function() {
      var data = this._oDashboardModel.getProperty("/drillDown/data") || [];
      var title = this._oDashboardModel.getProperty("/drillDown/title") || "drilldown";
      this._downloadCSV(data, ["col1", "col2", "col3", "col4"], "esp_" + title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30));
    },

    // ================================================================
    // CHART DRILL-DOWN
    // ================================================================
    // ================================================================
    // KPI TILE DRILL-DOWN
    // ================================================================
    onKpiSuppliers: function() {
      var data = (this._rawOrders || []).map(function(po) {
        return { col1: po.supplier ? po.supplier.supplierName : "-", col2: po.poNumber, col3: po.totalNetValue + " EUR", col4: po.status };
      });
      // Group by supplier
      var suppliers = {};
      (this._rawOrders || []).forEach(function(po) { var n = po.supplier ? po.supplier.supplierName : "?"; suppliers[n] = (suppliers[n] || 0) + 1; });
      var grouped = Object.keys(suppliers).map(function(s) { return { col1: s, col2: suppliers[s] + " orders", col3: "", col4: "" }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Supplier Portfolio", data: grouped });
    },
    onKpiOrders: function() {
      var data = (this._rawOrders || []).map(function(po) { return { col1: po.poNumber, col2: po.supplier ? po.supplier.supplierName : "-", col3: po.totalNetValue + " EUR", col4: po.status }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "All Purchase Orders (" + data.length + ")", data: data });
    },
    onKpiInvoices: function() {
      var data = (this._rawInvoices || []).map(function(inv) { return { col1: inv.invoiceNumber, col2: inv.supplier ? inv.supplier.supplierName : "-", col3: inv.netValue + " EUR", col4: inv.status }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "All Invoices (" + data.length + ")", data: data });
    },
    onKpiOpenContracts: function() {
      var data = (this._rawOrders || []).filter(function(po) { return po.status === "Active"; }).map(function(po) { return { col1: po.poNumber, col2: po.supplier ? po.supplier.supplierName : "-", col3: po.totalNetValue + " EUR", col4: po.deliveryEndDate || "-" }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Open Contracts — Active POs (" + data.length + ")", data: data });
    },
    onKpiConsumption: function() {
      var data = (this._rawAllocations || []).map(function(a) { return { col1: a.consumingChapterArea ? a.consumingChapterArea.name : "-", col2: a.plwProjectNumber || "-", col3: a.consumedValue + " EUR", col4: a.actualFte + " FTE" }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Consumption Allocations (" + data.length + ")", data: data });
    },

    onChartPoStatusSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      this._drillDownByStatus("PurchaseOrders", oData[0].data.Status);
    },
    onChartInvStatusSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      this._drillDownByStatus("Invoices", oData[0].data.Status);
    },
    onChartSupplierSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      this._drillDownBySupplier(oData[0].data.Supplier);
    },
    onChartAreaSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      this._drillDownByArea(oData[0].data["Chapter Area"]);
    },

    _drillDownByStatus: function(entityType, status) {
      var data = [];
      if (entityType === "PurchaseOrders") {
        data = (this._rawOrders || []).filter(function(po) { return po.status === status; })
          .map(function(po) { return { col1: po.poNumber, col2: po.supplier ? po.supplier.supplierName : "-", col3: po.totalNetValue + " EUR", col4: po.deliveryEndDate || "-" }; });
        this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Purchase Orders — " + status + " (" + data.length + ")", data: data });
      } else {
        data = (this._rawInvoices || []).filter(function(inv) { return inv.status === status; })
          .map(function(inv) { return { col1: inv.invoiceNumber, col2: inv.supplier ? inv.supplier.supplierName : "-", col3: inv.netValue + " EUR", col4: inv.invoiceDate || "-" }; });
        this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Invoices — " + status + " (" + data.length + ")", data: data });
      }
    },
    _drillDownBySupplier: function(supplierName) {
      var data = (this._rawOrders || []).filter(function(po) { return po.supplier && po.supplier.supplierName === supplierName; })
        .map(function(po) { return { col1: po.poNumber, col2: po.status, col3: po.totalNetValue + " EUR", col4: po.deliveryEndDate || "-" }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Orders — " + supplierName + " (" + data.length + ")", data: data });
    },
    _drillDownByArea: function(areaName) {
      var data = (this._rawAllocations || []).filter(function(a) { return a.consumingChapterArea && a.consumingChapterArea.name === areaName; })
        .map(function(a) { return { col1: a.plwProjectNumber || "-", col2: a.plannedFte + " / " + a.actualFte + " FTE", col3: a.consumedValue + " EUR", col4: (a.actualStartDate || "") + " → " + (a.actualEndDate || "") }; });
      this._oDashboardModel.setProperty("/drillDown", { visible: true, title: "Consumption — " + areaName + " (" + data.length + ")", data: data });
    },
    onCloseDrillDown: function() { this._oDashboardModel.setProperty("/drillDown/visible", false); },

    onSearchOrders: function(oEvent) {
      var sQuery = oEvent.getParameter("newValue").toLowerCase();
      var allOrders = this._allTableOrders || [];
      if (!sQuery) { this._oDashboardModel.setProperty("/tables/activeOrders", allOrders); return; }
      this._oDashboardModel.setProperty("/tables/activeOrders", allOrders.filter(function(o) {
        return (o.poNumber || "").toLowerCase().indexOf(sQuery) > -1 || (o.supplierName || "").toLowerCase().indexOf(sQuery) > -1;
      }));
    },

    // ================================================================
    // DATA LOADING
    // ================================================================
    _loadDashboardData: function() {
      var that = this;
      var sServiceUrl = this.getOwnerComponent().getModel().getServiceUrl();

      Promise.all([
        this._fetchJSON(sServiceUrl + "Suppliers?$count=true&$top=0"),
        this._fetchJSON(sServiceUrl + "PurchaseOrders?$select=ID,poNumber,status,totalNetValue,currency_code,deliveryStartDate,deliveryEndDate&$expand=supplier($select=supplierName),orderType($select=name),issuingChapterArea($select=name)"),
        this._fetchJSON(sServiceUrl + "Invoices?$select=ID,invoiceNumber,invoiceDate,status,netValue,grossValue,currency_code&$expand=supplier($select=supplierName)"),
        this._fetchJSON(sServiceUrl + "ConsumptionAllocations?$select=ID,consumedValue,consumedVolume,plannedFte,actualFte,plwProjectNumber,actualStartDate,actualEndDate&$expand=consumingChapterArea($select=name),consultant($select=firstName,lastName)"),
        this._fetchJSON(sServiceUrl + "PurchaseOrderItems?$select=ID,netValue,volume,unitPrice"),
        this._fetchJSON(sServiceUrl + "PlanLines?$select=plannedValue,plannedFte,hourlyRate&$expand=chapterArea($select=name)"),
        this._fetchJSON(sServiceUrl + "ForecastLines?$select=forecastValue,forecastFte,hourlyRate&$expand=chapterArea($select=name)")
      ]).then(function(results) {
        that._rawOrders = results[1].value || [];
        that._rawInvoices = results[2].value || [];
        that._rawAllocations = results[3].value || [];

        that._computeKPIs(results[0], results[1], results[2], results[3], results[4]);
        that._computeCharts(results[1], results[2], results[3]);
        that._buildTables(results[1]);
        that._buildBPvsCFCvsActuals(results[5], results[6], results[3]);
      }).catch(function(err) {
        console.error("Dashboard error:", err);
        MessageToast.show("Error loading data");
      });
    },

    _fetchJSON: function(url) {
      return fetch(url, { headers: { "Accept": "application/json", "Authorization": "Basic " + btoa("admin:admin") } })
        .then(function(r) { return r.json(); });
    },

    _computeKPIs: function(suppliers, orders, invoices, allocations, poItems) {
      var poData = orders.value || [];
      var invData = invoices.value || [];
      var allocData = allocations.value || [];
      var itemData = poItems.value || [];

      var openContracts = poData.filter(function(po) { return po.status === "Active"; });
      var totalOrderVolume = poData.reduce(function(s, po) { return s + (po.totalNetValue || 0); }, 0);
      var totalInvoiced = invData.reduce(function(s, inv) { return s + (inv.netValue || 0); }, 0);
      var totalOrdered = itemData.reduce(function(s, it) { return s + (it.netValue || 0); }, 0);
      var totalConsumed = allocData.reduce(function(s, a) { return s + (a.consumedValue || 0); }, 0);
      var consumptionRate = totalOrdered > 0 ? Math.round((totalConsumed / totalOrdered) * 100) : 0;
      var rates = itemData.filter(function(i) { return i.unitPrice > 0; });
      var avgRate = rates.length > 0 ? Math.round(rates.reduce(function(s, i) { return s + i.unitPrice; }, 0) / rates.length) : 0;
      var activeFte = allocData.reduce(function(s, a) { return s + (a.actualFte || 0); }, 0);
      var pendingInv = invData.filter(function(inv) { return inv.status === "PendingApproval" || inv.status === "Received"; }).length;

      this._oDashboardModel.setProperty("/kpis", {
        supplierCount: suppliers["@odata.count"] || 0,
        totalOrderVolume: Math.round(totalOrderVolume / 1000),
        totalInvoiceVolume: Math.round(totalInvoiced / 1000),
        openContracts: openContracts.length,
        consumptionRate: consumptionRate,
        avgHourlyRate: avgRate,
        activeFte: Math.round(activeFte * 10) / 10,
        pendingInvoices: pendingInv
      });
    },

    _computeCharts: function(orders, invoices, allocations) {
      var poData = orders.value || [];
      var invData = invoices.value || [];
      var allocData = allocations.value || [];

      // PO by Status
      var poStatusMap = {};
      poData.forEach(function(po) { poStatusMap[po.status] = (poStatusMap[po.status] || 0) + 1; });
      var poByStatus = Object.keys(poStatusMap).map(function(s) { return { status: s, count: poStatusMap[s] }; });

      // Invoice by Status
      var invStatusMap = {};
      invData.forEach(function(inv) { invStatusMap[inv.status] = (invStatusMap[inv.status] || 0) + 1; });
      var invoiceByStatus = Object.keys(invStatusMap).map(function(s) { return { status: s, count: invStatusMap[s] }; });

      // Spend by Supplier
      var supplierSpend = {};
      poData.forEach(function(po) { var n = po.supplier ? po.supplier.supplierName : "Unknown"; supplierSpend[n] = (supplierSpend[n] || 0) + (po.totalNetValue || 0); });
      var spendBySupplier = Object.keys(supplierSpend).map(function(s) { return { supplier: s, value: supplierSpend[s] }; }).sort(function(a, b) { return b.value - a.value; });

      // Consumption by Area
      var areaMap = {};
      allocData.forEach(function(a) { var n = a.consumingChapterArea ? a.consumingChapterArea.name : "Unknown"; areaMap[n] = (areaMap[n] || 0) + (a.consumedValue || 0); });
      var consumptionByArea = Object.keys(areaMap).map(function(a) { return { area: a, value: areaMap[a] }; }).sort(function(a, b) { return b.value - a.value; });

      // Consultants by area
      var consultantsByArea = {};
      allocData.forEach(function(a) {
        if (a.consultant) {
          var area = a.consumingChapterArea ? a.consumingChapterArea.name : "Unknown";
          if (!consultantsByArea[area]) consultantsByArea[area] = [];
          var name = a.consultant.firstName + " " + a.consultant.lastName;
          if (consultantsByArea[area].indexOf(name) === -1) consultantsByArea[area].push(name);
        }
      });
      var consultantsData = Object.keys(consultantsByArea).map(function(a) { return { area: a, count: consultantsByArea[a].length, names: consultantsByArea[a].join(", ") }; });

      this._oDashboardModel.setProperty("/charts", { poByStatus: poByStatus, invoiceByStatus: invoiceByStatus, spendBySupplier: spendBySupplier, consumptionByArea: consumptionByArea, consultantsByArea: consultantsData });
    },

    _buildTables: function(orders) {
      var poData = orders.value || [];
      var stateMap = { "Active": "Success", "Draft": "Warning", "Pending": "Warning", "Closed": "None", "Cancelled": "Error" };
      var tableData = poData.map(function(po) {
        return { poNumber: po.poNumber, supplierName: po.supplier ? po.supplier.supplierName : "-", orderType: po.orderType ? po.orderType.name : "-", totalNetValue: po.totalNetValue, currency: po.currency_code, status: po.status, statusState: stateMap[po.status] || "None", deliveryEndDate: po.deliveryEndDate || "-" };
      });
      this._allTableOrders = tableData;
      this._oDashboardModel.setProperty("/tables/activeOrders", tableData);
    },

    _buildBPvsCFCvsActuals: function(planLines, forecastLines, allocations) {
      var planData = planLines.value || [];
      var fcData = forecastLines.value || [];
      var allocData = allocations.value || [];
      var areas = {};

      planData.forEach(function(pl) { var n = pl.chapterArea ? pl.chapterArea.name : "Unknown"; if (!areas[n]) areas[n] = { area: n, bp: 0, cfc: 0, actuals: 0 }; areas[n].bp += (pl.plannedValue || 0); });
      fcData.forEach(function(fl) { var n = fl.chapterArea ? fl.chapterArea.name : "Unknown"; if (!areas[n]) areas[n] = { area: n, bp: 0, cfc: 0, actuals: 0 }; areas[n].cfc += (fl.forecastValue || 0); });
      allocData.forEach(function(a) { var n = a.consumingChapterArea ? a.consumingChapterArea.name : "Unknown"; if (!areas[n]) areas[n] = { area: n, bp: 0, cfc: 0, actuals: 0 }; areas[n].actuals += (a.consumedValue || 0); });

      var comparison = Object.values(areas).map(function(row) { row.variance = row.bp - row.actuals; return row; }).sort(function(a, b) { return b.bp - a.bp; });
      this._oDashboardModel.setProperty("/bpCfcActuals", comparison);
    }
  });
});
