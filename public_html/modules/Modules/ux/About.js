Ext.ns('App');
Ext.define('module.Modules.ux.About', {
    extend : 'Ext.window.Window',
    record : null,
    iconCls : 'ic-preferences',
    buttonAlign : 'center',
    plain : true,
    title : __.module_settings,
    resizable : false,
    width : 600,
    modal : true,
    bodyStyle : {
        padding : 10
    },
    layout : 'hbox',
    autoShow : true,
    constructor : function (config) {
        Ext.apply(this, config || {});
        if (!this.record) {
            return false;
        }
        var settingsFields = [], els, icon = this.record.get('iconPath'), ver, activeField, st;
        if (els = this.record.get('Settings')) {
            settingsFields = Ext.decode(els);
            Ext.each(settingsFields, function (item) {
                if (typeof(item.anchor) == 'undefined' && item.xtype == 'textfield') {
                    item.anchor = '100%';
                }
            });
        }
        ver = ' Ver ' + this.record.get('Version');
        st = this.record.get('Status');
        switch (st) {
            case 'orphan':
                ver = '';
                icon = 'Modules';
                activeField = {
                    fieldLabel : __.active,
                    value : this.colorText(__.orphanmodule, 'red'),
                    xtype : 'displayfield'
                };
                break;
            case 'system':
                activeField = {
                    fieldLabel : __.active,
                    value : this.colorText(__.coremodule, 'gray'),
                    xtype : 'displayfield'
                };
                break;
            case 'depend':
                activeField = {
                    fieldLabel : __.active,
                    value : this.colorText(__.depmodule + this.record.get('Depends'), 'gray'),
                    xtype : 'displayfield'
                };
                break;
            case 'active':
            default:
                activeField = {
                    xtype : 'enumtruefalsecombo',
                    fieldLabel : __.active,
                    name : 'm_active',
                    hiddenName : 'm_active',
                    value : this.record.get('m_active')
                };
                break;
        }
        var fields = [{
            xtype : 'hidden',
            name : 'm_path',
            value : this.record.get('m_path')
        }, {
            fieldLabel : __.title,
            value : this.record.get('m_name') + ver,
            xtype : 'displayfield'
        }, {
            fieldLabel : __.description,
            value : this.record.get('m_description'),
            xtype : 'displayfield'
        },
            activeField
        ];
        var frm = Ext.create('Ext.form.Panel', {
            id : 'modsettings',
            baseCls : 'x-plain',
            url : App.baseUrl,
            baseParams : {
                _m : 'Modules',
                _a : 'saveSettings'
            },
            width : 400,
            padding : 5,
            defaultType : 'textfield',
            items : Ext.Array.merge(fields, settingsFields)
        });

        var me = this;
        this.items = [{
            xtype : 'container',
            width : 150,
            height : 150,
            padding : 10,
            plain : true,
            border : false,
            html : '<div class="' + icon + '-icon about-size" />'
        }, {
            xtype : 'container',
            plain : true,
            manageHeight : false,
            items : frm
        }];
        this.buttons = [{
            text : __.save,
            iconCls : 'ic-save',
            handler : function () {
                var frm = Ext.getCmp('modsettings').getForm();
                frm.submit({
                    success : function () {
                        App.moduleRecords.reload();
                        var grid = Ext.getCmp('modules-grid');
                        if (grid) {
                            grid.getStore().load();
                        }
                        me.close();
                    }
                });
            }
        }, {
            text : __.close,
            iconCls : 'ic-close',
            handler : function () {
                me.close();
            }
        }];
        this.callParent(arguments);
    },
    colorText : function (value, color) {
        return Ext.String.format('<span style="color:{0}">{1}</spoan>', color, value);
    }
});


