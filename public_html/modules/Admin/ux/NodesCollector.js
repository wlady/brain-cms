/**
*  Ext.ux.NodesCollector
*
*  ExtJS 4 Tree Nodes Collector by wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.NodesCollector', {
	extend: 'Ext.tree.Panel',
	alias: 'plugin.nodescollector',

	initComponent: function() {
		this.callParent(arguments);
	},

	init: function(tree) {
		tree.getNodesCollection = this.collectNodes;
		tree.getOpenNodesCollection = this.collectOpenNodes;
	},

	collectNodes: function(rootNode) {
		if (Ext.isEmpty(rootNode)) {
			rootNode = this.getStore().getRootNode();
		}
		var result = {id: rootNode.data.id, checked: rootNode.data.checked};
		var children = rootNode.childNodes;
		var clen = children.length;
		if (clen != 0) {
			result.children = [];
			for (var i = 0; i < clen; i++){
				result.children.push(this.getNodesCollection(children[i]));
			}
		}
		return result;
	},

	collectOpenNodes: function(rootNode) {
		if (Ext.isEmpty(rootNode)) {
			rootNode = this.getStore().getRootNode();
		}
		var result = {id: rootNode.data.id, checked: rootNode.data.checked};
		if (rootNode.data.expanded) {
			var children = rootNode.childNodes;
			var clen = children.length;
			if (clen != 0) {
				result.children = [];
				for (var i = 0; i < clen; i++){
					result.children.push(this.getOpenNodesCollection(children[i]));
				}
			}
		}
		return result;
	}
});
