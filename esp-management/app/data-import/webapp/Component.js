sap.ui.define([
  "sap/ui/core/UIComponent",
  "esp/dataimport/model/models"
], function(UIComponent, models) {
  "use strict";

  return UIComponent.extend("esp.dataimport.Component", {
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
