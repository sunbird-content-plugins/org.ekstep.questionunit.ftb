/**
*
* Plugin to create question
* @class org.ekstep.plugins.ftbplugin.EditorPlugin
* @extends org.ekstep.contenteditor.basePlugin
* @author Gourav More <gourav_m@tekditechnologies.com>
*/
org.ekstep.questionunitFTB = {};
org.ekstep.questionunitFTB.EditorPlugin = org.ekstep.contenteditor.questionUnitPlugin.extend({
  /**
   *  Adds event listeners and loads template and controller
   *  @memberof org.ekstep.plugins.mcqplugin.EditorPlugin#
   */
  currentInstance: undefined,
  initialize: function() {
    var instance = this;
    ecEditor.addEventListener("org.ekstep.plugins.ftbplugin:showpopup", this.loadHtml, this);
    var templatePath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/templates/ftb-template.html');
    var controllerPath = ecEditor.resolvePluginResource(instance.manifest.id, instance.manifest.ver, 'editor/controllers/ftb-controller.js');
    ecEditor.getService(ServiceConstants.POPUP_SERVICE).loadNgModules(templatePath, controllerPath);

  },
  
  addDefaultMedia: function() {
    var instance = this;
    var keyboardPluginInstance = org.ekstep.pluginframework.pluginManager.getPluginManifest("org.ekstep.keyboard");
    var defaultMedia = [{
      id: "org.ekstep.keyboard.eras_icon",
      src: ecEditor.resolvePluginResource(keyboardPluginInstance.id, keyboardPluginInstance.ver, 'renderer/assets/eras_icon.png'),
      assetId: "org.ekstep.keyboard.eras_icon",
      type: "image",
      preload: true
    }, {
      id: "org.ekstep.keyboard.language_icon",
      src: ecEditor.resolvePluginResource(keyboardPluginInstance.id, keyboardPluginInstance.ver, 'renderer/assets/language_icon.png'),
      assetId: "org.ekstep.keyboard.language_icon",
      type: "image",
      preload: true
    }, {
      id: "org.ekstep.keyboard.hide_keyboard",
      src: ecEditor.resolvePluginResource(keyboardPluginInstance.id, keyboardPluginInstance.ver, 'renderer/assets/keyboard.svg'),
      assetId: "org.ekstep.keyboard.hide_keyboard",
      type: "image",
      preload: true
    }];
    instance.setAllMedia(defaultMedia);
  }
});
//# sourceURL=ftbpluginEditorPlugin.js