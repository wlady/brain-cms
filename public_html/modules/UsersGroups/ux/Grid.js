Ext.ns('App');
Ext.define('UsersGroupsModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.UsersGroups.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.UsersGroups,
    stateful : true,
    stateId : 'UGroupsGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns : [{
        header : __.groupname,
        sortable : true,
        dataIndex : 'user_group',
        filter : {
            type : 'string'
        },
        flex : 1,
        editor : {
            xtype : 'textfield',
            allowBlank : false
        }
    }, {
        header : __.grouplevel,
        sortable : true,
        width : 100,
        fixed : true,
        dataIndex : 'user_level',
        filter : {
            type : 'string'
        },
        editor : {
            xtype : 'numberfield',
            minValue : 0,
            maxValue : 1000,
            allowBlank : false
        }
    }, {
        header : __.is_active,
        sortable : true,
        dataIndex : 'group_active',
        filter : {
            type : 'boolean'
        },
        width : 100,
        fixed : true,
        renderer : function (v) {
            return Ext.String.format('<img src="/modules/Admin/img/{0}.png" alt="{0}" border="0" />', v.toLowerCase());
        },
        editor : {
            xtype : 'enumtruefalsecombo'
        }
    }],
    constructor : function (config) {
        this.store = Ext.create('Ext.data.Store', {
            model : 'UsersGroupsModel',
            proxy : {
                type : 'ajax',
                url : App.baseUrl,
                extraParams : {
                    _m : 'UsersGroups',
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
                    Ext.ux.Utils.purgeState('UGroupsGridState');
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
                stateId : 'user_group-grid'
            }],
            displayInfo : true
        }];
        this.ugrpRowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor : 0,
            listeners : {
                edit : function (editor) {
                    Ext.ux.Utils.runController(
                        params = {
                            _m : 'UsersGroups',
                            _a : 'saveRec',
                            record : Ext.encode(editor.context.record.data)
                        },
                        record = null,
                        callback = function () {
                            editor.context.grid.getStore().reload();
                        }
                    );
                },
                canceledit : function (editor) {
                    if (editor.context.record.data && !editor.context.record.data.group_id) {
                        editor.context.grid.getStore().remove(editor.context.record);
                    }
                    editor.context.grid.getView().refresh();
                }
            }
        });
        this.plugins = [{
            ptype : 'gridfilters'
        },
            this.ugrpRowEditor
        ];
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.selModel.on('selectionchange', this.onSelChange, this);
        this.on({
            viewready : this.onViewReady,
            itemcontextmenu : this.onItemContextClick,
            scope : this
        });
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

    onDelClick : function () {
        Ext.ux.Utils.delRows(this);
    },

    onEditClick : function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec && rec[0]) {
            this.ugrpRowEditor.startEdit(rec[0], 0);
        }
    },

    onAddClick : function () {
        var rec = Ext.create('UsersGroupsModel', {
            group_id : 0,
            user_group : 'New Group',
            user_level : 0,
            group_active : true
        });
        this.getDockedComponent('tBar').getComponent('delBtn').setDisabled(true);
        this.ugrpRowEditor.cancelEdit();
        this.store.insert(0, rec);
        this.getView().refresh();
        this.ugrpRowEditor.startEdit(0, 0);
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('editBtn').setDisabled(sels.length != 1);
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        }
    }
});
