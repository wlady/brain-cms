/**
* Ext.ux.form.field.commonCombo
*
*   By wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.commonCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.commoncombo'],
	constructor: function(config) {
		this.localStore = Ext.create('Ext.data.ArrayStore', {
			fields: ['id',         'text'],
			data: config.data
		});
		if (!Ext.isEmpty(config.name)) {
			this.hiddenName = config.name;
		}
		Ext.apply( this, config, {
			store: this.localStore,
			valueField: 'id',
			displayField: 'text',
			triggerAction: 'all',
			queryMode: 'local',
			forceSelection: true,
			editable: false,
			value: '',
			renderer: this.localRenderer
		});
		this.callParent(arguments);
	},
	localRenderer: function(val) {
		var rec = this.localStore.getById(val);
		return rec ? rec.data.text : '';
	}
});
