Ext.ns('App');
Ext.define('MailchimpMemberModel', {
    extend : 'Ext.data.Model',
    idProperty : 'email'
});
Ext.define('module.Mailchimp.ux.Members', {
    extend : 'Ext.grid.Panel',
    title : __.Mailchimp,
    stateful : true,
    stateId : 'MailchimpMembersGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns : [{
        header : __.id,
        hidden : true,
        sortable : false,
        dataIndex : 'id'
    }, {
        header : __.member,
        sortable : false,
        dataIndex : 'member',
        width : 150
    }, {
        header : __.email,
        flex : 1,
        sortable : true,
        dataIndex : 'email',
        filter : {
            type : 'string'
        }
    }, {
        header : __.firstname,
        flex : 1,
        sortable : true,
        dataIndex : 'firstname',
        filter : {
            type : 'string'
        }
    }, {
        header : __.lastname,
        flex : 1,
        sortable : true,
        dataIndex : 'lastname',
        filter : {
            type : 'string'
        }
    }, {
        header : __.status,
        sortable : false,
        dataIndex : 'status',
        filter : {
            type : 'list',
            options : [
                ['subscribed', 'Subscribed'],
                ['unsubscribed', 'Unsubscribed'],
                ['cleaned', 'Cleaned']
            ],
            phpMode : true
        }
    }, {
        header : __.date_created,
        sortable : true,
        dataIndex : 'created',
        width : 200,
        renderer : Ext.util.Format.dateRenderer(__.revision_date_format),
        filter : {
            type : 'date'
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
            model : 'MailchimpMemberModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'Mailchimp',
                    _a : 'getRows',
                    _t : 'members',
                    list : this.list
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
            items : [{
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
                    Ext.ux.Utils.purgeState('MailchimpMembersGridState');
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
                stateId : 'Mailchimp-grid'
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
            itemcontextmenu : this.onItemContextClick,
            scope : this
        });
        this.selModel.on('selectionchange', this.onSelChange, this);
    },

    onItemContextClick : function (view, record, node, index, e) {
        e.stopEvent();
        this.menu.showAt(e.getXY());
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

    onAddClick : function () {
        this.addMember(this.list);
    },

    onDelClick : function () {
        var grid = this;

        function delRec(btn) {
            var reader = grid.getStore().getProxy().getReader(),
                id = reader.idProperty ? reader.idProperty : (reader.metaData ? reader.metaData.id : reader.id);
            if (id && btn == 'yes') {
                var ids = [];
                Ext.each(grid.getSelectionModel().getSelection(), function (row) {
                    ids.push(row.data[id]);
                });
                var module = grid.getStore().module;
                if (typeof module == 'undefined') {
                    module = grid.getStore().getProxy().extraParams._m;
                }
                Ext.Ajax.request({
                    url : App.baseUrl,
                    params : {
                        _m : module,
                        _a : 'delRow',
                        id : Ext.encode(ids),
                        list : grid.list
                    },
                    success : function (response, request) {
                        if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                            Ext.ux.Utils.ajaxResponseShowError(response);
                        } else {
                            grid.getStore().load();
                        }
                    }
                });
            }
        }

        if (grid.getSelectionModel().getSelection().length > 0) {
            Ext.MessageBox.confirm(__.message, __.del_selection_question, delRec);
        } else {
            Ext.ux.Utils.alert(__.error_msg, __.select_recs);
        }
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        tbar.getComponent('delBtn').setDisabled(sels.length == 0);
    },

    addMember : function (list) {
        var form = Ext.create('Ext.Window', {
            title : 'Add New Member',
            width : 400,
            height : 200,
            layout : 'fit',
            items : [{
                xtype : 'form',
                bodyPadding : 5,
                items : [{
                    xtype : 'textfield',
                    name : 'email',
                    fieldLabel : 'Email',
                    allowBlank : false,
                    vtype : 'email'
                }, {
                    xtype : 'textfield',
                    name : 'MERGE1',
                    fieldLabel : 'First Name'
                }, {
                    xtype : 'textfield',
                    name : 'MERGE2',
                    fieldLabel : 'Last Name'
                }]
            }
            ],
            buttons : [
                {
                    xtype : 'button',
                    text : 'Save',
                    itemId : 'save',
                    iconCls : 'ic-save',
                    handler : function () {

                        var params = {
                            _m : 'Mailchimp',
                            _a : 'saveRow',
                            list : list
                        };
                        Ext.apply(params, form.down('form').getForm().getValues());

                        if (params.email) {
                            Ext.Ajax.request({
                                url : App.baseUrl,
                                params : params,
                                success : function (response, request) {
                                    if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                        Ext.ux.Utils.ajaxResponseShowError(response);
                                    } else {
                                        var json = Ext.decode(response.responseText);
                                        form.close();
                                        Ext.ux.Utils.info('Success', json.message);
                                    }
                                }
                            });
                        }
                    }
                }, {
                    xtype : 'button',
                    text : 'Cancel',
                    itemId : 'cancel',
                    iconCls : 'ic-cancel',
                    handler : function () {
                        form.close();
                    }
                }
            ]
        }).show();
    }
});
