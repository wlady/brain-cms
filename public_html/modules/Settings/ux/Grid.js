Ext.ns('App');
Ext.apply(Ext.form.field.VTypes, {
    ipAddress : function (v) {
        return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(v);
    },
    ipAddressText : 'Must be a numeric IP address',
    ipAddressMask : /[\d\.]/i
});

Ext.define('module.Settings.ux.Grid', {
    extend : 'Ext.grid.Panel',
    uses : [
        'Ext.grid.plugin.CellEditing',
        'Ext.grid.CellEditor',
        'Ext.ux.form.field.EnumTrueFalseCombo',
        'Ext.form.field.Text',
        'Ext.form.field.Number'
    ],
    valueField : 'value',
    nameField : 'name',
    title : __.site_settings,
    border : false,
    customEditors : {},
    constructor : function () {
        var me = this;
        this.plugins = [{
            ptype : 'cellediting',
            clicksToEdit : 1,
            startEdit : function (record, column) {
                return this.self.prototype.startEdit.call(this, record, me.headerCt.child('#' + me.valueField));
            },
            listeners : {
                edit : function (e, obj) {
                    if (obj.value == obj.originalValue) {
                        return false;
                    }
                    var params = {
                        _m : 'Settings',
                        _a : 'saveRow',
                        id : obj.record.data.id,
                        value : obj.value
                    };
                    Ext.ux.Utils.runController(params, obj.record);
                }
            }
        }];
        this.columns = [{
            header : __.group,
            hidden : true,
            dataIndex : 'g_name'
        }, {
            header : __.description,
            width : 200,
            dataIndex : 'teaser',
            sortable : false,
            menuDisabled : true
        }, {
            header : __.value,
            flex : 1,
            dataIndex : 'value',
            getEditor : Ext.bind(this.getCellEditor, this),
            sortable : false,
            menuDisabled : true
        }];
        this.editors = {
            'string' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.form.field.Text', {
                    selectOnFocus : true
                })
            }),
            'email' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.form.field.Text', {
                    vtype : 'email',
                    selectOnFocus : true
                })
            }),
            'url' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.form.field.Text', {
                    vtype : 'url',
                    selectOnFocus : true
                })
            }),
            'numeric' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.form.field.Number', {
                    decimalPrecision : 4,
                    style : 'text-align:left;',
                    allowBlank : false,
                    selectOnFocus : true,
                    anchor : '50%'
                })
            }),
            'percents' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.form.field.Number', {
                    allowBlank : false,
                    decimalPrecision : 2,
                    style : 'text-align:left;',
                    minValue : 0,
                    maxValue : 100,
                    selectOnFocus : true,
                    width : 100
                })
            }),
            'ip' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.form.field.Text', {
                    vtype : 'ipAddress',
                    selectOnFocus : true
                })
            }),
            'boolean' : Ext.create('Ext.grid.CellEditor', {
                field : Ext.create('Ext.ux.form.field.EnumTrueFalseCombo', {
                    width : 100
                })
            })
        };
        this.store = Ext.create('Ext.data.Store', {
            groupField : 'g_name',
            proxy : {
                type : 'ajax',
                url : App.baseUrl,
                extraParams : {
                    _m : 'Settings',
                    _a : 'getRows'
                },
                reader : {
                    type : 'json',
                    rootProperty : 'rows',
                    totalProperty : 'results'
                },
                sortParam : 'sortBy'
            },
            remoteSort : true,
            autoLoad : true
        });
        this.features = [
            Ext.create('Ext.grid.feature.Grouping')
        ];
        this.selModel = {
            mode : 'MULTI'
        },
            this.callParent();
    },

    getCellEditor : function (record, column) {
        var xtype = record.get('type'),
            editor = this.customEditors[xtype];
        if (editor) {
            if (!(editor instanceof Ext.grid.CellEditor)) {
                if (!(editor instanceof Ext.form.field.Base)) {
                    editor = Ext.ComponentManager.create(editor, 'textfield');
                }
                editor = this.customEditors[xtype] = Ext.create('Ext.grid.CellEditor', {field : editor});
            }
        } else if (this.editors.hasOwnProperty(xtype)) {
            editor = this.editors[xtype];
        } else {
            editor = this.editors.string;
        }
        editor.editorId = editor;
        return editor;
    },

    beforeDestroy : function () {
        this.callParent();
        this.destroyEditors(me.editors);
        this.destroyEditors(me.customEditors);
    },

    destroyEditors : function (editors) {
        for (var ed in editors) {
            if (editors.hasOwnProperty(ed)) {
                Ext.destroy(editors[ed]);
            }
        }
    }
});
