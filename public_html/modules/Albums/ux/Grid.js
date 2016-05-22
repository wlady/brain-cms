Ext.ns('App');
Ext.define('AlbumsModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.Albums.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.albums,
    stateful : true,
    stateId : 'AlbumsGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
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
                    _m : 'Albums',
                    _a : 'saveRow',
                    c_id : obj.record.data.c_id
                };
                params[obj.field] = obj.value;
                Ext.ux.Utils.runController(params, obj.record);
            }
        }
    }],
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        var me = this;
        var enableDND = !Ext.isEmpty(App.Albums.enableDND);
        var params = {
            _m : 'Albums',
            _a : 'getRows'
        };
        if (enableDND) {
            params.sortBy = Ext.encode([{
                property : 'c_order',
                direction : 'ASC'
            }]);
            this.viewConfig = {
                plugins : {
                    ptype : 'gridviewdragdrop',
                    ddGroup : 'albumsDDGroup',
                    enableDrop : true
                },
                listeners : {
                    drop : function () {
                        var store = [];
                        me.getStore().each(function (rec) {
                            store.push(rec.get('c_id'));
                        });
                        var params = {
                            _m : 'Albums',
                            _a : 'reorder',
                            order : Ext.encode(store)
                        };
                        Ext.Ajax.request({
                            url : App.baseUrl,
                            params : params,
                            success : function (response, request) {
                                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                    Ext.ux.Utils.ajaxResponseShowError(response);
                                } else {
                                    me.getStore().load();
                                }
                            }
                        });
                    }
                }
            };
        } else {
            params.sortBy = Ext.encode([{
                property : 'c_title',
                direction : 'ASC'
            }]);
        }
        this.store = Ext.create('Ext.data.Store', {
            model : 'AlbumsModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : params,
                reader : {
                    type : 'json',
                    rootProperty : 'rows',
                    totalProperty : 'results',
                    messageProperty : 'message'
                },
                sortParam : 'sortBy'
            }),
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
                    Ext.ux.Utils.purgeState('AlbumsGridState');
                }
            }, '->', {
                text : __.settings,
                tooltip : __.module_settings,
                iconCls : 'ic-preferences',
                margin : '0 20 0 0',
                handler : function () {
                    if (rec = App.moduleRecords.findRecord('m_path', 'Albums')) {
                        Ext.create('module.Modules.ux.About', {
                            record : rec
                        });
                    }
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
                stateId : 'albums-grid'
            }],
            displayInfo : true
        }];
        this.columns = [{
            header : __.title,
            sortable : !enableDND,
            flex : 1,
            dataIndex : 'c_title',
            filter : {
                type : 'string'
            }
        }, {
            header : __.pictures,
            sortable : !enableDND,
            dataIndex : 'cnt',
            width : 150,
            fixed : true,
            align : 'center',
            filter : {
                type : 'numeric'
            }
        }, {
            header : __.is_active,
            sortable : !enableDND,
            dataIndex : 'c_active',
            width : 100,
            fixed : true,
            editor : {
                xtype : 'enumtruefalsecombo'
            },
            filter : {
                type : 'boolean'
            }
        }];
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.on({
            itemdblclick : this.onItemDblClick,
            viewready : this.onViewReady,
            itemcontextmenu : this.onItemContextClick,
            scope : this
        });
        if (enableDND) {
            this.headerCt.on('headerclick', function () {
                Ext.ux.Utils.popup(__.clickheader, __.whynotsort);
                return false;
            }, this);
        }
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
        var id = !Ext.isEmpty(record) ? record.get('c_id') : 0;
        var frm = Ext.create('module.Albums.ux.Editor', {
            c_id : id,
            parentComponent : this
        });
        Ext.ux.Utils.createModulePanel(
            {
                title : __.album_editor,
                id : 'albums-panel-' + id,
                iconCls : 'Albums-icon',
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
    }
});
