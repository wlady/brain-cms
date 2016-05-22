/**
* Ext.ux.form.field.OutputImageFormatCombo
*
*  ExtJS 4 output image format chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.OutputImageFormatCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.outputimageformatcombo'],
	localStore: Ext.create('Ext.data.ArrayStore', {
		fields:
			['id',    'text'],
		data : [
			['jpeg', 'JPEG'],
			['png',  'PNG']
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
