var FTBController = {};
FTBController.initTemplate = function (pluginInstance) {
  FTBController.pluginInstance = pluginInstance;
};
FTBController.constant = {
  qsFtbElement: "#ftb-template",
  qsFtbContainer: ".qs-ftb-container",
  qsFtbQuestion: "#qs-ftb-question",
  keyboardPlugin: 'org.ekstep.keyboard'
};
FTBController.textboxtarget = {};
FTBController.question = undefined;

FTBController.getQuestionTemplate = function(){
  return '<div id="ftb-template">\
    <div class="qs-ftb-container">\
      <div class="qs-ftb-content">\
          <div class="qs-ftb-question" id="qs-ftb-question">\
          <% if ( question.data.question.image.length > 0 ){ %> \
            <div class="ftb-question-image">\
              <img onclick="FTBController.showImageModel(event)" src=<%=FTBController.pluginInstance.getAssetUrl( question.data.question.image) %>> \
            </div>\
            <% } %> \
            <% if ( question.data.question.audio.length > 0 ){ %> \
              <div class="ftb-question-audio">\
              <img src=<%=FTBController.pluginInstance.getAudioIcon("renderer/assets/audio.png") %> onclick=FTBController.pluginInstance.playAudio({src:"<%= question.data.question.audio %>"}) > \
                </div>\
              <% } %> \
            <%= question.data.question.text %>\
          </div>\
      </div>\
    </div>\
  </div>';
} 

FTBController.answerTemplate = function(){
  return '<% if(ansFieldConfig.keyboardType != "undefined" && (ansFieldConfig.keyboardType == "English" || ansFieldConfig.keyboardType == "Custom")) %> \
  <input type="text" class="ans-field" id="ans-field<%= ansFieldConfig.index %>" readonly style="cursor: pointer;" onclick="FTBController.logTelemetryInteract(event);">\
  <% else %> \
  <input type="text" class="ans-field" id="ans-field<%= ansFieldConfig.index %>" onclick="FTBController.logTelemetryInteract(event);">';
}


/**
 * renderer:questionunit.ftb:set state in the text box.
 * @event renderer:questionunit.ftb:show
 * @memberof org.ekstep.questionunit.ftb
 */
FTBController.setStateInput = function() {
  var textBoxCollection = $(FTBController.constant.qsFtbQuestion).find("input[type=text]");
  _.each(textBoxCollection, function(element, index) {
    $("#" + element.id).val(FTBController.question.state.val[index]);
  });
};

/**
 * renderer:questionunit.ftb:set target and value.
 * @event renderer:questionunit.ftb:click
 * @param {Object} event from question set plugin
 * @memberof org.ekstep.questionunit.ftb
 */
FTBController.invokeKeyboard = function(event) { // eslint-disable-line no-unused-vars
  var keyboardConfig = {
    type: FTBController.question.data.question.keyboardConfig.keyboardType,
    keys: FTBController.question.data.question.keyboardConfig.customKeys,
    targetInput: event.target
  };
  /*istanbul ignore else*/
  if (!(isbrowserpreview && (_.isUndefined(FTBController.question.data.question.keyboardConfig) || FTBController.question.data.question.keyboardConfig.keyboardType == "Device"))) { // eslint-disable-line no-undef
    $(FTBController.constant.qsFtbContainer).addClass("align-question");
  }
  var target = $('#' + event.target.id);
  target.addClass("highlightInput");
  target.siblings().removeClass("highlightInput");

  EkstepRendererAPI.dispatchEvent(FTBController.constant.keyboardPlugin + ":invoke", keyboardConfig, FTBController.keyboardCallback);
};

/**
 * renderer:questionunit.ftb:callback from the keyboard with answer.
 * @event renderer:questionunit.ftb:doTextBoxHandle
 * @param {Object} ans object
 * @memberof org.ekstep.questionunit.ftb
 */
FTBController.keyboardCallback = function(ans) { // eslint-disable-line no-unused-vars
  //TODO: check
  // $("#" + FTBController.textboxtarget.id).val(ans);
  $(FTBController.constant.qsFtbContainer).removeClass("align-question");
};

  /**
   * image will be shown in popup
   * @memberof org.ekstep.questionunit.ftb.ftbcontroller
   */
  FTBController.showImageModel = function () {
    var eventData = event.target.src;
    var modelTemplate = "<div class='popup' id='image-model-popup' onclick='FTBController.hideImageModel()'><div class='popup-overlay' onclick='FTBController.hideImageModel()'></div> \
    <div class='popup-full-body'> \
    <div class='font-lato assess-popup assess-goodjob-popup'> \
     <img class='qc-question-fullimage' src=<%= src %> /> \
      <div onclick='FTBController.hideImageModel()' class='qc-popup-close-button'>X</div> \
      <div  class='qc-popup-close-button'>X</div> \
    </div></div>";
    var template = _.template(modelTemplate);
    var templateData = template({
      src: eventData
    })
    $(FTBController.constant.qsFtbElement).append(templateData);
  },

/**
 * renderer:questionunit.ftb:get currentQuesData.
 * @event renderer:questionunit.ftb:doTextBoxHandle
 * @param {Object} quesData object without HTML
 * @returns {Object} quesData
 * @memberof org.ekstep.questionunit.ftb
 */
FTBController.generateHTML = function(quesData) {
  var index = 0,
    template, ansTemplate;
  // Add parsedQuestion to the currentQuesData
  quesData.question.text = quesData.question.text.replace(/\[\[.*?\]\]/g, function(a, b) { // eslint-disable-line no-unused-vars
    index = index + 1;
    template = _.template(FTBController.answerTemplate()); // eslint-disable-line no-undef
    var ansFieldConfig = {
      "index": index,
      "keyboardType": quesData.question.keyboardConfig.keyboardType
    };
    ansTemplate = template({ ansFieldConfig: ansFieldConfig });
    return ansTemplate;
  });
  return quesData;
};

/**
 * renderer:questionunit.ftb:show keyboard in device.
 * @event renderer:questionunit.ftb:click
 * @memberof org.ekstep.questionunit.ftb
 */
window.addEventListener('native.keyboardshow', function() { // eslint-disable-line no-unused-vars
  $(FTBController.constant.qsFtbContainer).addClass("align-question");
});

/**
 * renderer:questionunit.ftb:hide keyboard in device.
 * @event renderer:questionunit.ftb:click
 * @memberof org.ekstep.questionunit.ftb
 */
window.addEventListener('native.keyboardhide', function() {
  $(FTBController.constant.qsFtbContainer).removeClass("align-question");
});

/**
   * logs telemetry 
   * @memberof org.ekstep.questionunit.ftb.ftbcontroller
   * @param {Object} event js event object
   */
FTBController.logTelemetryInteract = function(event) {
  QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.TOUCH, { type: QSTelemetryLogger.EVENT_TYPES.TOUCH, id: event.target.id }); // eslint-disable-line no-undef
};

/**
   * pop up of image will be closed
   * @memberof org.ekstep.questionunit.ftb.ftbcontroller
   */
FTBController.hideImageModel = function () {
  $("#image-model-popup").remove();
};

//# sourceURL=FTBController.js