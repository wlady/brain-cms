/**
 * @class Ext.ux.grid.feature.Tileview
 * @extends Ext.grid.feature.Feature
 *
 * @author Harald Hanek (c) 2011-2012
 * @license http://harrydeluxe.mit-license.org
 */
Ext.define('Ext.ux.grid.feature.Tileview', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.tileview',
    metaTableTplOrig: null, // stores the original template
    viewMode: null,
    viewTpls: {},
    tableTpls: {},

    init: function(grid) {

        var me = this,
            view = me.view;

        me.metaTableTplOrig = me.view.tableTpl;
        view.tileViewFeature = me;

        Ext.Object.each(this.viewTpls, function(key, rowTpl) {
            view.addRowTpl(new Ext.XTemplate(rowTpl));
        })


        me.callParent(arguments);
    },

    getColumnValues: function(columns, record) {
        var columnValues = {};
        Ext.each(columns, function(column) {
            var key = column.dataIndex,
                value = record.data[column.dataIndex];

            columnValues[key] = value;
        });
        return columnValues;
    },

    getRowBody: function(values, viewMode)
    {
        if(this.viewTpls[viewMode])
        {
            return this.viewTpls[viewMode];
        }
    },

    setView: function(mode)
    {
        var me = this;

        if(me.viewMode != mode)
        {
            me.viewMode = mode;
            if (mode!='default') {
                me.view.addTableTpl(new Ext.XTemplate(me.tableTpl))
            } else {
                me.view.addTableTpl(me.metaTableTplOrig)
            }
            me.view.refresh();
         }
    }
});