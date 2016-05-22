Ext.ns('App');

Ext.define('SeoMetaDataFieldsModel', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        type: 'int'
    }, {
        name: 'f_xtype',
        type: 'string'
    }, {
        name: 'f_xname',
        type: 'string'
    }, {
        name: 'f_xlabel',
        type: 'string'
    }, {
        name: 'f_xorder',
        type: 'int'
    }, {
        name: 'custom',
        type: 'string'
    }]
});
Ext.define('module.SeoMetaDatasFields.ux.Grid', {
    extend: 'Ext.grid.Panel',
    title: __.SeoMetaDatasFields,
    minHeight: 200,
    stateful: true,
    stateId: 'SEOFieldsGridState',
    stateEvents: [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns: [
        {
            header: __.xlabel,
            flex: 1,
            dataIndex: 'f_xlabel',
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'textfield'
            }
        }, {
            header: __.xname,
            flex: 1,
            dataIndex: 'f_xname',
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'textfield',
                maskRe: /[0-9A-Za-z_\-]/,
                allowBlank: false
            }
        }, {
            header: __.xtype,
            flex: 1,
            dataIndex: 'f_xtype',
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'commoncombo',
                name: 'f_xtype',
                data: App.seoMetaDataFieldsArray
            },
            renderer: function (val) {
                var rec = App.seoMetaDataFieldsDS.getById(val);
                return rec ? rec.data.text : '';
            }
        }, {
            header: __.editable,
            width: 100,
            dataIndex: 'custom',
            menuDisabled: true,
            sortable: false
        }
    ],
    selModel:{
        mode: 'MULTI'
    },
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model: 'SeoMetaDataFieldsModel',
            proxy: new Ext.data.proxy.Ajax({
                url: App.baseUrl,
                extraParams: {
                    _m: 'SeoMetaDatasFields',
                    _a: 'getRows',
                    clear: 1, // get variable names as is (w/o "f_x" prefix)
                    sort: 'f_xorder'
                },
                reader: {
                    type: 'json',
                    rootProperty: 'rows',
                    totalProperty: 'results'
                },
                sortParam: 'sortBy'
            }),
            remoteSort: true
        });
        this.menu = Ext.create('Ext.menu.Menu', {
            items: [{
                text: __.edit_rec,
                iconCls: 'ic-edit',
                itemId: 'editMenuItem',
                handler: Ext.bind(this.onEditClick, this)
            }, {
                text: __.add_rec,
                iconCls: 'ic-add',
                handler: Ext.bind(this.onAddClick, this)
            }, {
                text: __.del_recs,
                iconCls: 'ic-del',
                handler: Ext.bind(this.onDelClick, this)
            }]
        });
        this.dockedItems = [{
            xtype: 'toolbar',
            itemId: 'tBar',
            layout: {
                overflowHandler: 'Menu'
            },
            items: [
                {
                    text: __.edit_rec,
                    tooltip: __.edit_rec_tooltip,
                    iconCls: 'ic-edit',
                    itemId: 'editBtn',
                    disabled: true,
                    handler: Ext.bind(this.onEditClick, this)
                }, '-', {
                    text: __.add_rec,
                    tooltip: __.add_rec_tooltip,
                    iconCls: 'ic-add',
                    handler: Ext.bind(this.onAddClick, this)
                }, '-', {
                    text: __.del_recs,
                    tooltip: __.del_recs_tooltip,
                    iconCls: 'ic-del',
                    itemId: 'delBtn',
                    disabled: true,
                    handler: Ext.bind(this.onDelClick, this)
                }, '-', {
                    text: __.purge_state,
                    tooltip: __.purge_state_tooltip,
                    iconCls: 'ic-purge',
                    handler: function () {
                        Ext.ux.Utils.purgeState('SEOFieldsGridState');
                    }
                }]
        }, {
            xtype: 'pagingtoolbar',
            store: this.store,
            dock: 'bottom',
            padding: '0 20 0 0',
            plugins: [{
                ptype: 'pagesize',
                stateful: true,
                stateId: 'seometadatas_fields-grid'
            }],
            displayInfo: true
        }];
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 0,
            listeners: {
                beforeedit: function(editor, context) {
                    if (context.record.get('custom')=='false') {
                        return false;
                    }
                },
                edit: function (editor) {
                    Ext.Ajax.request({
                        url: App.baseUrl,
                        params: {
                            _m: 'SeoMetaDatasFields',
                            _a: 'saveRec',
                            record: Ext.encode(editor.context.record.data)
                        },
                        success: function (response, request) {
                            if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                Ext.ux.Utils.ajaxResponseShowError(response);
                            }
                            editor.context.grid.getStore().reload();
                        },
                        failure: function () {
                            editor.context.grid.getStore().reload();
                        }
                    });
                },
                canceledit: function (editor) {
                    if (editor.context.record.data && !editor.context.record.data.id) {
                        editor.context.grid.getStore().remove(editor.context.record);
                    }
                    editor.context.grid.getView().refresh();
                }
            }
        });
        this.plugins = [
            this.rowEditor
        ];
        this.viewConfig = {
            plugins: {
                ptype: 'gridviewdragdrop',
                ddGroup: 'SEOFieldsDDGroup',
                enableDrop: true
            },
            listeners: {
                drop: function () {
                    var store = [];
                    me.getStore().each(function (rec) {
                        store.push(rec.get('id'));
                    });
                    var params = {
                        _m: 'SeoMetaDatasFields',
                        _a: 'reorder',
                        order: Ext.encode(store)
                    };
                    Ext.Ajax.request({
                        url: App.baseUrl,
                        params: params,
                        success: function (response, request) {
                            if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                Ext.ux.Utils.ajaxResponseShowError(response);
                            } else {
                                me.getStore().commitChanges();
                            }
                        }
                    });
                },
                scope: this
            }
        };
        this.callParent(arguments);
        this.on({
            viewready: this.onViewReady,
            itemcontextmenu: this.onItemContextClick,
            scope: this
        });
        this.selModel.on('selectionchange', this.onSelChange, this);
    },

    onViewReady: function (gridView) {
        var grid = gridView.initialConfig.grid;
        var els = Ext.ComponentQuery.query('combobox[ptype=pagesize]', grid);
        if (els.length) {
            els[0].loadStore(grid);
        } else {
            grid.store.load();
        }
    },

    onItemContextClick: function (view, record, node, index, e) {
        e.stopEvent();
        this.menu.showAt(e.getXY());
    },

    onDelClick: function () {
        Ext.ux.Utils.delRows(this);
    },

    onEditClick: function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec && rec.get('custom')=='false') {
            return false;
        }
        if (rec && rec[0]) {
            this.rowEditor.startEdit(rec[0], 0);
        }
    },

    onAddClick: function () {
        this.getDockedComponent('tBar').getComponent('delBtn').setDisabled(true);
        this.rowEditor.cancelEdit();
        this.store.insert(0, new SeoMetaDataFieldsModel({
            id: 0,
            f_xtype: 'textfield',
            f_xname: 'fieldId',
            f_xlabel: 'Field Label',
            custom: 'true'
        }));
        this.rowEditor.startEdit(0, 0);
    },

    onSelChange: function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('editBtn').setDisabled(sels.length != 1);
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        }
        this.menu.query("#editMenuItem")[0].setDisabled(sels.length != 1);
    }

});
