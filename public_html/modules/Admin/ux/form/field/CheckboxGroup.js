/**
* Ext.ux.form.field.CheckboxGroup
*
*   By wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.CheckboxGroup', {
	extend: 'Ext.form.FieldContainer',
	alias: ['widget.checkboxgroup'],
	items: [],
	delimiter: ',',
	data: [],
	constructor: function(config) {
		Ext.apply(this, config);
		this.items = this.build(this.data);
		this.callParent(arguments);
	},

	build: function(data) {
		var me = this, items = [], values = [];
		if (!Ext.isEmpty(this.value) && Ext.isString(this.value)) {
			values = this.value.split(this.delimiter);
		}
		Ext.each(data, function(item, key) {
			var el = {
				xtype: 'checkbox',
				baseCls: 'checkboxgroup-item',
				name: me.name+'['+item[0]+']',
				boxLabel: item[1],
				inputValue: item[0],
				checked: (values.indexOf(item[0])!=-1)
			};
			items.push(el);
		});
		return items;
	}

});
