/**
* Ext.ux.form.field.BooleanCombo
*
*  ExtJS 4 boolean chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.BooleanCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.booleancombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: Ext.create('Ext.data.ArrayStore', {
				fields: ['id', 'text'],
				data : [
					[1,       __.theyes],
					[0,       __.theno]
				]
			}),
			queryMode: 'local',
			valueField: 'id',
			forceSelection: true,
			editable: false,
			emptyText: __.select
		});
		this.callParent(arguments);
	},
	setValue: function(val) {
		this.callParent(arguments);
	}
});
