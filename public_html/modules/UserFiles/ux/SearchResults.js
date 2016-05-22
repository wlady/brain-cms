Ext.ns('App');
Ext.define('module.UserFiles.ux.SearchResults', {
    extend: 'Ext.grid.Panel',
    uses: [
        'module.UserFiles.ux.FilesModel'
    ],
    alias: 'widget.userfilessearchresults',
    id: 'userfilessearchresults',
    header: false,
    border: false,
    autoRender: true,
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.selModel = Ext.create('Ext.selection.RowModel', {
            mode: 'SINGLE',
            enableKeyNav: false
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'module.UserFiles.ux.FilesModel',
            proxy: {
                type: 'ajax',
                url: App.baseUrl,
                extraParams: {
                    _m: 'UserFiles',
                    _a: 'searchFiles'
                },
                reader: {
                    keepRawData: true,
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total'
                },
                sortParam: 'sortBy'
            },
            remoteSort: true,
            autoLoad: false,
            listeners: {
                datachanged: function (ds, eOpts) {
                    Ext.getCmp('userfilessearchpanel').setTitle(__.searchresults + ': ' + ds.getProxy().getReader().rawData.total);
                }
            }
        });
        this.columns = {
            defaults: {
                menuDisabled: true,
                sortable: false
            },
            items: [
                {
                    header: __.filename,
                    width: 200,
                    dataIndex: 'name'
                }, {
                    header: __.path,
                    flex: 1,
                    dataIndex: 'option'
                }, {
                    header: __.date,
                    dataIndex: 'lastmod',
                    width: 150,
                    renderer: Ext.util.Format.dateRenderer(__.revision_date_format)
                }, {
                    header: __.size,
                    width: 100,
                    dataIndex: 'size',
                    renderer: function (value, metaData, record) {
                        return Ext.util.Format.fileSize(record.get('size'));
                    }
                }
            ]
        };
        this.callParent(arguments);
        this.on({
            itemdblclick: this.onItemDblClick,
            scope: this
        });
    },

    search: function (value) {
        this.store.proxy.extraParams.search = value;
        this.store.load();
    },

    onItemDblClick: function (dataview, record, item, index, e) {
        var panel = Ext.getCmp('userfilessearchpanel');
        panel.collapse();
        var tree = Ext.getCmp('userfilestree');
        if (tree) {
            var node = tree.getRootNode().findChild('id', record.get('url'), true);
            if (Ext.isEmpty(node)) {
                // try the root
                node = tree.getRootNode();
            }
            if (node) {
                tree.getSelectionModel().select(node);
                function expandParent(node) {
                    if (node.parentNode && !Ext.isEmpty(node.parentNode.parentNode)) {
                        node.parentNode.expand(true);
                        return expandParent(node.parentNode);
                    }
                    return false;
                }

                expandParent(node);
                var obj = Ext.getCmp('userfilesgrid');
                if (obj) {
                    obj.currentPath = record.get('url');
                    obj.reloadGrid(
                        function (records, operation, success) {
                            var rec = Ext.Array.findBy(records, function (item) {
                                return item.data.path == record.get('path');
                            });
                            obj.selModel.select(rec);
                            obj.onItemClick(obj, rec);
                        }
                    );
                }
            }
        }
    }
});
