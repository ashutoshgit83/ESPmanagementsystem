sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
  "use strict";

  // Service endpoints for each app domain
  var DOMAINS = {
    suppliers: { label: "Supplier Management", service: "/odata/v4/master-data/Suppliers", expand: "contacts,classifications", fields: ["supplierNumber","supplierName","country_code","hcbLcb","tier","isOem","isRateCard"] },
    customers: { label: "Customer Management", service: "/odata/v4/master-data/Customers", expand: "", fields: ["customerNumber","customerName","country_code","contactName","isActive"] },
    orders: { label: "Purchase Orders", service: "/odata/v4/orders/PurchaseOrders", expand: "supplier,orderType,items", fields: ["poNumber","status","totalNetValue","currency_code","deliveryStartDate","deliveryEndDate"] },
    invoices: { label: "Invoice Management", service: "/odata/v4/invoices/Invoices", expand: "supplier,lines", fields: ["invoiceNumber","invoiceDate","status","netValue","grossValue","currency_code"] },
    consumption: { label: "Consumption Tracking", service: "/odata/v4/consumption/ConsumptionAllocations", expand: "consumingChapterArea,resourcePool,consultant,splits", fields: ["plwProjectNumber","plannedFte","actualFte","consumedVolume","consumedValue"] },
    forecasts: { label: "Financial Planning", service: "/odata/v4/admin/ForecastCycles", expand: "exchangeRates", fields: ["code","name","year","startDate","endDate","isCurrent"] },
    audit: { label: "Audit Trail", service: "/odata/v4/admin/AuditLogs", expand: "", fields: ["timestamp","entityType","action","fieldName","oldValue","newValue","changedBy"] }
  };

  // Suggested questions per domain
  var QUESTIONS = {
    suppliers: [
      "How many suppliers do we have?",
      "Show all Platinum tier suppliers",
      "Which suppliers are OEM?",
      "List HCB suppliers",
      "Show Rate Card Global suppliers"
    ],
    customers: [
      "How many customers are active?",
      "List all customers",
      "Which customers are in Germany?"
    ],
    orders: [
      "How many purchase orders are Active?",
      "Show Draft orders",
      "What is total PO value?",
      "List all Frame/Framework orders",
      "Which POs are expiring soon?"
    ],
    invoices: [
      "How many invoices are pending approval?",
      "Show paid invoices",
      "What is total invoiced amount?",
      "List rejected invoices"
    ],
    consumption: [
      "What is total consumed FTE?",
      "Show all project allocations",
      "Which consultants are deployed?"
    ],
    forecasts: [
      "Which forecast cycle is current?",
      "Show exchange rates",
      "List all cycles for 2025"
    ],
    audit: [
      "Show recent audit entries",
      "Who made the last changes?",
      "Show all status changes"
    ]
  };

  return Controller.extend("esp.chatbot.controller.Chat", {

    onInit: function() {
      this._chatModel = new JSONModel({
        messages: [],
        quickReplies: [],
        showQuickReplies: true,
        inputValue: "",
        currentDomain: null
      });
      this.getView().setModel(this._chatModel, "chat");
      this._addBotMessage("👋 Welcome to the ESP Assistant! I can answer questions about your data.\n\nPlease select a topic area:");
      this._showDomainSelection();
    },

    // ================================================================
    // MESSAGE HANDLING
    // ================================================================
    _addBotMessage: function(text) {
      var msgs = this._chatModel.getProperty("/messages") || [];
      msgs.push({ sender: "bot", text: text });
      this._chatModel.setProperty("/messages", msgs);
      this._scrollToBottom();
    },

    _addUserMessage: function(text) {
      var msgs = this._chatModel.getProperty("/messages") || [];
      msgs.push({ sender: "user", text: text });
      this._chatModel.setProperty("/messages", msgs);
      this._scrollToBottom();
    },

    _scrollToBottom: function() {
      var that = this;
      setTimeout(function() {
        var oScroll = that.byId("chatScroll");
        if (oScroll) oScroll.scrollTo(0, 99999);
      }, 100);
    },

    // ================================================================
    // QUICK REPLIES
    // ================================================================
    _showDomainSelection: function() {
      var replies = Object.keys(DOMAINS).map(function(key) {
        return { text: DOMAINS[key].label, value: "domain:" + key };
      });
      this._chatModel.setProperty("/quickReplies", replies);
      this._chatModel.setProperty("/showQuickReplies", true);
    },

    _showSuggestedQuestions: function(domain) {
      var questions = QUESTIONS[domain] || [];
      var replies = questions.map(function(q) { return { text: q, value: "question:" + q }; });
      replies.push({ text: "← Back to topics", value: "domain:back" });
      this._chatModel.setProperty("/quickReplies", replies);
      this._chatModel.setProperty("/showQuickReplies", true);
    },

    onQuickReply: function(oEvent) {
      var sValue = oEvent.getSource().getBindingContext("chat").getObject().value;
      if (sValue.startsWith("domain:")) {
        var domain = sValue.replace("domain:", "");
        if (domain === "back") {
          this._addUserMessage("Back to topics");
          this._addBotMessage("Select a topic area:");
          this._showDomainSelection();
          this._chatModel.setProperty("/currentDomain", null);
        } else {
          this._chatModel.setProperty("/currentDomain", domain);
          this._addUserMessage(DOMAINS[domain].label);
          this._addBotMessage("Great! You selected **" + DOMAINS[domain].label + "**.\n\nHere are some questions I can answer, or type your own:");
          this._showSuggestedQuestions(domain);
        }
      } else if (sValue.startsWith("question:")) {
        var question = sValue.replace("question:", "");
        this._processQuestion(question);
      }
    },

    // ================================================================
    // SEND MESSAGE (free text)
    // ================================================================
    onSendMessage: function() {
      var sInput = this._chatModel.getProperty("/inputValue");
      if (!sInput || !sInput.trim()) return;
      this._chatModel.setProperty("/inputValue", "");
      this._processQuestion(sInput.trim());
    },

    // ================================================================
    // QUESTION PROCESSING ENGINE (data-driven, no AI)
    // ================================================================
    _processQuestion: function(question) {
      this._addUserMessage(question);
      var domain = this._chatModel.getProperty("/currentDomain");

      if (!domain) {
        this._addBotMessage("Please select a topic area first.");
        this._showDomainSelection();
        return;
      }

      var that = this;
      var config = DOMAINS[domain];
      var q = question.toLowerCase();

      // Fetch data and answer
      this._fetchData(config).then(function(data) {
        var answer = that._generateAnswer(q, data, domain, config);
        that._addBotMessage(answer);
      }).catch(function(err) {
        that._addBotMessage("Sorry, I couldn't fetch the data. Error: " + err.message);
      });
    },

    _fetchData: function(config) {
      var url = ".." + config.service;
      if (config.expand) url += "?$expand=" + config.expand;
      return fetch(url, { headers: { "Accept": "application/json", "Authorization": "Basic " + btoa("admin:admin") } })
        .then(function(r) { return r.json(); })
        .then(function(d) { return d.value || []; });
    },

    // ================================================================
    // ANSWER GENERATION (pattern matching + aggregation)
    // ================================================================
    _generateAnswer: function(q, data, domain, config) {
      var count = data.length;

      // COUNT questions
      if (q.match(/how many|count|total number/)) {
        if (q.match(/active/)) {
          var active = data.filter(function(r) { return r.status === "Active" || r.isActive === true; });
          return "There are **" + active.length + "** active records (out of " + count + " total).";
        }
        if (q.match(/pending|approval/)) {
          var pending = data.filter(function(r) { return r.status === "PendingApproval" || r.status === "Pending"; });
          return "There are **" + pending.length + "** pending approval.";
        }
        if (q.match(/draft/)) {
          var drafts = data.filter(function(r) { return r.status === "Draft"; });
          return "There are **" + drafts.length + "** in Draft status.";
        }
        return "Total records: **" + count + "**";
      }

      // TOTAL VALUE questions
      if (q.match(/total.*value|total.*amount|total.*invoiced|sum/)) {
        var valueField = domain === "invoices" ? "netValue" : domain === "orders" ? "totalNetValue" : "consumedValue";
        var total = data.reduce(function(s, r) { return s + (Number(r[valueField]) || 0); }, 0);
        return "Total value: **" + total.toLocaleString() + " EUR**";
      }

      // TOTAL FTE
      if (q.match(/total.*fte|consumed.*fte/)) {
        var totalFte = data.reduce(function(s, r) { return s + (Number(r.actualFte || r.plannedFte) || 0); }, 0);
        return "Total FTE: **" + totalFte.toFixed(1) + "**";
      }

      // FILTER by status
      if (q.match(/show.*active|list.*active/)) { return this._formatList(data.filter(function(r) { return r.status === "Active"; }), config); }
      if (q.match(/show.*draft|list.*draft/)) { return this._formatList(data.filter(function(r) { return r.status === "Draft"; }), config); }
      if (q.match(/show.*paid|list.*paid/)) { return this._formatList(data.filter(function(r) { return r.status === "Paid"; }), config); }
      if (q.match(/show.*pending|list.*pending/)) { return this._formatList(data.filter(function(r) { return r.status === "PendingApproval" || r.status === "Pending"; }), config); }
      if (q.match(/show.*rejected|list.*rejected/)) { return this._formatList(data.filter(function(r) { return r.status === "Rejected"; }), config); }
      if (q.match(/show.*closed|list.*closed/)) { return this._formatList(data.filter(function(r) { return r.status === "Closed"; }), config); }

      // FILTER by specific attributes
      if (q.match(/platinum/)) { return this._formatList(data.filter(function(r) { return r.tier === "Platinum"; }), config); }
      if (q.match(/gold/)) { return this._formatList(data.filter(function(r) { return r.tier === "Gold"; }), config); }
      if (q.match(/silver/)) { return this._formatList(data.filter(function(r) { return r.tier === "Silver"; }), config); }
      if (q.match(/oem/)) { return this._formatList(data.filter(function(r) { return r.isOem === true; }), config); }
      if (q.match(/hcb(?!.*lcb)/)) { return this._formatList(data.filter(function(r) { return r.hcbLcb === "HCB"; }), config); }
      if (q.match(/lcb/)) { return this._formatList(data.filter(function(r) { return r.hcbLcb === "LCB"; }), config); }
      if (q.match(/rate.?card.*global/)) { return this._formatList(data.filter(function(r) { return r.rateCardScope === "Global"; }), config); }
      if (q.match(/frame|framework/)) { return this._formatList(data.filter(function(r) { return r.orderType && r.orderType.name && r.orderType.name.match(/frame/i); }), config); }
      if (q.match(/germany|german|\bDE\b/i)) { return this._formatList(data.filter(function(r) { return r.country_code === "DE"; }), config); }

      // CURRENT cycle
      if (q.match(/current|active.*cycle/)) {
        var current = data.filter(function(r) { return r.isCurrent === true; });
        if (current.length > 0) return "Current active cycle: **" + current[0].code + "** — " + current[0].name;
        return "No current cycle is set.";
      }

      // EXCHANGE RATES
      if (q.match(/exchange|rate|fx/)) {
        var rates = [];
        data.forEach(function(cycle) {
          (cycle.exchangeRates || []).forEach(function(fx) {
            rates.push(fx.sourceCurrency_code + "/" + fx.targetCurrency_code + " = " + fx.rate + " (valid " + fx.validFrom + " → " + fx.validTo + ")");
          });
        });
        return rates.length > 0 ? "Exchange rates:\n" + rates.join("\n") : "No exchange rates found.";
      }

      // CONSULTANTS
      if (q.match(/consultant|deployed|who/)) {
        var consultants = [];
        data.forEach(function(a) {
          if (a.consultant) consultants.push(a.consultant.firstName + " " + a.consultant.lastName + " → " + (a.consumingChapterArea ? a.consumingChapterArea.name : "?"));
        });
        return consultants.length > 0 ? "Deployed consultants:\n" + consultants.join("\n") : "No consultants found in allocations.";
      }

      // RECENT / LAST
      if (q.match(/recent|last/)) {
        var sorted = data.slice().sort(function(a, b) { return (b.timestamp || b.createdAt || "") > (a.timestamp || a.createdAt || "") ? 1 : -1; });
        return this._formatList(sorted.slice(0, 5), config);
      }

      // STATUS CHANGES (audit)
      if (q.match(/status.?change/)) {
        var changes = data.filter(function(r) { return r.action === "StatusChange"; });
        return this._formatList(changes, config);
      }

      // LIST ALL / SHOW ALL
      if (q.match(/list.*all|show.*all|show me/)) {
        return this._formatList(data, config);
      }

      // EXPIRING
      if (q.match(/expir/)) {
        var today = new Date().toISOString().slice(0, 10);
        var soon = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
        var expiring = data.filter(function(r) { return r.deliveryEndDate && r.deliveryEndDate >= today && r.deliveryEndDate <= soon; });
        return expiring.length > 0 ? "POs expiring in next 90 days:\n" + this._formatList(expiring, config) : "No POs expiring in the next 90 days.";
      }

      // DEFAULT: show summary
      return "I have **" + count + "** records in " + DOMAINS[domain].label + ".\n\nTry asking:\n• 'How many are active?'\n• 'Show all' or 'List Draft'\n• 'What is total value?'\n• Or filter by a specific attribute.";
    },

    _formatList: function(items, config) {
      if (!items || items.length === 0) return "No matching records found.";
      var lines = items.slice(0, 10).map(function(r) {
        // Build a readable line from available fields
        var parts = [];
        if (r.supplierNumber) parts.push(r.supplierNumber);
        if (r.supplierName) parts.push(r.supplierName);
        if (r.customerNumber) parts.push(r.customerNumber);
        if (r.customerName) parts.push(r.customerName);
        if (r.poNumber) parts.push(r.poNumber);
        if (r.invoiceNumber) parts.push(r.invoiceNumber);
        if (r.code) parts.push(r.code);
        if (r.name) parts.push(r.name);
        if (r.plwProjectNumber) parts.push("Project: " + r.plwProjectNumber);
        if (r.supplier && r.supplier.supplierName) parts.push(r.supplier.supplierName);
        if (r.status) parts.push("[" + r.status + "]");
        if (r.action) parts.push("[" + r.action + "]");
        if (r.entityType) parts.push(r.entityType);
        if (r.totalNetValue) parts.push(r.totalNetValue + " EUR");
        if (r.netValue && !r.totalNetValue) parts.push(r.netValue + " EUR");
        if (r.tier) parts.push("Tier:" + r.tier);
        if (r.hcbLcb) parts.push(r.hcbLcb);
        if (r.changedBy) parts.push("by " + r.changedBy);
        if (r.timestamp) parts.push(r.timestamp.substring(0, 16));
        return "• " + parts.join(" | ");
      });
      var result = lines.join("\n");
      if (items.length > 10) result += "\n\n... and " + (items.length - 10) + " more records.";
      return "Found **" + items.length + "** records:\n\n" + result;
    }
  });
});
