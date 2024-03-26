sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/layout/ResponsiveFlowLayoutData", // Add this dependency
    "sap/m/Input",  // Make sure this path is correct
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, MessageBox, ResponsiveFlowLayoutData, Input, Filter, FilterOperator) {
    "use strict";
    var controller;
    var fragmentControls = {};
    var oDataModel;
    return Controller.extend("project1.controller.View1", {
      onInit: async function (oEvent) {
        var that = this, quizData;
        await $.get({
          // url: "https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz?$expand=questions",
          url: that.getOwnerComponent().getModel().getServiceUrl() + "/Quiz",
          success: function (data) {
            // your success logic
            var newModel = new sap.ui.model.json.JSONModel({});
            newModel.setProperty('/Exam', data.value);
            newModel.setProperty('/Quiz', data.value);
            that.getOwnerComponent().setModel(newModel, "localModel");
            //self.getView().getModel("quizDetail").setProperty("/fragmentData", fragmentData);
          },
          error: function (error) {
            // your error logic
            console.log(error);
          }
        });
      },
      onQuizTableSelectionChange: function (oEvent) {
        var oItem, oCtx;
        oItem = oEvent.getParameter("listItem");
        console.log(oItem);
        oCtx = oItem.getBindingContext('localModel');
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteMainView", {
          // quizID: oCtx.getProperty("ID"),
          // quizPath: oCtx.getPath()
          index: oCtx.getPath().split('/')[2]
        });
        if(oCtx.getPath()){
          var quizData = this.getOwnerComponent().getModel('localModel').getProperty(oCtx.getPath());
          var newModel = new sap.ui.model.json.JSONModel(quizData);
          this.getOwnerComponent().setModel(newModel, "quizDetail");
        }
        else{
          var newModel = new sap.ui.model.json.JSONModel({});
          this.getOwnerComponent().setModel(newModel, "quizDetail");
        }
        this.byId('idQuizTable').removeSelections();
      },
      onPressAddExam: function () {
        var newModel = new sap.ui.model.json.JSONModel({});
        this.getOwnerComponent().setModel(newModel, "quizDetail");
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteMainView", {
        });
      },
      // onPressDeleteItem: function (oEvent) {
      //   var sPath = oEvent.getSource().getBindingContext('localModel').getPath();
      //   var id = this.getView().getModel('localModel').getProperty(sPath).ID;
      //   var url = this.getView().getModel().getServiceUrl();
      //   $.ajax({
      //     url: url + 'Quiz' + `(ID=${id})`,
      //     method: "DELETE",
      //     contentType: "application/json",
      //     success: function () {
      //       alert("success");
      //     },
      //     error: function (err) {
      //       console.log(err);
      //     }
      //   })
      // },

      onPressDeleteItem: function(oEvent) {
        var sPath = oEvent.getSource().getBindingContext('localModel').getPath();
        var id = this.getView().getModel('localModel').getProperty(sPath).ID;
        var url = this.getView().getModel().getServiceUrl();
        var that = this;
        MessageBox.show("Do you want to delete this Exam", {
          icon: MessageBox.Icon.action,
          title: "title",
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          emphasizedAction: MessageBox.Action.YES,
          onClose: function (oAction) {
            if (oAction === "YES") {
              $.ajax({
                  url: url + 'Quiz' + `(ID=${id})`,
                  method: "DELETE",
                  contentType: "application/json",
                  success: function () {
                    alert("success");
                    var data = that.getView().getModel('localModel').getProperty('/Exam');
                    data = data.filter((item) => {
                      return item.ID != id;
                    })
                    that.getView().getModel('localModel').setProperty('/Exam', data);
                    that.getView().getModel('localModel').setProperty('/Quiz', data);
                  },
                  error: function (err) {
                    console.log(err);
                  }
                })
            }
          }
        });
  
      },

      onMultiComboBoxSelectionChange: function (oEvent) {

      },

      onSearch: function (oEvent) {
        var title = this.byId('idSerachExamItem').getControl().getValue();
        var oControl = this.byId('idPrepStatusComboBox').getControl();
        var aSelectedKeys = oControl.getSelectedKeys();
        var data = this.getOwnerComponent().getModel('localModel').getProperty('/Exam');
        data = data.filter((item) => {
          return aSelectedKeys.includes(item.draft.toString(), 0) && item.title.includes(title);
        })

        this.getOwnerComponent().getModel('localModel').setProperty('/Quiz', data);
        this.byId('idQuizTable').setShowOverlay(false);
      },

      onFilterChange: function (oEvent) {

      },
    });
  }
);