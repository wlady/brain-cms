Ext.ns('App');
Ext.define('Ext.ux.ReloginForm', {
    uses: [
        'Ext.form.Panel',
        'Ext.ux.LoginWindow'
    ],
    constructor: function () {
        this.callParent(arguments);
        return this;
    },
    run: function () {
        me = this;
        frm = Ext.create('Ext.form.Panel', {
            baseCls: 'x-plain',
            url: App.baseUrl,
            baseParams: {
                _m: 'Auth',
                _a: 'auth'
            },
            bodyStyle: 'padding:5px 35px;',
            defaultType: 'textfield',
            region: 'south',
            layout: 'form',
            frame: false,
            labelWidth: 100,
            autoHeight: true,
            defaults: {
                xtype: 'textfield',
                width: 300
            },
            items: [
                {
                    xtype: 'hidden',
                    name: 'login',
                    value: currentUser
                }, {
                    fieldLabel: __.username,
                    disabled: true,
                    name: 'user',
                    value: currentUser
                }, {
                    fieldLabel: __.password,
                    inputType: 'password',
                    name: 'password',
                    enableKeyEvents: true,
                    listeners: {
                        render: function () {
                            this.capsWarningTooltip = null;
                        },
                        keypress: {
                            fn: function (field, e) {
                                var charCode = e.getCharCode();
                                if (charCode == Ext.EventObject.ENTER) {
                                    doSubmit();
                                } else if ((e.shiftKey && charCode >= 97 && charCode <= 122) ||
                                    (!e.shiftKey && charCode >= 65 && charCode <= 90)) {
                                    if (Ext.isEmpty(field.capsWarningTooltip)) {
                                        field.capsWarningTooltip = Ext.create('Ext.tip.ToolTip', {
                                            target: 'password',
                                            anchor: 'top',
                                            width: 305,
                                            cls: 'ux-auth-warning',
                                            html: '<div>' + __.caps_warning + '</div>'
                                        });
                                    }
                                    field.capsWarningTooltip.show();
                                } else {
                                    if (!Ext.isEmpty(field.capsWarningTooltip) && field.capsWarningTooltip.hidden == false) {
                                        field.capsWarningTooltip.hide();
                                    }
                                }
                            },
                            scope: this
                        },
                        blur: function (field) {
                            if (!Ext.isEmpty(this.capsWarningTooltip) && this.capsWarningTooltip.hidden == false) {
                                this.capsWarningTooltip.hide();
                            }
                        }
                    }
                }]
        });
        function Success(f, a) {
            if (a && a.result) {
                me.win.destroy();
                runner.start(task);
            } else {
                Ext.ux.Utils.alert(__.error_msg, __.register_err);
            }
        }

        function Failure() {
            me.win.destroy();
            runner.start(task);
        }

        function doSubmit() {
            frm.submit({
                waitMsg: __.loading,
                waitTitle: __.wait,
                reset: true,
                success: Success,
                failure: Failure,
                scope: me
            });
        }

        me.win = Ext.create('Ext.ux.LoginWindow', {
            title: __.relogin_form,
            modal: true,
            resizable: false,
            width: 400,
            items: [
                frm
            ],
            buttons: [{
                handler: doSubmit,
                iconCls: 'ic-btn-login',
                text: __.enter
            }],
            listeners: {
                close: function (p) {
                    me.win.destroy();
                    window.location = App.baseUrl;
                }
            }
        });
        Ext.Ajax.request({
            url: App.baseUrl,
            params: {
                _m: 'Auth',
                _a: 'isAuth'
            },
            success: function (response, request) {
                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                    runner.stop(task);
                    me.win.show().focus();
                } else {
                    var json = Ext.decode(response.responseText);
                    if (json.finished) {
                        Ext.ux.Utils.popup(__.info_msg, __.taskfinished);
                    }
                }
            },
            failure: function (result, request) {
                runner.stop(task);
                me.win.show();
            }
        });
    }
});
