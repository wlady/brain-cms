Ext.ns('App');
Ext.define('LibraryModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.Library.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.Library,
    stateful : true,
    stateId : 'LibGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns : [{
        header : __.name,
        sortable : true,
        flex : 1,
        dataIndex : 'title',
        filter : {
            type : 'string'
        }
    }, {
        header : __.is_active,
        sortable : true,
        dataIndex : 'active',
        width : 100,
        fixed : true,
        filter : {
            type : 'boolean'
        },
        editor : {
            xtype : 'enumtruefalsecombo'
        }
    }],
    plugins : [{
        ptype : 'gridfilters'
    }, {
        ptype : 'cellediting',
        clicksToEdit : 1,
        listeners : {
            edit : function (e, obj) {
                if (obj.value == obj.originalValue) {
                    return;
                }
                var params = {
                    _m : 'Library',
                    _a : 'saveRow',
                    id : obj.record.data.id,
                    active : obj.value
                };
                Ext.ux.Utils.runController(params, obj.record, this.reloadArticlesDS);
            }
        }
    }],
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        this.store = Ext.create('Ext.data.Store', {
            model : 'LibraryModel',
            proxy : {
                type : 'ajax',
                url : App.baseUrl,
                extraParams : {
                    _m : 'Library',
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
                    Ext.ux.Utils.purgeState('LibGridState');
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
                stateId : 'library-grid'
            }],
            displayInfo : true
        }];
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.on({
            itemdblclick : this.onItemDblClick,
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

    onAddClick : function () {
        this.createEditor();
    },

    onItemDblClick : function (dataview, record, item, index, e) {
        this.createEditor(record);
    },

    onDelClick : function () {
        Ext.ux.Utils.delRows(this);
    },

    onEditClick : function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec && rec[0]) {
            this.createEditor(rec[0]);
        }
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('editBtn').setDisabled(sels.length != 1);
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        }
        this.menu.query("#editMenuItem")[0].setDisabled(sels.length != 1);
    },

    createEditor : function (record) {
        var id = !Ext.isEmpty(record) ? record.get('id') : 0;
        var frm = Ext.create('module.Library.ux.Editor', {
            fid : id,
            parentComponent : this
        });
        Ext.ux.Utils.createModulePanel(
            {
                title : __.library_editor,
                id : 'library-panel-' + id,
                iconCls : 'Library-icon',
                closable : true,
                autoScroll : true,
                items : frm
            },
            function () {
                if (!Ext.isEmpty(record)) {
                    frm.loadRecord(record);
                }
            }
        );
    },

    reloadAll : function () {
        this.getStore().reload();
        this.reloadArticlesDS();
    },

    reloadArticlesDS : function () {
        Ext.Ajax.request({
            url : App.baseUrl,
            params : {
                _m : 'Library',
                _a : 'reload'
            },
            success : function (response, request) {
                if (!Ext.ux.Utils.ajaxResponseHasError(response)) {
                    var json = Ext.decode(response.responseText);
                    if (Ext.isArray(json.ds)) {
                        _libraryDocsArray = json.ds;
                        Ext.StoreMgr.lookup('_libraryDocsID').loadData(_libraryDocsArray);
                    }
                }
            },
            failure : function (result, request) {
            }
        });
    }
});
