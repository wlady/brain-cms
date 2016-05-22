/**
* Ext.ux.form.field.ProtocolCombo
*
*  ExtJS 4 protocol chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.ProtocolCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.protocolcombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: Ext.create('Ext.data.ArrayStore', {
				fields:
					['protocol', 'text'],
				data : [
					['', 'Any'],
					['http', 'HTTP'],
					['https', 'HTTPS']
				]
			}),
			queryMode: 'local',
			valueField: 'protocol',
			forceSelection: true,
			editable: false
		});
		this.callParent(arguments);
	}
});
