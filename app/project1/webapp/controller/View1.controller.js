sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      "sap/m/MessageBox",
      "sap/ui/core/date/UI5Date",
      "sap/ui/layout/ResponsiveFlowLayoutData", // Add this dependency
      "sap/m/Input"  // Make sure this path is correct
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, UI5Date, MessageToast, MessageBox, ResponsiveFlowLayoutData, Input) {
      "use strict";
      var controller;
      var fragmentControls = {};
      var oDataModel;
      return Controller.extend("project1.controller.View1", {
        onInit: function () {
          oDataModel = this.getOwnerComponent().getModel();
          this.selectedPaths = [];
          controller = this;
  
          // Load data from data.json using a JSONModel
          var dataModel = new JSONModel();
          dataModel.loadData("model/data.json"); // Adjust the path based on your project structure
  
          // Set the model to the view
          this.getView().setModel(dataModel);
  
          // Your existing logic
          this._wizard = this.byId("CreateProductWizard");
          this._oNavContainer = this.byId("wizardNavContainer");
          this._oWizardContentPage = this.byId("wizardContentPage");
  
          this.model = this.getView().getModel();
          this.model.setData({
            productNameState: "Error",
            productWeightState: "Error",
            productType: "Mobile",
            availabilityType: "In Store",
            navApiEnabled: true,
            productVAT: false,
            measurement: "",
            fragmentData: { NumberOfOptions: 2 } // Fragment Data
          });
  
          this.getView().setModel(this.model);
          this._setEmptyValue("/productManufacturer");
          this._setEmptyValue("/productDescription");
          this._setEmptyValue("/size");
          this._setEmptyValue("/productPrice");
          this._setEmptyValue("/manufacturingDate");
          this._setEmptyValue("/discountGroup");
  
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
  
        handleWizardCancel: function () {
          this._handleMessageBoxOpen(
            "Are you sure you want to cancel your report?",
            "warning"
          );
        },
  
        handleWizardSubmit: function () {
          this._handleMessageBoxOpen(
            "Are you sure you want to submit your report?",
            "confirm"
          );
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
            this.model.setProperty("/fragmentData", {
              ...this.model.getProperty("/fragmentData"),
              [name]: value
            });
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
          // Open the dialog
          this.getDialog().open();
        },
  
        onPressEditQuestion: function (oEvent) {
          var oPath = oEvent.getSource().getBindingContext().getPath();
          var oDeepPath = parseInt(oPath.charAt(oPath.length - 1));
          var oData = oEvent.getSource().getModel().getData().Quiz[0].Questions[oDeepPath];
  
          if (oData !== undefined) {
            // Copy the question data to fragmentData
            var oFragmentData = {
              SlNo: oData.SlNo,
              Question: oData.Question,
              NumberOfOptions: oData.NumberOfOptions,
              // Copy other properties as needed
            };
  
            // Set options in fragmentData
            var fragmentOptions = []
            for (var i = 1; i <= parseInt(oData.NumberOfOptions); i++) {
              oFragmentData["option" + i] = oData.Options[i - 1].option;
              oFragmentData["option" + i + "Selected"] = oData.Options[i - 1].correctOption;
              fragmentOptions.push({option: oData.Options[i - 1].option, correctOption: oData.Options[i - 1].correctOption})
            }

            oFragmentData["Options"] = fragmentOptions;
  
            this.model.setProperty("/fragmentData", oFragmentData);
          }
  
          // Open the dialog
          this.getDialog().open();
        },
  
        onSave: function (oEvent) {
          var oModel = this.getView().getModel();
          var aQuestions = oModel.getProperty("/Quiz/0/Questions");
  
          // Check if we are in edit mode
          var bEditMode = this.model.getProperty("/fragmentData/SlNo") !== undefined;
  
          if (bEditMode) {
            // Editing existing question
            var iEditIndex = aQuestions.findIndex(function (oQuestion) {
              return oQuestion.SlNo === this.model.getProperty("/fragmentData/SlNo");
            }.bind(this));
  
            if (iEditIndex !== -1) {
              // Update existing question
              aQuestions[iEditIndex].Question = this.model.getProperty("/fragmentData/Question");
              aQuestions[iEditIndex].NumberOfOptions = this.model.getProperty("/fragmentData/NumberOfOptions");
              aQuestions[iEditIndex].Options = [];
  
              // Add options based on the number specified
              for (var i = 1; i <= parseInt(aQuestions[iEditIndex].NumberOfOptions); i++) {
                var oOption = {
                  option: this.model.getProperty("/fragmentData/option" + i),
                  correctOption: this.model.getProperty("/fragmentData/option" + i + "Selected")
                };
  
                if (oOption.option.length === 0) {
                  console.log("data not saved !!!");
                  return;
                }
  
                aQuestions[iEditIndex].Options.push(oOption);
              }

              //PUT request to service
              var updatedData = {
                content: oEvent.getSource().getModel().oData.fragmentData.Question,
                answers: [{
                  options: oEvent.getSource().getModel().oData.fragmentData.Options
                }] 
              }

              $.ajax({
                url: oDataModel.getServiceUrl() + "Questions(ID='cf4450cf-3c56-4a81-b819-02bd7916f790')",
                method: "PUT",
                data:JSON.stringify(updatedData),
                contentType: "application/json",
                success: function () {
                  alert("Successfully Edited");
                },
              })
  
              MessageToast.show("Question Updated Successfully.", { duration: 1000 });
            } else {
              console.log("Error: Question not found for editing.");
            }
          } else {
            // Adding new question
            var oNewQuestion = {
              SlNo: aQuestions.length + 1,
              Question: this.model.getProperty("/fragmentData/Question"),
              NumberOfOptions: this.model.getProperty("/fragmentData/NumberOfOptions") || 2,
              Options: []
            };
  
            if (oNewQuestion.Question.length === 0 || oNewQuestion.NumberOfOptions == 0) {
              console.log("data not saved !!!");
              return;
            }
  
            // Add options based on the number specified
            for (var i = 1; i <= parseInt(oNewQuestion.NumberOfOptions); i++) {
              var oOption = {
                option: this.model.getProperty("/fragmentData/option" + i),
                correctOption: this.model.getProperty("/fragmentData/option" + i + "Selected")
              };
  
              if (oOption.option.length === 0) {
                console.log("data not saved !!!");
                return;
              }
  
              oNewQuestion.Options.push(oOption);
            }
  
            aQuestions.push(oNewQuestion);

            var QAData = {
              ID: "cf4450cf-3c56-4a81-b819-02bd7916f790",
              quizID: "cf4450cf-3c56-4a81-b819-02bd7916f790",
              content: oNewQuestion.Question,
              score: 10,
              answers:[{
                  ID: "cf4450cf-3c56-4a81-b819-02bd7916f790",
                  options: oNewQuestion.Options
                }]
            }

            $.ajax({
              url: oDataModel.getServiceUrl() + "Questions",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify(QAData),
              success: function () {
                alert("success");
              },
            });
            
            MessageToast.show("Question Saved Successfully.", { duration: 1000 });
          }  
          oModel.setProperty("/Quiz/0/Questions", aQuestions);
          this.closeDialog();
        },
  
        closeDialog: function () {
          // Close the dialog
          this.model.setProperty("/fragmentData", {
            NumberOfOptions: 2
          });
          this.getDialog().close();
        },
        onSelectionChange: function(oEvent){
          // console.log(oEvent);
          this.selectedPaths = oEvent.getSource().getSelectedContextPaths();
          console.log(this.selectedPaths);
        },
  
        onDeleteQuestion: function (oEvent) {
          var oTable = this.byId("idProductsTable");
          var oModel = this.getView().getModel();
          var aQuestions = oModel.getProperty("/Quiz/0/Questions");
      
          // Get the selected paths
          var aSelectedPaths = this.selectedPaths;
      
          // Remove selected questions from the model based on paths
          aSelectedPaths.forEach(function (sPath) {
              var iIndex = parseInt(sPath.split('/').pop()); // Extract index from the path
              if (!isNaN(iIndex)) {
                  aQuestions.splice(iIndex, 1);
              }
          });

          //Perform delete request in backend
          $.ajax({
            url: oDataModel.getServiceUrl() + "Questions(ID='cf4450cf-3c56-4a81-b819-02bd7916f790')",
            method: "DELETE",
            contentType: "application/json",
            success: function () {
              alert("Successfully Deleted");
            },
          })
      
          // Update the SlNo property based on the updated array
          aQuestions.forEach(function (oQuestion, index) {
              oQuestion.SlNo = index + 1;
          });
      
          // Update the model
          oModel.setProperty("/Quiz/0/Questions", aQuestions);
      
          // Clear selections in the table
          oTable.clearSelection();
      
          // Optionally, you can clear the selected paths array
          this.selectedPaths = [];
      },

      handleWizardSave: function(){
        var quizDetails = {
          ID: "cf4450cf-3c56-4a81-b819-02bd7916f790",
          title: this.getView().byId("QuizTopic").getValue(),
          conditionsID:{
              ID: "cf4450cf-3c56-4a81-b819-02bd7916f760",
              quizEndTime: this.getView().byId("timePicker").getValue(),
              quizDate: "2023-12-11",
              quizNoQues: parseInt(this.getView().byId("fullMarks").getValue()),
              quizFullMarks: parseInt(this.getView().byId("fullMarks").getValue()),
              quizPassMarks: parseInt(this.getView().byId("passMarks").getValue()),
              LearningSP: this.getView().byId("learningSP").getValue(),
              LearningEP: this.getView().byId("learningEP").getValue()
            },
        }
        $.ajax({
          url: oDataModel.getServiceUrl() + "Quiz",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(quizDetails),
          success: function () {
            alert("success");
          },
        })  
      }
      });
    }
  );