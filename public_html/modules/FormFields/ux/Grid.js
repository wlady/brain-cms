Ext.ns('App');
Ext.define('module.FormFields.ux.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.formfieldsvalidators',
    header: false,
    minHeight: 200,
    originalId: 0,
    formId: 0,
    stateful: true,
    stateId: 'FFieldsGridState',
    stateEvents: [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    columns: [
        {
            header: __.fname,
            flex: 1,
            dataIndex: 'fname',
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'textfield',
                allowBlank: false
            }
        }, {
            header: __.fdefault,
            flex: 1,
            dataIndex: 'fdefault',
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'textfield'
            }
        }, {
            header: __.ftype,
            width: 200,
            dataIndex: 'ftype',
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'combobox',
                name: 'ftype',
                hiddenName: 'ftype',
                typeAhead: true,
                triggerAction: 'all',
                store: App.Forms.ftypesDS,
                displayField: 'text',
                valueField: 'id',
                editable: false,
                forceSelection: true,
                queryMode: 'local'
            },
            renderer: function (val) {
                var rec = App.Forms.ftypesDS.getById(val);
                return rec ? rec.data.text : '';
            }
        }, {
            header: __.fempty,
            dataIndex: 'fempty',
            align: 'center',
            width: 100,
            menuDisabled: true,
            sortable: false,
            editor: {
                xtype: 'enumtruefalsecombo'
            }
        }
    ],
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model: 'FormFieldsModel',
            proxy: new Ext.data.proxy.Ajax({
                url: App.baseUrl,
                extraParams: {
                    _m: 'FormFields',
                    _a: 'getRows',
                    fform: me.formId
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
                    text: __.fparser,
                    tooltip: __.fparser_tooltip,
                    iconCls: 'ic-fparser',
                    handler: Ext.bind(this.onParserClick, this)
                }, '-', {
                    text: __.purge_state,
                    tooltip: __.purge_state_tooltip,
                    iconCls: 'ic-purge',
                    handler: function () {
                        Ext.ux.Utils.purgeState('FFieldsGridState');
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
                stateId: 'form_fields-grid'
            }],
            displayInfo: true
        }];
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 0,
            listeners: {
                edit: function (editor) {
                    Ext.Ajax.request({
                        url: App.baseUrl,
                        params: {
                            _m: 'FormFields',
                            _a: 'saveRec',
                            record: Ext.encode(editor.context.record.data)
                        },
                        success: function (response, request) {
                            if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                Ext.ux.Utils.ajaxResponseShowError(response);
                            } else {
                                editor.context.grid.getStore().commitChanges();
                            }
                            editor.context.grid.getView().refresh();
                        },
                        failure: function () {
                            editor.context.grid.getStore().reload();
                        }
                    });
                },
                canceledit: function (editor) {
                    if (editor.context.record.data && !editor.context.record.data.fid) {
                        editor.context.grid.getStore().remove(editor.context.record);
                    }
                    editor.context.grid.getView().refresh();
                }
            }
        });
        this.plugins = [
            this.rowEditor
        ];
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
        if (rec && rec[0]) {
            this.rowEditor.startEdit(rec[0], 0);
        }
    },

    onAddClick: function () {
        var rec = Ext.create('FormFieldsModel', {
            fid: 0,
            fform: this.formId,
            ftype: 'text',
            fname: 'fieldId',
            fdefault: '',
            fempty: true
        });
        this.getDockedComponent('tBar').getComponent('delBtn').setDisabled(true);
        this.rowEditor.cancelEdit();
        this.store.insert(0, rec);
        this.getView().refresh();
        this.rowEditor.startEdit(0, 0);
    },

    onSelChange: function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('editBtn').setDisabled(sels.length != 1);
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
        }
    },

    setForm: function (id) {
        this.formId = id;
        this.getStore().getProxy().setExtraParam('fform', id);
    },

    reloadForm: function (id) {
        this.setForm(id);
        this.getStore().load();
    },

    onParserClick: function () {
        var frms = Ext.ComponentQuery.query('formseditor[fid=' + this.formId + ']');
        if (frms.length) {
            var frm = frms[0].getForm();
            if (frm.isDirty() && frm.isValid()) {
                frm.submit({
                    success: Ext.bind(this.doParse, this)
                });
            } else if (frm.isValid()) {
                this.doParse();
            } else {
                Ext.ux.Utils.alert(__.errors, __.pls_fix);
            }
        }
    },

    doParse: function () {
        var me = this;
        Ext.Ajax.request({
            url: App.baseUrl,
            params: {
                _m: 'Forms',
                _a: 'parse',
                id: me.formId
            },
            success: function (response, request) {
                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                    Ext.ux.Utils.ajaxResponseShowError(response);
                } else {
                    var json = Ext.decode(response.responseText);
                    function saveParsed(btn) {
                        if (btn == 'yes') {
                            Ext.Ajax.request({
                                url: App.baseUrl,
                                params: {
                                    _m: 'Forms',
                                    _a: 'saveParsed',
                                    id: me.formId
                                },
                                success: function (response, request) {
                                    if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                        Ext.ux.Utils.ajaxResponseShowError(response);
                                    }  else {
                                        me.getStore().load();
                                    }
                                }
                            });
                        }
                    }
                    Ext.MessageBox.confirm(__.message, Ext.String.format(__.fparser_found, json.results), saveParsed);
                }
            }
        });
    }

});
