sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	return ManagedObject.extend("project1.token", {
        getCSRFToken: function(){
            this.on('getCSRFToken', () => {
                    return "Token"
            });
        }
	});
});