Ext.ns('App');
Ext.define('UsersModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.Users.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.Users,
    stateful : true,
    stateId : 'UsersGridState',
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
        dataIndex : 'user_name',
        filter : {
            type : 'string'
        }
    }, {
        header : __.login,
        sortable : true,
        flex : 1,
        dataIndex : 'user_login',
        filter : {
            type : 'string'
        }
    }, {
        header : __.email,
        sortable : true,
        flex : 1,
        dataIndex : 'user_email',
        filter : {
            type : 'string'
        }
    }, {
        header : __.is_active,
        sortable : true,
        dataIndex : 'user_active',
        width : 100,
        fixed : true,
        editor : {
            xtype : 'enumtruefalsecombo'
        },
        filter : {
            type : 'boolean'
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
                    _m : 'Users',
                    _a : 'saveRow',
                    user_id : obj.record.data.user_id,
                    user_type : obj.record.data.user_type,
                    user_active : obj.value
                };
                Ext.ux.Utils.runController(params, obj.record);
            }
        }
    }],
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        this.store = Ext.create('Ext.data.Store', {
            model : 'UsersModel',
            proxy : {
                type : 'ajax',
                url : App.baseUrl,
                extraParams : {
                    _m : 'Users',
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
                    Ext.ux.Utils.purgeState('UsersGridState');
                }
            }].concat(App.Users.whitelist ? [
                '-', {
                    text : __.users_whitelist,
                    tooltip : __.users_whitelist_tooltip,
                    iconCls : 'ic-whitelist',
                    handler : function () {
                        Ext.ux.Utils.loadModulePanel('UsersWhitelist');
                    }
                }
            ] : [])
        }, {
            xtype : 'pagingtoolbar',
            store : this.store,
            dock : 'bottom',
            padding : '0 20 0 0',
            plugins : [{
                ptype : 'pagesize',
                stateful : true,
                stateId : 'users-grid'
            }],
            displayInfo : true
        }];
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.on({
            viewready : this.onViewReady,
            itemdblclick : this.onItemDblClick,
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
        var id = !Ext.isEmpty(record) ? record.get('user_id') : 0;
        var userModules = !Ext.isEmpty(record) ? record.get('user_modules') : null;
        var frm = Ext.create('module.Users.ux.Editor', {
            user_id : id,
            modulesStore : Ext.decode(userModules),
            parentComponent : this
        });
        Ext.ux.Utils.createModulePanel(
            {
                title : __.user,
                id : 'users-panel-' + id,
                iconCls : 'Profile-icon',
                closable : true,
                autoScroll : true,
                items : frm
            },
            function () {
                if (!Ext.isEmpty(record)) {
                    record.set('user_password', '');
                    frm.loadRecord(record);
                }
            }
        );
    }
});
