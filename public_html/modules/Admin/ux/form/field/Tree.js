Ext.ns('App');
Ext.define('Ext.ux.form.field.Tree', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.treefield',
	matchFieldWidth: false,
	//trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
	//triggerClass : 'sites_pages',
	constructor : function(config) {
		Ext.apply(this, config || {});
		this.callParent(arguments);
	}

});
