/**
* Ext.ux.form.field.LayoutCombo
*
*  ExtJS 4 boolean chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.LayoutCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.layoutscombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: App.Vars.availableLayouts,
			triggerAction: 'all',
			queryMode: 'local',
			valueField: 'layout',
			forceSelection: true,
			editable: false,
			emptyText: __.select
		});
		this.callParent(arguments);
	},
	setValue:function(val) {
		this.callParent(arguments);
	}
});
