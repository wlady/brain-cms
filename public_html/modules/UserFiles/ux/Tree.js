Ext.ns('App');
Ext.define('module.UserFiles.ux.Tree', {
    extend: 'Ext.tree.Panel',
    uses: [
        'Ext.ux.upload.MenuItem'
    ],
    alias: 'widget.userfilestree',
    header: false,
    id: 'userfilestree',
    border: false,
    columns: [{
        xtype: 'treecolumn',
        text: __.userdirs,
        flex: 1,
        sortable: false,
        dataIndex: 'text'
    }],
    clipboardPath: '',
    currentRecord: null,
    disablePaste: true,
    constructor: function (config) {
        if (config && config.rootText) {
            var root = this.getStore().getRootNode();
            root.data.text = config.rootText;
        }
        var me = this;
        this.menu_files = [{
            text: __.reload,
            iconCls: 'ic-reload',
            handler: Ext.bind(this.reloadTree, this)
        }, {
            text: __.file_uploader,
            tooltip: __.file_uploader_tt,
            iconCls: 'ic-upload',
            hidden: App.isDisableUpload,
            handler: function () {
                Ext.create('Ext.ux.upload.UploadFiles', {
                    parentComponent: this,
                    url: App.baseUrl,
                    params: {
                        _m: 'UserFiles',
                        _a: 'uploadFiles'
                    },
                    path: me.currentPath,
                    callback: function () {
                        me.getStore().load();
                    }
                });
            }
        }, '-', {
            text: __.mkdir,
            iconCls: 'ic-add',
            handler: function () {
                var selected = me.getSelectionModel().getLastSelected();

                function createDir(btn, text) {
                    if (btn == 'ok') {
                        Ext.Ajax.request({
                            url: App.baseUrl,
                            params: {
                                _m: 'UserFiles',
                                _a: 'createDir',
                                path: selected.get('id'),
                                name: text
                            },
                            success: function (response, request) {
                                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                    Ext.ux.Utils.ajaxResponseShowError(response);
                                } else {
                                    var node = me.getRootNode().findChild('id', selected.get('id'), true);
                                    if (!Ext.isEmpty(node)) {
                                        me.getSelectionModel().select(node);
                                        function expandParent(node) {
                                            if (node.parentNode && !Ext.isEmpty(node.parentNode.parentNode)) {
                                                node.parentNode.expand(true);
                                                return expandParent(node.parentNode);
                                            }
                                            return false;
                                        }

                                        expandParent(node);
                                    }
                                    me.getStore().load();
                                }
                            }
                        });
                    }
                }

                Ext.MessageBox.prompt(__.message, __.new_dir_name, createDir);
            }
        }, {
            text: __.rmdir,
            iconCls: 'ic-del',
            disabled: true,
            handler: Ext.bind(this.onDeleteClick, this)
        }];
        this.menu_edit = [{
            text: __.copy,
            iconCls: 'ic-copy',
            handler: Ext.bind(this.onCopyClick, this)
        }, {
            text: __.paste,
            iconCls: 'ic-paste',
            disabled: true,
            handler: Ext.bind(this.onPasteClick, this)
        }];
        this.viewConfig = {
            layout: 'vbox',
            plugins: {
                ptype: 'treeviewdragdrop',
                ddGroup: 'userfilesDD',
                enableDrop: true
            }
        };
        this.tbar = [{
            split: true,
            text: __.file,
            menu: {
                minWidth: 150,
                items: this.menu_files,
                listeners: {
                    beforeshow: function () {
                        this.items.items[3].setDisabled(me.getSelectionModel().getCount() < 1);
                        this.items.items[4].setDisabled(me.getSelectionModel().getCount() < 1);
                    }
                }
            }
        }, {
            split: true,
            text: __.edit,
            menu: {
                minWidth: 150,
                items: this.menu_edit,
                listeners: {
                    beforeshow: function () {
                        var node = me.getSelectionModel().getLastSelected();
                        this.items.items[0].setDisabled(Ext.isEmpty(node));
                        if (node) {
                            me.currentRecord = node;
                            this.items.items[1].setDisabled(me.isDisablePaste(node.get('id')));
                        }
                    }
                }
            }
        }];
        this.store = Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: App.baseUrl,
                extraParams: {
                    _m: 'UserFiles',
                    _a: 'getAllDirs'
                }
            },
            root: {
                text: App.uploadDir,
                id: '/',
                expanded: true
            },
            autoLoad: false
        });
        this.callParent();
        this.on({
            itemclick: this.onItemClick,
            itemcontextmenu: this.onItemContextClick,
            itemmove: this.onItemMove,
            scope: this
        });
    },

    onViewReady: function () {
        var node = this.getRootNode();
        this.onItemClick(this, node);
        this.getSelectionModel().select(node);
    },

    onItemMove: function (cmp, oldParent, newParent, index, eOpts) {
        var me = this;
        Ext.Ajax.request({
            url: App.baseUrl,
            params: {
                _m: 'UserFiles',
                _a: 'moveDir',
                dest: cmp.raw.id,
                target: newParent.raw.id
            },
            success: function (response, request) {
                if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                    Ext.ux.Utils.ajaxResponseShowError(response);
                }
                me.getStore().load();
            }
        });
        return false;
    },

    reloadTree: function () {
        this.getStore().load();
        var root = this.getRootNode();
        tree.expand();
    },

    deleteNode: function (btn, tree, nodes) {
        if (btn == 'yes') {
            var names = [];
            Ext.each(nodes, function () {
                names.push(this.get('id'));
            });
            Ext.ux.Utils.runController(
                {
                    _m: 'UserFiles',
                    _a: 'deleteDirs',
                    names: Ext.encode(names)
                },
                null,
                function (response) {
                    if (response.message.length) {
                        Ext.ux.Utils.alert(__.error_msg, response.message);
                    }
                    var node = tree.getRootNode();
                    tree.getStore().reload();
                    tree.onItemClick(tree, node);
                    tree.getSelectionModel().select(node);
                }
            );
        }
    },

    onDeleteClick: function () {
        var nodes = this.getChecked();
        if (!nodes.length) {
            return Ext.ux.Utils.alert(__.error_msg, __.select_recs);
        }
        Ext.Msg.show({
            title: __.del_question,
            msg: __.del_selection_question,
            buttons: Ext.Msg.YESNO,
            fn: Ext.bind(this.deleteNode, this, [this, nodes], 1),
            animEl: 'elId',
            icon: Ext.MessageBox.QUESTION
        });
    },

    onItemContextClick: function (view, record, node, index, e) {
        e.stopEvent();
        this.menu_edit[1].disabled = this.isDisablePaste(record.get('id'));
        this.onItemClick(view, record);
    },

    onItemClick: function (dataview, record, item, index, e) {
        var obj = Ext.getCmp('userfilesgrid');
        if (obj) {
            obj.currentPath = record.get('id');
            obj.reloadGrid();
            obj.clearDetailsPanel();
        }
    },

    onCopyClick: function () {
        this.clipboardPath = this.currentRecord.get('id');
        // clear grid's clipboard
        var obj = Ext.getCmp('userfilesgrid');
        if (obj) {
            obj.clipboard = [];
        }
        //Ext.getCmp('userfilesclipboard').refill();
    },

    onPasteClick: function () {
        var me = this, obj = Ext.getCmp('userfilesgrid');
        // check it once more
        if (obj && (this.currentRecord.get('id') !== obj.currentPath) && obj.clipboard.length) {
            Ext.Ajax.request({
                url: App.baseUrl,
                params: {
                    _m: 'UserFiles',
                    _a: 'copyFiles',
                    path: this.currentRecord.get('id'),
                    files: Ext.encode(obj.clipboard)
                },
                success: function (response, request) {
                    if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                        Ext.ux.Utils.ajaxResponseShowError(response);
                    } else {
                        // clear clipboards
                        me.clipboardPath = '';
                        obj.clipboard = [];
                        obj.getStore().load();
                    }
                }
            });
        } else if (me.clipboardPath && (this.currentRecord.get('id') !== me.clipboardPath)) {
            Ext.Ajax.request({
                url: App.baseUrl,
                params: {
                    _m: 'UserFiles',
                    _a: 'copyDir',
                    src: me.clipboardPath,
                    dst: this.currentRecord.get('id')
                },
                success: function (response, request) {
                    if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                        Ext.ux.Utils.ajaxResponseShowError(response);
                    } else {
                        // clear clipboards
                        me.clipboardPath = '';
                        obj.clipboard = [];
                        me.getStore().load();
                    }
                }
            });
        }
        //Ext.getCmp('userfilesclipboard').refill();
    },

    isDisablePaste: function (path) {
        var disablePaste = true, obj = Ext.getCmp('userfilesgrid');
        // TODO: refine enable/disable menu by checking file clipboard first
        if (obj && (path !== obj.currentPath) && obj.clipboard.length) {
            disablePaste = false;
        } else if (this.clipboardPath.length && (path !== this.clipboardPath)) {
            disablePaste = false;
        }
        return disablePaste;
    }

});
