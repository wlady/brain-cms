Ext.ns('App');
Ext.define('UrlmapsModel', {
    extend : 'Ext.data.Model',
    fields : [{
        name : 'id',
        type : 'int'
    }, {
        name : 'old_url',
        type : 'string'
    }, {
        name : 'new_url',
        type : 'string'
    }]
});
Ext.define('module.UrlMaps.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.UrlMaps,
    stateful : true,
    stateId : 'UrlmapsGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    plugins : [{
        ptype : 'gridfilters'
    }],
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model : 'UrlmapsModel',
            proxy : {
                type : 'ajax',
                url : App.baseUrl,
                extraParams : {
                    _m : 'UrlMaps',
                    _a : 'getRows'
                },
                reader : {
                    type : 'json',
                    rootProperty : 'rows',
                    totalProperty : 'results'
                },
                sortParam : 'sortBy'
            },
            remoteSort : true
        });
        this.menu = Ext.create('Ext.menu.Menu', {
            items : [{
                text : __.edit_rec,
                iconCls : 'ic-edit',
                itemId : 'editMenuItem',
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
                    Ext.ux.Utils.purgeState('UrlmapsGridState');
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
                stateId : 'urlmaps-grid'
            }],
            displayInfo : true
        }];
        this.columns = [{
            header : __.oldurl,
            flex : 1,
            dataIndex : 'old_url',
            filter : {
                type : 'string'
            },
            editor : {
                xtype : 'textfield',
                allowBlank : false,
                value : __.oldurl
            }
        }, {
            header : __.newurl,
            dataIndex : 'new_url',
            flex : 1,
            filter : {
                type : 'string'
            },
            editor : {
                xtype : 'textfield',
                allowBlank : false,
                value : __.newurl
            }
        }];
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor : 0,
            listeners : {
                edit : function (editor) {
                    Ext.ux.Utils.runController(
                        params = {
                            _m : 'UrlMaps',
                            _a : 'saveRec',
                            record : Ext.encode(editor.context.record.data)
                        },
                        record = null,
                        callback = function () {
                            editor.context.grid.getStore().reload();
                        }
                    );
                },
                cancelEdit : function (editor) {
                    // Canceling editing of a locally added, unsaved record: remove it
                    if (editor.context.record.data && !editor.context.record.data.id) {
                        editor.context.grid.getStore().remove(editor.context.record);
                    }
                    editor.context.grid.getView().refresh();
                }
            }
        });
        this.plugins = [
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

    onViewReady : function (gridView) {
        var grid = gridView.initialConfig.grid;
        var els = Ext.ComponentQuery.query('combobox[ptype=pagesize]', grid);
        if (els.length) {
            els[0].loadStore(grid);
        } else {
            grid.store.load();
        }
    },

    onItemContextClick : function (view, record, node, index, e) {
        e.stopEvent();
        this.menu.showAt(e.getXY());
    },

    onEditClick : function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec && rec[0]) {
            this.rowEditor.startEdit(rec[0], 0);
        }
    },

    onAddClick : function () {
        this.getDockedComponent('tBar').getComponent('delBtn').setDisabled(true);
        this.rowEditor.cancelEdit();
        this.store.insert(0, new UrlmapsModel({
            id : 0,
            old_url : '/',
            new_url : '/'
        }));
        this.rowEditor.startEdit(0, 0);
    },

    onDelClick : function () {
        Ext.ux.Utils.delRows(this);
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('editBtn').setDisabled(sels.length != 1);
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        }
        this.menu.query("#editMenuItem")[0].setDisabled(sels.length != 1);
    }
});
