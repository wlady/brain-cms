/**
* Ext.ux.form.field.TrueFalseCombo
*
*  ExtJS 4 boolean chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.TrueFalseCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.truefalsecombo'],
	localStore: Ext.create('Ext.data.ArrayStore', {
		fields:
			['id',    'text'],
		data : [
			[true,  __.thetrue],
			[false, __.thefalse]
		]
	}),
	initComponent:function() {
		Ext.apply( this, {
			store: this.localStore,
			triggerAction: 'all',
			queryMode: 'local',
			valueField: 'id',
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
