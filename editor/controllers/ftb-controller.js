/*
 * Plugin to create MCQ question
 * @class org.ekstep.questionunitmcq:mcqQuestionFormController
 * Jagadish P<jagadish.pujari@tarento.com>
 */
angular.module('ftbApp', ['org.ekstep.question']).controller('ftbQuestionFormController', ['$scope', '$rootScope', 'questionServices', function($scope, $rootScope, questionServices) { // eslint-disable-line no-unused-vars
  var questionInput;
  $scope.keyboardConfig = {
    keyboardType: 'Device',
    customKeys: []
  };
  $scope.configuration = {
    'questionConfig': {
      'isText': true,
      'isImage': true,
      'isAudio': true,
      'isHint': false
    }
  };
  $scope.questionMedia = {};
  $scope.keyboardTypes = ['Device', 'English', 'Custom'];
  $scope.ftbFormData = {
    question: {
      text: '',
      image: '',
      audio: '',
      audioName: '',
      keyboardConfig: $scope.keyboardConfig
    },
    answer: [],
    media: []
  };
  $scope.keyboardPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.keyboard");
  $scope.defaultMedia = [{
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
  questionInput = CKEDITOR.replace('ftbQuestion', { // eslint-disable-line no-undef
    customConfig: ecEditor.resolvePluginResource('org.ekstep.questionunit', '1.0', "editor/ckeditor-config.js"),
    skin: 'moono-lisa,' + CKEDITOR.basePath + "skins/moono-lisa/", // eslint-disable-line no-undef
    contentsCss: CKEDITOR.basePath + "contents.css" // eslint-disable-line no-undef
  });
  questionInput.on('change', function () {
    $scope.ftbFormData.question.text = this.getData();
  });
  questionInput.on('focus', function () {
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
  var questionUnitInstance = ecEditor.instantiatePlugin('org.ekstep.questionunit');
  $scope.init = function () {
    /**
     * editor:questionunit.ftb:call form validation.
     * @event org.ekstep.questionunit.ftb:validateform
     * @memberof org.ekstep.questionunit.ftb.horizontal_controller
     */
    EventBus.listeners['org.ekstep.questionunit.ftb:validateform'] = [];
    $scope.ftbPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.questionunit.ftb");
    ecEditor.addEventListener('org.ekstep.questionunit.ftb:validateform', function (event, callback) {
      var validationRes = $scope.formValidation();
      callback(validationRes.isValid, validationRes.formData);
    }, $scope);
    /**
     * editor:questionunit.ftb:call form edit the question.
     * @event org.ekstep.questionunit.ftb:editquestion
     * @memberof org.ekstep.questionunit.ftb.horizontal_controller
     */
    $scope.addDefaultMedia();
    EventBus.listeners['org.ekstep.questionunit.ftb:editquestion'] = [];
    ecEditor.addEventListener('org.ekstep.questionunit.ftb:editquestion', $scope.editFtbQuestion, $scope);
    //its indicating the controller is loaded in question unit
    ecEditor.dispatchEvent("org.ekstep.questionunit:ready");
    
  }
  /**
   * add media to stage
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   */
  $scope.addDefaultMedia = function () {
    //push media into ftbform media
    _.each($scope.defaultMedia, function (obj) {
      var mediaObject = {
        "type" : "default",
        "value" : obj
      };
      questionUnitInstance.setMedia(mediaObject);
    })
  }
  /**
   * for edit flow
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   * @param {event} event data.
   * @param {question} data data.
   */
  $scope.editFtbQuestion = function (event, data) {
    var qdata = data.data;
    $scope.ftbFormData.question = qdata.question;
    _.each(qdata.media, function (obj) {
      questionUnitInstance.setMedia(obj);
    })
    $scope.ftbFormData.media = questionUnitInstance.getAllMedia();
    $scope.keyboardConfig = qdata.question.keyboardConfig;
    _.each(qdata.media, function (mediaObject, index) {
      $scope.questionMedia[mediaObject.type] = mediaObject;
    });
    $scope.$safeApply();
  }
  /**
   * create answer array for ftb blank
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   */
  $scope.createAnswerArray = function () {
    var regexForAns = /(?:^|)\[\[(.*?)(?:\]\]|$)/g;
    $scope.ftbFormData.answer = $scope.splitAnswer($scope.ftbFormData.question.text, regexForAns, 1).map(function (a) {
      a = $scope.extractHTML(a);
      return a.toLowerCase().trim();
    });
  }

  $scope.extractHTML = function(htmlElement) {
    var divElement= document.createElement('div');
    divElement.innerHTML= htmlElement;
    return divElement.textContent || divElement.innerText;
  }
  /**
   * split answer into question text
   * @memberof org.ekstep.questionunit.ftb.horizontal_controller
   * @returns {String} question data.
   * @param {string} string data.
   * @param {regex} regex expression.
   * @param {index} index value.
   */
  $scope.splitAnswer = function (string, regex, index) {
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
  $scope.formValidation = function () {
    var ftbFormQuestionText, formValid, formConfig = {};
    $scope.submitted = true;
    ftbFormQuestionText = $scope.ftbFormData.question.text;
    formValid = (ftbFormQuestionText.length > 0) && /\[\[.*?\]\]/g.test(ftbFormQuestionText);
    
    if (formValid) {
      $scope.createAnswerArray();
      formConfig.isValid = true;
      formConfig.formData = $scope.ftbFormData;
      $('.questionTextBox').removeClass("ck-error");
    } else {
      formConfig.isValid = false;
      formConfig.formData = $scope.ftbFormData;
      $('.questionTextBox').addClass("ck-error");
    }
    return formConfig;
  }

  /**
   * Helper function to generate telemetry event
   * @param {Object} data telemetry data
   */
  $scope.generateTelemetry = function (data) {
    if (data) {
      data.plugin = data.plugin || {
        "id": $scope.ftbPluginInstance.id,
        "ver": $scope.ftbPluginInstance.ver
      }
      data.form = data.form || 'question-creation-ftb-form';
      questionServices.generateTelemetry(data);
    }
  }

  /**
   * invokes the asset browser to pick an image to add to either the question or the options
   * @param {string} id if `q` then it is image for question, else for options
   * @param {string} type if `id` is not `q` but an index, then it can be either 'LHS' or 'RHS'
   * @param {string} mediaType `image` or `audio`
   */
  $scope.addMedia = function (type, index, mediaType) {
    var mediaObject = {
      type: mediaType,
      search_filter: {} // All composite keys except mediaType
    }
    //Defining the callback function of mediaObject before invoking asset browser
    mediaObject.callback = function (data) {
      var telemetryObject = { type: 'TOUCH', id: 'button', target: { id: 'questionunit-ftb-add-' + mediaType, ver: '', type: 'button' } };
      var mediaObject = {
        "type" : type,
        "value" : data
      };
      if($scope.ftbFormData.question[mediaType]){
        questionUnitInstance.removeMedia($scope.ftbFormData.question[mediaType]);
      }
      questionUnitInstance.setMedia(mediaObject)
      
      var media = questionUnitInstance.getMedia();
      $scope.ftbFormData.question[mediaType] = org.ekstep.contenteditor.mediaManager.getMediaOriginURL(media.src);
      media.type == 'audio' ? $scope.ftbFormData.question.audioName = media.name : '';
      $scope.questionMedia[mediaType] = media;
      $scope.ftbFormData.media = questionUnitInstance.getAllMedia();

      if(!$scope.$$phase) {
        $scope.$digest()
      }
      $scope.generateTelemetry(telemetryObject)
    }
    questionServices.invokeAssetBrowser(mediaObject);
  }

  /**
   * Deletes the selected media
   * @param {string} type 
   * @param {Integer} index 
   * @param {string} mediaType 
   */
  $scope.deleteMedia = function (type, index, mediaType) {
    var telemetryObject = { type: 'TOUCH', id: 'button', target: { id: 'questionunit-ftb-delete-' + mediaType, ver: '', type: 'button' } };
    
    questionUnitInstance.removeMedia($scope.questionMedia[mediaType]);
    $scope.ftbFormData.media = questionUnitInstance.getAllMedia();
    $scope.ftbFormData.question[mediaType] = '';

    $scope.generateTelemetry(telemetryObject)
  }

  /**
   * Callbacks object to be passed to the directive to manage selected media
   */
  $scope.callbacks = {
    deleteMedia: $scope.deleteMedia,
    addMedia: $scope.addMedia,
    qtype: 'ftb'
  }

}]);
//# sourceURL=horizontalFTB.js