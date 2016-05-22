Ext.ns('App');
Ext.define('UsersWhitelistModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.UsersWhitelist.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.UsersWhitelist,
    stateful : true,
    stateId : 'UsersWhitelistGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns : [{
        header : __.u_login,
        dataIndex : 'u_login',
        flex : 1,
        filter : {
            type : 'string'
        },
        editor : {
            xtype : 'textfield',
            allowBlank : true
        }
    }, {
        header : __.u_type,
        dataIndex : 'u_type',
        filter : {
            type : 'string'
        },
        editor : {
            xtype : 'combo',
            editable : false,
            store : Ext.create('Ext.data.ArrayStore', {
                fields : ['type', 'title'],
                data : App.userTypes
            }),
            displayField : 'title',
            valueField : 'type'
        }
    }
    ],
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model : 'UsersWhitelistModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'UsersWhitelist',
                    _a : 'getRows'
                },
                reader : {
                    type : 'json',
                    rootProperty : 'rows',
                    totalProperty : 'results'
                },
                sortParam : 'sortBy'
            }),
            remoteSort : true
        });
        this.menu = Ext.create('Ext.menu.Menu', {
            items : [{
                text : __.edit_rec,
                iconCls : 'ic-edit',
                handler : Ext.bind(this.onEditClick, this)
            }, {
                text : __.add_rec,
                iconCls : 'ic-add',
                handler : Ext.bind(this.onAddClick, this)
            }, {
                text : __.del_recs,
                iconCls : 'ic-del',
                handler : Ext.bind(this.onDelClick, this)
            }]
        });
        this.dockedItems = [{
            xtype : 'toolbar',
            itemId : 'tBar',
            layout : {
                overflowHandler : 'Menu'
            },
            items : [{
                text : __.edit_rec,
                tooltip : __.edit_rec_tooltip,
                iconCls : 'ic-edit',
                itemId : 'editBtn',
                disabled : true,
                handler : Ext.bind(this.onEditClick, this)
            }, '-', {
                text : __.add_rec,
                tooltip : __.add_rec_tooltip,
                iconCls : 'ic-add',
                handler : Ext.bind(this.onAddClick, this)
            }, '-', {
                text : __.del_recs,
                tooltip : __.del_recs_tooltip,
                iconCls : 'ic-del',
                itemId : 'delBtn',
                disabled : true,
                handler : Ext.bind(this.onDelClick, this)
            }, '-', {
                text : __.purge_state,
                tooltip : __.purge_state_tooltip,
                iconCls : 'ic-purge',
                handler : function () {
                    Ext.ux.Utils.purgeState('UsersWhitelistGridState');
                }
            }]
        }, {
            xtype : 'pagingtoolbar',
            store : this.store,
            dock : 'bottom',
            padding : '0 20 0 0',
            plugins : [{
                ptype : 'pagesize',
                stateful : true,
                stateId : 'UsersWhitelist-grid'
            }],
            displayInfo : true
        }];
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            listeners : {
                edit : function (editor) {
                    Ext.ux.Utils.runController(
                        params = Ext.merge(editor.context.record.data, {
                            _m : 'UsersWhitelist',
                            _a : 'saveRow',
                        }),
                        record = null,
                        callback = function () {
                            editor.context.grid.getStore().reload();
                        }
                    )
                },
                canceledit : function (editor) {
                    if (editor.context.record.data && !editor.context.record.data.id) {
                        editor.context.grid.getStore().remove(editor.context.record);
                    }
                    editor.context.grid.getView().refresh();
                }
            }
        });
        this.plugins = [{
            ptype : 'gridfilters'
        },
            this.rowEditor
        ];
        this.callParent(arguments);
        this.on({
            viewready : this.onViewReady,
            itemcontextmenu : this.onItemContextClick,
            scope : this
        });
        this.selModel.on('selectionchange', this.onSelChange, this);
    },

    onItemContextClick : function (view, record, node, index, e) {
        e.stopEvent();
        this.menu.showAt(e.getXY());
    },

    onViewReady : function (gridView) {
        var grid = gridView.initialConfig.grid;
        var els = Ext.ComponentQuery.query('combobox[ptype=pagesize]', grid);
        if (els.length) {
            els[0].loadStore(grid);
        } else {
            grid.store.load();
        }
    },

    onAddClick : function () {
        this.rowEditor.cancelEdit();
        this.store.insert(0, {
            id : 0,
            u_type : 'Users'
        });
        this.getView().refresh();
        this.rowEditor.startEdit(0, 0);
    },

    onItemDblClick : function (dataview, record, item, index, e) {
        this.rowEditor.startEdit(record, 0);
    },

    onDelClick : function () {
        Ext.ux.Utils.delRows(this);
    },

    onEditClick : function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec && rec[0]) {
            this.rowEditor.startEdit(rec[0], 0);
        }
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        tbar.getComponent('editBtn').setDisabled(sels.length != 1);
        tbar.getComponent('delBtn').setDisabled(sels.length == 0);
    }
});
