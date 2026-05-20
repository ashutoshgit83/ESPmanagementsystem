sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function(Controller) {
  "use strict";

  return Controller.extend("esp.launchpad.controller.Launchpad", {

    handleTilePress: function(oEvent) {
      var oTile = oEvent.getSource();
      var sUrl = oTile.data("targetUrl");
      if (sUrl) {
        window.location.href = sUrl;
      }
    }

  });
});
