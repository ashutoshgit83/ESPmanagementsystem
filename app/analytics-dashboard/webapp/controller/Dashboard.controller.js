sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/core/format/NumberFormat"
], function(Controller, JSONModel, MessageToast, NumberFormat) {
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
    // EXCEL EXPORT
    // ================================================================
    onExport: function() {
      var tableData = this._oDashboardModel.getProperty("/tables/activeOrders") || [];
      if (tableData.length === 0) {
        MessageToast.show("No data to export");
        return;
      }
      var csv = "PO Number;Supplier;Order Type;Net Value;Currency;Status;Delivery End\n";
      tableData.forEach(function(row) {
        csv += [row.poNumber, row.supplierName, row.orderType, row.totalNetValue, row.currency, row.status, row.deliveryEndDate].join(";") + "\n";
      });
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "esp_orders_export_" + new Date().toISOString().slice(0, 10) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
      MessageToast.show("Export downloaded");
    },

    // ================================================================
    // CHART DRILL-DOWN
    // ================================================================
    onChartPoStatusSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      var selectedStatus = oData[0].data.Status;
      this._drillDownByStatus("PurchaseOrders", selectedStatus);
    },

    onChartInvStatusSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      var selectedStatus = oData[0].data.Status;
      this._drillDownByStatus("Invoices", selectedStatus);
    },

    onChartSupplierSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      var selectedSupplier = oData[0].data.Supplier;
      this._drillDownBySupplier(selectedSupplier);
    },

    onChartAreaSelect: function(oEvent) {
      var oData = oEvent.getParameter("data");
      if (!oData || !oData[0]) return;
      var selectedArea = oData[0].data["Chapter Area"];
      this._drillDownByArea(selectedArea);
    },

    _drillDownByStatus: function(entityType, status) {
      var data = [];
      if (entityType === "PurchaseOrders") {
        data = (this._rawOrders || []).filter(function(po) { return po.status === status; })
          .map(function(po) {
            return { col1: po.poNumber, col2: po.supplier ? po.supplier.supplierName : "-", col3: po.totalNetValue + " " + (po.currency_code || "EUR"), col4: po.deliveryEndDate || "-" };
          });
        this._oDashboardModel.setProperty("/drillDown", {
          visible: true,
          title: "Purchase Orders — Status: " + status + " (" + data.length + " records)",
          columns: ["PO Number", "Supplier", "Value", "Delivery End"],
          data: data
        });
      } else {
        data = (this._rawInvoices || []).filter(function(inv) { return inv.status === status; })
          .map(function(inv) {
            return { col1: inv.invoiceNumber, col2: inv.supplier ? inv.supplier.supplierName : "-", col3: inv.netValue + " " + (inv.currency_code || "EUR"), col4: inv.invoiceDate || "-" };
          });
        this._oDashboardModel.setProperty("/drillDown", {
          visible: true,
          title: "Invoices — Status: " + status + " (" + data.length + " records)",
          columns: ["Invoice Number", "Supplier", "Net Value", "Date"],
          data: data
        });
      }
    },

    _drillDownBySupplier: function(supplierName) {
      var data = (this._rawOrders || []).filter(function(po) {
        return po.supplier && po.supplier.supplierName === supplierName;
      }).map(function(po) {
        return { col1: po.poNumber, col2: po.status, col3: po.totalNetValue + " " + (po.currency_code || "EUR"), col4: po.deliveryEndDate || "-" };
      });
      this._oDashboardModel.setProperty("/drillDown", {
        visible: true,
        title: "Orders for Supplier: " + supplierName + " (" + data.length + " records)",
        columns: ["PO Number", "Status", "Value", "Delivery End"],
        data: data
      });
    },

    _drillDownByArea: function(areaName) {
      var data = (this._rawAllocations || []).filter(function(a) {
        return a.consumingChapterArea && a.consumingChapterArea.name === areaName;
      }).map(function(a) {
        return { col1: a.plwProjectNumber || "-", col2: a.plannedFte + " / " + a.actualFte, col3: a.consumedValue + " EUR", col4: (a.actualStartDate || "-") + " → " + (a.actualEndDate || "-") };
      });
      this._oDashboardModel.setProperty("/drillDown", {
        visible: true,
        title: "Consumption for: " + areaName + " (" + data.length + " allocations)",
        columns: ["Project", "FTE (Plan/Act)", "Consumed Value", "Period"],
        data: data
      });
    },

    onCloseDrillDown: function() {
      this._oDashboardModel.setProperty("/drillDown/visible", false);
    },

    onSearchOrders: function(oEvent) {
      var sQuery = oEvent.getParameter("newValue").toLowerCase();
      var allOrders = this._allTableOrders || [];
      if (!sQuery) {
        this._oDashboardModel.setProperty("/tables/activeOrders", allOrders);
      } else {
        var filtered = allOrders.filter(function(o) {
          return (o.poNumber || "").toLowerCase().indexOf(sQuery) > -1 ||
                 (o.supplierName || "").toLowerCase().indexOf(sQuery) > -1;
        });
        this._oDashboardModel.setProperty("/tables/activeOrders", filtered);
      }
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
        this._fetchJSON(sServiceUrl + "Invoices?$select=ID,invoiceNumber,invoiceDate,status,netValue,currency_code&$expand=supplier($select=supplierName)"),
        this._fetchJSON(sServiceUrl + "ConsumptionAllocations?$select=ID,consumedValue,consumedVolume,plannedFte,actualFte,plwProjectNumber,actualStartDate,actualEndDate&$expand=consumingChapterArea($select=name),consultant($select=firstName,lastName)"),
        this._fetchJSON(sServiceUrl + "PurchaseOrderItems?$select=ID,netValue,volume,unitPrice"),
        this._fetchJSON(sServiceUrl + "PlanLines?$select=chapterArea_ID,plannedValue,plannedFte&$expand=chapterArea($select=name)"),
        this._fetchJSON(sServiceUrl + "ForecastLines?$select=chapterArea_ID,forecastValue,forecastFte&$expand=chapterArea($select=name)")
      ]).then(function(results) {
        var suppliers = results[0];
        var orders = results[1];
        var invoices = results[2];
        var allocations = results[3];
        var poItems = results[4];
        var planLines = results[5];
        var forecastLines = results[6];

        // Store raw data for drill-down
        that._rawOrders = orders.value || [];
        that._rawInvoices = invoices.value || [];
        that._rawAllocations = allocations.value || [];

        that._computeKPIs(suppliers, orders, invoices, allocations, poItems);
        that._computeCharts(orders, invoices, allocations);
        that._buildTables(orders);
        that._buildBPvsCFCvsActuals(planLines, forecastLines, allocations, invoices);
      }).catch(function(err) {
        console.error("Dashboard load error:", err);
        MessageToast.show("Error loading data");
      });
    },

    _fetchJSON: function(url) {
      return fetch(url, { headers: { "Accept": "application/json", "Authorization": "Basic " + btoa("admin:admin") } })
        .then(function(resp) { return resp.json(); });
    },

    _computeKPIs: function(suppliers, orders, invoices, allocations, poItems) {
      var poData = orders.value || [];
      var invData = invoices.value || [];
      var allocData = allocations.value || [];
      var itemData = poItems.value || [];

      var activeOrders = poData.filter(function(po) { return po.status === "Active"; });
      var totalPoValue = activeOrders.reduce(function(sum, po) { return sum + (po.totalNetValue || 0); }, 0);
      var totalInvoiced = invData.reduce(function(sum, inv) { return sum + (inv.netValue || 0); }, 0);
      var totalOrdered = itemData.reduce(function(sum, item) { return sum + (item.netValue || 0); }, 0);
      var totalConsumed = allocData.reduce(function(sum, a) { return sum + (a.consumedValue || 0); }, 0);
      var consumptionRate = totalOrdered > 0 ? Math.round((totalConsumed / totalOrdered) * 100) : 0;
      var avgHourlyRate = itemData.length > 0 ? Math.round(itemData.reduce(function(s, i) { return s + (i.unitPrice || 0); }, 0) / itemData.length) : 0;

      // Consultants count (unique from allocations with consultant)
      var consultantSet = {};
      allocData.forEach(function(a) { if (a.consultant) consultantSet[a.consultant.lastName] = true; });

      this._oDashboardModel.setProperty("/kpis", {
        supplierCount: suppliers["@odata.count"] || 0,
        activePoCount: activeOrders.length,
        totalPoValue: Math.round(totalPoValue / 1000),
        totalInvoiceValue: Math.round(totalInvoiced / 1000),
        consumptionRate: consumptionRate,
        consultantCount: Object.keys(consultantSet).length,
        avgHourlyRate: avgHourlyRate
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
      poData.forEach(function(po) {
        var name = po.supplier ? po.supplier.supplierName : "Unknown";
        supplierSpend[name] = (supplierSpend[name] || 0) + (po.totalNetValue || 0);
      });
      var spendBySupplier = Object.keys(supplierSpend).map(function(s) { return { supplier: s, value: supplierSpend[s] }; })
        .sort(function(a, b) { return b.value - a.value; });

      // Consumption by Chapter Area
      var areaConsumption = {};
      allocData.forEach(function(a) {
        var name = a.consumingChapterArea ? a.consumingChapterArea.name : "Unknown";
        areaConsumption[name] = (areaConsumption[name] || 0) + (a.consumedValue || 0);
      });
      var consumptionByArea = Object.keys(areaConsumption).map(function(area) { return { area: area, value: areaConsumption[area] }; })
        .sort(function(a, b) { return b.value - a.value; });

      // Consultants by area (for consultant roster)
      var consultantsByArea = {};
      allocData.forEach(function(a) {
        if (a.consultant) {
          var area = a.consumingChapterArea ? a.consumingChapterArea.name : "Unknown";
          if (!consultantsByArea[area]) consultantsByArea[area] = [];
          var name = a.consultant.firstName + " " + a.consultant.lastName;
          if (consultantsByArea[area].indexOf(name) === -1) consultantsByArea[area].push(name);
        }
      });
      var consultantsData = Object.keys(consultantsByArea).map(function(area) {
        return { area: area, count: consultantsByArea[area].length, names: consultantsByArea[area].join(", ") };
      });

      this._oDashboardModel.setProperty("/charts", {
        poByStatus: poByStatus,
        invoiceByStatus: invoiceByStatus,
        spendBySupplier: spendBySupplier,
        consumptionByArea: consumptionByArea,
        consultantsByArea: consultantsData
      });
    },

    _buildTables: function(orders) {
      var poData = orders.value || [];
      var statusStateMap = { "Active": "Success", "Draft": "Warning", "Pending": "Warning", "Closed": "None", "Cancelled": "Error" };

      var tableData = poData.map(function(po) {
        return {
          poNumber: po.poNumber,
          supplierName: po.supplier ? po.supplier.supplierName : "-",
          orderType: po.orderType ? po.orderType.name : "-",
          totalNetValue: po.totalNetValue,
          currency: po.currency_code,
          status: po.status,
          statusState: statusStateMap[po.status] || "None",
          deliveryEndDate: po.deliveryEndDate || "-"
        };
      });

      this._allTableOrders = tableData;
      this._oDashboardModel.setProperty("/tables/activeOrders", tableData);
    },

    // ================================================================
    // BP vs CFC vs ACTUALS COMPARISON
    // ================================================================
    _buildBPvsCFCvsActuals: function(planLines, forecastLines, allocations, invoices) {
      var planData = planLines.value || [];
      var fcData = forecastLines.value || [];
      var allocData = allocations.value || [];
      var invData = invoices.value || [];

      // Aggregate by chapter area
      var areas = {};

      planData.forEach(function(pl) {
        var name = pl.chapterArea ? pl.chapterArea.name : "Unknown";
        if (!areas[name]) areas[name] = { area: name, bp: 0, cfc: 0, actuals: 0 };
        areas[name].bp += (pl.plannedValue || 0);
      });

      fcData.forEach(function(fl) {
        var name = fl.chapterArea ? fl.chapterArea.name : "Unknown";
        if (!areas[name]) areas[name] = { area: name, bp: 0, cfc: 0, actuals: 0 };
        areas[name].cfc += (fl.forecastValue || 0);
      });

      // Actuals from consumption allocations
      allocData.forEach(function(a) {
        var name = a.consumingChapterArea ? a.consumingChapterArea.name : "Unknown";
        if (!areas[name]) areas[name] = { area: name, bp: 0, cfc: 0, actuals: 0 };
        areas[name].actuals += (a.consumedValue || 0);
      });

      var comparison = Object.values(areas).sort(function(a, b) { return b.bp - a.bp; });
      this._oDashboardModel.setProperty("/bpCfcActuals", comparison);
    }
  });
});
