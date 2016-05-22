/**
* Ext.ux.form.field.IconSizeCombo
*
*  ExtJS 4 icon size chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.IconSizeCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.iconsizecombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: App.Vars.availableIcons,
			triggerAction: 'all',
			queryMode: 'local',
			valueField: 'size',
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
