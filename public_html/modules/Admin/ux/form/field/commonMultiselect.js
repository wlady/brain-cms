/**
* Ext.ux.form.field.commonMultiselect
*
*   By wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.commonMultiselect', {
	extend: 'Ext.ux.form.MultiSelect',
	alias: ['widget.commonmultiselect'],
	beforeBodyEl: __.multiselect_toolip,
	constructor: function(config) {
		this.localStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id',  'text'],
			data: config.data
		});
		if (!Ext.isEmpty(config.name)) {
			this.hiddenName = config.name;
		}
		Ext.apply( this, config, {
			store: this.localStore,
			valueField: 'id',
			value: [],
			renderer: this.localRenderer
		});
		this.callParent(arguments);
	},
	localRenderer: function(val) {
		var rec = this.localStore.getById(val);
		return rec ? rec.data.text : '';
	}
});
