/**
* Ext.ux.form.field.EnumTrueFalseCombo
*
*  ExtJS 4 boolean chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.EnumTrueFalseCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.enumtruefalsecombo'],
	localStore: Ext.create('Ext.data.ArrayStore', {
		fields:
			['id',    'text'],
		data : [
			['true',  __.thetrue],
			['false', __.thefalse]
		]
	}),
	initComponent:function() {
		Ext.apply( this, {
			store: this.localStore,
			valueField: 'id',
			displayField: 'text',
			triggerAction: 'all',
			queryMode: 'local',
			forceSelection:true,
			editable: false,
			emptyText: __.select,
			renderer: this.localRenderer
		});
		this.callParent(arguments);
	},
	localRenderer: function(val) {
		var rec = this.localStore.getById(val);
		return rec ? rec.data.text : '';
	}
});
