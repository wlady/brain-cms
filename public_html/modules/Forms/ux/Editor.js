Ext.ns('App');
Ext.define('module.Forms.ux.Editor', {
    extend: 'Ext.form.Panel',
    alias: 'widget.formseditor',
    uses: 'module.FormFields.ux.Grid',
    trackResetOnLoad: true,
    fid: 0,
    originalId: 0,
    title: __.forms_editor,
    url: App.baseUrl,
    baseParams: {
        _m: 'Forms',
        _a: 'saveRow'
    },
    layout: {
        type: 'responsivecolumn',
        states: {
            small: 800,
            large: 0
        }
    },
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.originalId = this.fid;
        this.parentComponent = config.parentComponent;
        this.items = [
            {
                xtype: 'responsivefieldset',
                responsiveCls: 'large-100 small-100',
                title: __.forminfo,
                collapsible: true,
                collapsed: false,
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'id'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: __.name,
                        allowBlank: false,
                        name: 'name'
                    }, {
                        xtype: 'container',
                        layout: 'fit',
                        margin: '0 0 5 0',
                        items: [{
                            xtype: 'htmleditor',
                            fieldLabel: __.content,
                            labelAlign: 'top',
                            labelModif: false,
                            name: 'content',
                            height: 300
                        }]
                    }, {
                        xtype: 'enumtruefalsecombo',
                        fieldLabel: __.active,
                        allowBlank: false,
                        hiddenName: 'active',
                        name: 'active'
                    }]
            }, {
                xtype: 'responsivefieldset',
                responsiveCls: 'large-100 small-100',
                title: __.formvalidators,
                collapsible: true,
                collapsed: true,
                manageHeight: false,
                items: [
                    {
                        xtype: 'formfieldsvalidators',
                        formId: me.fid
                    }
                ],
                listeners: {
                    beforeexpand: function () {
                        if (me.getForm().isValid() && !me.fid) {
                            // new item
                            me.getForm().submit({
                                success: function (form, action) {
                                    if (action.result.id) {
                                        me.fid = action.result.id;
                                        form.findField('id').setValue(action.result.id);
                                        var els = Ext.ComponentQuery.query('formfieldsvalidators', me);
                                        if (els.length) {
                                            els[0].reloadForm(me.fid);
                                        }
                                    }
                                }
                            });
                        } else if (!me.getForm().isValid()) {
                            Ext.ux.Utils.alert(__.errors, __.pls_fix);
                            return false;
                        }
                    },
                    expand: function () {
                        me.updateLayout();
                    }
                }
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
                                    if (!me.fid && action.result.id) {
                                        me.fid = action.result.id;
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
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.on({
            close: this.closeContainer,
            destroy: this.destroyContainer,
            scope: this
        });
    },

    closeContainer: function () {
        var grid = this.parentComponent;
        if (grid && (!parseInt(this.fid) || this.getForm().isDirty())) {
            grid.getStore().load();
        }
        this.fireEvent('destroy', this);
    },

    destroyContainer: function () {
        Ext.ux.Utils.removeModulePanel('forms-panel-' + this.originalId);
    }
});
