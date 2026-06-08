(function() {
  "use strict";

  var DOMAINS = {
    suppliers: { label: "Suppliers", service: "/odata/v4/master-data/Suppliers", expand: "contacts,classifications" },
    customers: { label: "Customers", service: "/odata/v4/master-data/Customers", expand: "" },
    orders: { label: "Purchase Orders", service: "/odata/v4/orders/PurchaseOrders", expand: "supplier,orderType" },
    invoices: { label: "Invoices", service: "/odata/v4/invoices/Invoices", expand: "supplier" },
    consumption: { label: "Consumption", service: "/odata/v4/consumption/ConsumptionAllocations", expand: "consumingChapterArea,consultant" },
    forecasts: { label: "Planning", service: "/odata/v4/admin/ForecastCycles", expand: "exchangeRates" },
    audit: { label: "Audit", service: "/odata/v4/admin/AuditLogs", expand: "" }
  };

  var SUGGESTIONS = {
    suppliers: ["How many?", "Supplier scores", "Rate benchmark", "Anomalies", "Recommendations"],
    customers: ["List all", "How many active?", "Trends"],
    orders: ["Total PO value?", "Budget prediction", "Expiring contracts", "Risk assessment", "What-if reduce 10%", "Anomalies"],
    invoices: ["Pending?", "Total invoiced?", "Fraud indicators", "Seasonal patterns", "Anomalies"],
    consumption: ["Total FTE?", "Consumption trend", "Efficiency score", "FTE demand forecast", "Burn rate", "Recommendations"],
    forecasts: ["Current cycle?", "Exchange rates", "Trends", "Prediction", "Correlation analysis"],
    audit: ["Recent changes?", "Status changes", "Trends"]
  };

  var state = { open: false, domain: null, messages: [] };

  // ================================================================
  // CREATE FLOATING UI
  // ================================================================
  function createWidget() {
    var style = document.createElement("style");
    style.textContent = `
      #esp-chat-fab { position:fixed; bottom:24px; right:24px; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#0a6ed1,#1a365d); border:none; cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.3); z-index:99999; display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }
      #esp-chat-fab:hover { transform:scale(1.1); }
      #esp-chat-fab svg { width:28px; height:28px; fill:white; }
      #esp-chat-panel { position:fixed; bottom:90px; right:24px; width:380px; height:520px; background:white; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.25); z-index:99998; display:none; flex-direction:column; overflow:hidden; font-family:'Segoe UI',Arial,sans-serif; }
      #esp-chat-panel.open { display:flex; }
      #esp-chat-header { background:linear-gradient(135deg,#0a6ed1,#1a365d); color:white; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; }
      #esp-chat-header h4 { margin:0; font-size:14px; font-weight:600; }
      #esp-chat-close { background:none; border:none; color:white; font-size:20px; cursor:pointer; padding:0 4px; }
      #esp-chat-messages { flex:1; overflow-y:auto; padding:12px; }
      .esp-msg { margin-bottom:10px; max-width:85%; padding:8px 12px; border-radius:10px; font-size:12px; line-height:1.4; white-space:pre-wrap; }
      .esp-msg-bot { background:#f0f4f8; color:#1a202c; border-bottom-left-radius:2px; }
      .esp-msg-user { background:#0a6ed1; color:white; margin-left:auto; border-bottom-right-radius:2px; }
      #esp-chat-suggestions { padding:8px 12px; display:flex; flex-wrap:wrap; gap:6px; border-top:1px solid #e2e8f0; max-height:100px; overflow-y:auto; }
      .esp-sug-btn { background:#ebf8ff; border:1px solid #90cdf4; border-radius:14px; padding:4px 10px; font-size:11px; cursor:pointer; color:#2b6cb0; white-space:nowrap; }
      .esp-sug-btn:hover { background:#bee3f8; }
      #esp-chat-input-bar { display:flex; border-top:1px solid #e2e8f0; padding:8px; gap:6px; }
      #esp-chat-input { flex:1; border:1px solid #cbd5e0; border-radius:6px; padding:8px 10px; font-size:12px; outline:none; }
      #esp-chat-input:focus { border-color:#0a6ed1; }
      #esp-chat-send { background:#0a6ed1; border:none; border-radius:6px; color:white; padding:8px 12px; cursor:pointer; font-size:12px; }
    `;
    document.head.appendChild(style);

    // FAB button
    var fab = document.createElement("button");
    fab.id = "esp-chat-fab";
    fab.title = "Partner Assistant";
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
    fab.onclick = togglePanel;
    document.body.appendChild(fab);

    // Chat panel
    var panel = document.createElement("div");
    panel.id = "esp-chat-panel";
    panel.innerHTML = `
      <div id="esp-chat-header">
        <h4>💬 Partner Assistant</h4>
        <button id="esp-chat-close" onclick="document.getElementById('esp-chat-panel').classList.remove('open')">&times;</button>
      </div>
      <div id="esp-chat-messages"></div>
      <div id="esp-chat-suggestions"></div>
      <div id="esp-chat-input-bar">
        <input id="esp-chat-input" placeholder="Ask a question..." />
        <button id="esp-chat-send">Send</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Events
    document.getElementById("esp-chat-send").onclick = sendMessage;
    document.getElementById("esp-chat-input").addEventListener("keypress", function(e) { if (e.key === "Enter") sendMessage(); });

    // Initial message
    addBot("Hi! I'm your Partner Assistant.\nSelect a topic to get started:");
    showDomainButtons();
  }

  function togglePanel() {
    var panel = document.getElementById("esp-chat-panel");
    panel.classList.toggle("open");
    state.open = panel.classList.contains("open");
  }

  // ================================================================
  // MESSAGES
  // ================================================================
  function addBot(text) {
    var div = document.createElement("div");
    div.className = "esp-msg esp-msg-bot";
    div.textContent = text;
    var container = document.getElementById("esp-chat-messages");
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function addUser(text) {
    var div = document.createElement("div");
    div.className = "esp-msg esp-msg-user";
    div.textContent = text;
    var container = document.getElementById("esp-chat-messages");
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // ================================================================
  // SUGGESTIONS
  // ================================================================
  function showDomainButtons() {
    var container = document.getElementById("esp-chat-suggestions");
    container.innerHTML = "";
    Object.keys(DOMAINS).forEach(function(key) {
      var btn = document.createElement("button");
      btn.className = "esp-sug-btn";
      btn.textContent = DOMAINS[key].label;
      btn.onclick = function() { selectDomain(key); };
      container.appendChild(btn);
    });
  }

  function showQuestions(domain) {
    var container = document.getElementById("esp-chat-suggestions");
    container.innerHTML = "";
    (SUGGESTIONS[domain] || []).forEach(function(q) {
      var btn = document.createElement("button");
      btn.className = "esp-sug-btn";
      btn.textContent = q;
      btn.onclick = function() { processQuestion(q); };
      container.appendChild(btn);
    });
    // Back button
    var back = document.createElement("button");
    back.className = "esp-sug-btn";
    back.textContent = "← Topics";
    back.style.background = "#fed7d7";
    back.style.borderColor = "#fc8181";
    back.style.color = "#c53030";
    back.onclick = function() { state.domain = null; addBot("Select a topic:"); showDomainButtons(); };
    container.appendChild(back);
  }

  function selectDomain(key) {
    state.domain = key;
    addUser(DOMAINS[key].label);
    addBot("Ask about " + DOMAINS[key].label + ":");
    showQuestions(key);
  }

  // ================================================================
  // SEND & PROCESS
  // ================================================================
  function sendMessage() {
    var input = document.getElementById("esp-chat-input");
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    processQuestion(text);
  }

  function processQuestion(question) {
    addUser(question);
    if (!state.domain) { addBot("Please select a topic first."); showDomainButtons(); return; }

    var config = DOMAINS[state.domain];
    var url = config.service + (config.expand ? "?$expand=" + config.expand : "");

    fetch(url, { headers: { "Accept": "application/json" } })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var data = d.value || [];
        // Try predictive analysis first
        var prediction = runPredictiveAnalysis(question.toLowerCase(), data);
        if (prediction) { addBot(prediction); }
        else { addBot(generateAnswer(question.toLowerCase(), data, state.domain)); }
      })
      .catch(function() { addBot("Sorry, couldn't fetch data."); });
  }

  // ================================================================
  // ML PREDICTIVE ANALYSIS ENGINE
  // ================================================================
  function runPredictiveAnalysis(q, allData) {
    // Simple ML-style analysis using statistical methods on real data
    // No external AI — all computed locally from OData responses

    if (q.match(/predict.*budget|forecast.*overrun|will.*exceed|budget/)) return predictBudgetOverrun(allData);
    if (q.match(/predict.*consumption|consumption.*trend|consumption.*forecast/)) return predictConsumptionTrend(allData);
    if (q.match(/risk|at.?risk|risky/)) return identifyRisks(allData);
    if (q.match(/anomal|unusual|outlier/)) return detectAnomalies(allData);
    if (q.match(/recommend|suggest|optim/)) return generateRecommendations(allData);
    if (q.match(/trend|pattern|growth/)) return analyzeTrends(allData);
    if (q.match(/supplier.*score|performance.*score|vendor.*score|score.*supplier|rank.*supplier/)) return supplierPerformanceScore(allData);
    if (q.match(/expir|renew|contract.*end|due.*soon/)) return poExpiryAlerts(allData);
    if (q.match(/benchmark|rate.*compar|overpriced|expensive/)) return rateBenchmarking(allData);
    if (q.match(/fraud|suspicious|duplicate.*invoice|flag/)) return invoiceFraudIndicators(allData);
    if (q.match(/what.?if|scenario|impact.*rate|if.*reduce|if.*increase/)) return whatIfScenario(allData, q);
    if (q.match(/correlat|driver|root.*cause|why.*cost/)) return correlationAnalysis(allData);
    if (q.match(/season|monthly.*pattern|recurring|cycle.*pattern/)) return seasonalPatterns(allData);
    if (q.match(/efficien|utiliz|underperform/)) return allocationEfficiency(allData);
    if (q.match(/categor|classify|auto.*assign/)) return autoCategorizeSuggestion(allData);
    if (q.match(/demand.*forecast|fte.*forecast|hiring|capacity.*plan/)) return fteDemandForecast(allData);
    if (q.match(/burn.*rate|cost.*center.*budget|cc.*budget/)) return costCenterBurnRate(allData);
    if (q.match(/predict|forecast|projection|estimate/)) return generalPrediction(allData);
    return null;
  }

  function predictBudgetOverrun(data) {
    var items = data;
    var totalOrdered = items.reduce(function(s, r) { return s + (Number(r.totalNetValue || r.netValue || 0)); }, 0);
    var consumed = items.reduce(function(s, r) { return s + (Number(r.consumedValue || 0)); }, 0);
    var activeCount = items.filter(function(r) { return r.status === "Active"; }).length;
    var consumptionRate = totalOrdered > 0 ? (consumed / totalOrdered * 100) : 0;
    
    var projection = consumed * (12 / Math.max(getCurrentMonth(), 1)); // Annualize
    var variance = projection - totalOrdered;
    var riskLevel = variance > 0 ? "⚠️ HIGH" : consumptionRate > 70 ? "🟡 MEDIUM" : "✅ LOW";

    return "📊 BUDGET PREDICTION:\n\n" +
      "Current spend rate: " + consumptionRate.toFixed(1) + "%\n" +
      "Projected annual: " + Math.round(projection).toLocaleString() + " EUR\n" +
      "Budget capacity: " + Math.round(totalOrdered).toLocaleString() + " EUR\n" +
      "Projected variance: " + (variance > 0 ? "+" : "") + Math.round(variance).toLocaleString() + " EUR\n" +
      "Risk level: " + riskLevel + "\n\n" +
      (variance > 0 ? "⚠️ At current rate, budget will be exceeded by " + Math.round(variance).toLocaleString() + " EUR" : "✅ On track to stay within budget");
  }

  function predictConsumptionTrend(data) {
    var allocations = data.filter(function(r) { return r.consumedValue; });
    if (allocations.length < 2) return "Not enough data for trend analysis.";

    var values = allocations.map(function(r) { return Number(r.consumedValue) || 0; });
    var avg = values.reduce(function(s, v) { return s + v; }, 0) / values.length;
    var max = Math.max.apply(null, values);
    var min = Math.min.apply(null, values);
    var totalFte = allocations.reduce(function(s, r) { return s + (Number(r.actualFte) || 0); }, 0);
    var avgFte = totalFte / allocations.length;

    // Simple linear trend
    var trend = values[values.length - 1] > avg ? "📈 INCREASING" : "📉 DECREASING";
    var nextMonthEst = avg * 1.05; // 5% growth assumption

    return "📊 CONSUMPTION TREND:\n\n" +
      "Allocations analyzed: " + allocations.length + "\n" +
      "Avg consumption: " + Math.round(avg).toLocaleString() + " EUR\n" +
      "Range: " + Math.round(min).toLocaleString() + " — " + Math.round(max).toLocaleString() + " EUR\n" +
      "Avg FTE deployed: " + avgFte.toFixed(1) + "\n" +
      "Trend: " + trend + "\n" +
      "Next period estimate: ~" + Math.round(nextMonthEst).toLocaleString() + " EUR\n\n" +
      "💡 Recommendation: " + (trend.includes("INCREASING") ? "Review capacity planning — demand is growing" : "Current allocation levels are stable");
  }

  function identifyRisks(data) {
    var risks = [];

    // Over-budget POs
    var highValue = data.filter(function(r) { return r.totalNetValue > 200000 && r.status === "Active"; });
    if (highValue.length > 0) risks.push("🔴 " + highValue.length + " high-value POs (>200K) currently active");

    // Pending approvals
    var pending = data.filter(function(r) { return r.status === "PendingApproval" || r.status === "Pending"; });
    if (pending.length > 0) risks.push("🟡 " + pending.length + " items awaiting approval (potential bottleneck)");

    // Draft orders (not submitted)
    var drafts = data.filter(function(r) { return r.status === "Draft"; });
    if (drafts.length > 0) risks.push("🟡 " + drafts.length + " draft orders not yet submitted");

    // High consumption rate
    var highConsumption = data.filter(function(r) { return r.consumedValue && r.consumedValue > 80000; });
    if (highConsumption.length > 0) risks.push("🟠 " + highConsumption.length + " allocations with high consumption (>80K)");

    if (risks.length === 0) risks.push("✅ No significant risks detected in current data");

    return "⚠️ RISK ASSESSMENT:\n\n" + risks.join("\n") + "\n\n📋 Total records analyzed: " + data.length;
  }

  function detectAnomalies(data) {
    var anomalies = [];
    var numericFields = ["totalNetValue", "netValue", "consumedValue", "actualFte"];

    numericFields.forEach(function(field) {
      var values = data.map(function(r) { return Number(r[field]) || 0; }).filter(function(v) { return v > 0; });
      if (values.length < 3) return;

      var avg = values.reduce(function(s, v) { return s + v; }, 0) / values.length;
      var stdDev = Math.sqrt(values.reduce(function(s, v) { return s + Math.pow(v - avg, 2); }, 0) / values.length);
      var threshold = avg + 2 * stdDev;

      var outliers = data.filter(function(r) { return (Number(r[field]) || 0) > threshold; });
      if (outliers.length > 0) {
        var names = outliers.slice(0, 3).map(function(r) { return r.poNumber || r.invoiceNumber || r.supplierName || "ID:" + (r.ID || "").substring(0, 8); });
        anomalies.push("📍 " + field + ": " + outliers.length + " outlier(s) > " + Math.round(threshold).toLocaleString() + " (" + names.join(", ") + ")");
      }
    });

    if (anomalies.length === 0) anomalies.push("✅ No statistical anomalies detected (all values within 2σ)");

    return "🔍 ANOMALY DETECTION (2σ method):\n\n" + anomalies.join("\n") + "\n\nRecords analyzed: " + data.length;
  }

  function generateRecommendations(data) {
    var recs = [];

    // Supplier concentration
    var suppliers = {};
    data.forEach(function(r) { var n = (r.supplier && r.supplier.supplierName) || r.supplierName; if (n) suppliers[n] = (suppliers[n] || 0) + 1; });
    var topSupplier = Object.keys(suppliers).sort(function(a, b) { return suppliers[b] - suppliers[a]; })[0];
    if (topSupplier && suppliers[topSupplier] > data.length * 0.4) {
      recs.push("⚡ Diversify: " + topSupplier + " has " + Math.round(suppliers[topSupplier] / data.length * 100) + "% concentration — consider alternative suppliers");
    }

    // Pending items
    var pending = data.filter(function(r) { return r.status === "Pending" || r.status === "PendingApproval"; });
    if (pending.length > 2) recs.push("⚡ Process " + pending.length + " pending approvals to avoid delays");

    // FTE optimization
    var underUtilized = data.filter(function(r) { return r.plannedFte && r.actualFte && r.actualFte < r.plannedFte * 0.7; });
    if (underUtilized.length > 0) recs.push("⚡ " + underUtilized.length + " allocation(s) under-utilized (<70% of planned FTE) — review staffing");

    // Rate optimization
    var rates = data.filter(function(r) { return r.unitPrice > 0; }).map(function(r) { return r.unitPrice; });
    if (rates.length > 2) {
      var avgRate = rates.reduce(function(s, v) { return s + v; }, 0) / rates.length;
      var highRates = rates.filter(function(r) { return r > avgRate * 1.3; });
      if (highRates.length > 0) recs.push("⚡ " + highRates.length + " item(s) with rates 30%+ above average (" + Math.round(avgRate) + " EUR/h) — negotiate");
    }

    if (recs.length === 0) recs.push("✅ Portfolio looks well-optimized. No immediate actions needed.");

    return "💡 RECOMMENDATIONS:\n\n" + recs.join("\n\n");
  }

  function analyzeTrends(data) {
    var statusDist = {};
    data.forEach(function(r) { if (r.status) statusDist[r.status] = (statusDist[r.status] || 0) + 1; });

    var totalValue = data.reduce(function(s, r) { return s + (Number(r.totalNetValue || r.netValue || r.consumedValue || 0)); }, 0);
    var avgValue = data.length > 0 ? totalValue / data.length : 0;

    var result = "📈 TREND ANALYSIS:\n\n";
    result += "Records: " + data.length + "\n";
    result += "Total value: " + Math.round(totalValue).toLocaleString() + " EUR\n";
    result += "Average per record: " + Math.round(avgValue).toLocaleString() + " EUR\n\n";

    if (Object.keys(statusDist).length > 0) {
      result += "Status distribution:\n";
      Object.keys(statusDist).forEach(function(s) {
        var pct = (statusDist[s] / data.length * 100).toFixed(0);
        result += "  " + s + ": " + statusDist[s] + " (" + pct + "%)\n";
      });
    }

    return result;
  }

  function generalPrediction(data) {
    var totalValue = data.reduce(function(s, r) { return s + (Number(r.totalNetValue || r.netValue || r.consumedValue || 0)); }, 0);
    var month = getCurrentMonth();
    var annualProjection = month > 0 ? (totalValue / month) * 12 : totalValue;
    var growthRate = 1.08; // Assume 8% YoY growth
    var nextYearProjection = annualProjection * growthRate;

    return "🔮 PREDICTION:\n\n" +
      "Current year spend (annualized): " + Math.round(annualProjection).toLocaleString() + " EUR\n" +
      "Growth assumption: 8% YoY\n" +
      "Next year projection: ~" + Math.round(nextYearProjection).toLocaleString() + " EUR\n" +
      "Monthly run rate: ~" + Math.round(annualProjection / 12).toLocaleString() + " EUR/month\n\n" +
      "📋 Based on " + data.length + " records analyzed";
  }

  // ================================================================
  // ML FEATURE: Supplier Performance Scoring
  // ================================================================
  function supplierPerformanceScore(data) {
    var suppliers = {};
    data.forEach(function(r) {
      var name = (r.supplier && r.supplier.supplierName) || r.supplierName;
      if (!name) return;
      if (!suppliers[name]) suppliers[name] = { orders: 0, value: 0, active: 0, onTime: 0 };
      suppliers[name].orders++;
      suppliers[name].value += Number(r.totalNetValue || r.netValue || 0);
      if (r.status === "Active" || r.status === "Paid" || r.status === "Approved") suppliers[name].active++;
    });

    var scores = Object.keys(suppliers).map(function(name) {
      var s = suppliers[name];
      var volumeScore = Math.min(s.orders * 20, 100);
      var valueScore = Math.min(s.value / 5000, 100);
      var reliabilityScore = s.orders > 0 ? (s.active / s.orders) * 100 : 50;
      var total = Math.round((volumeScore * 0.3 + valueScore * 0.3 + reliabilityScore * 0.4));
      return { name: name, score: total, orders: s.orders, value: s.value };
    }).sort(function(a, b) { return b.score - a.score; });

    var result = "\ud83c\udfc6 SUPPLIER PERFORMANCE SCORES:\n\n";
    scores.forEach(function(s, i) {
      var badge = s.score >= 80 ? "\u2b50" : s.score >= 60 ? "\ud83d\udfe2" : "\ud83d\udfe1";
      result += badge + " " + (i + 1) + ". " + s.name + " \u2014 Score: " + s.score + "/100 (" + s.orders + " orders, " + Math.round(s.value).toLocaleString() + " EUR)\n";
    });
    result += "\n\ud83d\udccb Scoring: Volume 30% + Value 30% + Reliability 40%";
    return result;
  }

  // ================================================================
  // ML FEATURE: PO Expiry Alerts
  // ================================================================
  function poExpiryAlerts(data) {
    var today = new Date();
    var alerts = { expired: [], within30: [], within60: [], within90: [] };

    data.forEach(function(r) {
      var endDate = r.deliveryEndDate || r.validityEndDate;
      if (!endDate || r.status === "Closed" || r.status === "Cancelled") return;
      var end = new Date(endDate);
      var daysLeft = Math.round((end - today) / 86400000);
      var label = (r.poNumber || r.supplierName || "") + " (" + endDate + ")";
      if (daysLeft < 0) alerts.expired.push(label);
      else if (daysLeft <= 30) alerts.within30.push(label);
      else if (daysLeft <= 60) alerts.within60.push(label);
      else if (daysLeft <= 90) alerts.within90.push(label);
    });

    var result = "\u23f0 CONTRACT EXPIRY ALERTS:\n\n";
    if (alerts.expired.length) result += "\ud83d\udd34 EXPIRED:\n" + alerts.expired.map(function(a) { return "  \u2022 " + a; }).join("\n") + "\n\n";
    if (alerts.within30.length) result += "\ud83d\udfe0 Within 30 days:\n" + alerts.within30.map(function(a) { return "  \u2022 " + a; }).join("\n") + "\n\n";
    if (alerts.within60.length) result += "\ud83d\udfe1 Within 60 days:\n" + alerts.within60.map(function(a) { return "  \u2022 " + a; }).join("\n") + "\n\n";
    if (alerts.within90.length) result += "\ud83d\udfe2 Within 90 days:\n" + alerts.within90.map(function(a) { return "  \u2022 " + a; }).join("\n") + "\n";
    if (!alerts.expired.length && !alerts.within30.length && !alerts.within60.length && !alerts.within90.length) result += "\u2705 No contracts expiring in next 90 days.";
    return result;
  }

  // ================================================================
  // ML FEATURE: Rate Benchmarking
  // ================================================================
  function rateBenchmarking(data) {
    var rates = data.filter(function(r) { return r.unitPrice > 0; }).map(function(r) {
      return { name: r.poNumber || r.supplierName || "Item", rate: Number(r.unitPrice), supplier: (r.supplier && r.supplier.supplierName) || "" };
    });
    if (rates.length < 2) return "Not enough rate data for benchmarking.";

    var avg = rates.reduce(function(s, r) { return s + r.rate; }, 0) / rates.length;
    var overpriced = rates.filter(function(r) { return r.rate > avg * 1.25; }).sort(function(a, b) { return b.rate - a.rate; });
    var underpriced = rates.filter(function(r) { return r.rate < avg * 0.75; });

    var result = "\ud83d\udcb0 RATE BENCHMARKING:\n\n";
    result += "Average rate: " + Math.round(avg) + " EUR/h (" + rates.length + " items)\n\n";
    if (overpriced.length) {
      result += "\ud83d\udd34 Above benchmark (+25%):\n";
      overpriced.slice(0, 5).forEach(function(r) { result += "  \u2022 " + r.name + ": " + r.rate + " EUR/h (" + Math.round((r.rate / avg - 1) * 100) + "% above avg)\n"; });
      result += "\n";
    }
    if (underpriced.length) {
      result += "\ud83d\udfe2 Below benchmark (-25%):\n";
      underpriced.forEach(function(r) { result += "  \u2022 " + r.name + ": " + r.rate + " EUR/h\n"; });
    }
    if (!overpriced.length) result += "\u2705 All rates within acceptable benchmark range.";
    return result;
  }

  // ================================================================
  // ML FEATURE: Invoice Fraud Indicators
  // ================================================================
  function invoiceFraudIndicators(data) {
    var flags = [];

    // Duplicate amounts
    var amounts = {};
    data.forEach(function(r) {
      var val = r.netValue || r.totalNetValue;
      if (val) { amounts[val] = (amounts[val] || 0) + 1; }
    });
    Object.keys(amounts).forEach(function(val) {
      if (amounts[val] > 1 && Number(val) > 1000) flags.push("\ud83d\udea9 Duplicate amount: " + Number(val).toLocaleString() + " EUR appears " + amounts[val] + " times");
    });

    // Round number amounts (potential fabrication)
    var roundNumbers = data.filter(function(r) { var v = Number(r.netValue || 0); return v > 0 && v % 10000 === 0; });
    if (roundNumbers.length > 1) flags.push("\ud83d\udea9 " + roundNumbers.length + " invoices with suspiciously round amounts (multiples of 10K)");

    // Very high single items
    var values = data.map(function(r) { return Number(r.netValue || r.totalNetValue || 0); }).filter(function(v) { return v > 0; });
    if (values.length > 2) {
      var avg = values.reduce(function(s, v) { return s + v; }, 0) / values.length;
      var extreme = data.filter(function(r) { return (Number(r.netValue || r.totalNetValue || 0)) > avg * 3; });
      if (extreme.length) flags.push("\ud83d\udea9 " + extreme.length + " item(s) with value 3x above average \u2014 verify");
    }

    if (flags.length === 0) flags.push("\u2705 No fraud indicators detected.");
    return "\ud83d\udd0d FRAUD INDICATORS:\n\n" + flags.join("\n") + "\n\nRecords scanned: " + data.length;
  }

  // ================================================================
  // ML FEATURE: What-If Scenario
  // ================================================================
  function whatIfScenario(data, q) {
    var pctMatch = q.match(/(\d+)\s*%/);
    var pct = pctMatch ? parseInt(pctMatch[1]) : 10;
    var isReduce = q.match(/reduce|decrease|cut|lower/);
    var multiplier = isReduce ? (1 - pct / 100) : (1 + pct / 100);

    var totalValue = data.reduce(function(s, r) { return s + (Number(r.totalNetValue || r.netValue || r.consumedValue || 0)); }, 0);
    var newValue = totalValue * multiplier;
    var impact = newValue - totalValue;

    return "\ud83d\udca1 WHAT-IF SCENARIO:\n\n" +
      "Scenario: " + (isReduce ? "Reduce" : "Increase") + " rates by " + pct + "%\n\n" +
      "Current total: " + Math.round(totalValue).toLocaleString() + " EUR\n" +
      "After change: " + Math.round(newValue).toLocaleString() + " EUR\n" +
      "Impact: " + (impact > 0 ? "+" : "") + Math.round(impact).toLocaleString() + " EUR/year\n\n" +
      (isReduce ? "\u2705 Saving " + Math.round(Math.abs(impact)).toLocaleString() + " EUR annually" : "\u26a0\ufe0f Additional cost: " + Math.round(impact).toLocaleString() + " EUR annually") +
      "\n\nTip: Try 'what if reduce 15%' or 'what if increase 5%'";
  }

  // ================================================================
  // ML FEATURE: Correlation Analysis
  // ================================================================
  function correlationAnalysis(data) {
    var dimensions = {};
    data.forEach(function(r) {
      var region = r.region || (r.country_code === "DE" ? "EMEA" : r.country_code === "IN" ? "APAC" : "Other");
      var supplier = (r.supplier && r.supplier.supplierName) || r.supplierName || "Unknown";
      var value = Number(r.totalNetValue || r.netValue || r.consumedValue || 0);

      if (!dimensions[region]) dimensions[region] = { total: 0, count: 0 };
      dimensions[region].total += value;
      dimensions[region].count++;
    });

    var result = "\ud83d\udd17 COST DRIVER ANALYSIS:\n\n";
    var sorted = Object.keys(dimensions).sort(function(a, b) { return dimensions[b].total - dimensions[a].total; });
    var grandTotal = sorted.reduce(function(s, k) { return s + dimensions[k].total; }, 0);

    sorted.forEach(function(key) {
      var d = dimensions[key];
      var pct = grandTotal > 0 ? (d.total / grandTotal * 100).toFixed(1) : 0;
      result += "\u25aa " + key + ": " + Math.round(d.total).toLocaleString() + " EUR (" + pct + "%) \u2014 " + d.count + " records\n";
    });
    result += "\n\ud83d\udca1 Highest cost driver: " + sorted[0] + " (" + (grandTotal > 0 ? (dimensions[sorted[0]].total / grandTotal * 100).toFixed(0) : 0) + "% of total)";
    return result;
  }

  // ================================================================
  // ML FEATURE: Seasonal Patterns
  // ================================================================
  function seasonalPatterns(data) {
    var months = {};
    data.forEach(function(r) {
      var date = r.issueDate || r.invoiceDate || r.actualStartDate || r.createdAt;
      if (!date) return;
      var m = date.substring(5, 7);
      if (!months[m]) months[m] = { count: 0, value: 0 };
      months[m].count++;
      months[m].value += Number(r.totalNetValue || r.netValue || r.consumedValue || 0);
    });

    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var result = "\ud83d\udcc5 SEASONAL PATTERNS:\n\n";
    var hasData = false;

    for (var i = 1; i <= 12; i++) {
      var key = String(i).padStart(2, "0");
      if (months[key]) {
        hasData = true;
        var bar = "\u2588".repeat(Math.min(Math.round(months[key].count * 2), 10));
        result += monthNames[i - 1] + ": " + bar + " " + months[key].count + " (" + Math.round(months[key].value).toLocaleString() + " EUR)\n";
      }
    }
    if (!hasData) result += "Not enough date-based data for seasonal analysis.";
    else result += "\n\ud83d\udca1 Peak months indicate higher procurement activity.";
    return result;
  }

  // ================================================================
  // ML FEATURE: Allocation Efficiency
  // ================================================================
  function allocationEfficiency(data) {
    var allocations = data.filter(function(r) { return r.plannedFte && r.actualFte; });
    if (allocations.length === 0) return "No allocation data with planned/actual FTE for efficiency analysis.";

    var result = "\u2699\ufe0f ALLOCATION EFFICIENCY:\n\n";
    allocations.forEach(function(a) {
      var efficiency = (a.actualFte / a.plannedFte * 100).toFixed(0);
      var status = efficiency >= 90 ? "\ud83d\udfe2" : efficiency >= 70 ? "\ud83d\udfe1" : "\ud83d\udd34";
      var label = a.plwProjectNumber || a.consumingChapterArea && a.consumingChapterArea.name || "Allocation";
      result += status + " " + label + ": " + efficiency + "% (" + a.actualFte + "/" + a.plannedFte + " FTE)\n";
    });

    var avgEff = allocations.reduce(function(s, a) { return s + (a.actualFte / a.plannedFte); }, 0) / allocations.length * 100;
    result += "\nOverall efficiency: " + avgEff.toFixed(0) + "%";
    result += avgEff < 80 ? "\n\u26a0\ufe0f Under-utilization detected \u2014 review staffing" : "\n\u2705 Utilization is healthy";
    return result;
  }

  // ================================================================
  // ML FEATURE: Auto-Categorization Suggestion
  // ================================================================
  function autoCategorizeSuggestion(data) {
    var uncategorized = data.filter(function(r) { return !r.serviceType && !r.contractType; });
    var categorized = data.filter(function(r) { return r.serviceType || r.contractType; });

    var result = "\ud83c\udff7\ufe0f AUTO-CATEGORIZATION:\n\n";
    result += "Categorized: " + categorized.length + " records\n";
    result += "Uncategorized: " + uncategorized.length + " records\n\n";

    if (uncategorized.length > 0) {
      result += "Suggested actions:\n";
      result += "\u2022 " + uncategorized.length + " records need service type assignment\n";
      result += "\u2022 Use patterns from existing data to auto-assign\n";
    } else {
      result += "\u2705 All records are properly categorized.";
    }
    return result;
  }

  // ================================================================
  // ML FEATURE: FTE Demand Forecast
  // ================================================================
  function fteDemandForecast(data) {
    var totalPlanned = data.reduce(function(s, r) { return s + (Number(r.plannedFte) || 0); }, 0);
    var totalActual = data.reduce(function(s, r) { return s + (Number(r.actualFte) || 0); }, 0);
    var count = data.filter(function(r) { return r.plannedFte; }).length;

    if (count === 0) return "No FTE data available for demand forecasting.";

    var avgPlanned = totalPlanned / count;
    var growthRate = totalActual > totalPlanned * 0.9 ? 1.15 : 1.05;
    var nextQuarter = totalActual * growthRate;

    return "\ud83d\udc65 FTE DEMAND FORECAST:\n\n" +
      "Current planned FTE: " + totalPlanned.toFixed(1) + "\n" +
      "Current actual FTE: " + totalActual.toFixed(1) + "\n" +
      "Utilization: " + (totalPlanned > 0 ? (totalActual / totalPlanned * 100).toFixed(0) : 0) + "%\n" +
      "Growth assumption: " + Math.round((growthRate - 1) * 100) + "% next quarter\n\n" +
      "\ud83d\udd2e Next quarter projection: " + nextQuarter.toFixed(1) + " FTE\n" +
      "Additional need: +" + (nextQuarter - totalActual).toFixed(1) + " FTE\n\n" +
      "\ud83d\udca1 " + (growthRate > 1.1 ? "High demand growth \u2014 start recruitment planning" : "Stable demand \u2014 current capacity sufficient");
  }

  // ================================================================
  // ML FEATURE: Cost Center Burn Rate
  // ================================================================
  function costCenterBurnRate(data) {
    var ccData = {};
    data.forEach(function(r) {
      var cc = (r.costCenter && r.costCenter.name) || r.costCenter_ID || "Unknown";
      var value = Number(r.consumedValue || r.totalNetValue || r.netValue || 0);
      if (!ccData[cc] || cc === "Unknown") return;
      ccData[cc] = (ccData[cc] || 0) + value;
    });

    if (Object.keys(ccData).length === 0) {
      // Fallback: use any available grouping
      data.forEach(function(r) {
        var area = (r.consumingChapterArea && r.consumingChapterArea.name) || (r.issuingChapterArea && r.issuingChapterArea.name) || r.region;
        if (!area) return;
        var value = Number(r.consumedValue || r.totalNetValue || r.netValue || 0);
        ccData[area] = (ccData[area] || 0) + value;
      });
    }

    var month = getCurrentMonth();
    var result = "\ud83d\udcca BURN RATE ANALYSIS:\n\n";

    Object.keys(ccData).sort(function(a, b) { return ccData[b] - ccData[a]; }).forEach(function(cc) {
      var spent = ccData[cc];
      var monthlyRate = month > 0 ? spent / month : spent;
      var annualProjection = monthlyRate * 12;
      result += "\u25aa " + cc + ":\n";
      result += "  Spent YTD: " + Math.round(spent).toLocaleString() + " EUR\n";
      result += "  Monthly rate: " + Math.round(monthlyRate).toLocaleString() + " EUR/month\n";
      result += "  Annual projection: " + Math.round(annualProjection).toLocaleString() + " EUR\n\n";
    });

    if (Object.keys(ccData).length === 0) result += "No cost center data available.";
    return result;
  }

  function getCurrentMonth() {
    return new Date().getMonth() + 1; // 1-12
  }

  // ================================================================
  // ANSWER ENGINE
  // ================================================================
  function generateAnswer(q, data, domain) {
    var count = data.length;

    if (q.match(/how many|count|total number/)) {
      if (q.match(/active/)) return "Active: " + data.filter(function(r) { return r.status === "Active" || r.isActive === true; }).length + " (of " + count + ")";
      if (q.match(/pending/)) return "Pending: " + data.filter(function(r) { return r.status === "PendingApproval" || r.status === "Pending"; }).length;
      if (q.match(/draft/)) return "Draft: " + data.filter(function(r) { return r.status === "Draft"; }).length;
      return "Total: " + count + " records";
    }

    if (q.match(/total.*value|total.*amount|total.*invoiced/)) {
      var field = domain === "invoices" ? "netValue" : domain === "orders" ? "totalNetValue" : "consumedValue";
      var total = data.reduce(function(s, r) { return s + (Number(r[field]) || 0); }, 0);
      return "Total value: " + total.toLocaleString() + " EUR";
    }

    if (q.match(/total.*fte/)) {
      var fte = data.reduce(function(s, r) { return s + (Number(r.actualFte || r.plannedFte) || 0); }, 0);
      return "Total FTE: " + fte.toFixed(1);
    }

    if (q.match(/platinum/)) return formatList(data.filter(function(r) { return r.tier === "Platinum"; }));
    if (q.match(/gold/)) return formatList(data.filter(function(r) { return r.tier === "Gold"; }));
    if (q.match(/oem/)) return formatList(data.filter(function(r) { return r.isOem === true; }));
    if (q.match(/show.*active|list.*active/)) return formatList(data.filter(function(r) { return r.status === "Active"; }));
    if (q.match(/show.*draft|list.*draft/)) return formatList(data.filter(function(r) { return r.status === "Draft"; }));
    if (q.match(/show.*paid|list.*paid/)) return formatList(data.filter(function(r) { return r.status === "Paid"; }));
    if (q.match(/show.*pending|pending/)) return formatList(data.filter(function(r) { return r.status === "PendingApproval" || r.status === "Pending"; }));
    if (q.match(/current|active.*cycle/)) { var c = data.filter(function(r) { return r.isCurrent; }); return c.length ? "Current: " + c[0].code + " — " + c[0].name : "No current cycle set."; }
    if (q.match(/exchange|rate|fx/)) { var rates = []; data.forEach(function(cy) { (cy.exchangeRates || []).forEach(function(fx) { rates.push(fx.sourceCurrency_code + "/" + fx.targetCurrency_code + " = " + fx.rate); }); }); return rates.length ? "Exchange rates:\n" + rates.join("\n") : "No rates found."; }
    if (q.match(/deployed|consultant|who/)) { var c = []; data.forEach(function(a) { if (a.consultant) c.push(a.consultant.firstName + " " + a.consultant.lastName); }); return c.length ? "Deployed:\n" + c.join("\n") : "No consultants found."; }
    if (q.match(/recent|last/)) return formatList(data.slice(-5).reverse());
    if (q.match(/status.*change/)) return formatList(data.filter(function(r) { return r.action === "StatusChange"; }));

    return count + " records in " + DOMAINS[domain].label + ".\nTry: 'How many active?' or 'Total value?'";
  }

  function formatList(items) {
    if (!items || !items.length) return "No matching records.";
    var lines = items.slice(0, 8).map(function(r) {
      var parts = [];
      if (r.supplierName) parts.push(r.supplierName);
      if (r.customerName) parts.push(r.customerName);
      if (r.poNumber) parts.push(r.poNumber);
      if (r.invoiceNumber) parts.push(r.invoiceNumber);
      if (r.code) parts.push(r.code);
      if (r.supplier && r.supplier.supplierName) parts.push(r.supplier.supplierName);
      if (r.status) parts.push("[" + r.status + "]");
      if (r.action) parts.push("[" + r.action + "]");
      if (r.totalNetValue) parts.push(r.totalNetValue + " EUR");
      if (r.netValue && !r.totalNetValue) parts.push(r.netValue + " EUR");
      if (r.tier) parts.push(r.tier);
      if (r.changedBy) parts.push("by " + r.changedBy);
      return "• " + parts.join(" | ");
    });
    var result = "Found " + items.length + ":\n" + lines.join("\n");
    if (items.length > 8) result += "\n... +" + (items.length - 8) + " more";
    return result;
  }

  // ================================================================
  // INIT
  // ================================================================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWidget);
  } else {
    createWidget();
  }
})();
