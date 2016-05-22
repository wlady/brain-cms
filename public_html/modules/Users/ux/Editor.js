Ext.ns('App');
Ext.require([
    'Ext.ux.form.field.EditorCombo',
    'Ext.ux.form.field.ThemeCombo',
    'Ext.ux.form.field.LayoutCombo',
    'Ext.ux.form.field.IconSizeCombo'
]);
Ext.define('module.Users.ux.Editor', {
    extend: 'Ext.form.Panel',
    originalId: 0,
    fid: 0,
    trackResetOnLoad: true,
    title: __.users_editor,
    url: App.baseUrl,
    baseParams: {
        _m: 'Users',
        _a: 'saveRow'
    },
    loadMask: true,
    layout: {
        type: 'responsivecolumn',
        states: {
            small: 800,
            large: 0
        }
    },
    modulesStore: null,
    constructor: function (config) {
        if (config && config.user_id) {
            this.originalId = this.fid = config.user_id;
        }
        var me = this;
        this.parentComponent = config.parentComponent;
        this.tmpTheme = App.curTheme.getValue();
        this.items = [
            {
                xtype: 'responsivefieldset',
                responsiveCls: 'large-50 small-100',
                title: __.user_info,
                items: [
                    {
                        xtype: 'hiddenfield',
                        name: 'user_id'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'user_login'
                    }, {
                        xtype: 'hiddenfield',
                        name: 'user_type'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: __.name,
                        name: 'user_name',
                        allowBlank: false
                    }, {
                        xtype: 'textfield',
                        vtype: 'email',
                        fieldLabel: __.email,
                        name: 'user_email'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: __.login,
                        name: 'user_login',
                        disabled: me.fid != 0
                    }, {
                        xtype: 'textfield',
                        inputType: 'password',
                        fieldLabel: __.password,
                        name: 'user_password'
                    }, {
                        xtype: 'commoncombo',
                        fieldLabel: __.user_group,
                        name: 'ug_id',
                        data: App.usersGroups2Array,
                        value: App.usersGroups2Array[0][0]
                    }, {
                        xtype: 'commoncombo',
                        fieldLabel: __.user_type,
                        name: 'user_type',
                        data: App.userTypes,
                        disabled: me.fid != 0,
                        value: App.userTypes[0][0]
                    }]
            }, {
                xtype: 'responsivefieldset',
                responsiveCls: 'large-50 small-100',
                title: __.user_settings,
                items: [
                    {
                        fieldLabel: __.sel_theme,
                        xtype: 'themecombo',
                        hiddenName: 'user_theme',
                        name: 'user_theme',
                        value: App.Vars.availableThemes.getAt(0).getData().id
                    }, {
                        fieldLabel: __.sel_editor,
                        xtype: 'editorcombo',
                        hiddenName: 'user_editor',
                        name: 'user_editor',
                        value: App.Vars.availableEditors.getAt(0).getData().id
                    }, {
                        fieldLabel: __.debug,
                        xtype: 'enumtruefalsecombo',
                        hiddenName: 'user_debug',
                        name: 'user_debug',
                        value: 'false'
                    }, {
                        xtype: 'enumtruefalsecombo',
                        fieldLabel: __.is_active,
                        hiddenName: 'user_active',
                        name: 'user_active',
                        value: 'false'
                    }]
            }, {
                xtype: 'panel',
                title: __.usermodules,
                responsiveCls: 'large-100 small-100',
                minHeight: 300,
                autoScroll: true,
                margin: 5,
                tbar: [
                    {
                        text: __.select_all,
                        iconCls: 'ic-checked',
                        handler: Ext.bind(this.checkAll, this)
                    }, '-', {
                        text: __.deselect_all,
                        iconCls: 'ic-unchecked',
                        handler: Ext.bind(this.uncheckAll, this)
                    }],
                itemId: 'user_modules',
                items: Ext.create('Ext.view.View', {
                    store: App.userModuleRecords,
                    tpl: [
                        '<tpl for=".">',
                        '<div class="umodule">',
                        '<input type="checkbox" name="{m_id}" class="umod" <tpl if="checked == true">checked="checked"</tpl> />',
                        '<span class="{iconPath}-icon menu-size"></span>',
                        '<span>{m_name}</span>',
                        '</div>',
                        '</tpl>'
                    ],
                    itemSelector: 'div.umodule',
                    prepareData: function (data) {
                        var checked = (me.modulesStore && !Ext.isEmpty(me.modulesStore[data.m_path]));
                        Ext.apply(data, {
                            checked: checked
                        });
                        return data;
                    }
                })
            }];
        this.dockedItems = [{
            xtype: 'toolbar',
            ui: 'footer',
            dock: 'bottom',
            padding: '20 0 20 0',
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
                                params: {
                                    assigned: this.getAssigned()
                                },
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
                                params: {
                                    assigned: this.getAssigned()
                                },
                                success: function (form, action) {
                                    if (!me.fid && action.result.id) {
                                        form.findField('user_id').setValue(action.result.id);
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
        this.fireEvent('destroy', this);
    },

    destroyContainer: function () {
        var grid = this.parentComponent;
        if (grid) {
            // always reload store !!!
            grid.getStore().load();
        }
        Ext.ux.Utils.removeModulePanel('users-panel-' + this.originalId);
        App.curTheme.setValue(this.tmpTheme);
    },

    checkAll: function () {
        var els = this.query('panel[itemId=user_modules]')[0].getEl().query('input.umod[type=checkbox]');
        Ext.each(els, function (item) {
            item.checked = true;
        });
    },

    uncheckAll: function () {
        var els = this.query('panel[itemId=user_modules]')[0].getEl().query('input.umod[type=checkbox]');
        Ext.each(els, function (item) {
            item.checked = false;
        });
    },

    getAssigned: function () {
        var p = [];
        var cb = Ext.query('input.umod[type=checkbox]');
        if (cb && cb.length) {
            Ext.each(cb, function (item) {
                p.push([item.name, item.checked]);
            });
        }
        return Ext.encode(p);
    }

});
