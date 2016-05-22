Ext.ns('App');
Ext.define('module.UserFiles.ux.Clipboard', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.userfilesclipboard',
    id: 'userfilesclipboard',
    autoRender: true,
    autoScroll: true,
    manageHeight: false,
    constructor: function (config) {
        Ext.apply(this, config || {});
        this.callParent(arguments);
    },

    refill: function () {
        var me = this, data = [], tpl;
        data.dir = '';
        var tree = Ext.getCmp('userfilestree');
        if (tree && tree.clipboardPath.length) {
            data.dir = tree.clipboardPath;
        }
        data.files = [];
        var grid = Ext.getCmp('userfilesgrid');
        if (grid && grid.clipboard.length) {
            data.files = grid.clipboard;
        }
        tpl = new Ext.XTemplate(
            '<div class="userfilesregion">',
            '<b>' + __.dirsclipboard + '</b><br />',
            '<span>{dir}</span><br /><br />',
            '<b>' + __.filesclipboard + '</b><br />',
            '<tpl for="files"><span>{.}</span><br /></tpl>',
            '</div>'
        );
        tpl.overwrite(me.getEl().dom, data);
    },

    clear: function () {
        var tree = Ext.getCmp('userfilestree');
        if (tree) {
            tree.clipboardPath = [];
        }
        var grid = Ext.getCmp('userfilesgrid');
        if (grid) {
            grid.clipboard = [];
        }
        this.refill();
    }
});
