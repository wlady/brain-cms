Ext.define('Ext.ux.TreeState', {
	extend:'Ext.tree.Panel',
	alias: 'plugin.treestate',

	initComponent: function() {
		this.callParent(arguments);
	},

	init: function(tree) {
		this.tree = tree;
		this.stateName = this.tree.getStateId()+'Nodes';
		this.idField = this.idField || 'id';
		this.provider = Ext.state.Manager.getProvider();
		this.state = this.provider.get(this.stateName, []);
		this.tree.applyState = this.applyState;
		this.tree.saveState = this.saveState;
		this.tree.on({
			collapsenode: this.onCollapse,
			expandnode: this.onExpand,
			//load: this.applyState,
			scope: this
		});
	},
	
	getState: function () {
		var ids = [],
		me = this,
		state,
		store = me.tree.getStore(),
		node;
		if (me.stateName) {
			state = me.provider.get(me.stateName);
			if (state) {
				state = Ext.apply([], state);
				Ext.each(state, function (id) {
					node = store.getNodeById(id);
					if (node) {
						if (node.raw.id == 0) return;
						ids.push(node.raw.id);
					}
				});
			}
		}
		if (ids.length == 0) {
			ids = null;
		}
		return ids;
	},
	
	saveState : function(newState) {
		this.state = newState || this.state;
		this.provider.set(this.stateName, this.state);
	},
	
	applyState: function () {
		var me = this,
		state,
		store = me.tree.getStore(),
		node;
		if (me.stateName) {
			state = me.provider.get(me.stateName);
			if (state) {
				state = Ext.apply([], state);
				Ext.each(state, function (id) {
					node = store.getNodeById(id);
					if (node) {
						node.bubble(function (node) {
							node.expand();
						});
					}
				});
			}
		}
	},

	onExpand: function(node) {
		var index = this.state.indexOf(node.raw.id);
		if (index==-1) {
			this.state.push(node.raw.id);
			this.saveState();
		}
	},
	
	onCollapse: function(node) {
		var index = this.state.indexOf(node.raw.id);
		if (index!=-1) {
			delete this.state[node.raw.id];
		}
		this.saveState();
	}
	
});
