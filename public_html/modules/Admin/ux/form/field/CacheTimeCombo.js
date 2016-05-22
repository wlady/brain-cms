/**
* Ext.ux.form.field.CacheTimeCombo
*
*  ExtJS 4 cache time chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.CacheTimeCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.cachetimecombo'],
	initComponent: function() {
		Ext.apply(this, {
			store: Ext.create('Ext.data.ArrayStore', {
				fields:
					['time', 'text'],
				data : [
					['5',     '5  '+__.mins],
					['10',    '10 '+__.mins],
					['15',    '15 '+__.mins],
					['30',    '30 '+__.mins],
					['60',    '1  '+__.hrs],
					['120',   '2  '+__.hrs],
					['180',   '3  '+__.hrs],
					['240',   '4  '+__.hrs],
					['300',   '5  '+__.hrs],
					['360',   '6  '+__.hrs],
					['420',   '7  '+__.hrs],
					['480',   '8  '+__.hrs],
					['540',   '9  '+__.hrs],
					['600',   '10 '+__.hrs],
					['660',   '11 '+__.hrs],
					['720',   '12 '+__.hrs],
					['1440',  '1  '+__.days],
					['2880',  '2  '+__.days],
					['4320',  '3  '+__.days],
					['5760',  '4  '+__.days],
					['7209',  '5  '+__.days],
					['8640',  '6  '+__.days],
					['10080', '1  '+__.weeks],
					['20160', '2  '+__.weeks],
					['30240', '3  '+__.weeks],
					['40320', '1  '+__.months],
					['86400', '2  '+__.months],
					['129600','3  '+__.months]
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

