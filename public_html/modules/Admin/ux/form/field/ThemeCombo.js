/**
* Ext.ux.form.field.ThemeCombo
*
*  ExtJS 4 theme chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.ThemeCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.themecombo'],
	themeVar: 'theme',
	initComponent: function() {
		Ext.apply(this, {
			store: App.Vars.availableThemes,
			valueField: 'id',
			triggerAction:'all',
			queryMode: 'local',
			forceSelection: true,
			editable: false,
			listeners: {
				scope: this,
				select: function(el, val) {
					this.setValue(val.get('id'));
				}
			}
		});
		this.callParent(arguments);
	},
	setValue: function(val) {
		var rec = App.Vars.availableThemes.getById(val);
		if (typeof rec == 'undefined' || !rec || typeof val == 'undefined' || !val) {
			return;
		}
		this.callParent(arguments);
	}
});
