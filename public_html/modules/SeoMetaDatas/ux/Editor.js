Ext.ns('App');
Ext.define('module.SeoMetaDatas.ux.Editor', {
    extend: 'Ext.form.Panel',
    trackResetOnLoad: true,
    rec: null,
    editorFields: [],
    fields: [],
    fid: 0,
    title: __.seometadatas_editor,
    url: App.baseUrl,
    baseParams: {
        _m: 'SeoMetaDatas',
        _a: 'saveRow'
    },
    loadMask: true,
    layout: {
        type: 'responsivecolumn',
        states: {
            small: 800,
            large: 0
        },
    },
    manageHeight: false,
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config || {});
        var data = me.rec ? me.rec.get('data') : false;
        me.editorFields = [];
        Ext.each(this.fields, function (item) {
            var field = {
                xtype: item.f_xtype,
                fieldLabel: item.f_xlabel,
                name: item.f_xname,
                value: data ? data[item.f_xname] : ''
            };
            if (item.f_xtype == 'textareafield') {
                field.height = 200;
            }
            if (item.f_xtype == 'textareafield' || item.f_xtype == 'textfield') {
            }
            me.editorFields.push(field);
        });
        this.items = [
            {
                xtype: 'responsivefieldset',
                responsiveCls: 'large-100 small-100',
                title: __.SeoMetaDatas,
                collapsible: false,
                items: Ext.Array.merge([
                    {
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: __.url,
                        allowBlank: false,
                        name: 'url',
                    }], me.editorFields
                )
            }];
        this.dockedItems = [{
            xtype: 'toolbar',
            ui: 'footer',
            dock: 'bottom',
            margin: '20 0 20 0',
            layout: {
                pack: 'center'
            },
            items: [
                {
                    text: __.save_exit,
                    iconCls: 'ic-save_exit',
                    scope: this,
                    handler: function () {
                        var frm = this.getForm();
                        if (frm.isValid()) {
                            frm.submit({
                                success: function () {
                                    me.fireEvent('close', me);
                                }
                            });
                        } else {
                            Ext.ux.Utils.alert(__.errors, __.pls_fix);
                        }
                    }
                }, {
                    text: __.save,
                    iconCls: 'ic-save',
                    scope: this,
                    handler: function () {
                        var frm = this.getForm();
                        if (frm.isValid()) {
                            frm.submit({
                                success: function (form, action) {
                                    if (!this.fid && action.result.id) {
                                        form.findField('id').setValue(action.result.id);
                                    }
                                    Ext.ux.Utils.popup(__.info_msg, __.data_saved);
                                }
                            });
                        } else {
                            Ext.ux.Utils.alert(__.errors, __.pls_fix);
                        }
                    }
                }, {
                    text: __.close,
                    iconCls: 'ic-close',
                    handler: function () {
                        me.fireEvent('close', me);
                    }
                }]
        }];
        this.callParent(arguments);
        this.on({
            close: this.closeContainer,
            destroy: this.destroyContainer,
            scope: this
        });
    },

    closeContainer: function () {
        var grid = this.parentComponent;
        if (grid) {
            // always reload store !!!
            grid.getStore().load();
        }
        this.fireEvent('destroy', this);
    },

    destroyContainer: function () {
        Ext.ux.Utils.removeModulePanel(this.up('panel[itemId=seometadatas_editor' + this.fid + ']'));
    }
});
