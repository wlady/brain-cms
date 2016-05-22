Ext.ns('App');
Ext.define('module.EmailForms.ux.Editor', {
    extend : 'Ext.form.Panel',
    fid : 0,
    originalId : 0,
    trackResetOnLoad : true,
    title : __.form_editor,
    url : App.baseUrl,
    baseParams : {
        _m : 'EmailForms',
        _a : 'saveRow'
    },
    layout : {
        type : 'responsivecolumn',
        states : {
            small : 800,
            large : 0
        }
    },
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.originalId = this.fid;
        this.parentComponent = config.parentComponent;
        this.items = [{
            xtype : 'responsivefieldset',
            responsiveCls : 'large-100 small-100',
            title : __.forminfo,
            collapsible : true,
            collapsed : false,
            items : [{
                xtype : 'hiddenfield',
                name : 'f_id'
            }, {
                xtype : 'textfield',
                fieldLabel : __.formname,
                allowBlank : false,
                name : 'f_name',
            }, {
                xtype : 'commoncombo',
                fieldLabel : __.useform,
                name : 'f_form',
                data : App.forms2Array,
            }, {
                xtype : 'enumtruefalsecombo',
                fieldLabel : __.logging,
                hiddenName : 'f_logging',
                name : 'f_logging'
            }, {
                xtype : 'enumtruefalsecombo',
                fieldLabel : __.active,
                hiddenName : 'f_active',
                name : 'f_active'
            }]
        }, {
            xtype : 'responsivefieldset',
            responsiveCls : 'large-100 small-100',
            title : __.email,
            collapsible : true,
            collapsed : false,
            manageHeight : false,
            items : [{
                xtype : 'textfield',
                fieldLabel : __.f_to,
                name : 'f_to'
            }, {
                xtype : 'textfield',
                fieldLabel : __.f_cc,
                name : 'f_cc'
            }, {
                xtype : 'textfield',
                fieldLabel : __.subject,
                name : 'f_subject'
            }, {
                xtype : 'wysiwygeditor',
                fieldLabel : __.template,
                name : 'f_template'
            }, {
                xtype : 'fieldcontainer',
                fieldLabel : __.attachments,
                border : false,
                items : [{
                    xtype : 'container',
                    itemId : 'attachments',
                    items : []
                }]
            }]
        }, {
            xtype : 'responsivefieldset',
            responsiveCls : 'large-100 small-100',
            title : __.reply,
            collapsible : true,
            collapsed : false,
            items : [{
                xtype : 'textfield',
                fieldLabel : __.subject,
                name : 'f_reply_subject'
            }, {
                xtype : 'wysiwygeditor',
                fieldLabel : __.content,
                name : 'f_reply_content'
            }]
        }];
        this.dockedItems = [{
            xtype : 'toolbar',
            ui : 'footer',
            dock : 'bottom',
            margin : '20 0 20 0',
            layout : {
                pack : 'center'
            },
            items : [{
                text : __.save_exit,
                iconCls : 'ic-save_exit',
                scope : this,
                handler : function () {
                    var frm = this.getForm();
                    if (frm.isValid()) {
                        frm.submit({
                            success : function () {
                                me.fireEvent('close', me);
                            }
                        });
                    } else {
                        Ext.ux.Utils.alert(__.errors, __.pls_fix);
                    }
                }
            }, {
                text : __.save,
                iconCls : 'ic-save',
                scope : this,
                handler : function () {
                    var frm = this.getForm();
                    if (frm.isValid()) {
                        frm.submit({
                            success : function (form, action) {
                                if (!this.fid && action.result.id) {
                                    form.findField('f_id').setValue(action.result.id);
                                }
                                Ext.ux.Utils.popup(__.info_msg, __.data_saved);
                            }
                        });
                    } else {
                        Ext.ux.Utils.alert(__.errors, __.pls_fix);
                    }
                }
            }, {
                text : __.close,
                iconCls : 'ic-close',
                handler : function () {
                    me.fireEvent('close', me);
                }
            }]
        }];
        this.callParent(arguments);
        this.on({
            render : this.createAttachmentsEditor,
            close : this.closeContainer,
            destroy : this.destroyContainer,
            scope : this
        });
    },

    createAttachmentsEditor : function () {
        var me = this;
        var editor = Ext.create('module.EmailAttachments.ux.Grid', {
            id : 'attachments-grid-' + this.fid,
            form_id : me.fid
        });
        var containers = this.query('container[itemId=attachments]');
        if (containers.length) {
            containers[0].removeAll();
            containers[0].add(editor);
        }
    },

    closeContainer : function () {
        var grid = this.parentComponent
        if (grid && (!parseInt(this.fid) || this.getForm().isDirty())) {
            grid.getStore().load();
        }
        this.fireEvent('destroy', this);
    },

    destroyContainer : function () {
        Ext.ux.Utils.removeModulePanel('email_forms-panel-' + this.originalId);
    }
});
