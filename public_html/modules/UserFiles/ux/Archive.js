Ext.ns('App');
Ext.define('module.UserFiles.ux.Archive', {
    extend: 'Ext.tree.Panel',
    uses: [
        'module.UserFiles.ux.ArchiveModel'
    ],
    alias: 'widget.userfilesarchive',
    id: 'userfilesarchive',
    header: false,
    border: false,
    rootVisible: false,
    useArrows: true,
    fileName: '',
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.TreeStore', {
            model: 'module.UserFiles.ux.ArchiveModel',
            proxy: {
                type: 'ajax',
                url: App.baseUrl,
                extraParams: {
                    _m: 'UserFiles',
                    _a: 'archiveList',
                    path: this.fileName
                }
            },
            autoLoad: true
        });
        this.columns = {
            defaults: {
                menuDisabled: true,
                sortable: false
            },
            items: [
                {
                    xtype: 'treecolumn',
                    header: __.filename,
                    flex: 1,
                    dataIndex: 'name'
                }, {
                    header: __.size,
                    width: 200,
                    dataIndex: 'size',
                    renderer: function (value, metaData, record) {
                        if (record.get('dir')) {
                            return '';
                        } else {
                            return Ext.util.Format.fileSize(record.get('size'));
                        }
                    }
                }
            ]
        };
        this.callParent(arguments);
    }

});
