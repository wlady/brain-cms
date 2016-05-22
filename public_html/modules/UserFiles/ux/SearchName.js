/**
 *  module.UserFiles.ux.SearchName
 *
 *  ExtJS 4 google map search by address field by wlady2001 at gmail dot com
 *
 */
Ext.define('module.UserFiles.ux.SearchName', {
    extend: 'Ext.form.field.Trigger',

    alias: 'widget.userfilessearchname',

    trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

    trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger',

    initComponent: function (config) {
        var me = this;
        Ext.apply(me, config);
        me.callParent(arguments);
        me.on('specialkey', function (f, e) {
            if (e.getKey() == e.ENTER) {
                me.onTrigger2Click();
            }
        });
    },

    afterRender: function () {
        this.callParent();
        this.triggerCell.item(0).setDisplayed(false);
    },

    onTrigger1Click: function () {
        var me = this;
        me.setValue('');
        me.handler();
        me.triggerCell.item(0).setDisplayed(false);
        me.updateLayout();
        me.fireEvent('afterclear', me);
    },

    onTrigger2Click: function () {
        var me = this,
            value = me.getValue();
        me.handler();
        me.triggerCell.item(0).setDisplayed(true);
        me.updateLayout();
    }

});
