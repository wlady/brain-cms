Ext.ns('App');
Ext.define('MailchimpModel', {
    extend : 'Ext.data.Model'
});
Ext.define('module.Mailchimp.ux.Lists', {
    extend : 'Ext.grid.Panel',
    title : __.Mailchimp,
    stateful : true,
    stateId : 'MailchimpListsGridState',
    stateEvents : ['columnhide', 'columnshow', 'columnresize', 'columnmove', 'sortchange'],
    columns : [{
        header : __.id,
        sortable : false,
        dataIndex : 'id',
        width : 150,
        filter : {
            type : 'string'
        }
    }, {
        header : __.name,
        flex : 1,
        sortable : false,
        dataIndex : 'name'
    }, {
        header : __.date_created,
        sortable : false,
        dataIndex : 'date_created',
        width : 200,
        renderer : Ext.util.Format.dateRenderer(__.revision_date_format)
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
            model : 'MailchimpModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'Mailchimp',
                    _a : 'getRows',
                    _t : 'list'
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
        this.dockedItems = [{
            xtype : 'toolbar',
            itemId : 'tBar',
            items : [{
                text : __.sync,
                tooltip : __.sync_tooltip,
                iconCls : 'ic-sync',
                itemId : 'syncBtn',
                disabled : true,
                handler : Ext.bind(this.onSyncClick, this)
            }, '->', {
                text : __.settings,
                tooltip : __.module_settings,
                iconCls : 'ic-preferences',
                margin : '0 20 0 0',
                handler : function () {
                    if (rec = App.moduleRecords.findRecord('m_path', 'Mailchimp')) {
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
                stateId : 'Mailchimp-lists'
            }],
            displayInfo : true
        }];
        this.viewConfig = {
            plugins : {
                ptype : 'gridviewdragdrop',
                ddGroup : 'MailchimpDDGroup',
                enableDrop : true
            },
            listeners : {
                render : Ext.bind(this.initDropZone, this)
            }
        };
        this.callParent(arguments);
        this.on({
            viewready : this.onViewReady,
            itemdblclick : this.onItemDblClick,
            scope : this
        });
        this.selModel.on('selectionchange', this.onSelChange, this);
    },

    initDropZone : function (v) {
        var me = this;
        this.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
            getTargetFromEvent : function (e) {
                return e.getTarget(me.getView().rowSelector);
            },
            onNodeEnter : function (target, dd, e, data) {
                Ext.fly(target).addCls('my-row-highlight-class');
            },
            onNodeOut : function (target, dd, e, data) {
                Ext.fly(target).removeCls('my-row-highlight-class');
            },
            onNodeDrop : function (target, dd, e, data) {
                e.stopEvent();
                var rowBody = Ext.fly(target).findParent('.x-grid-row', null, false);
                if (!rowBody) {
                    return false;
                }
                var h = v.getRecord(rowBody), targetEl = Ext.get(target);
                var storeArray = [];
                me.getStore().each(function (rec) {
                    storeArray.push(rec.get('id'));
                });
                var tmp = storeArray.splice(data.records[0].index, 1);
                storeArray.splice(h.index, 0, tmp.toString());
                var params = {
                    _m : 'Mailchimp',
                    _a : 'reorder',
                    order : Ext.encode(storeArray)
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

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        tbar.getComponent('syncBtn').setDisabled(sels.length == 0);
    },

    onSyncClick : function () {
        var ids = [];
        Ext.each(this.getSelectionModel().getSelection(), function (row) {
            ids.push(row.data['id']);
        });
        Ext.Ajax.request({
            url : App.baseUrl,
            params : {
                _m : 'Mailchimp',
                _a : 'sync',
                id : Ext.encode(ids)
            },
            success : function (response, request) {
                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                    Ext.ux.Utils.ajaxResponseShowError(response);
                } else {
                    var json = Ext.decode(response.responseText);
                    Ext.ux.Utils.info('Success', json.message);
                }
            }
        });
    },

    onItemDblClick : function (dataview, record, item, index, e) {
        this.editMembers(record);
    },

    editMembers : function (record) {
        var id = !Ext.isEmpty(record) ? record.get('id') : 0;
        var grid = Ext.create('module.Mailchimp.ux.Members', {
            list : id,
            parentComponent : this
        });
        Ext.ux.Utils.createModulePanel({
            title : 'Mailchimp "' + record.get('name') + '"',
            itemId : 'Mailchimp-members' + id,
            iconCls : 'Mailchimp-icon',
            closable : true,
            autoScroll : true,
            autoShow : true,
            autoDestroy : true,
            layout : 'card',
            items : grid
        });
    }
});
