Ext.ns('App');
Ext.require([
    'Ext.ux.form.field.EditorCombo',
    'Ext.ux.form.field.ThemeCombo',
    'Ext.ux.form.field.LayoutCombo',
    'Ext.ux.form.field.IconSizeCombo'
]);
Ext.define('module.Profile.ux.Editor', {
    extend: 'Ext.form.Panel',
    title: __.my_profile,
    url: App.baseUrl,
    baseParams: {
        _m: 'Profile'
    },
    layout: {
        type: 'responsivecolumn',
        states: {
            small: 800,
            large: 0
        }
    },
    initComponent: function () {
        var me = this;
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
                        name: 'current_user',
                        value: currentUser
                    }, {
                        xtype: 'hiddenfield',
                        name: 'user_type',
                        value: App.auth_type
                    }, {
                        xtype: 'textfield',
                        fieldLabel: __.name,
                        name: 'user_name'
                    }, {
                        xtype: 'textfield',
                        vtype: 'email',
                        fieldLabel: __.email,
                        name: 'user_email'
                    }, {
                        xtype: 'textfield',
                        fieldLabel: __.login,
                        name: 'user_login',
                        disabled: true
                    }, {
                        xtype: 'textfield',
                        inputType: 'password',
                        fieldLabel: __.password,
                        name: 'user_password'
                    }, {
                        xtype: 'commoncombo',
                        fieldLabel: __.user_group,
                        name: 'ug_id',
                        data: App.usersGroupsArray,
                        disabled: true
                    }, {
                        xtype: 'commoncombo',
                        fieldLabel: __.user_type,
                        name: 'user_type',
                        data: App.userTypes,
                        disabled: true
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
                        name: 'user_theme'
                    }, {
                        fieldLabel: __.layout,
                        xtype: 'layoutscombo',
                        name: 'user_layout',
                        hiddenName: 'user_layout',
                        hidden: true
                    }, {
                        fieldLabel: __.sel_editor,
                        xtype: 'editorcombo',
                        hiddenName: 'user_editor',
                        name: 'user_editor'
                    },{
                        fieldLabel: __.debug,
                        xtype: 'enumtruefalsecombo',
                        hiddenName: 'user_debug',
                        name: 'user_debug'
                    }, {
                        xtype: 'enumtruefalsecombo',
                        fieldLabel: __.is_active,
                        hiddenName: 'user_active',
                        name: 'user_active',
                        disabled: true
                    }]
            }
        ];
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
                    text: __.save_reload,
                    iconCls: 'ic-reload',
                    scope: this,
                    handler: function () {
                        var frm = this.getForm();
                        if (frm.isValid()) {
                            frm.submit({
                                params: {
                                    _a: 'saveRow'
                                },
                                success: function (form, action) {
                                    window.location = App.baseUrl;
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
                        me.fireEvent('destroy', me);
                    }
                }]
        }];
        this.callParent(arguments);
        this.on({
            destroy: this.destroyContainer,
            scope: this
        });
    },

    destroyContainer: function () {
        Ext.ux.Utils.removeModulePanel('Profile-panel');
        App.curTheme.setValue(tmpTheme);
    }
});
