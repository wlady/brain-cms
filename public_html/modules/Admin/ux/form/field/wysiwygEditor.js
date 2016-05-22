/**
 * Ext.ux.form.field.wysiwygEditor
 *
 *  ExtJS 4 WYSIWYG editor chooser by wlady2001 at gmail dot com
 *
 */
Ext.ns('App');
Ext.define('Ext.ux.form.field.wysiwygEditor', {
    extend : 'Ext.form.field.TextArea',
    alias : ['widget.wysiwygeditor'],
    constructor : function (config) {
        var curEditor = null;
        switch (App.wisywygEditor) {
            case 'tinymce':
                // create bigger container for toolbars and menu
                var cfg = {
                    hidden : false,
                    tinymceConfig : App.tinymceDefaultConfig,
                    height : 'auto'
                };
                Ext.apply(cfg, config);
                cfg.height = 300;
                if (!Ext.isEmpty(cfg.width)) {
                    cfg.tinymceConfig.width = cfg.width;
                }
                if (cfg.hidden) {
                    settings.height = 0;
                }
                curEditor = Ext.create('Ext.ux.form.field.TinyMCE', cfg);
                break;
            case 'htmleditor':
            default:
                var cfg = {
                    margin : '0 0 5 0',
                    /*,
                     plugins: [
                     Ext.create('Ext.ux.form.plugin.HtmlEditor',{
                     enableAll:  true,
                     enableMultipleToolbars: false
                     })
                     ]*/
                };
                Ext.apply(cfg, config);
                cfg.height = 200; // use fixed height
                curEditor = Ext.create('Ext.form.HtmlEditor', cfg);
                break;
        }
        return curEditor;
    }
});
