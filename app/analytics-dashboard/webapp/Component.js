sap.ui.define([
  "sap/ui/core/UIComponent",
  "esp/analytics/model/models"
], function(UIComponent, models) {
  "use strict";

  return UIComponent.extend("esp.analytics.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(models.createDeviceModel(), "device");
      this.getRouter().initialize();
    }
  });
});
