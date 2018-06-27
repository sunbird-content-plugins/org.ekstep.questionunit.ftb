/*
 * Plugin to create MCQ question
 * @class org.ekstep.questionunitmcq:mcqQuestionFormController
 * Jagadish P<jagadish.pujari@tarento.com>
 */
angular.module('ftbApp', []).controller('ftbQuestionFormController', ['$scope', '$rootScope', function($scope, $rootScope) { // eslint-disable-line no-unused-vars
  var questionInput;
  $scope.keyboardConfig = {
    keyboardType: 'Device',
    customKeys: []
  };
  $scope.formVaild = false;
  $scope.ftbConfiguartion = {
    'questionConfig': {
      'isText': true,
      'isImage': false,
      'isAudio': false,
      'isHint': false
    }
  };
  $scope.keyboardTypes = ['Device', 'English', 'Custom'];
  $scope.ftbFormData = {
    question: {
      text: '',
      image: '',
      audio: '',
      keyboardConfig: $scope.keyboardConfig
    },
    answer: [],
    media: []
  };
  questionInput = CKEDITOR.replace('ftbQuestion', { // eslint-disable-line no-undef
    customConfig: CKEDITOR.basePath + "config.js", // eslint-disable-line no-undef
    skin: 'moono-lisa,' + CKEDITOR.basePath + "skins/moono-lisa/", // eslint-disable-line no-undef
    contentsCss: CKEDITOR.basePath + "contents.css" // eslint-disable-line no-undef
  });
  questionInput.on('change', function() {
    $scope.ftbFormData.question.text = this.getData();
  });
  questionInput.on('focus', function() {
    $scope.generateTelemetry({
      type: 'TOUCH',
      id: 'input',
      target: {
        id: 'questionunit-ftb-question',
        ver: '',
        type: 'input'
      }
    })
  });
  $scope.init = function() {
    /**
     * editor:questionunit.ftb:call form validation.
     * @event org.ekstep.questionunit.ftb:validateform
     * @memberof org.ekstep.questionunit.ftb.horizontal_controller
     */
    $scope.ftbPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.questionunit.ftb");
    ecEditor.addEventListener('org.ekstep.questionunit.ftb:validateform', function(event, callback) {
      var validationRes = $scope.formValidation();
      callback(validationRes.isValid, validationRes.formData);
    }, $scope);
    /**
     * editor:questionunit.ftb:call form edit the question.
     * @event org.ekstep.questionunit.ftb:editquestion
     * @memberof org.ekstep.questionunit.ftb.horizontal_controller
     */
    ecEditor.addEventListener('org.ekstep.questionunit.ftb:editquestion', $scope.editFtbQuestion, $scope);
    ecEditor.dispatchEvent("org.ekstep.questionunit:compiled");
    $scope.addAllMedia();
  }
  /**
   * add media to stage
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   */
  $scope.addAllMedia = function() {
    var addAllMedia;
    $scope.keyboardPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.keyboard");
    addAllMedia = [{
      id: "org.ekstep.keyboard.eras_icon",
      src: ecEditor.resolvePluginResource($scope.keyboardPluginInstance.id, $scope.keyboardPluginInstance.ver, 'renderer/assets/eras_icon.png'),
      assetId: "org.ekstep.keyboard.eras_icon",
      type: "image",
      preload: true
    }, {
      id: "org.ekstep.keyboard.language_icon",
      src: ecEditor.resolvePluginResource($scope.keyboardPluginInstance.id, $scope.keyboardPluginInstance.ver, 'renderer/assets/language_icon.png'),
      assetId: "org.ekstep.keyboard.language_icon",
      type: "image",
      preload: true
    }, {
      id: "org.ekstep.keyboard.hide_keyboard",
      src: ecEditor.resolvePluginResource($scope.keyboardPluginInstance.id, $scope.keyboardPluginInstance.ver, 'renderer/assets/keyboard.svg'),
      assetId: "org.ekstep.keyboard.hide_keyboard",
      type: "image",
      preload: true
    }];
    //push media into ftbform media
    addAllMedia.forEach(function(obj) {
      $scope.ftbFormData.media.push(obj);
    })
  }
  /**
   * for edit flow
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   * @param {event} event data.
   * @param {question} data data.
   */
  $scope.editFtbQuestion = function(event, data) {
    var qdata = data.data;
    $scope.ftbFormData.question = qdata.question;
    $scope.keyboardConfig = qdata.question.keyboardConfig;
    $scope.$safeApply();
  }
  /**
   * create answer array for ftb blank
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   */
  $scope.createAnswerArray = function() {
    var regexForAns = /(?:^|)\[\[(.*?)(?:\]\]|$)/g;
    $scope.ftbFormData.answer = $scope.splitAnswer($scope.ftbFormData.question.text, regexForAns, 1).map(function(a) {
      return a.toLowerCase().trim();
    });
  }
  /**
   * split answer into question text
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   * @returns {String} question data.
   * @param {string} string data.
   * @param {regex} regex expression.
   * @param {index} index value.
   */
  $scope.splitAnswer = function(string, regex, index) {
    var matches = [],
      match;
    while (match = regex.exec(string)) { // eslint-disable-line no-cond-assign
      matches.push(match[index]);
    }
    return matches;
  }
  /**
   * check form validation
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   * @returns {Object} question data.
   */
  $scope.formValidation = function() {
    var ftbFormQuestionText, formValid, formConfig = {};
    $scope.submitted = true;
    ftbFormQuestionText = $scope.ftbFormData.question.text;
    formValid = (ftbFormQuestionText.length > 0) && /\[\[.*?\]\]/g.test(ftbFormQuestionText);
    if (formValid) {
      $scope.createAnswerArray();
      formConfig.isValid = true;
      formConfig.formData = $scope.ftbFormData;
    } else {
      formConfig.isValid = false;
      formConfig.formData = $scope.ftbFormData;
    }
    return formConfig;
  }
  $scope.generateTelemetry = function(data, event) { // eslint-disable-line no-unused-vars
    if (data) {
      ecEditor.getService('telemetry').interact({
        "type": data.type,
        "id": data.id,
        "pageid": 'question-creation-ftb-form',
        "target": {
          "id": data.target.id,
          "ver": data.target.ver,
          "type": data.target.type
        },
        "plugin": {
          "id": $scope.ftbPluginInstance.id,
          "ver": $scope.ftbPluginInstance.ver
        }
      })
    }
  }
}]);
//# sourceURL=horizontalFTB.js