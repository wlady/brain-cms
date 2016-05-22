Ext.ns('App');
Ext.define('module.Modules.ux.Grid', {
    extend : 'Ext.grid.Panel',
    title : __.Modules,
    store : App.moduleRecords,
    features : [
        Ext.create('Ext.grid.feature.Grouping', {
            groupHeaderTpl : 'Group: {name:capitalize()} Modules ({rows.length})'
        })
    ],
    plugins : [{
        ptype : 'gridfilters'
    }, {
        ptype : 'cellediting',
        clicksToEdit : 1,
        listeners : {
            edit : function (e, obj) {
                if (obj.value == obj.originalValue) {
                    return false;
                }
                var params = {
                    _m : 'Modules',
                    _a : 'saveRow',
                    m_id : obj.record.data.m_id,
                    m_active : obj.value
                };
                Ext.ux.Utils.runController(params, obj.record);
            }
        }
    }],
    selModel : {
        mode : 'MULTI'
    },
    editors : {
        'boolean' : Ext.create('Ext.grid.CellEditor', {
            field : Ext.create('Ext.ux.form.field.EnumTrueFalseCombo', {
                width : 100
            })
        })
    },
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.dockedItems = [{
            xtype : 'toolbar',
            itemId : 'tBar',
            layout : {
                overflowHandler : 'Menu'
            },
            items : [{
                text : __.about,
                tooltip : __.about,
                iconCls : 'Modules-icon',
                itemId : 'aboutBtn',
                disabled : true,
                handler : Ext.bind(this.aboutBox, this)
            }]
        }];
        this.columns = [{
            header : __.group,
            hidden : true,
            dataIndex : 'm_panel'
        }, {
            header : __.title,
            flex : 1,
            dataIndex : 'm_name',
            sortable : false,
            menuDisabled : true,
            renderer : function (value, meta, rec, rowInd, colInd) {
                return this.colorText(value, rec, colInd, 'red');
            }
        }, {
            header : __.version,
            width : 100,
            align : 'center',
            dataIndex : 'Version',
            sortable : false,
            menuDisabled : true,
            fixed : true
        }, {
            header : '',
            width : 30,
            fixed : true,
            sortable : false,
            menuDisabled : true,
            dataIndex : 'Settings',
            renderer : function (value) {
                return value.length ? '<dic class="ic-preferences" />' : '';
            }
        }, {
            header : __.is_active,
            sortable : false,
            menuDisabled : true,
            dataIndex : 'm_active',
            width : 100,
            fixed : true,
            getEditor : Ext.bind(this.getCellEditor, this),
            renderer : function (value, meta, rec, rowInd, colInd) {
                return this.colorText(value, rec, colInd, 'gray');
            }
        }];
        this.aboutAction = Ext.create('Ext.Action', {
            iconCls : 'Modules-icon',
            text : __.about,
            handler : Ext.bind(this.aboutBox, this)
        });
        this.contextMenu1 = Ext.create('Ext.menu.Menu', {
            items : [
                this.aboutAction,
                '-',
                Ext.create('Ext.Action', {
                    iconCls : 'ic-del',
                    text : __.del_orphan,
                    handler : Ext.bind(this.onDelClick, this, [this], 2)
                })
            ]
        });
        this.contextMenu2 = Ext.create('Ext.menu.Menu', {
            items : [
                this.aboutAction
            ]
        });
        this.viewConfig = {
            plugins : {
                ptype : 'gridviewdragdrop',
                ddGroup : 'modulesDDGroup',
                enableDrop : true
            },
            listeners : {
                itemdblclick : Ext.bind(this.aboutBox, this),
                itemcontextmenu : function (view, rec, node, index, e) {
                    e.stopEvent();
                    if (rec.get('Status') == 'orphan') {
                        me.contextMenu1.showAt(e.getXY());
                    } else {
                        me.contextMenu2.showAt(e.getXY());
                    }
                    return false;
                },
                render : Ext.bind(this.initDropZone, this)
            }
        };
        this.callParent(arguments);
        this.selModel.on('selectionchange', this.onSelChange, this);
    },

    onDelClick : function (btn, e, grid) {
        Ext.ux.Utils.delRows(grid);
    },

    getCellEditor : function (record, column) {
        var st = record.get('Status');
        var editor = this.editors['boolean'];
        if (st != 'active') {
            return false;
        }
        editor.editorId = editor;
        return editor;
    },

    beforeDestroy : function () {
        this.callParent();
        this.destroyEditors(this.editors);
    },

    destroyEditors : function (editors) {
        for (var ed in editors) {
            if (editors.hasOwnProperty(ed)) {
                Ext.destroy(editors[ed]);
            }
        }
    },

    colorText : function (value, rec, colInd, color) {
        if (colInd == 0 && rec.get('Status') == 'orphan') {
            return Ext.String.format('<span style="color:{0}">{1}</spoan>', color, Ext.String.capitalize(value));
        } else if (colInd == 3 && rec.get('Status') != 'active') {
            return Ext.String.format('<span style="color:{0}">{1}</spoan>', color, Ext.String.capitalize(value));
        } else {
            return Ext.String.capitalize(value);
        }
    },

    initDropZone : function (v) {
        var me = this;
        this.dropZone = new Ext.dd.DropZone(v.el, {
            getTargetFromEvent : function (e) {
                return e.getTarget(me.getView().rowSelector);
            },
            onNodeEnter : function (target, dd, e, data) {
                Ext.fly(target).addCls('my-row-highlight-class');
            },
            onNodeOut : function (target, dd, e, data) {
                Ext.fly(target).removeCls('my-row-highlight-class');
            },
            onNodeOver : function (target, dd, e, data) {
                var rowBody = Ext.fly(target).findParent('.x-grid-row', null, false);
                if (rowBody) {
                    var h = v.getRecord(rowBody);
                    return h.data.m_panel == data.records[0].data.m_panel ? Ext.dd.DropZone.prototype.dropAllowed : Ext.dd.DropZone.prototype.dropNotAllowed;
                }
            },
            onNodeDrop : function (target, dd, e, data) {
                e.stopEvent();
                var rowBody = Ext.fly(target).findParent('.x-grid-row', null, false);
                if (!rowBody) {
                    return false;
                }
                var h = v.getRecord(rowBody), targetEl = Ext.get(target);
                if (h.data.m_panel == data.records[0].data.m_panel && h.data.m_id != data.records[0].data.m_id) {
                    var storeArray = [];
                    me.getStore().each(function (rec) {
                        storeArray.push(rec.get('m_id'));
                    });
                    var index1 = me.store.find('m_path', data.records[0].data.m_path);
                    var index2 = me.store.find('m_path', h.data.m_path);
                    if (index1 != -1 && index2 != -1) {
                        var tmp = storeArray.splice(index1, 1);
                        storeArray.splice(index2, 0, tmp.toString());
                    }
                    var params = {
                        _m : 'Modules',
                        _a : 'reorder',
                        order : Ext.encode(storeArray),
                        panel : h.data.m_panel
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
            }
        });
    },

    aboutBox : function () {
        var rec = this.getSelectionModel().getSelection();
        if (rec[0]) {
            Ext.create('module.Modules.ux.About', {
                record : rec[0]
            });
        }
    },

    onSelChange : function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('aboutBtn').setDisabled(sels.length != 1);
        }
    }
});
