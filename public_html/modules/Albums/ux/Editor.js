Ext.ns('App');
Ext.require([
    'module.Pictures.ux.Grid',
    'module.Pictures.ux.YoutubeEditor'
]);
Ext.define('module.Albums.ux.Editor', {
    extend : 'Ext.form.Panel',
    alias : 'widget.albumseditor',
    trackResetOnLoad : true,
    c_id : 0,
    originalId : 0,
    title : __.album_editor,
    url : App.baseUrl,
    baseParams : {
        _m : 'Albums',
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
        if (config && config.c_id) {
            this.c_id = this.originalId = config.c_id;
        }
        this.id = 'albumseditor' + this.c_id;
        this.parentComponent = config.parentComponent;
        var me = this;
        this.items = [
            {
                xtype : 'responsivefieldset',
                responsiveCls : 'large-100 small-100',
                title : __.album_info,
                collapsible : true,
                collapsed : false,
                items : [{
                    xtype : 'hiddenfield',
                    name : 'c_id'
                }, {
                    xtype : 'textfield',
                    fieldLabel : __.name,
                    allowBlank : false,
                    name : 'c_title'
                }, {
                    xtype : 'textfield',
                    fieldLabel : __.slug,
                    allowBlank : false,
                    name : 'c_slug'
                }, {
                    xtype : 'wysiwygeditor',
                    fieldLabel : __.description,
                    height : 400,
                    name : 'c_description'
                }, {
                    xtype : 'enumtruefalsecombo',
                    fieldLabel : __.active,
                    hiddenName : 'c_active',
                    name : 'c_active'
                }]
            }, {
                xtype : 'responsivefieldset',
                responsiveCls : 'large-100 small-100',
                title : __.pictures,
                collapsible : true,
                collapsed : true,
                manageHeight : false,
                items : [
                    {
                        xtype : 'container',
                        anchor : '100%',
                        itemId : 'pictures',
                        items : []
                    }
                ],
                listeners : {
                    beforeexpand : function () {
                        if (me.getForm().isValid() && !me.c_id) {
                            me.getForm().submit({
                                success : function (form, action) {
                                    if (action.result.id) {
                                        me.c_id = action.result.id;
                                        form.findField('c_id').setValue(action.result.id);
                                        me.createPicsEditor();
                                    }
                                }
                            });
                        } else if (me.getForm().isValid()) {
                            me.createPicsEditor();
                        } else if (!me.getForm().isValid()) {
                            Ext.ux.Utils.alert(__.errors, __.pls_fix);
                            return false;
                        }
                    }
                }
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
                                if (!me.c_id && action.result.id) {
                                    form.findField('c_id').setValue(action.result.id);
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

    createPicsEditor : function () {
        var me = this;
        var editor = Ext.create('module.Pictures.ux.Grid', {
            id : 'pictures-grid-' + this.c_id,
            album_id : me.c_id,
            parentComponent : this
        });
        var containers = this.query('container[itemId=pictures]');
        if (containers.length) {
            containers[0].removeAll();
            containers[0].add(editor);
        }
    },

    closeContainer : function () {
        var grid = this.parentComponent;
        if (grid && (!parseInt(this.c_id) || this.getForm().isDirty())) {
            grid.getStore().load();
        }
        this.fireEvent('destroy', this);
    },

    destroyContainer : function () {
        Ext.ux.Utils.removeModulePanel('albums-panel-' + this.originalId);
    }
});
