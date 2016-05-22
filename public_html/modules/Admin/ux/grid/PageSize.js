/**
* Ext.ux.grid.PageSize
*/
Ext.define('Ext.ux.grid.PageSize', {
	extend      : 'Ext.form.field.ComboBox',
	alias       : 'plugin.pagesize',
	beforeText  : 'Show',
	afterText   : 'rows/page',
	queryMode   : 'local',
	displayField: 'text',
	valueField  : 'value',
	allowBlank  : false,
	editable    : false,
	triggerAction: 'all',
	width       : 70,
	maskRe      : /[0-9]/,
	stateful    : false,
	stateId     : undefined,
	stateEvents : ['select'],
	value       : 20,
	/**
	* initialize the paging combo after the pagebar is rendered
	*/
	init: function(paging) {
		paging.on('afterrender', this.onInitView, this);
	},
	/**
	* create a local store for availabe range of pages
	*/
	store: new Ext.data.ArrayStore({
		fields: ['text', 'value'],
		data: [[5,5], [10,10], [15,15], [20,20], [25,25], [30,30], [50,50], [75,75], [100,100], [200,200], [500,500]]
	}),
	/**
	* assing the select and specialkey events for the combobox
	* after the pagebar is rendered.
	*/
	onInitView: function(paging) {
		paging.add('-', this.beforeText, this, this.afterText);
		this.on('select', this.onPageSizeChanged, paging);
		this.on('specialkey', function(combo, e) {
			if (13 === e.getKey()) {
				this.onPageSizeChanged.call(paging, this);
			}
		});
	},
	/**
	* refresh the page when the value is changed
	*/
	onPageSizeChanged: function(combo) {
		this.store.pageSize = parseInt(combo.getRawValue(), 10);
		this.store.loadPage(1);
	},

	loadStore: function(grid) {
		grid.store.pageSize = parseInt(this.getRawValue(), 10);
		grid.store.loadPage(1);
	},

	getState: function() {
		return { v: this.getValue() };
	},

	applyState: function(state) {
		this.callParent(arguments);
		this.setValue(state.v);
	}

});
