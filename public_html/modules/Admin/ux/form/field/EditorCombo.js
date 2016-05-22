/**
* Ext.ux.form.field.EditorCombo
*
*  ExtJS 4 editor chooser by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.EditorCombo', {
	extend: 'Ext.form.ComboBox',
	alias: ['widget.editorcombo'],
	editorVar: 'htmleditor',
	initComponent: function() {
		Ext.apply(this, {
			store: App.Vars.availableEditors,
			triggerAction: 'all',
			queryMode: 'local',
			valueField: 'id',
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
		var rec = App.Vars.availableEditors.getById(val);
		if (typeof rec == 'undefined' || !rec || typeof val == 'undefined' || !val) {
			return;
		}
		this.callParent(arguments);
		if (Ext.state.Manager.getProvider()) {
			Ext.state.Manager.set(this.editorVar, val);
		}
	}
});

