Ext.ns('App');

App.email_logs_template = [
    '<div class="eml-header">',
    '<dt>Date:</dt><b>{fl_date}</b><br />',
    '<dt>From:</dt><b>{fl_address_from}</b><br />',
    '<dt>To:</dt><b>{fl_address_to}</b><br />',
    '<dt>Subject:</dt><b>{fl_subject}</b><br />',
    '</div><div class="eml-body">{fl_message}</div>'
];

Ext.require([
    'Ext.ux.RowExpander'
]);

Ext.define('EmailLogsModel', {
    extend : 'Ext.data.Model'
});

Ext.define('module.EmailLogs.ux.Grid', {
    extend : 'Ext.grid.Panel',
    alias : 'widget.emaillogs',
    title : __.EmailLogs,
    stateful : true,
    stateId : 'EmailLogsGridState',
    stateEvents : [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    animCollapse : false,
    selModel : {
        mode : 'MULTI'
    },
    constructor : function (config) {
        Ext.apply(this, config || {});
        this.store = Ext.create('Ext.data.Store', {
            model : 'EmailLogsModel',
            proxy : new Ext.data.proxy.Ajax({
                url : App.baseUrl,
                extraParams : {
                    _m : 'EmailLogs',
                    _a : 'getRows'
                },
                reader : {
                    type : 'json',
                    rootProperty : 'rows',
                    totalProperty : 'results'
                },
                sortParam : 'sortBy'
            }),
            remoteSort : true,
            sorters : {
                property : 'fl_date',
                direction : 'DESC'
            }
        });
        this.columns = [{
            header : __.form,
            dataIndex : 'form_id',
            sortable : true,
            flex : 1,
            renderer : function (val) {
                var rec = Ext.StoreMgr.lookup('App.emailformsID').getById(val);
                return rec ? (rec.data.text ? rec.data.text : '') : '';
            },
            filter : {
                type : 'list',
                options : App.emailformsArray,
                phpMode : true
            }
        }, {
            header : __.date,
            width : 200,
            sortable : true,
            dataIndex : 'fl_date',
            renderer : Ext.util.Format.dateRenderer(__.revision_date_format),
            filter : {
                type : 'date',
                dateFormat : __.revision_date_format
            }
        }, {
            header : __.from,
            width : 200,
            sortable : true,
            dataIndex : 'fl_address_from',
            filter : {
                type : 'string'
            }
        }, {
            header : __.to,
            width : 200,
            sortable : true,
            dataIndex : 'fl_address_to',
            filter : {
                type : 'string'
            }
        }];
        this.plugins = [{
            ptype : 'gridfilters'
        }, {
            ptype : 'rowexpander',
            rowBodyTpl : App.email_logs_template
        }];
        this.dockedItems = [{
            xtype : 'toolbar',
            itemId : 'tBar',
            layout : {
                overflowHandler : 'Menu'
            },
            items : [{
                text : __.del_recs,
                tooltip : __.del_recs_tooltip,
                iconCls : 'ic-del',
                itemId : 'delBtn',
                disabled : true,
                handler : Ext.bind(this.onDelClick, this, [this], 2)
            }, '-', {
                text : __.print_selected,
                tooltip : __.print_selected_tt,
                iconCls : 'ic-print',
                itemId : 'printBtn',
                disabled : true,
                handler : function () {
                    var els = Ext.ComponentQuery.query('emaillogs');
                    if (els.length) {
                        var recs = els[0].getSelectionModel().getSelection();
                        if (recs.length > 0) {
                            var datas = [];
                            Ext.each(recs, function (row) {
                                datas.push(row.getData());
                            });
                            var tpls = [];
                            var tpl = new Ext.XTemplate(tpls.concat('<tpl for=".">', App.email_logs_template, '<hr size="1" width="100%" /></tpl>'));
                            var printable = tpl.overwrite(Ext.get('print_email_logs-body'), datas);
                            var a = window.open('', '', 'scrollbars=yes,width=700');
                            a.document.open('text/html');
                            a.document.write(Ext.String.format('<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="?modules=css" /></head><body>{0}</body></html>', Ext.get('print_email_logs-body').dom.innerHTML));
                            a.document.close();
                            a.focus();
                            a.print();
                        } else {
                            Ext.ux.Utils.alert(__.error_msg, __.select_recs);
                        }
                    }
                }
            }, '-', {
                text : __.purge_state,
                tooltip : __.purge_state_tooltip,
                iconCls : 'ic-purge',
                handler : function () {
                    Ext.ux.Utils.purgeState('EmailLogsGridState');
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
                stateId : 'email_logs-grid'
            }],
            displayInfo : true
        }];
        this.callParent(arguments);
        this.selModel.on('selectionchange', this.onSelChange, this);
        this.on('viewready', this.onViewReady, this);
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
            tbar.getComponent('printBtn').setDisabled(sels.length == 0);
        }
    }
});
