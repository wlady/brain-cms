Ext.ns('App');
Ext.define('EmailFormsModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.EmailForms.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.EmailForms,
    stateful : true,
    stateId : 'EmailsGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns : [{
        header : __.formname,
        width : 150,
        sortable : true,
        dataIndex : 'f_name',
        filter : {
            type : 'string'
        }
    }, {
        header : __.subject,
        flex : 1,
        sortable : true,
        dataIndex : 'f_subject'
    }, {
        header : __.logging,
        sortable : true,
        dataIndex : 'f_logging',
        width : 100,
        editor : {
            xtype : 'enumtruefalsecombo'
        },
        filter : {
            type : 'boolean'
        }
    }, {
        header : __.active,
        sortable : true,
        dataIndex : 'f_active',
        width : 100,
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
                    _m : 'EmailForms',
                    _a : 'saveRow',
                    f_id : obj.record.data.f_id
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
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model : 'EmailFormsModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'EmailForms',
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
                text : __.sentemails,
                tooltip : __.sentemails_tt,
                iconCls : 'EmailLogs-icon',
                handler : function () {
                    Ext.ux.Utils.loadModulePanel('EmailLogs');
                }
            }, '-', {
                text : __.purge_state,
                tooltip : __.purge_state_tooltip,
                iconCls : 'ic-purge',
                handler : function () {
                    Ext.ux.Utils.purgeState('EmailsGridState');
                }
            }, '->', {
                text : __.settings,
                tooltip : __.module_settings,
                iconCls : 'ic-preferences',
                margin : '0 20 0 0',
                handler : function () {
                    if (rec = App.moduleRecords.findRecord('m_path', 'EmailForms')) {
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
                stateId : 'email_forms-grid'
            }],
            displayInfo : true
        }];
        this.callParent(arguments);
        this.selModel.on('selectionchange', this.onSelChange, this);
        this.on({
            itemdblclick : this.onItemDblClick,
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
        var id = !Ext.isEmpty(record) ? record.get('f_id') : 0;
        var frm = Ext.create('module.EmailForms.ux.Editor', {
            fid : id,
            parentComponent : this
        });
        Ext.ux.Utils.createModulePanel(
            {
                title : __.forms_editor,
                id : 'email_forms-panel-' + id,
                iconCls : 'EmailForms-icon',
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