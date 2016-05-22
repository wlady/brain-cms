Ext.ns('App');
Ext.define('RoutesModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.Routes.ux.Grid', {
    extend : 'Ext.grid.Panel',
    requires : ['module.SeoMetaDatas.ux.Grid'],
    title : __.Routes,
    stateful : true,
    stateId : 'RoutesGridState',
    stateEvents : ['columnhide', 'columnshow', 'columnresize', 'columnmove', 'sortchange'],
    columns : [{
        header : __.route,
        flex : 1,
        dataIndex : 'url',
        filter : {
            type : 'string'
        }
    }, {
        header : __.route_name,
        flex : 1,
        dataIndex : 'route',
        filter : {
            type : 'string'
        }
    }, {
        header : __.method,
        flex : 1,
        dataIndex : 'method',
        filter : {
            type : 'string'
        }
    }],
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
            model : 'RoutesModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'Routes',
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
                itemId : 'editMenuItem',
                handler : Ext.bind(this.onEditClick, this)
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
                text : __.purge_state,
                tooltip : __.purge_state_tooltip,
                iconCls : 'ic-purge',
                handler : function () {
                    Ext.ux.Utils.purgeState('RoutesGridState');
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
                stateId : 'Routes-grid'
            }],
            displayInfo : true
        }];
        this.callParent(arguments);
        this.on({
            viewready : this.onViewReady,
            itemdblclick : this.onItemDblClick,
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

    onItemDblClick : function (dataview, record, item, index, e) {
        this.createEditor(record);
    },

    onEditClick : function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec && rec[0]) {
            this.createEditor(rec[0]);
        }
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        tbar.getComponent('editBtn').setDisabled(sels.length != 1);
        this.menu.query("#editMenuItem")[0].setDisabled(sels.length != 1);
    },

    createEditor : function (record) {
        if (App.userModuleRecords.find('m_path', 'SeoMetaDatas') == -1) {
            return;
        }
        Ext.Ajax.request({
            url : App.baseUrl,
            params : {
                _m : 'SeoMetaDatas',
                _a : 'getRow',
                url : record.get('url')
            },
            success : function (response, request) {
                var json = Ext.decode(response.responseText);
                if (json.data) {
                    record = Ext.create('SeoMetaDatasModel', {
                        id : json.data.id,
                        url : json.data.url,
                        data : json.data.data
                    });
                } else {
                    record = Ext.create('SeoMetaDatasModel', {
                        id : 0,
                        url : record.get('url')
                    });
                }

                Ext.Ajax.request({
                    url : App.baseUrl,
                    params : {
                        _m : 'SeoMetaDatasFields',
                        _a : 'getRows',
                        f_xactive : 'true',
                        sort : 'f_xorder',
                        dir : 'asc'
                    },
                    success : function (response, request) {
                        var json = Ext.decode(response.responseText);
                        if (json.rows) {
                            var id = !Ext.isEmpty(record) ? record.get('id') : 0;
                            var frm = Ext.create('module.SeoMetaDatas.ux.Editor', {
                                fields : json.rows,
                                rec : record,
                                fid : id
                            });
                            Ext.ux.Utils.createModulePanel({
                                title : __.seometadatas_editor,
                                itemId : 'seometadatas_editor' + id,
                                iconCls : 'ic-edit',
                                closable : true,
                                autoScroll : true,
                                items : frm
                            }, function () {
                                if (!Ext.isEmpty(record)) {
                                    frm.loadRecord(record);
                                }
                            });
                        }
                    }
                });
            }
        });
    }
});
