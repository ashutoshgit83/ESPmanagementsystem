sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  // Entity configurations with templates
  var ENTITY_CONFIG = {
    Supplier: {
      requiredFields: ["supplierNumber", "supplierName", "country"],
      uniqueField: "supplierNumber",
      keyField: "supplierNumber",
      nameField: "supplierName",
      targetPath: "/odata/v4/master-data/Suppliers",
      existingEndpoint: "/odata/v4/master-data/Suppliers?$select=supplierNumber",
      fieldMap: {
        "supplierNumber": "supplierNumber", "supplier_number": "supplierNumber",
        "supplierName": "supplierName", "supplier_name": "supplierName", "name": "supplierName",
        "country": "country_code", "country_code": "country_code",
        "hcbLcb": "hcbLcb", "hcb_lcb": "hcbLcb",
        "tier": "tier",
        "isOem": "isOem", "is_oem": "isOem",
        "isRateCard": "isRateCard", "is_rate_card": "isRateCard",
        "rateCardScope": "rateCardScope", "rate_card_scope": "rateCardScope",
        "classificationAttribute": "classificationAttribute", "classification": "classificationAttribute",
        "locationClassification": "locationClassification", "location_classification": "locationClassification",
        "exceptionScenario": "exceptionScenario", "exception_scenario": "exceptionScenario",
        "primaryContactName": "primaryContactName", "contact_name": "primaryContactName",
        "primaryContactEmail": "primaryContactEmail", "contact_email": "primaryContactEmail",
        "billingEntityCountry": "billingEntityCountry_code", "billing_country": "billingEntityCountry_code",
        "serviceDeliveryCountry": "serviceDeliveryCountry_code", "delivery_country": "serviceDeliveryCountry_code"
      },
      templateHeaders: ["supplierNumber", "supplierName", "country", "hcbLcb", "tier", "classificationAttribute", "locationClassification", "exceptionScenario", "isOem", "isRateCard", "rateCardScope", "primaryContactName", "primaryContactEmail", "billingEntityCountry", "serviceDeliveryCountry"],
      templateSample: ["SUP-001", "Accenture GmbH", "DE", "HCB", "Platinum", "Rate Card Global", "HCB", "Not Applicable", "false", "true", "Global", "Hans Mueller", "hans@accenture.com", "DE", "DE"],
      dateFields: [],
      numericFields: [],
      validValues: {
        "hcbLcb": ["HCB", "LCB"],
        "tier": ["Platinum", "Gold", "Silver"],
        "rateCardScope": ["Global", "Regional"],
        "classificationAttribute": ["Rate Card Global", "Rate Card Regional", "OEM", "Tender/Fixed"],
        "locationClassification": ["HCB", "LCB"],
        "exceptionScenario": ["Not Applicable", "Ordered HCB / Delivered LCB", "Ordered LCB / Billed HCB"]
      }
    },
    PurchaseOrder: {
      requiredFields: ["poNumber", "supplier", "orderType"],
      uniqueField: "poNumber",
      keyField: "poNumber",
      nameField: "supplier",
      targetPath: "/odata/v4/orders/PurchaseOrders",
      existingEndpoint: "/odata/v4/orders/PurchaseOrders?$select=poNumber",
      fieldMap: {
        "poNumber": "poNumber", "po_number": "poNumber",
        "issueDate": "issueDate", "issue_date": "issueDate",
        "cid3Number": "cid3Number", "cid3_number": "cid3Number",
        "orderType": "orderType_ID", "order_type": "orderType_ID",
        "supplier": "supplier_ID", "supplier_id": "supplier_ID",
        "deliveryStartDate": "deliveryStartDate", "delivery_start": "deliveryStartDate",
        "deliveryEndDate": "deliveryEndDate", "delivery_end": "deliveryEndDate",
        "validityStartDate": "validityStartDate", "validity_start": "validityStartDate",
        "validityEndDate": "validityEndDate", "validity_end": "validityEndDate",
        "issuingChapterArea": "issuingChapterArea_ID", "chapter_area": "issuingChapterArea_ID",
        "sourceSystem": "sourceSystem", "source_system": "sourceSystem",
        "totalNetValue": "totalNetValue", "total_value": "totalNetValue",
        "currency": "currency_code", "currency_code": "currency_code"
      },
      templateHeaders: ["poNumber", "issueDate", "cid3Number", "orderType", "supplier", "deliveryStartDate", "deliveryEndDate", "validityStartDate", "validityEndDate", "issuingChapterArea", "sourceSystem", "totalNetValue", "currency"],
      templateSample: ["PO-2025-001", "2025-01-15", "CID3-78901", "1a2b3c4d-1111-1111-1111-000000000001", "a1000001-aaaa-bbbb-cccc-000000000001", "2025-02-01", "2025-12-31", "2025-01-15", "2025-12-31", "6a2b3c4d-6666-6666-6666-000000000001", "CID3", "250000.00", "EUR"],
      dateFields: ["issueDate", "deliveryStartDate", "deliveryEndDate", "validityStartDate", "validityEndDate"],
      numericFields: ["totalNetValue"],
      validValues: {
        "sourceSystem": ["CID3", "MyBuy", "PICOS", "SAP", "Manual"]
      }
    },
    Customer: {
      requiredFields: ["customerNumber", "customerName"],
      uniqueField: "customerNumber",
      keyField: "customerNumber",
      nameField: "customerName",
      targetPath: "/odata/v4/master-data/Customers",
      existingEndpoint: "/odata/v4/master-data/Customers?$select=customerNumber",
      fieldMap: {
        "customerNumber": "customerNumber", "customer_number": "customerNumber",
        "customerName": "customerName", "customer_name": "customerName", "name": "customerName",
        "country": "country_code", "country_code": "country_code",
        "contactName": "contactName", "contact_name": "contactName",
        "contactEmail": "contactEmail", "contact_email": "contactEmail",
        "isActive": "isActive", "is_active": "isActive"
      },
      templateHeaders: ["customerNumber", "customerName", "country", "contactName", "contactEmail", "isActive"],
      templateSample: ["CUST-001", "Bosch Automotive", "DE", "Thomas Weber", "thomas@bosch.com", "true"],
      dateFields: [],
      numericFields: [],
      validValues: {}
    },
    Invoice: {
      requiredFields: ["invoiceNumber", "invoiceDate", "supplier", "currency"],
      uniqueField: "invoiceNumber",
      keyField: "invoiceNumber",
      nameField: "supplier",
      targetPath: "/odata/v4/invoices/Invoices",
      existingEndpoint: "/odata/v4/invoices/Invoices?$select=invoiceNumber",
      fieldMap: {
        "invoiceNumber": "invoiceNumber", "invoice_number": "invoiceNumber",
        "invoiceDate": "invoiceDate", "invoice_date": "invoiceDate",
        "supplier": "supplier_ID", "supplier_id": "supplier_ID",
        "currency": "currency_code", "currency_code": "currency_code",
        "netValue": "netValue", "net_value": "netValue",
        "taxValue": "taxValue", "tax_value": "taxValue",
        "grossValue": "grossValue", "gross_value": "grossValue",
        "sourceSystem": "sourceSystem", "source_system": "sourceSystem"
      },
      templateHeaders: ["invoiceNumber", "invoiceDate", "supplier", "currency", "netValue", "taxValue", "grossValue", "sourceSystem"],
      templateSample: ["INV-2025-0001", "2025-03-15", "a1000001-aaaa-bbbb-cccc-000000000001", "EUR", "45000.00", "8550.00", "53550.00", "PICOS"],
      dateFields: ["invoiceDate"],
      numericFields: ["netValue", "taxValue", "grossValue"],
      validValues: {
        "sourceSystem": ["CID3", "MyBuy", "PICOS", "SAP", "Manual"]
      }
    }
  };

  return Controller.extend("esp.dataimport.controller.Import", {

    onInit: function() {
      this._oImportModel = new JSONModel({
        config: { sourceSystem: "CID3", entityType: "Supplier", batchName: "" },
        sources: [
          { key: "CID3", text: "CID3" }, { key: "MyBuy", text: "MyBuy / SAP" },
          { key: "PICOS", text: "PICOS" }, { key: "Manual", text: "Manual Upload" }
        ],
        entityTypes: [
          { key: "Supplier", text: "Suppliers" }, { key: "PurchaseOrder", text: "Purchase Orders" },
          { key: "Customer", text: "Customers" }, { key: "Invoice", text: "Invoices" }
        ],
        fileReady: false, parsedData: [], preview: [],
        validation: { total: 0, valid: 0, errors: 0, warnings: 0, errorList: [], warningList: [] },
        importing: false, importComplete: false,
        importProgress: { current: 0, total: 0, percent: 0 },
        importResult: { success: 0, failed: 0 }
      });
      this.getView().setModel(this._oImportModel, "import");
      this._existingRecords = {};
    },

    onEntityTypeChange: function() {
      this._oImportModel.setProperty("/validation", { total: 0, valid: 0, errors: 0, warnings: 0, errorList: [], warningList: [] });
      this._oImportModel.setProperty("/preview", []);
      this._existingRecords = {};
    },

    onFileChange: function(oEvent) {
      var oFile = oEvent.getParameter("files")[0];
      this._oImportModel.setProperty("/fileReady", !!oFile);
      this._selectedFile = oFile;
      this._oImportModel.setProperty("/importComplete", false);
      this._oImportModel.setProperty("/validation", { total: 0, valid: 0, errors: 0, warnings: 0, errorList: [], warningList: [] });
    },

    onTypeMismatch: function() { MessageBox.error("Please upload a tab-separated file (.tsv, .txt) or Excel file (.xlsx, .xls)"); },

    onParseFile: function() {
      if (!this._selectedFile) { MessageToast.show("Please select a file first"); return; }
      var that = this;
      // First load existing records for duplicate detection
      this._loadExistingRecords().then(function() {
        var reader = new FileReader();
        reader.onload = function(e) { that._parseCSV(e.target.result); };
        reader.readAsText(that._selectedFile);
      });
    },

    // ================================================================
    // DUPLICATE DETECTION: Load existing records
    // ================================================================
    _loadExistingRecords: function() {
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];
      var serviceUrl = this.getOwnerComponent().getModel().getServiceUrl();
      var url = ".." + config.existingEndpoint;

      return fetch(url, { headers: { "Accept": "application/json", "Authorization": "Basic " + btoa("admin:admin") } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var existing = {};
          (data.value || []).forEach(function(rec) {
            var key = rec[config.uniqueField];
            if (key) existing[key.toUpperCase()] = true;
          });
          this._existingRecords = existing;
          return existing;
        }.bind(this))
        .catch(function() { this._existingRecords = {}; }.bind(this));
    },

    // ================================================================
    // PARSE & VALIDATE CSV
    // ================================================================
    _parseCSV: function(content) {
      // Primary format is TAB-separated values (TSV). Lines starting with '#' are
      // treated as comments/instructions and ignored.
      var lines = content.split(/\r?\n/).filter(function(l) {
        var t = l.trim();
        return t.length > 0 && t.charAt(0) !== "#";
      });
      if (lines.length < 2) { MessageBox.error("File must contain a header row and at least one data row"); return; }

      // Prefer TAB delimiter; fall back to ';' or ',' for backward compatibility.
      var headerLine = lines[0];
      var delimiter = headerLine.indexOf("\t") > -1 ? "\t" : (headerLine.indexOf(";") > -1 ? ";" : ",");
      var headers = lines[0].split(delimiter).map(function(h) { return h.trim().replace(/"/g, ""); });
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];

      if (!config) { MessageBox.error("Unsupported entity type: " + entityType); return; }

      var parsedRows = [], errorList = [], warningList = [], validCount = 0;
      var seenKeys = {}; // For detecting duplicates within the file

      for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(delimiter).map(function(v) { return v.trim().replace(/"/g, ""); });
        var row = {};
        var rowErrors = [];
        var rowWarnings = [];

        // Map CSV columns to entity fields
        headers.forEach(function(header, idx) {
          var mappedField = config.fieldMap[header] || config.fieldMap[header.toLowerCase()];
          if (mappedField && idx < values.length) {
            row[mappedField] = values[idx] || null;
          }
        });

        // 1. REQUIRED FIELD VALIDATION
        config.requiredFields.forEach(function(field) {
          var mappedField = config.fieldMap[field] || field;
          if (!row[mappedField] && !row[field]) {
            rowErrors.push({ row: i + 1, field: field, message: "Required field '" + field + "' is missing or empty" });
          }
        });

        // 2. DUPLICATE DETECTION (against existing data)
        var keyField = config.fieldMap[config.uniqueField] || config.uniqueField;
        var keyValue = row[keyField];
        if (keyValue) {
          if (this._existingRecords[keyValue.toUpperCase()]) {
            rowErrors.push({ row: i + 1, field: config.uniqueField, message: "Duplicate: '" + keyValue + "' already exists in the system" });
          }
          // Duplicate within file
          if (seenKeys[keyValue.toUpperCase()]) {
            rowErrors.push({ row: i + 1, field: config.uniqueField, message: "Duplicate within file: '" + keyValue + "' appears multiple times" });
          }
          seenKeys[keyValue.toUpperCase()] = true;
        }

        // 3. DATE FORMAT VALIDATION
        (config.dateFields || []).forEach(function(df) {
          var mappedDf = config.fieldMap[df] || df;
          var val = row[mappedDf];
          if (val) {
            var parsed = this._parseDate(val);
            if (!parsed) {
              rowErrors.push({ row: i + 1, field: df, message: "Invalid date format for '" + df + "': '" + val + "'. Use YYYY-MM-DD, DD.MM.YYYY, or DD/MM/YYYY" });
            } else {
              row[mappedDf] = parsed; // Normalize to ISO format
            }
          }
        }.bind(this));

        // 4. NUMERIC FORMAT VALIDATION
        (config.numericFields || []).forEach(function(nf) {
          var mappedNf = config.fieldMap[nf] || nf;
          var val = row[mappedNf];
          if (val) {
            var num = this._parseNumber(val);
            if (isNaN(num)) {
              rowErrors.push({ row: i + 1, field: nf, message: "Invalid number for '" + nf + "': '" + val + "'. Use format like 1234.56 or 1.234,56" });
            } else {
              row[mappedNf] = num;
              if (num < 0) {
                rowWarnings.push({ row: i + 1, field: nf, message: "Negative value for '" + nf + "': " + num });
              }
            }
          }
        }.bind(this));

        // 5. VALID VALUES CHECK (enum fields)
        Object.keys(config.validValues || {}).forEach(function(vf) {
          var mappedVf = config.fieldMap[vf] || vf;
          var val = row[mappedVf];
          if (val && config.validValues[vf].length > 0) {
            if (config.validValues[vf].indexOf(val) === -1) {
              rowWarnings.push({ row: i + 1, field: vf, message: "Value '" + val + "' not in allowed list: " + config.validValues[vf].join(", ") });
            }
          }
        });

        // 6. EMAIL FORMAT VALIDATION
        ["primaryContactEmail", "contactEmail"].forEach(function(ef) {
          var val = row[ef];
          if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            rowWarnings.push({ row: i + 1, field: ef, message: "Invalid email format: '" + val + "'" });
          }
        });

        // 7. BOOLEAN CONVERSIONS
        ["isOem", "isRateCard", "isActive"].forEach(function(bf) {
          if (row[bf] !== undefined && row[bf] !== null) {
            row[bf] = ["true", "1", "yes", "x"].indexOf(String(row[bf]).toLowerCase()) > -1;
          }
        });

        var status = rowErrors.length > 0 ? "Error" : "Valid";
        if (status === "Valid") validCount++;

        parsedRows.push({
          row: i + 1, status: status,
          keyField: row[config.fieldMap[config.keyField] || config.keyField] || "-",
          nameField: row[config.fieldMap[config.nameField] || config.nameField] || "-",
          details: Object.keys(row).filter(function(k) { return row[k]; }).length + " fields" + (rowWarnings.length > 0 ? " ⚠️" + rowWarnings.length + " warnings" : ""),
          data: row, errors: rowErrors
        });

        rowErrors.forEach(function(err) { errorList.push(err); });
        rowWarnings.forEach(function(w) { warningList.push(w); });
      }

      this._oImportModel.setProperty("/parsedData", parsedRows);
      this._oImportModel.setProperty("/preview", parsedRows.slice(0, 50));
      this._oImportModel.setProperty("/validation", {
        total: parsedRows.length, valid: validCount,
        errors: errorList.length, warnings: warningList.length,
        errorList: errorList, warningList: warningList
      });

      MessageToast.show(parsedRows.length + " rows parsed: " + validCount + " valid, " + errorList.length + " errors, " + warningList.length + " warnings");
    },

    // ================================================================
    // DATE PARSING (supports YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY)
    // ================================================================
    _parseDate: function(val) {
      if (!val) return null;
      val = val.trim();
      // ISO format: YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        var d = new Date(val);
        return isNaN(d.getTime()) ? null : val;
      }
      // European: DD.MM.YYYY or DD/MM/YYYY
      var match = val.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
      if (match) {
        var day = parseInt(match[1], 10), month = parseInt(match[2], 10), year = parseInt(match[3], 10);
        if (month > 12) { var tmp = day; day = month; month = tmp; } // Swap if month>12 (likely MM/DD)
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
        }
      }
      return null;
    },

    // ================================================================
    // NUMBER PARSING (supports 1234.56, 1.234,56, 1234,56)
    // ================================================================
    _parseNumber: function(val) {
      if (!val) return NaN;
      val = val.trim();
      // Remove currency symbols and spaces
      val = val.replace(/[€$£\s]/g, "");
      // European format: 1.234,56 → 1234.56
      if (/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(val)) {
        val = val.replace(/\./g, "").replace(",", ".");
      }
      // Simple comma decimal: 1234,56 → 1234.56
      else if (/^\d+(,\d+)$/.test(val)) {
        val = val.replace(",", ".");
      }
      return parseFloat(val);
    },

    // ================================================================
    // IMPORT EXECUTION
    // ================================================================
    onExecuteImport: function() {
      var that = this;
      var parsedData = this._oImportModel.getProperty("/parsedData");
      var validRecords = parsedData.filter(function(r) { return r.status === "Valid"; });
      if (validRecords.length === 0) { MessageBox.error("No valid records to import"); return; }

      MessageBox.confirm("Import " + validRecords.length + " records?\n\n" + (this._oImportModel.getProperty("/validation/warnings") > 0 ? "⚠️ " + this._oImportModel.getProperty("/validation/warnings") + " warnings exist - records will still be imported." : ""), {
        title: "Confirm Import",
        onClose: function(action) { if (action === MessageBox.Action.OK) that._executeImport(validRecords); }
      });
    },

    _executeImport: function(validRecords) {
      var that = this;
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];
      var targetUrl = ".." + config.targetPath;

      this._oImportModel.setProperty("/importing", true);
      this._oImportModel.setProperty("/importComplete", false);
      this._oImportModel.setProperty("/importProgress", { current: 0, total: validRecords.length, percent: 0 });

      var successCount = 0, failedCount = 0;

      this._createImportBatch(validRecords.length).then(function(batch) {
        var batchId = batch ? batch.ID : null;
        var chain = Promise.resolve();

        validRecords.forEach(function(record, idx) {
          chain = chain.then(function() {
            return fetch(targetUrl, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Basic " + btoa("admin:admin") }, body: JSON.stringify(record.data) })
              .then(function(resp) { if (resp.ok) successCount++; else failedCount++; })
              .catch(function() { failedCount++; })
              .then(function() {
                var progress = Math.round(((idx + 1) / validRecords.length) * 100);
                that._oImportModel.setProperty("/importProgress", { current: idx + 1, total: validRecords.length, percent: progress });
              });
          });
        });

        return chain.then(function() {
          if (batchId) that._updateImportBatch(batchId, successCount, failedCount);
          that._oImportModel.setProperty("/importing", false);
          that._oImportModel.setProperty("/importComplete", true);
          that._oImportModel.setProperty("/importResult", { success: successCount, failed: failedCount });
          MessageToast.show("Import complete: " + successCount + " success, " + failedCount + " failed");
        });
      });
    },

    _createImportBatch: function(totalRecords) {
      var config = this._oImportModel.getProperty("/config");
      var serviceUrl = this.getOwnerComponent().getModel().getServiceUrl();
      return fetch(serviceUrl + "ImportBatches", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Basic " + btoa("admin:admin") },
        body: JSON.stringify({ batchName: config.batchName || config.entityType + " Import " + new Date().toISOString().slice(0, 10), sourceSystem: config.sourceSystem, status: "Processing", totalRecords: totalRecords, successCount: 0, errorCount: 0, importedBy: "admin" })
      }).then(function(r) { return r.json(); }).catch(function() { return null; });
    },

    _updateImportBatch: function(batchId, success, failed) {
      var serviceUrl = this.getOwnerComponent().getModel().getServiceUrl();
      fetch(serviceUrl + "ImportBatches(" + batchId + ")", {
        method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": "Basic " + btoa("admin:admin") },
        body: JSON.stringify({ status: failed > 0 ? "Completed with Errors" : "Completed", successCount: success, errorCount: failed })
      });
    },

    // ================================================================
    // TEMPLATE DOWNLOAD (with headers + sample row + instructions)
    // ================================================================
    onDownloadTemplate: function() {
      var entityType = this._oImportModel.getProperty("/config/entityType");
      var config = ENTITY_CONFIG[entityType];
      var headers = config.templateHeaders;
      var sample = config.templateSample;

      var csv = "# ESP Management - " + entityType + " Import Template\n";
      csv += "# Format: TAB-separated values (TSV). Keep columns separated by a single TAB character.\n";
      csv += "# Required fields: " + config.requiredFields.join(", ") + "\n";
      csv += "# Date format: YYYY-MM-DD (e.g., 2025-06-15) or DD.MM.YYYY\n";
      csv += "# Boolean fields: true/false or 1/0 or yes/no\n";
      if (config.dateFields.length > 0) csv += "# Date fields: " + config.dateFields.join(", ") + "\n";
      if (config.numericFields.length > 0) csv += "# Numeric fields: " + config.numericFields.join(", ") + " (use . as decimal separator)\n";
      if (Object.keys(config.validValues).length > 0) {
        csv += "# Valid values:\n";
        Object.keys(config.validValues).forEach(function(k) {
          csv += "#   " + k + ": " + config.validValues[k].join(" | ") + "\n";
        });
      }
      csv += "#\n";
      csv += headers.join("\t") + "\n";
      csv += sample.join("\t") + "\n";

      var blob = new Blob(["\ufeff" + csv], { type: "text/tab-separated-values;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = entityType.toLowerCase() + "_import_template.tsv";
      a.click();
      URL.revokeObjectURL(url);
      MessageToast.show("Template downloaded: " + entityType.toLowerCase() + "_import_template.tsv");
    },

    onShowHistory: function() {
      var oPanel = this.byId("panelHistory");
      oPanel.setExpanded(!oPanel.getExpanded());
    }
  });
});
