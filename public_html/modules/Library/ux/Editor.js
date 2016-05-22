Ext.ns('App');
Ext.define('module.Library.ux.Editor', {
    extend : 'Ext.form.Panel',
    originalId : 0,
    fid : 0,
    trackResetOnLoad : true,
    title : __.library_editor,
    url : App.baseUrl,
    baseParams : {
        _m : 'Library',
        _a : 'saveRow'
    },
    loadMask : true,
    layout : {
        type : 'responsivecolumn',
        states : {
            small : 800,
            large : 0
        }
    },
    assignedModulesStore : null,
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.originalId = this.fid;
        this.parentComponent = config.parentComponent;
        this.items = [
            {
                xtype : 'responsivefieldset',
                responsiveCls : 'large-100 small-100',
                title : __.library_doc,
                collapsible : false,
                items : [{
                    xtype : 'hiddenfield',
                    name : 'id'
                }, {
                    xtype : 'textfield',
                    fieldLabel : __.title,
                    name : 'title',
                    allowBlank : false
                }, {
                    xtype : 'textfield',
                    fieldLabel : __.alias,
                    name : 'alias'
                }, {
                    xtype : 'wysiwygeditor',
                    fieldLabel : __.content,
                    name : 'content'
                }, {
                    xtype : 'enumtruefalsecombo',
                    fieldLabel : __.is_active,
                    hiddenName : 'active',
                    name : 'active',
                    value : 'false'
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
                text : __.close,
                iconCls : 'ic-close',
                handler : function () {
                    me.fireEvent('close', me);
                }
            }]
        }];
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.on({
            close : this.closeContainer,
            destroy : this.destroyContainer,
            scope : this
        });
    },

    closeContainer : function () {
        var grid = this.parentComponent;
        if (grid && (!parseInt(this.fid) || this.getForm().isDirty())) {
            grid.getStore().load();
        }
        this.fireEvent('destroy', this);
    },

    destroyContainer : function () {
        Ext.ux.Utils.removeModulePanel('library-panel-' + this.originalId);
    }
});
