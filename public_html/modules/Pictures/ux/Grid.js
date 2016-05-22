Ext.ns('App');
Ext.define('PicturesModel', {
    extend: 'Ext.data.Model'
});
Ext.define('module.Pictures.ux.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.picturesgrid',
    header: false,
    minHeight: 600,
    originalId: 0,
    album_id: 0,
    stateful: true,
    stateId: 'PicturesGridState',
    stateEvents: [
        'columnhide',
        'columnshow',
        'columnresize',
        'columnmove',
        'sortchange'
    ],
    selModel:  {
        mode: 'MULTI'
    },
    constructor: function (config) {
        var me = this;
        if (config && config.album_id) {
            this.album_id = config.album_id;
        }
        this.store = Ext.create('Ext.data.Store', {
            model: 'PicturesModel',
            storeId: 'pics' + me.album_id,
            proxy: new Ext.data.proxy.Ajax({
                url: App.baseUrl,
                extraParams: {
                    _m: 'Pictures',
                    _a: 'getRows',
                    album_id: me.album_id,
                    sort: 'sortorder',
                    dir: 'asc',
                    limit: -1
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
        this.setImageAction = {
            text: __.set_image,
            iconCls: 'insImage',
            handler: Ext.bind(this.onInsImageClick, this)
        };
        this.menuImage = Ext.create('Ext.menu.Menu', {
            items: this.setImageAction
        });
        this.columns = {
            defaults: {
                menuDisabled: true
            },
            items: [
                {
                    header: __.file,
                    dataIndex: 'filename',
                    xtype: 'templatecolumn',
                    width: 120,
                    fixed: true,
                    sortable: false,
                    tpl: '<img src="/thumb/?src={url}&w=100" alt="{url}" title="{url}" border="0" class="{cls}" />'
                }, {
                    header: __.title,
                    flex: 1,
                    dataIndex: 'title',
                    editor: {
                        xtype: 'textfield',
                        allowBlank: true
                    }
                }, {
                    header: __.url,
                    width: 200,
                    dataIndex: 'link',
                    hidden: true,
                    editor: {
                        xtype: 'textfield',
                        vtype: 'url',
                        allowBlank: true,
                        maxLength: 255
                    }
                }, {
                    header: __.file,
                    width: 100,
                    hidden: true,
                    dataIndex: 'filename'
                }, {
                    header: __.size,
                    width: 100,
                    hidden: true,
                    dataIndex: 'size'
                }, {
                    header: __.dims,
                    width: 100,
                    hidden: true,
                    dataIndex: 'dims'
                }, {
                    header: __.active,
                    dataIndex: 'active',
                    fixed: true,
                    width: 70,
                    editor: {
                        xtype: 'enumtruefalsecombo'
                    }
                }, {
                    header: __.featured,
                    dataIndex: 'featured',
                    fixed: true,
                    width: 70,
                    editor: {
                        xtype: 'enumtruefalsecombo'
                    }
                }, {
                    header: __.external,
                    dataIndex: 'external',
                    fixed: true,
                    width: 70,
                    renderer: function (v) {
                        if (v != 'true' && v != 'false') {
                            return '';
                        }
                        return Ext.String.format('<img src="/modules/Admin/img/{0}.png" alt="0" border="0" />', v.toLowerCase());
                    }
                }]
        };
        this.dockedItems = [{
            xtype: 'toolbar',
            itemId: 'tBar',
            layout: {
                overflowHandler: 'Menu'
            },
            items: [
                {
                    text: __.pics_actions,
                    iconCls: 'ic-actions',
                    itemId: 'editBtn',
                    disabled: true,
                    menu: Ext.create('Ext.menu.Menu', {
                        items: [
                            {
                                text: __.edit_rec,
                                tooltip: __.edit_rec_tooltip,
                                iconCls: 'ic-edit',
                                handler: Ext.bind(this.onEditClick, this, [this], 2)
                            }, '-',
                            this.setImageAction
                        ]
                    })
                }, '-', {
                    text: __.add_recs,
                    tooltip: __.add_recs_tt,
                    iconCls: 'ic-add',
                    handler: Ext.bind(this.onAddClick, this, [this], 2)
                }, '-', {
                    text: __.del_recs,
                    tooltip: __.del_recs_tt,
                    iconCls: 'ic-del',
                    itemId: 'delBtn',
                    disabled: true,
                    handler: Ext.bind(this.onDelClick, this, [this], 2)
                }, '-', {
                    text: __.add_youtube,
                    tooltip: __.add_youtube_tt,
                    iconCls: 'ic-youtubeIcon',
                    handler: Ext.bind(this.onAddYoutubeClick, this, [this])
                }, '-', {
                    text: __.purge_state,
                    tooltip: __.purge_state_tooltip,
                    iconCls: 'ic-purge',
                    handler: function () {
                        Ext.ux.Utils.purgeState('PicturesGridState');
                    }
                }]
        }];
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 0,
            listeners: {
                edit: function (editor) {
                    // we have to use only these fields b/c there are a lot of virtual ones (pls see cms_picture.classs.php)
                    var rec = {
                        id: editor.context.record.data.id,
                        link: editor.context.record.data.link,
                        title: editor.context.record.data.title,
                        active: editor.context.record.data.active,
                        featured: editor.context.record.data.featured
                    }
                    Ext.Ajax.request({
                        url: App.baseUrl,
                        params: {
                            _m: 'Pictures',
                            _a: 'saveRec',
                            record: Ext.encode(rec)
                        },
                        success: function (response, response) {
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
                    me.getStore().reload();
                }
            }
        });
        this.plugins = [
            this.rowEditor
        ];
        this.viewConfig = {
            plugins: {
                ptype: 'gridviewdragdrop',
                ddGroup: 'albumsDDGroup',
                enableDrop: true
            },
            listeners: {
                cellcontextmenu: this.onContextMenuClick,
                drop: function () {
                    var store = [];
                    me.getStore().each(function (rec) {
                        store.push(rec.get('id'));
                    });
                    var params = {
                        _m: 'Pictures',
                        _a: 'reorder',
                        order: Ext.encode(store)
                    };
                    Ext.Ajax.request({
                        url: App.baseUrl,
                        params: params,
                        success: function (response, request) {
                            if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                Ext.ux.Utils.ajaxResponseShowError(response);
                            }else {
                                me.getStore().commitChanges();
                            }
                        }
                    });
                },
                scope: this
            }
        };
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.selModel.on('selectionchange', this.onSelChange, this);
        this.on({
            viewready: this.onViewReady,
            itemdblclick: this.onItemDblClick,
            cellclick: this.onCellClick,
            scope: this
        });
    },

    onViewReady: function (gridView) {
        var grid = gridView.initialConfig.grid;
        if (grid) {
            grid.store.load();
        }
    },

    onContextMenuClick: function (view, td, cellInd, rec, tr, rowInd, e) {
        e.stopEvent();
        view.initialConfig.grid.curRec = rec;
        if (cellInd == 0 && rec.get('external') !== 'true') {
            view.initialConfig.grid.menuImage.showAt(e.getXY());
        }
    },

    onItemDblClick: function (dataview, record, item, index, e) {
        if (record.get('external') == 'true') {
            this.rowEditor.cancelEdit();
            this.createYoutubeEditor(record);
        }
    },

    onCellClick: function (view, td, cellInd, rec, tr, rowInd, e) {
        if (cellInd == 0) {
            if (rec.get('external') == 'true') {
                Ext.ux.Utils.showVideo("http://www.youtube.com/v/" + rec.get('video_code') + "?fs=1&amp;hl=en_US&amp;rel=0", rec.get('title'));
            } else {
                Ext.ux.Utils.showAlbumItem('pics' + rec.get('album_id'), rowInd, 'url');
            }
        }
    },

    onDelClick: function (btn, e, grid) {
        Ext.ux.Utils.delRows(grid);
    },

    onEditClick: function (btn, e, grid) {
        var rec = grid.getSelectionModel().getSelection();
        if (rec && rec[0]) {
            if (rec[0].get('external') == 'true') {
                this.createYoutubeEditor(rec[0]);
            } else {
                this.rowEditor.startEdit(rec[0], 0);
            }
        }
    },

    onAddClick: function (btn, e, grid) {
        Ext.create('module.UserFiles.ux.Window', {
            uploadPath: App.imagesDir,
            singleSelect: false,
            filters: [{
                title: __.image_files,
                extensions: App.picsExtentions
            }],
            callback: function (selectedRows, path) {
                var data = selectedRows[0].data;
                var names = [];
                Ext.each(selectedRows, function (row) {
                    if (row.data) {
                        names.push(row.data.name);
                    }
                });
                if (names.length) {
                    Ext.Ajax.request({
                        url: App.baseUrl,
                        params: {
                            _m: 'Pictures',
                            _a: 'addPics',
                            folder: path,
                            names: Ext.encode(names),
                            c_id: grid.album_id
                        },
                        success: function (response, request) {
                            if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                                Ext.ux.Utils.ajaxResponseShowError(response);
                            } else {
                                grid.getStore().reload();
                            }
                        }
                    });
                }
            }
        });
    },

    onInsImageClick: function (item) {
        this.chooseFile('photo');
    },

    onAddYoutubeClick: function () {
        this.createYoutubeEditor();
    },

    createYoutubeEditor: function (record) {
        var c_id = this.album_id;
        var id = !Ext.isEmpty(record) ? record.get('id') : 0;
        var frm = Ext.create('module.Pictures.ux.YoutubeEditor', {
            id: id,
            c_id: c_id
        });
        Ext.ux.Utils.createModulePanel(
            {
                title: __.youtube_editor,
                id: 'youtube-panel-' + id,
                iconCls: 'ic-youtubeIcon',
                closable: true,
                autoScroll: true,
                items: frm
            },
            function () {
                if (!Ext.isEmpty(record)) {
                    frm.loadRecord(record).on('actioncomplete', frm.loadData());
                } else {
                    frm.hideLoader();
                }
            }
        );
    },

    chooseFile: function (fld) {
        var me = this;
        Ext.create('module.UserFiles.ux.Window', {
            uploadPath: App.imagesDir,
            singleSelect: true,
            filters: [{
                title: __.image_files,
                extensions: App.picsExtentions
            }],
            callback: function (selectedRows, path) {
                var data = selectedRows[0].data;
                var params = {
                    _m: 'Pictures',
                    _a: 'saveRow',
                    id: me.curRec.get('id')
                };
                params[fld] = data.path;
                if (data.path) {
                    Ext.ux.Utils.runController(params, me.curRec, function () {
                        me.getStore().reload()
                    });
                }
            }
        });
    },

    onSelChange: function (sm, sels) {
        var tbar = this.getDockedComponent('tBar');
        if (tbar) {
            tbar.getComponent('editBtn').setDisabled(sels.length != 1);
            tbar.getComponent('delBtn').setDisabled(sels.length == 0);
            if (sels.length == 1) {
                tbar.getComponent('editBtn').menu.items.items[2].setDisabled(sels[0].get('external') == 'true');
            }
        }
    }

});
