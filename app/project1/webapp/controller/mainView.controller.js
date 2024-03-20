sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/date/UI5Date",
    "sap/ui/layout/ResponsiveFlowLayoutData", // Add this dependency
    "sap/m/Input",  // Make sure this path is correct
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, MessageBox, UI5Date, ResponsiveFlowLayoutData, Input, History, Filter, FilterOperator, DateFormat) {
    "use strict";
    var controller;
    var fragmentControls = {};
    var oDataModel;
    let index;
    return Controller.extend("project1.controller.mainView", {
      

      onInit: function () {
        oDataModel = this.getOwnerComponent().getModel();
        controller = this;
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("RouteMainView").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function (oEvent) {
        var self = this;
        var oArgs = oEvent.getParameter("arguments");
        index = oArgs.index;
        //var oView = this.getView();
        // var aFilter = [];
        // if (oArgs.quizID) {
        //   var oFilter = new Filter("ID", FilterOperator.EQ, oArgs.quizID);
        //   aFilter.push(oFilter);
        //   var oModel = this.getOwnerComponent().getModel();
        //   $.get({
        //     url: oModel.getServiceUrl() + "/Quiz/" + oArgs.quizID + "?$expand=questions",
        //     success: function (data) {
        //       // your success logic
        //       var newModel = new sap.ui.model.json.JSONModel(data);
        //       self.getView().setModel(newModel, "quizDetail");

        //       //self.getView().getModel("quizDetail").setProperty("/fragmentData", fragmentData);
        //     },
        //     error: function (error) {
        //       // your error logic
        //       console.log(error);
        //     }
        //   });
        // }
        // else{
        //   var newModel = new sap.ui.model.json.JSONModel({});
        //   this.getView().setModel(newModel, 'quizDetail');
        // }
      },


      setProductType: function (evt) {
        var productType = evt.getSource().getTitle();
        this.model.setProperty("/productType", productType);
        this.byId("ProductStepChosenType").setText(
          "Chosen product type: " + productType
        );
        this._wizard.validateStep(this.byId("ProductTypeStep"));
      },

      setProductTypeFromSegmented: function (evt) {
        var productType = evt.getParameters().item.getText();
        this.model.setProperty("/productType", productType);
        this._wizard.validateStep(this.byId("ProductTypeStep"));
      },

      additionalInfoValidation: function () {
        var name = this.byId("ProductName").getValue();
        var weight = parseInt(this.byId("ProductWeight").getValue());

        if (isNaN(weight)) {
          this._wizard.setCurrentStep(this.byId("ProductInfoStep"));
          this.model.setProperty("/productWeightState", "Error");
        } else {
          this.model.setProperty("/productWeightState", "None");
        }

        if (name.length < 6) {
          this._wizard.setCurrentStep(this.byId("ProductInfoStep"));
          this.model.setProperty("/productNameState", "Error");
        } else {
          this.model.setProperty("/productNameState", "None");
        }

        if (name.length < 6 || isNaN(weight)) {
          this._wizard.invalidateStep(this.byId("ProductInfoStep"));
        } else {
          this._wizard.validateStep(this.byId("ProductInfoStep"));
        }
      },

      optionalStepActivation: function () {
        MessageToast.show("This event is fired on activate of Step3.");
      },

      optionalStepCompletion: function () {
        MessageToast.show(
          "This event is fired on complete of Step3. You can use it to gather the information, and lock the input data."
        );
      },

      pricingActivate: function () {
        this.model.setProperty("/navApiEnabled", true);
      },

      pricingComplete: function () {
        this.model.setProperty("/navApiEnabled", false);
      },

      scrollFrom4to2: function () {
        this._wizard.goToStep(this.byId("ProductInfoStep"));
      },

      goFrom4to3: function () {
        if (this._wizard.getProgressStep() === this.byId("PricingStep")) {
          this._wizard.previousStep();
        }
      },

      goFrom4to5: function () {
        if (this._wizard.getProgressStep() === this.byId("PricingStep")) {
          this._wizard.nextStep();
        }
      },

      wizardCompletedHandler: function () {
        this._oNavContainer.to(this.byId("wizardReviewPage"));
      },

      backToWizardContent: function () {
        this._oNavContainer.backToPage(this._oWizardContentPage.getId());
      },

      editStepOne: function () {
        this._handleNavigationToStep(0);
      },

      editStepTwo: function () {
        this._handleNavigationToStep(1);
      },

      editStepThree: function () {
        this._handleNavigationToStep(2);
      },

      editStepFour: function () {
        this._handleNavigationToStep(3);
      },

      _handleNavigationToStep: function (iStepNumber) {
        var fnAfterNavigate = function () {
          this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
          this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
        }.bind(this);

        this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
        this.backToWizardContent();
      },

      _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
        MessageBox[sMessageBoxType](sMessage, {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.YES) {
              this._handleNavigationToStep(0);
              this._wizard.discardProgress(this._wizard.getSteps()[0]);
            }
          }.bind(this),
        });
      },

      _setEmptyValue: function (sPath) {
        this.model.setProperty(sPath, "n/a");
      },


      productWeighStateFormatter: function (val) {
        return isNaN(val) ? "Error" : "None";
      },

      discardProgress: function () {
        this._wizard.discardProgress(this.byId("ProductTypeStep"));

        var clearContent = function (content) {
          for (var i = 0; i < content.length; i++) {
            if (content[i].setValue) {
              content[i].setValue("");
            }

            if (content[i].getContent) {
              clearContent(content[i].getContent());
            }
          }
        };

        this.model.setProperty("/productWeightState", "Error");
        this.model.setProperty("/productNameState", "Error");
        clearContent(this._wizard.getSteps());
      },


      onFragmentInputChange: function (oEvent) {
        if (oEvent === undefined) return;

        var name = oEvent.getSource().getName();
        var value = oEvent.getSource().getValue();

        if (name !== undefined) {
          if (name === 'content') {
            this.getView().getModel('quizDetail').setProperty("/fragmentData/" + name, value);
          } else if (name === 'noOfOptions') {
            var options = this.getView().getModel('quizDetail').getProperty("/fragmentData/options");
            var prevValue = options.length;
            if (value > prevValue) {
              for (let len = prevValue; len < value; len++) {
                options.push({
                  option: '',
                  correctOption: false
                })
              }
            }
            else {
              options = options.slice(0, value);
            }
            this.getView().getModel('quizDetail').getProperty("/fragmentData/options", options);
            this.getView().getModel('quizDetail').setProperty("/fragmentData/" + name, value);
          } else {
            this.getView().getModel('quizDetail').setProperty("/fragmentData/options/" + name + "/option", value);
          }
        }

      },

      getDialog: function () {
        var oView = controller.getView();
        // create a fragment with dialog, and pass the selected data
        if (!this.dialog) {
          // This fragment can be instantiated from a controller as follows:
          this.dialog = sap.ui.xmlfragment("idFragment", "project1.fragments.AddQuestion", this);
          //debugger;
          oView.addDependent(controller.dialog);
        }
        //debugger;
        return this.dialog;
      },

      onPressAddQuestion: function () {
        //Open the dialog
        var fragmentData = {
          noOfOptions: 2,
          content: '',
          options: [
            {
              option: '',
              correctOption: false
            },
            {
              option: '',
              correctOption: false
            }
          ]
        }
        this.getView().getModel('quizDetail').setProperty('/fragmentData', fragmentData);
        var ques = this.getView().getModel('quizDetail').getData().questions;
        var len = ques? ques.length : 0;
        this.getView().getModel('quizDetail').setProperty('/editQuestionIndex', `/questions/${len}`);
        this.getDialog().open();
      },

      onPressEditQuestion: function (oEvent) {
        var oPath = oEvent.getSource().getBindingContext('quizDetail').getPath();
        var oData = this.getView().getModel('quizDetail').getProperty(oPath);
        this.getView().getModel('quizDetail').setProperty('/editQuestionIndex', oPath);

        if (oData !== undefined) {
          // Copy the question data to fragmentData
          // var oFragmentData = {
          //   slNo: oData.slNo,
          //   content: oData.content,
          //   noOfOptions: oData.noOfOptions,
          //   // Copy other properties as needed
          // };

          // // Set options in fragmentData
          // var fragmentOptions = []
          // for (var i = 1; i <= parseInt(oData.noOfOptions); i++) {
          //   oFragmentData["option" + i] = oData.Options[i - 1].option;
          //   oFragmentData["option" + i + "Selected"] = oData.Options[i - 1].correctOption;
          //   fragmentOptions.push({option: oData.Options[i - 1].option, correctOption: oData.Options[i - 1].correctOption})
          // }

          // oFragmentData["options"] = fragmentOptions;
          // var dataModel = new sap.ui.model.json.JSONModel(oData);
          // controller.getView().setModel('fragmentModel', dataModel);

          this.getView().getModel('quizDetail').setProperty('/fragmentData', JSON.parse(JSON.stringify(oData)));
        }

        // Open the dialog
        this.getDialog().open();
      },

      onSave: function (oEvent) {
        var quePath = this.getView().getModel('quizDetail').getProperty('/editQuestionIndex');
        var data = this.getView().getModel('quizDetail').getProperty('/fragmentData');
        if(!this.getView().getModel('quizDetail').getProperty('/questions'))
        this.getView().getModel('quizDetail').setProperty('/questions', []);
        this.getView().getModel('quizDetail').setProperty(quePath, data);

        this.closeDialog();
      },

      closeDialog: function () {
        // Close the dialog
        // this.getView().getModel('quizDetail').setProperty("/fragmentData", {
        //   noOfOptions: 2
        // });
        this.getView().getModel('quizDetail').setProperty("/fragmentData", null);
        this.getDialog().close();
      },
      onSelectionChange: function (oEvent) {
        // console.log(oEvent);
        this.selectedPaths = oEvent.getSource().getSelectedContextPaths();
        console.log(this.selectedPaths);
      },

      onDeleteQuestion: function (oEvent) {
        this.selectedPaths = this.selectedPaths.map((path) => {
          var index = parseInt(path.split("/")[2]);
          return index;
        });
        var ques = this.getView().getModel('quizDetail').getProperty('/questions');
        var filteredQues = [];
        for( let i=0; i<ques.length; i++){
          if(!this.selectedPaths.includes(i)){
            filteredQues.push(ques[i]);
          }
        }
        this.getView().getModel('quizDetail').setProperty('/questions', filteredQues);
        this.byId('idQuestionsTable').removeSelections();
      },

      onDraftButtonPress: function(oEvent){
        this.getView().getModel('quizDetail').setProperty('/draft', true);
        this.handleWizardSave();
      },

      onCancelButtonPress: function () {
        this._handleMessageBoxOpen(
          "Are you sure you want to cancel your report?",
          "warning"
        );
      },

      onSaveButtonPress: function(oEvent){
        this.getView().getModel('quizDetail').setProperty('/draft', false);
        this.handleWizardSave();
      },

      handleWizardSave: async function () {
        var that = this;
        var data = this.getView().getModel('quizDetail').getData();
        delete data.fragmentData;
        delete data.editQuestionIndex;
        data.noOfQues = parseInt(data.noOfQues);
        data.fullMarks = parseInt(data.fullMarks);
        data.passMarks = parseInt(data.passMarks);
        data.learningSP = data.learningSP.substring(0, 10);
        data.learningEP = data.learningEP.substring(0, 10);
        
        if(data.ID){
          // do patch call
          await $.ajax({
            // url: "https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz/" + data.ID,
            url: oDataModel.getServiceUrl() + "Quiz/" + data.ID,
            method: "PATCH",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data) {
              //that.getView().getModel('localModel').setProperty('/Quiz/'+index, data);
              that.setMainModel();
              alert("success");
            },
            error: function(err) {
              console.log(err);
            }
          })
        }
        else{
          // do post call
          data.date =  new Date().toJSON().slice(0, 10);
          await $.ajax({
            // url: "https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz",
            url: oDataModel.getServiceUrl() + "Quiz",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data) {
              // var exams = that.getView().getModel('localModel').getProperty('/Quiz');
              // exams.push(data);
              // that.getView().getModel('localModel').setProperty('/Quiz', exams);
              that.setMainModel();
              alert("success");
            },
            error: function(err) {
              console.log(err);
            }
          })
        }
      },

      setMainModel: async function(){
        var that = this;
        await $.ajax({
          // url: "https://mindset-consulting--llc-mindsetbtpdev-btp-dev-quizapp-srv.cfapps.us10.hana.ondemand.com/odata/v4/quiz/Quiz",
          url: oDataModel.getServiceUrl() + "Quiz",
          method: "GET",
          contentType: "application/json",
          success: function (data) {
            that.getView().getModel("localModel").setProperty("/Exam", data.value);
            that.getView().getModel("localModel").setProperty("/Quiz", data.value);
          },
          error: function(err) {
            console.log(err);
          }
        })
      }
    });
  }
);