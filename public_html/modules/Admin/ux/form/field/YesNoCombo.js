/**
* Ext.ux.form.field.YesNoCombo
*
*  ExtJS 4 boolean chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.YesNoCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.yesnocombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: Ext.create('Ext.data.ArrayStore', {
				fields:
					['state', 'text'],
				data : [
					[true,       __.theyes],
					[false,      __.theno]
				]
			}),
			valueField: 'state',
			displayField: 'text',
			triggerAction: 'all',
			queryMode: 'local',
			forceSelection: true,
			editable: false,
			emptyText: __.select
		});
		this.callParent(arguments);
	}
});
