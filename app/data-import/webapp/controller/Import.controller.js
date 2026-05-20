sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  // Entity type configurations: required fields, validation rules, target service
  var ENTITY_CONFIG = {
    Supplier: {
      requiredFields: ["supplierNumber", "supplierName", "country"],
      keyField: "supplierNumber",
      nameField: "supplierName",
      targetPath: "/odata/v4/master-data/Suppliers",
      fieldMap: {
        "supplierNumber": "supplierNumber",
        "supplier_number": "supplierNumber",
        "supplierName": "supplierName",
        "supplier_name": "supplierName",
        "name": "supplierName",
        "country": "country_code",
        "country_code": "country_code",
        "hcb_lcb": "hcbLcb",
        "hcbLcb": "hcbLcb",
        "tier": "tier",
        "is_oem": "isOem",
        "isOem": "isOem",
        "is_rate_card": "isRateCard",
        "isRateCard": "isRateCard",
        "rate_card_scope": "rateCardScope",
        "rateCardScope": "rateCardScope",
        "contact_name": "primaryContactName",
        "primaryContactName": "primaryContactName",
        "contact_email": "primaryContactEmail",
        "primaryContactEmail": "primaryContactEmail"
      }
    },
    PurchaseOrder: {
      requiredFields: ["poNumber", "supplier", "orderType"],
      keyField: "poNumber",
      nameField: "supplier",
      targetPath: "/odata/v4/orders/PurchaseOrders",
      fieldMap: {
        "po_number": "poNumber",
        "poNumber": "poNumber",
        "po_number": "poNumber",
        "issue_date": "issueDate",
        "issueDate": "issueDate",
        "cid3_number": "cid3Number",
        "cid3Number": "cid3Number",
        "order_type": "orderType_ID",
        "orderType": "orderType_ID",
        "supplier": "supplier_ID",
        "supplier_id": "supplier_ID",
        "delivery_start": "deliveryStartDate",
        "deliveryStartDate": "deliveryStartDate",
        "delivery_end": "deliveryEndDate",
        "deliveryEndDate": "deliveryEndDate",
        "validity_start": "validityStartDate",
        "validityStartDate": "validityStartDate",
        "validity_end": "validityEndDate",
        "validityEndDate": "validityEndDate",
        "chapter_area": "issuingChapterArea_ID",
        "issuingChapterArea": "issuingChapterArea_ID",
        "source_system": "sourceSystem",
        "sourceSystem": "sourceSystem",
        "total_value": "totalNetValue",
        "totalNetValue": "totalNetValue",
        "currency": "currency_code",
        "currency_code": "currency_code"
      }
    },
    Customer: {
      requiredFields: ["customerNumber", "customerName"],
      keyField: "customerNumber",
      nameField: "customerName",
      targetPath: "/odata/v4/master-data/Customers",
      fieldMap: {
        "customer_number": "customerNumber",
        "customerNumber": "customerNumber",
        "customer_name": "customerName",
        "customerName": "customerName",
        "name": "customerName",
        "country": "country_code",
        "country_code": "country_code",
        "contact_name": "contactName",
        "contactName": "contactName",
        "contact_email": "contactEmail",
        "contactEmail": "contactEmail"
      }
    },
    Invoice: {
      requiredFields: ["invoiceNumber", "invoiceDate", "supplier", "currency"],
      keyField: "invoiceNumber",
      nameField: "supplier",
      targetPath: "/odata/v4/invoices/Invoices",
      fieldMap: {
        "invoice_number": "invoiceNumber",
        "invoiceNumber": "invoiceNumber",
        "invoice_date": "invoiceDate",
        "invoiceDate": "invoiceDate",
        "supplier": "supplier_ID",
        "supplier_id": "supplier_ID",
        "currency": "currency_code",
        "currency_code": "currency_code",
        "net_value": "netValue",
        "netValue": "netValue",
        "tax_value": "taxValue",
        "taxValue": "taxValue",
        "gross_value": "grossValue",
        "grossValue": "grossValue",
        "source_system": "sourceSystem",
        "sourceSystem": "sourceSystem"
      }
    }
  };

  return Controller.extend("esp.dataimport.controller.Import", {

    onInit: function() {
      this._oImportModel = new JSONModel({
        config: {
          sourceSystem: "CID3",
          entityType: "Supplier",
          batchName: ""
        },
        sources: [
          { key: "CID3", text: "CID3" },
          { key: "MyBuy", text: "MyBuy / SAP" },
          { key: "PICOS", text: "PICOS" },
          { key: "Manual", text: "Manual Upload" }
        ],
        entityTypes: [
          { key: "Supplier", text: "Suppliers" },
          { key: "PurchaseOrder", text: "Purchase Orders" },
          { key: "Customer", text: "Customers" },
          { key: "Invoice", text: "Invoices" }
        ],
        fileReady: false,
        parsedData: [],
        preview: [],
        validation: { total: 0, valid: 0, errors: 0, warnings: 0, errorList: [], warningList: [] },
        importing: false,
        importComplete: false,
        importProgress: { current: 0, total: 0, percent: 0 },
        importResult: { success: 0, failed: 0 }
      });
      this.getView().setModel(this._oImportModel, "import");
    },

    onEntityTypeChange: function() {
      // Reset validation when entity type changes
      this._oImportModel.setProperty("/validation", { total: 0, valid: 0, errors: 0, warnings: 0, errorList: [], warningList: [] });
      this._oImportModel.setProperty("/preview", []);
    },

    onFileChange: function(oEvent) {
      var oFile = oEvent.getParameter("files")[0];
      this._oImportModel.setProperty("/fileReady", !!oFile);
      this._selectedFile = oFile;
      // Reset state
      this._oImportModel.setProperty("/importComplete", false);
      this._oImportModel.setProperty("/validation", { total: 0, valid: 0, errors: 0, warnings: 0, errorList: [], warningList: [] });
    },

    onTypeMismatch: function() {
      MessageBox.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
    },

    onParseFile: function() {
      if (!this._selectedFile) {
        MessageToast.show("Please select a file first");
        return;
      }
      var that = this;
      var reader = new FileReader();
      reader.onload = function(e) {
        var content = e.target.result;
        that._parseCSV(content);
      };
      reader.readAsText(this._selectedFile);
    },

    _parseCSV: function(content) {
      var lines = content.split(/\r?\n/).filter(function(l) { return l.trim().length > 0; });
      if (lines.length < 2) {
        MessageBox.error("File must contain a header row and at least one data row");
        return;
      }

      // Detect delimiter (semicolon or comma)
      var delimiter = lines[0].indexOf(";") > -1 ? ";" : ",";
      var headers = lines[0].split(delimiter).map(function(h) { return h.trim().replace(/"/g, ""); });
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];

      if (!config) {
        MessageBox.error("Unsupported entity type: " + entityType);
        return;
      }

      var parsedRows = [];
      var errorList = [];
      var warningList = [];
      var validCount = 0;

      for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(delimiter).map(function(v) { return v.trim().replace(/"/g, ""); });
        var row = {};
        var rowErrors = [];

        // Map CSV columns to entity fields
        headers.forEach(function(header, idx) {
          var mappedField = config.fieldMap[header] || config.fieldMap[header.toLowerCase()];
          if (mappedField && idx < values.length) {
            row[mappedField] = values[idx] || null;
          }
        });

        // Validate required fields
        config.requiredFields.forEach(function(field) {
          var mappedField = config.fieldMap[field] || field;
          if (!row[mappedField] && !row[field]) {
            rowErrors.push({ row: i + 1, field: field, message: "Required field '" + field + "' is missing or empty" });
          }
        });

        // Boolean conversions
        ["isOem", "isRateCard", "isActive"].forEach(function(bf) {
          if (row[bf] !== undefined && row[bf] !== null) {
            row[bf] = ["true", "1", "yes", "x"].indexOf(String(row[bf]).toLowerCase()) > -1;
          }
        });

        var status = rowErrors.length > 0 ? "Error" : "Valid";
        if (status === "Valid") validCount++;

        parsedRows.push({
          row: i + 1,
          status: status,
          keyField: row[config.fieldMap[config.keyField] || config.keyField] || "-",
          nameField: row[config.fieldMap[config.nameField] || config.nameField] || "-",
          details: Object.keys(row).filter(function(k) { return row[k]; }).length + " fields mapped",
          data: row,
          errors: rowErrors
        });

        rowErrors.forEach(function(err) { errorList.push(err); });
      }

      this._oImportModel.setProperty("/parsedData", parsedRows);
      this._oImportModel.setProperty("/preview", parsedRows.slice(0, 50));
      this._oImportModel.setProperty("/validation", {
        total: parsedRows.length,
        valid: validCount,
        errors: errorList.length,
        warnings: warningList.length,
        errorList: errorList,
        warningList: warningList
      });

      MessageToast.show(parsedRows.length + " rows parsed, " + validCount + " valid");
    },

    onExecuteImport: function() {
      var that = this;
      var parsedData = this._oImportModel.getProperty("/parsedData");
      var validRecords = parsedData.filter(function(r) { return r.status === "Valid"; });

      if (validRecords.length === 0) {
        MessageBox.error("No valid records to import");
        return;
      }

      MessageBox.confirm(
        "Import " + validRecords.length + " records?",
        {
          title: "Confirm Import",
          onClose: function(action) {
            if (action === MessageBox.Action.OK) {
              that._executeImport(validRecords);
            }
          }
        }
      );
    },

    _executeImport: function(validRecords) {
      var that = this;
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];
      var serviceUrl = this.getOwnerComponent().getModel().getServiceUrl();
      var targetUrl = ".." + config.targetPath;

      this._oImportModel.setProperty("/importing", true);
      this._oImportModel.setProperty("/importComplete", false);
      this._oImportModel.setProperty("/importProgress", { current: 0, total: validRecords.length, percent: 0 });

      var successCount = 0;
      var failedCount = 0;
      var batchId = null;

      // Create import batch first
      this._createImportBatch(validRecords.length).then(function(batch) {
        batchId = batch.ID;

        // Sequential import (to avoid overwhelming the server)
        var chain = Promise.resolve();
        validRecords.forEach(function(record, idx) {
          chain = chain.then(function() {
            return fetch(targetUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record.data)
            }).then(function(resp) {
              if (resp.ok) {
                successCount++;
              } else {
                failedCount++;
              }
              var progress = Math.round(((idx + 1) / validRecords.length) * 100);
              that._oImportModel.setProperty("/importProgress", {
                current: idx + 1,
                total: validRecords.length,
                percent: progress
              });
            }).catch(function() {
              failedCount++;
            });
          });
        });

        return chain;
      }).then(function() {
        // Update batch with results
        if (batchId) {
          that._updateImportBatch(batchId, successCount, failedCount);
        }
        that._oImportModel.setProperty("/importing", false);
        that._oImportModel.setProperty("/importComplete", true);
        that._oImportModel.setProperty("/importResult", { success: successCount, failed: failedCount });
        MessageToast.show("Import complete: " + successCount + " success, " + failedCount + " failed");
      }).catch(function(err) {
        that._oImportModel.setProperty("/importing", false);
        MessageBox.error("Import failed: " + err.message);
      });
    },

    _createImportBatch: function(totalRecords) {
      var config = this._oImportModel.getProperty("/config");
      var serviceUrl = this.getOwnerComponent().getModel().getServiceUrl();
      return fetch(serviceUrl + "ImportBatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: config.batchName || config.entityType + " Import " + new Date().toISOString().slice(0, 10),
          sourceSystem: config.sourceSystem,
          status: "Processing",
          totalRecords: totalRecords,
          successCount: 0,
          errorCount: 0,
          importedBy: "Current User"
        })
      }).then(function(resp) { return resp.json(); });
    },

    _updateImportBatch: function(batchId, success, failed) {
      var serviceUrl = this.getOwnerComponent().getModel().getServiceUrl();
      fetch(serviceUrl + "ImportBatches(" + batchId + ")", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: failed > 0 ? "Completed with Errors" : "Completed",
          successCount: success,
          errorCount: failed
        })
      });
    },

    onDownloadTemplate: function() {
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];
      var headers = Object.keys(config.fieldMap).filter(function(k, i, arr) {
        // Only output unique mapped fields (take first alias)
        var mapped = config.fieldMap[k];
        return arr.findIndex(function(x) { return config.fieldMap[x] === mapped; }) === i;
      });

      var csvContent = headers.join(";") + "\n";
      var blob = new Blob([csvContent], { type: "text/csv" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = entityType.toLowerCase() + "_template.csv";
      a.click();
      URL.revokeObjectURL(url);
      MessageToast.show("Template downloaded");
    },

    onShowHistory: function() {
      var oPanel = this.byId("panelHistory");
      oPanel.setExpanded(!oPanel.getExpanded());
    }
  });
});
