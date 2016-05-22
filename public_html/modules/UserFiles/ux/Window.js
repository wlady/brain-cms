Ext.ns('App');
Ext.define('module.UserFiles.ux.Window', {
    extend: 'module.UserFiles.ux.Container',
    maximized: true,
    callback: null,
    singleSelect: true,
    uploadPath: '',
    constructor: function (config) {
        var me = this;
        Ext.apply(me, config);
        this.buttons = [{
            text: __.ok,
            scope: this,
            handler: Ext.bind(this.onOk, this)
        }, {
            text: __.cancel,
            handler: Ext.bind(this.onClose, this)
        }];
        this.callParent(arguments);
    },

    onOk: function () {
        var obj = this.query('userfilesgrid');
        if (Ext.isArray(obj) && obj.length) {
            var rows = obj[0].getSelectionModel().getSelection();
            if (rows.length) {
                if (rows.length > 1 && this.singleSelect) {
                    Ext.ux.Utils.alert(__.error_msg, __.single_file_only);
                    return;
                } else if (typeof(this.callback) == 'function') {
                    this.callback(rows, obj[0].currentPath);
                }
            }
        }
        this.close();
    },

    onClose: function () {
        this.close();
    }

});
