/**
 *  module.GoogleMaps.ux.MapSearchAddress
 *
 *  ExtJS 4 google map search by address field by wlady2001 at gmail dot com
 *
 */
Ext.define('module.GoogleMaps.ux.MapSearchAddress', {
    extend: 'Ext.form.field.Trigger',

    alias: 'widget.mapsearchaddress',

    trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

    trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger',

    hasSearch: false,

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

        if (me.hasSearch) {
            me.setValue('');
            me.hasSearch = false;
            me.triggerCell.item(0).setDisplayed(false);
            me.updateLayout();
        }
    },

    onTrigger2Click: function () {
        var me = this,
            value = me.getValue();

        if (value.length > 0) {
            me.handler();
            me.hasSearch = true;
            me.triggerCell.item(0).setDisplayed(true);
            me.updateLayout();
        }
    }
});
