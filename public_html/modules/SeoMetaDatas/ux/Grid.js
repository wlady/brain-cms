Ext.ns('App');
/*
 * We will use this model in this grid and in Routers module grid.
 * We have to describe every field to manually create record of this type.
 */
Ext.define('SeoMetaDatasModel', {
    extend : 'Ext.data.Model',
    fields : [{
        name : 'id',
        type : 'int'
    }, {
        name : 'url',
        type : 'string'
    }, {
        name : 'data',
        type : 'auto'
    }]
});
Ext.define('module.SeoMetaDatas.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.SeoMetaDatas,
    stateful : true,
    stateId : 'seometadatasGridState',
    stateEvents : ['columnhide', 'columnshow', 'columnresize', 'columnmove', 'sortchange'],
    columns : [{
        header : __.url,
        dataIndex : 'url',
        flex : 1,
        filter : {
            type : 'string'
        }
    }, {
        header : __.title,
        dataIndex : 'data',
        sortable : false,
        flex : 1,
        renderer : function (value) {
            return value['f_xtitle'] ? value['f_xtitle'] : '';
        }
    }, {
        header : __.seo_protocol,
        dataIndex : 'data',
        sortable : false,
        width : 100,
        renderer : function (value) {
            return value['f_xprotocol'] ? value['f_xprotocol'].toUpperCase() : 'Any';
        }
    }, {
        header : __.seo_sitemap,
        dataIndex : 'data',
        sortable : false,
        width : 100,
        renderer : function (value) {
            return (!value['f_xsitemap'] || value['f_xsitemap'] == 'Select') ? '-' : value['f_xsitemap'];
        }
    }, {
        header : __.seo_cachecontrol,
        dataIndex : 'data',
        sortable : false,
        width : 100,
        renderer : function (value) {
            return (!value['f_xcachecontrol'] || value['f_xcachecontrol'] == 'Select') ? '-' : value['f_xcachecontrol'];
        }
    }, {
        header : __.seo_cachetime,
        dataIndex : 'data',
        sortable : false,
        width : 100,
        renderer : function (value) {
            return (!value['f_xcachetime'] || value['f_xcachetime'] == 'Select') ? '-' : value['f_xcachetime'];
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
            model : 'SeoMetaDatasModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'SeoMetaDatas',
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
            }, {
                text : __.add_rec,
                iconCls : 'ic-add',
                handler : Ext.bind(this.onAddClick, this)
            }, {
                text : __.copy_rec,
                iconCls : 'ic-copy',
                itemId : 'copyMenuItem',
                handler : Ext.bind(this.onCopyClick, this)
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
                text : __.copy_rec,
                tooltip : __.copy_rec_tooltip,
                iconCls : 'ic-copy',
                itemId : 'copyRecBtn',
                disabled : true,
                handler : Ext.bind(this.onCopyClick, this)
            }, '-', {
                text : __.del_recs,
                tooltip : __.del_recs_tooltip,
                iconCls : 'ic-del',
                itemId : 'delBtn',
                disabled : true,
                handler : Ext.bind(this.onDelClick, this)
            }, '-', {
                text : __.seo_fields,
                tooltip : __.seo_fields_tooltip,
                iconCls : 'SeoMetaDatas-icon',
                itemId : 'fieldsBtn',
                handler : function () {
                    Ext.ux.Utils.loadModulePanel('SeoMetaDatasFields');
                }
            }, '-', {
                text : __.purge_state,
                tooltip : __.purge_state_tooltip,
                iconCls : 'ic-purge',
                handler : function () {
                    Ext.ux.Utils.purgeState('seometadatasGridState');
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
                stateId : 'seometadatas-grid'
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
    onAddClick : function () {
        this.createEditor();
    },
    onCopyClick : function () {
        var rec = this.getSelectionModel().getLastSelected();
        var me = this;
        Ext.Ajax.request({
            url : App.baseUrl,
            params : {
                _m : 'SeoMetaDatas',
                _a : 'copy',
                id : rec.get('id')
            },
            success : function (response, request) {
                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                    Ext.ux.Utils.ajaxResponseShowError(response);
                } else {
                    me.store.load();
                }
            }
        });
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
        tbar.getComponent('editBtn').setDisabled(sels.length != 1);
        tbar.getComponent('copyRecBtn').setDisabled(sels.length != 1);
        tbar.getComponent('fieldsBtn').setDisabled(sels.length != 0);
        tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        this.menu.query("#editMenuItem")[0].setDisabled(sels.length != 1);
        this.menu.query("#copyMenuItem")[0].setDisabled(sels.length != 1);
    },
    createEditor : function (record) {
        var me = this;
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
                        fid : id,
                        parentComponent : me
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
