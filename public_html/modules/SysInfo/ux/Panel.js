Ext.ns('App');
Ext.define('module.SysInfo.ux.Panel', {
    extend: 'Ext.panel.Panel',
    title: __.SysInfo,
    border: false,
    autoScroll: true,
    items: [{
        xtype: 'container',
        layout: 'fit',
        itemId: 'siTable'
    }],
    initComponent: function (config) {
        Ext.apply(this, config || {});
        this.tbar = [
            {
                text: __.reload,
                iconCls: 'ic-reload',
                handler: Ext.bind(this.loadSysInfo, this)
            }, '->', {
                text: __.settings,
                tooltip: __.module_settings,
                iconCls: 'ic-preferences',
                margin: '0 20 0 0',
                handler: function () {
                    if (rec = App.moduleRecords.findRecord('m_path', 'SysInfo')) {
                        Ext.create('module.Modules.ux.About', {
                            record: rec
                        });
                    }
                }
            }];
        this.callParent(arguments);
        this.on({
            beforerender: this.loadSysInfo,
            scope: this
        });
    },

    loadSysInfo: function () {
        var me = this;
        Ext.Ajax.request({
            url: App.baseUrl,
            params: {
                _m: 'SysInfo',
                _a: 'getInfo'
            },
            loadMask: true,
            callback: function (options, success, response) {
                var json = Ext.decode(response.responseText);
                if (json.success) {
                    me.getComponent('siTable').getEl().setHtml(json.message);
                }
            }
        });
    }

});
