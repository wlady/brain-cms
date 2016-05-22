Ext.ns('App');
Ext.define('AttachmentsModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.EmailAttachments.ux.Grid', {
    extend : 'Ext.grid.Panel',
    header : false,
    id : 'attachments-grid',
    form_id : 0,
    stateful : true,
    stateId : 'AttachmentsGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model : 'AttachmentsModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'EmailAttachments',
                    _a : 'getRows',
                    form_id : me.form_id
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
        this.columns = [{
            header : __.name,
            dataIndex : 'a_filename',
            menuDisabled : true,
            flex : 1
        }, {
            header : __.size,
            width : 100,
            menuDisabled : true,
            dataIndex : 'a_size'
        }];
        this.dockedItems = [{
            xtype : 'toolbar',
            itemId : 'tBar',
            layout : {
                overflowHandler : 'Menu'
            },
            items : [{
                text : __.browse,
                tooltip : __.browse,
                iconCls : 'ic-browse',
                handler : function () {
                    Ext.create('module.UserFiles.ux.Window', {
                        uploadPath : App.docsDir,
                        chroot : true,
                        singleSelect : false,
                        filters : [{
                            title : __.docs_files,
                            extensions : App.docsExtentions
                        }],
                        callback : function (selectedRows, path) {
                            var names = [];
                            Ext.each(selectedRows, function (row) {
                                if (row.data) {
                                    names.push(row.data.name);
                                }
                            });
                            Ext.Ajax.request({
                                url : App.baseUrl,
                                method : 'POST',
                                params : {
                                    _m : 'EmailAttachments',
                                    _a : 'addFile',
                                    folder : path,
                                    names : Ext.encode(names),
                                    form_id : me.form_id
                                },
                                success : function (response, request) {
                                    me.getStore().reload();
                                }
                            });
                        }
                    });
                }
            }, '-', {
                text : __.del_att,
                tooltip : __.del_att_tt,
                iconCls : 'ic-del',
                itemId : 'delBtn',
                disabled : true,
                handler : Ext.bind(this.onDelClick, this, [this], 2)
            }, '-', {
                text : __.purge_state,
                tooltip : __.purge_state_tooltip,
                iconCls : 'ic-purge',
                handler : function () {
                    Ext.ux.Utils.purgeState('AttachmentsGridState');
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
                stateId : 'attachments-grid'
            }],
            displayInfo : true
        }];
        this.callParent(arguments);
        this.selModel.on('selectionchange', this.onSelChange, this);
        this.on({
            viewready : this.onViewReady,
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

    onDelClick : function (btn, e, grid) {
        Ext.ux.Utils.delRows(grid);
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        }
    }
});
