Ext.define('Ext.ux.LoginWindow', {
    extend: 'Ext.window.Window',
    iconCls: 'ic-login',
    defaults: {
        buttonAlign: 'center',
        plain: true
    },
    constructor: function (config) {
        Ext.apply(this, config || {}, this.defaults);
        this.callParent(arguments);
        return this;
    },
    findFirst: function (item) {
        if (item instanceof Ext.form.Field && !item.hidden && !item.disabled) {
            item.focus(false, 50);
            return true;
        }
        if (item.items && item.items.find) {
            return item.items.findBy(this.findFirst, this);
        }
        return false;
    },
    focus: function () {
        this.items.findBy(this.findFirst, this);
    }
});
