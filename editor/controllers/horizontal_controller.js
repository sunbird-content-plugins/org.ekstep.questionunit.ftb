/**
 * Plugin to create FTB question
 * @class org.ekstep.questionunitftb:ftbQuestionFormController
 * Jagadish P<jagadish.pujari@tarento.com>
 */

angular.module('ftbApp', ['org.ekstep.question']).controller('ftbQuestionFormController', ['$scope', '$rootScope', 'questionServices', function($scope, $rootScope, $questionServices) { // eslint-disable-line no-unused-vars
  $scope.keyboardConfig = {
    keyboardType: 'Device',
    customKeys: []
  };
  $scope.formVaild = false;
  $scope.ftbConfiguartion = {
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
  var eraserIcon = {
    id: "org.ekstep.keyboard.eras_icon",
    src: ecEditor.resolvePluginResource("org.ekstep.keyboard", "1.0", 'renderer/assets/eras_icon.png'),
    assetId: "org.ekstep.keyboard.eras_icon",
    type: "image",
    preload: true
  };
  $scope.ftbFormData.media.push(eraserIcon);
  var languageIcon = {
    id: "org.ekstep.keyboard.language_icon",
    src: ecEditor.resolvePluginResource("org.ekstep.keyboard", "1.0", 'renderer/assets/language_icon.png'),
    assetId: "org.ekstep.keyboard.language_icon",
    type: "image",
    preload: true
  };
  $scope.ftbFormData.media.push(languageIcon);
  var hideKeyboardIcon = {
    id: "org.ekstep.keyboard.hide_keyboard",
    src: ecEditor.resolvePluginResource("org.ekstep.keyboard", "1.0", 'renderer/assets/keyboard.svg'),
    assetId: "org.ekstep.keyboard.hide_keyboard",
    type: "image",
    preload: true
  };
  $scope.ftbFormData.media.push(hideKeyboardIcon);
  var questionInput = CKEDITOR.replace('ftbQuestion', { // eslint-disable-line no-undef
    customConfig: CKEDITOR.basePath + "config.js", // eslint-disable-line no-undef
    skin: 'moono-lisa,' + CKEDITOR.basePath + "skins/moono-lisa/", // eslint-disable-line no-undef
    contentsCss: CKEDITOR.basePath + "contents.css" // eslint-disable-line no-undef
  });
  questionInput.on('change', function() {
    $scope.ftbFormData.question.text = this.getData();
  });
  questionInput.on('focus', function() {
    $scope.generateTelemetry({ type: 'TOUCH', id: 'input', target: { id: 'questionunit-ftb-question', ver: '', type: 'input' } })
  });
  $scope.init = function() {
    $('.menu .item').tab();
    $('.ui.dropdown').dropdown({
      useLabels: false
    });
    if (!ecEditor._.isUndefined($scope.questionEditData)) {
      var data = $scope.questionEditData.data;
      $scope.ftbFormData.question = data.question;
      $scope.keyboardConfig = data.question.keyboardConfig;
    }
    $scope.$parent.$on('question:form:val', function() { // eslint-disable-line no-unused-vars
      var regexForAns = /(?:^|)\[\[(.*?)(?:\]\]|$)/g;
      $scope.ftbFormData.answer = $scope.getMatches($scope.ftbFormData.question.text, regexForAns, 1).map(function(a) {
        return a.toLowerCase().trim();
      });
      if ($scope.formValidation()) {
        $scope.$emit('question:form:valid', $scope.ftbFormData);
      } else {
        $scope.$emit('question:form:inValid', $scope.ftbFormData);
      }
    })
  }

  $scope.getMatches = function(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) { // eslint-disable-line no-cond-assign
      matches.push(match[index]);
    }
    return matches;
  }
  
  $scope.formValidation = function() {
    $scope.submitted = true;
    var ftbQuestionLength = $scope.ftbFormData.question.text.length;
    var formValid = (ftbQuestionLength > 0) && /\[\[.*?\]\]/g.test($scope.ftbFormData.question.text);
    if (formValid) {
      return true;
    } else {
      $scope.ftbForm.ftbQuestion.$valid = false;
      return false;
    }
  }

  $scope.generateTelemetry = function(data, event) { // eslint-disable-line no-unused-vars
    var plugin = {
      "id": "org.ekstep.questionunit.ftb",
      "ver": "1.0"
    }
    data.form = 'question-creation-mcq-form';
    $questionServices.generateTelemetry(data, plugin);
  }

  $scope.addImage = function () {
    var mediaObject =  {
      type: 'image',
      search_filter: {} // All composite keys except mediaType
    }
    //Defining the callback function of mediaObject before invoking asset browser
    mediaObject.callback = function(data) {
      var tempImage = {
        "id": Math.floor(Math.random() * 1000000000), // Unique identifier
        "src": org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src), // Media URL
        "assetId": data.assetMedia.id, // Asset identifier
        "type": "image", // Type of asset (image, audio, etc)
        "preload": false // true or false
      };
      $scope.ftbFormData.question.image = org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src);
      $scope.questionMedia.image = tempImage;
    }
    $questionServices.invokeAssetBrowser(mediaObject);
    var telemetryObject = {type: 'TOUCH', id: 'button', target: {id: 'questionunit-ftb-add-image', ver: '', type: 'button'}}
    $scope.generateTelemetry(telemetryObject)
  }

  $scope.addAudio = function () {
    var mediaObject =  {
      type: 'audio',
      search_filter: {} // All composite keys except mediaType
    }
    //Defining the callback function of mediaObject before invoking asset browser
    mediaObject.callback = function(data) {
      var tempAudio = {
        "id": Math.floor(Math.random() * 1000000000), // Unique identifier
        "src": org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src), // Media URL
        "assetId": data.assetMedia.id, // Asset identifier
        "type": "audio", // Type of asset (image, audio, etc)
        "preload": false // true or false
      };
      $scope.ftbFormData.question.audio = org.ekstep.contenteditor.mediaManager.getMediaOriginURL(data.assetMedia.src);
      $scope.ftbFormData.question.audioName = data.assetMedia.name;
      $scope.questionMedia.audio = tempAudio;        
    }
    $questionServices.invokeAssetBrowser(mediaObject);
    var telemetryObject = {type: 'TOUCH', id: 'button', target: {id: 'questionunit-ftb-add-audio', ver: '', type: 'button'}}
    $scope.generateTelemetry(telemetryObject)
  }

  $scope.deleteImage = function () {
    $scope.ftbFormData.question.image = '';
    delete $scope.questionMedia.image;
    var telemetryObject = {type: 'TOUCH', id: 'button', target: {id: 'questionunit-ftb-delete-image', ver: '', type: 'button'}}
    $scope.generateTelemetry(telemetryObject)
  }
  $scope.deleteAudio = function () {
    $scope.isPlayingQ = false;
    $scope.ftbFormData.question.audio = '';
    delete $scope.questionMedia.audio;
    var telemetryObject = {type: 'TOUCH', id: 'button', target: {id: 'questionunit-ftb-delete-audio', ver: '', type: 'button'}}
    $scope.generateTelemetry(telemetryObject)
  }

  $scope.functionConfig = {
    deleteImage: $scope.deleteImage,
    addImage: $scope.addImage,
    addAudio: $scope.addAudio,
    deleteAudio: $scope.deleteAudio,
    qtype: 'ftb'
  }

}]);
//# sourceURL=horizontalFTB.js