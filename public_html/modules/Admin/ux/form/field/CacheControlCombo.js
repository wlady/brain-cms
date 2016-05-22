/**
* Ext.ux.form.field.CacheControlCombo
*
*  ExtJS 4 cache time chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.CacheControlCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.cachecontrolcombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: Ext.create('Ext.data.ArrayStore', {
				fields:
					['time', 'text'],
				data : [
					['private',           'Private w/ Expires'],
					['private_no_expire', 'Private w/o Expire'],
					['public',            'Public w/o Expires'],
					['nocache',           'Prevent Caching']
				]
			}),
			valueField: 'time',
			queryMode: 'local',
			forceSelection: true,
			editable: false,
			emptyText: __.select
		});
		this.callParent(arguments);
	}
});

