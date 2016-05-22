Ext.ns('App');
Ext.define('module.UserFiles.ux.Grid', {
    uses : [
        'module.UserFiles.ux.Archive',
        'module.UserFiles.ux.FilesModel',
        'Ext.ux.grid.feature.Tileview',
        'Ext.ux.upload.MenuItem'
    ],
    extend : 'Ext.grid.Panel',
    alias : 'widget.userfilesgrid',
    id : 'userfilesgrid',
    header : false,
    border : false,
    autoRender : true,
    rowLines : false,
    viewMode : 'default',
    currentPath : '/',
    clipboard : [],
    clipboardWin : null,
    clipboardPath : '',
    drop_element : null,
    filters : [],
    search : '',
    emptyTpl : new Ext.XTemplate(
        '<div class="ic-details"></div>'
    ),
    detailsTpls : {
        default : new Ext.XTemplate(
            '<div class="ic-details">',
            '<tpl for=".">',
            '<div style="height:100px"><img src="{icon}" /></div><div class="ic-details-info">',
            '<b>File Name:</b>',
            '<span>{name}</span>',
            '<b>Size:</b>',
            '<span>{filSize}</span>',
            '<b>Last Modified:</b>',
            '<span>{lastmod}</span>',
            '<b>Relative URL:</b>',
            '<span>{path}</span>',
            '</tpl>',
            '</div>',
            {
                disableFormats : true
            }
        ),
        image : new Ext.XTemplate(
            '<div class="ic-details">',
            '<tpl for=".">',
            '<div style="height:100px"><img src="{icon}" /></div><div class="ic-details-info">',
            '<b>File Name:</b>',
            '<span>{name}</span>',
            '<b>Size:</b>',
            '<span>{filSize}</span>',
            '<b>Dimensions:</b>',
            '<span>{width}x{height} px</span>',
            '<b>Last Modified:</b>',
            '<span>{lastmod}</span>',
            '<b>Relative URL:</b>',
            '<span>{path}</span>',
            '</tpl>',
            '</div>',
            {
                disableFormats : true
            }
        ),
        media : new Ext.XTemplate(
            '<div class="ic-details">',
            '<tpl for=".">',
            '<div style="position:relative;width:180px;height:110px;">',
            '<div style="position: absolute;width:100px;height:100px;left:40px;"><img src="{icon}" /></div>',
            '<tpl if="type == \'video\'">',
            '<div style="position: absolute;left:66px;top:24px;opacity:0.9;"><img src="/modules/UserFiles/ux/img/play.png" /></div>',
            '</tpl>',
            '</div>',
            '<div class="ic-details-info">',
            '<b>File Name:</b>',
            '<span>{name}</span>',
            '<b>Size:</b>',
            '<span>{filSize}</span>',
            '<tpl if="option.common">',
            '<b>Duration:</b>',
            '<span>{option.common.duration}</span>',
            '</tpl>',
            '<tpl if="option.video">',
            '<b>Dimensions:</b>',
            '<span>{option.video.width}x{option.video.height} px</span>',
            '<b>Video Codec:</b>',
            '<span>{option.video.vcodec}</span>',
            '</tpl>',
            '<tpl if="option.audio">',
            '<b>Audio Channels:</b>',
            '<span>{option.audio.channels}</span>',
            '<b>Audio Codec:</b>',
            '<span>{option.audio.acodec}</span>',
            '<b>Audio Frequency:</b>',
            '<span>{option.audio.freq} Hz</span>',
            '</tpl>',
            '<b>Last Modified:</b>',
            '<span>{lastmod}</span>',
            '<b>Relative URL:</b>',
            '<span>{path}</span>',
            '</tpl>',
            '</div>',
            {
                disableFormats : true
            }
        )
    },
    constructor : function (config) {
        var me = this;
        Ext.apply(this, config || {});
        this.selModel = Ext.create('Ext.selection.RowModel', {
            mode : this.singleSelect ? 'SINGLE' : 'MULTI',
            enableKeyNav : false
        });
        this.store = Ext.create('Ext.data.Store', {
            model : 'module.UserFiles.ux.FilesModel',
            proxy : {
                type : 'ajax',
                url : App.baseUrl,
                extraParams : {
                    _m : 'UserFiles',
                    _a : 'getFiles'
                },
                reader : {
                    keepRawData : true,
                    type : 'json',
                    rootProperty : 'data',
                    totalProperty : 'total'
                },
                sortParam : 'sortBy'
            },
            remoteSort : true,
            autoLoad : false,
            listeners : {
                datachanged : function (ds, eOpts) {
                    Ext.getCmp('userfilescurrentpath').setText(__.currentPath + ds.getProxy().getReader().rawData.path);
                }
            }
        });
        this.columns = {
            defaults : {
                menuDisabled : true
            },
            items : [
                {
                    header : __.icon,
                    dataIndex : 'icon',
                    width : 0
                }, {
                    header : __.filename,
                    flex : 1,
                    dataIndex : 'name',
                    filter : [{
                        type : 'string'
                    }],
                    renderer : function (value, metaData, record) {
                        if (record.get('dir')) {
                            return Ext.String.format('<b>{0}</b>', value);
                        } else {
                            return value;
                        }
                    }
                }, {
                    header : __.date,
                    sortable : true,
                    dataIndex : 'lastmod',
                    filterable : true,
                    filter : [{
                        type : 'date',
                        dateFormat : __.revision_date_format
                    }],
                    width : 150,
                    renderer : function (value, metaData, record) {
                        if (record.get('dir')) {
                            return Ext.String.format('<b>{0}</b>', Ext.util.Format.date(value, __.revision_date_format));
                        } else {
                            return Ext.util.Format.date(value, __.revision_date_format);
                        }
                    }
                }, {
                    header : __.size,
                    width : 100,
                    dataIndex : 'size',
                    renderer : function (value, metaData, record) {
                        if (record.get('dir')) {
                            return '<b>SUB-DIR</b>';
                        } else {
                            return Ext.util.Format.fileSize(record.get('size'));
                        }
                    }
                }
            ]
        };
        this.features = [Ext.create('Ext.ux.grid.feature.Tileview', {
            viewMode : me.viewMode,
            tableTpl : [
                '{%',
                // Add the row/column line classes to the table element.
                'var view=values.view,tableCls=["' + Ext.baseCSSPrefix + '" + view.id + "-table ' + Ext.baseCSSPrefix + 'grid-table"];',
                'if (view.columnLines) tableCls[tableCls.length]=view.ownerCt.colLinesCls;',
                'if (view.rowLines) tableCls[tableCls.length]=view.ownerCt.rowLinesCls;',
                '%}',
                '<table role="presentation" id="{view.id}-table" class="{[tableCls.join(" ")]}" border="0" cellspacing="0" cellpadding="0" style="{tableStyle}" tabIndex="-1">',
                '{[view.renderTHead(values, out)]}',
                '{[view.renderTFoot(values, out)]}',
                '<tbody id="{view.id}-body">',
                '{%',
                'view.renderRows(values.rows, values.viewStartIndex, out);',
                '%}',
                '</tbody>',
                '</table>',
                {
                    priority : 0
                }
            ],
            viewTpls : {
                medium : [
                    '<tpl if="view.tileViewFeature.viewMode==\'medium\'">',
                    '{%',
                    'var grid = Ext.getCmp("userfilesgrid");',
                    'if (grid.columns) grid.columns[0].hidden = false;',
                    'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
                    'var columnValues = values.view.tileViewFeature.getColumnValues(values.columns, values.record);',
                    '%}',
                    '<tr role="row" {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
                    'data-boundView="{view.id}" ',
                    'data-recordId="{record.internalId}" ',
                    'data-recordIndex="{recordIndex}" ',
                    'class="mediumview {[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
                    '{rowAttr:attributes} tabIndex="-1">',
                    '<td role="gridcell" class="{tdCls} x-grid-td ux-explorerview-medium-icon-row" {tdAttr} id="{[Ext.id()]}">',
                    '<table class="x-grid-row-table">',
                    '<tbody>',
                    '<tr>',
                    '<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;{[columnValues.icon]}&quot;) no-repeat scroll 50% 50% transparent !important;">',
                    '</td>',
                    '</tr>',
                    '<tr>',
                    '<td class="x-grid-col x-grid-cell">',
                    '<div {unselectableAttr} class="x-grid-cell-inner">{[this.ellipsis(columnValues.name,20)]}</div>',
                    '</td>',
                    '</tr>',
                    '</tbody>',
                    '</table>',
                    '</td>',
                    '</tr>',
                    '<tpl else>',
                    '{%this.nextTpl.applyOut(values, out, parent);%}',
                    '</tpl>',
                    {
                        priority : 0,
                        ellipsis : function (value, length) {
                            return Ext.String.ellipsis(value, length);
                        }
                    }
                ],
                tiles : [
                    '<tpl if="view.tileViewFeature.viewMode==\'tiles\'">',
                    '{%',
                    'var grid = Ext.getCmp("userfilesgrid");',
                    'if (grid.columns) grid.columns[0].hidden = false;',
                    'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
                    'var columnValues = values.view.tileViewFeature.getColumnValues(values.columns, values.record);',
                    '%}',
                    '<tr role="row" {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
                    'data-boundView="{view.id}" ',
                    'data-recordId="{record.internalId}" ',
                    'data-recordIndex="{recordIndex}" ',
                    'class="tileview {[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
                    '{rowAttr:attributes} tabIndex="-1">',
                    '<td role="gridcell" class="{tdCls} x-grid-td ux-explorerview-detailed-icon-row" {tdAttr} id="{[Ext.id()]}">',
                    '<table class="x-grid-row-table">',
                    '<tbody>',
                    '<tr>',
                    '<td class="x-grid-col x-grid-cell ux-explorerview-icon" style="background: url(&quot;{[columnValues.icon]}&quot;) no-repeat scroll 50% 50% transparent !important;">',
                    '</td>',
                    '<td class="x-grid-col x-grid-cell">',
                    '<div class="x-grid-cell-inner" unselectable="on"><label>Name:</label> {[columnValues.name]}<br /><label>Size:</label> {[this.fileSize(columnValues.size)]}<br /><label>Modified:</label> {[this.lastModified(columnValues.lastmod)]}</div>',
                    '</td>',
                    '</tr>',
                    '</tbody>',
                    '</table>',
                    '</td>',
                    '</tr>',
                    '<tpl else>',
                    '{%this.nextTpl.applyOut(values, out, parent);%}',
                    '</tpl>',
                    {
                        priority : 0,
                        disableFormats : true,
                        fileSize : function (value) {
                            return Ext.util.Format.fileSize(value);
                        },
                        lastModified : function (value) {
                            return Ext.util.Format.date(value, __.revision_date_format);
                        }
                    }
                ]
            }
        })];
        this.viewConfig = {
            listeners : {
                itemcontextmenu : Ext.bind(this.onItemContextMenu, this),
                itemclick : Ext.bind(this.onItemClick, this),
                itemdblclick : Ext.bind(this.onItemDblClick, this)
            }
        };
        this.menu_files = [{
            text : __.openfile,
            iconCls : 'ic-browse',
            handler : Ext.bind(this.onOpenFile, this)
        }, {
            text : __.reload,
            iconCls : 'ic-reload',
            handler : Ext.bind(this.reloadGrid, this)
        }, {
            text : __.file_uploader,
            tooltip : __.file_uploader_tt,
            iconCls : 'ic-upload',
            hidden : App.isDisableUpload,
            handler : function () {
                Ext.create('Ext.ux.upload.UploadFiles', {
                    parentComponent : this,
                    url : App.baseUrl,
                    params : {
                        _m : 'UserFiles',
                        _a : 'uploadFiles'
                    },
                    path : me.currentPath,
                    callback : function () {
                        me.getStore().load();
                    }
                });
            }
        }, {
            text : __.download,
            iconCls : 'ic-download',
            itemId : 'downloadBtn',
            hidden : App.isDisableUpload,
            handler : Ext.bind(this.onDownloadClick, this)
        }, '-', {
            text : __.del,
            iconCls : 'ic-del',
            itemId : 'delBtn',
            handler : Ext.bind(this.onDeleteFiles, this)
        }];
        this.menu_edit = [{
            text : __.copy,
            iconCls : 'ic-copy',
            handler : Ext.bind(this.onCopyClick, this, [this])
        }, {
            text : __.paste,
            iconCls : 'ic-paste',
            disabled : true,
            handler : Ext.bind(this.onPasteClick, this)
        }];
        this.menu_tools = [{
            text : __.img_edit,
            iconCls : 'ic-edit',
            disabled : true,
            handler : function () {
                var row = me.getSelectionModel().getLastSelected();
                Ext.create('module.ImageEditor.ux.Window', {
                    record : row
                });
            }
        }, {
            text : __.compress,
            iconCls : 'ic-compress',
            handler : function () {
                var rows = me.getSelectionModel().getSelection();

                function createArchive(btn, text) {
                    var files = [];
                    Ext.each(me.getSelectionModel().getSelection(), function () {
                        files.push(this.get('name'));
                    });
                    if (btn == 'ok') {
                        Ext.Ajax.request({
                            url : App.baseUrl,
                            params : {
                                _m : 'UserFiles',
                                _a : 'createArchive',
                                name : text,
                                path : me.currentPath,
                                files : Ext.encode(files)
                            },
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

                Ext.MessageBox.prompt(__.message, __.archive_name, createArchive);
            }
        }, {
            text : __.uncompress,
            iconCls : 'ic-compress',
            disabled : true,
            handler : function () {
                var row = me.getSelectionModel().getLastSelected();
                Ext.Ajax.request({
                    url : App.baseUrl,
                    params : {
                        _m : 'UserFiles',
                        _a : 'unpackArchive',
                        file : row.get('path')
                    },
                    success : function (response, request) {
                        if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                            Ext.ux.Utils.ajaxResponseShowError(response);
                        } else {
                            var tree = Ext.getCmp('userfilestree');
                            if (tree) {
                                tree.getStore().reload();
                            }
                            me.getStore().load();
                        }
                    }
                });
            }
        }];
        this.tbar = [{
            split : true,
            text : __.file,
            menu : {
                minWidth : 150,
                items : this.menu_files,
                listeners : {
                    beforeshow : function () {
                        this.items.items[0].setDisabled(me.getSelectionModel().getCount() != 1);
                        this.items.items[3].setDisabled(me.getSelectionModel().getCount() != 1);
                        this.items.items[5].setDisabled(me.getSelectionModel().getCount() < 1);
                    }
                }
            }
        }, {
            split : true,
            text : __.edit,
            menu : {
                minWidth : 150,
                items : this.menu_edit,
                listeners : {
                    beforeshow : function () {
                        var row = me.getSelectionModel().getLastSelected();
                        this.items.items[0].setDisabled(Ext.isEmpty(row));
                        if (row) {
                            me.currentRecord = row;
                        }
                        this.items.items[1].setDisabled(me.isDisablePaste());
                    }
                }
            }
        }, {
            split : true,
            text : __.tools,
            menu : {
                minWidth : 150,
                items : this.menu_tools,
                listeners : {
                    beforeshow : function () {
                        var row = me.getSelectionModel().getLastSelected();
                        this.items.items[0].setDisabled(!(me.getSelectionModel().getCount() == 1 && row.get('type') == 'image'));
                        this.items.items[1].setDisabled(me.getSelectionModel().getCount() < 1);
                        this.items.items[2].setDisabled(!(me.getSelectionModel().getCount() == 1 && row.get('type') == 'archive'));
                    }
                }
            }
        }, {
            xtype : 'userfilessearchname',
            width : 200,
            labelWidth : 60,
            labelAlign : 'right',
            fieldLabel : __.searchname,
            qtips : __.searchname_tt,
            handler : function () {
                Ext.getCmp('userfilessearchresults').search(this.value);
                var panel = Ext.getCmp('userfilessearchpanel');
                if (this.value.length) {
                    panel.expand();
                }
            },
            listeners : {
                afterclear : function () {
                    Ext.getCmp('userfilessearchpanel').collapse();
                }
            }
        }]
        this.callParent(arguments);
    },

    onViewReady : function () {
        this.clipboard = [];
        this.features[0].setView(this.viewMode);
        if (!Ext.isEmpty(this.search)) {
            var me = this, tmpPath;
            var parts = this.search.split('/');
            if (parts.length) {
                try {
                    parts.shift();
                    parts.shift();
                    parts.pop();
                    tmpPath = parts.join('/') + '/';
                } catch (e) {
                    console.log(e);
                }
            }
            var tree = Ext.getCmp('userfilestree');
            if (tree) {
                var node = tree.getRootNode().findChild('id', tmpPath, true);
                if (Ext.isEmpty(node)) {
                    // try the root
                    node = tree.getRootNode();
                }
                if (node) {
                    tree.getSelectionModel().select(node);
                    function expandParent(node) {
                        if (node.parentNode && !Ext.isEmpty(node.parentNode.parentNode)) {
                            node.parentNode.expand(true);
                            return expandParent(node.parentNode);
                        }
                        return false;
                    }

                    expandParent(node);
                    me.currentPath = tmpPath;
                    me.reloadGrid(
                        function (records, operation, success) {
                            var rec = Ext.Array.findBy(records, function (item) {
                                return item.data.path == me.search;
                            });
                            me.selModel.select(rec);
                            me.onItemClick(me, rec);
                        }
                    );
                }
            }
        }
    },

    clearDetailsPanel : function () {
        var detailEl = Ext.getCmp('userfiledetailpanel');
        detailEl.tpl = this.emptyTpl;
        detailEl.update([]);
    },

    onItemContextMenu : function (view, record, node, index, e) {
        e.stopEvent();
        this.currentRecord = record;
        this.getSelectionModel().select(record);
        this.onItemClick(this, record);
        return false;
    },

    onItemDblClick : function (grid, row) {
        var me = this;
        if (row.get('dir')) {
            this.currentPath = row.get('path');
            return this.reloadGrid(
                function (records, operation, success) {
                    var tree = Ext.getCmp('userfilestree');
                    if (tree) {
                        var node = tree.getRootNode().findChild('id', me.currentPath + '/', true);
                        if (node) {
                            tree.getSelectionModel().select(node);
                            function expandParent(node) {
                                if (!Ext.isEmpty(node.parentNode.parentNode)) {
                                    node.parentNode.expand(true);
                                    return expandParent(node.parentNode);
                                }
                                return false;
                            }

                            expandParent(node);
                        }
                    }
                    me.clearDetailsPanel();
                }
            );
        }
        this.openByType(row);
    },

    onItemClick : function (grid, row) {
        if (row.get('dir')) {
            return this.clearDetailsPanel();
        }
        var me = this;
        var detailEl = Ext.getCmp('userfiledetailpanel');
        detailEl.animate({
            remove : false,
            opacity : 0,
            duration : .1
        });
        switch (row.data.type) {
            case 'image':
                detailEl.tpl = me.detailsTpls.image;
                break;
            case 'audio':
            case 'video':
                detailEl.tpl = me.detailsTpls.media;
                break;
            default:
                detailEl.tpl = me.detailsTpls.default;
                break;
        }
        row.data.filSize = Ext.util.Format.fileSize(row.data.size);
        detailEl.update(row.data);
        detailEl.animate({
            remove : false,
            opacity : 1,
            duration : .5
        });
    },

    onCopyClick : function (view) {
        var files = [];
        Ext.each(view.getSelectionModel().getSelection(), function () {
            files.push(this.get('path'));
        });
        this.clipboard = files;
        this.clipboardPath = this.currentPath;
    },

    onPasteClick : function (view) {
        var me = this;
        // check it once more
        if ((me.clipboardPath !== me.currentPath) && me.clipboard.length) {
            Ext.Ajax.request({
                url : App.baseUrl,
                params : {
                    _m : 'UserFiles',
                    _a : 'copyFiles',
                    path : me.currentPath,
                    files : Ext.encode(me.clipboard)
                },
                success : function (response, request) {
                    if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                        Ext.ux.Utils.ajaxResponseShowError(response);
                    } else {
                        // clear clipboard
                        me.clipboard = [];
                        me.getStore().load();
                    }
                }
            });
        }
    },

    onDownloadClick : function () {
        if (this.getSelectionModel().getCount() == 1) {
            var file = this.getSelectionModel().getLastSelected();
            this.frm = new Ext.form.Panel({
                standardSubmit : true,
                method : 'GET',
                url : App.baseUrl,
                baseParams : {
                    _m : 'UserFiles',
                    _a : 'downloadFiles'
                },
                items : [
                    {
                        xtype : 'hidden',
                        name : 'file',
                        value : file.get('path')
                    }]
            });
            this.frm.submit();
        }
        return;
    },

    onDeleteFiles : function (grid) {
        var me = this;

        function deleteRecord(btn) {
            if (btn == 'yes') {
                var names = [];
                Ext.each(me.getSelectionModel().getSelection(), function (rec) {
                    names.push(rec.get('name'));
                });
                Ext.Ajax.request({
                    url : App.baseUrl,
                    params : {
                        _m : 'UserFiles',
                        _a : 'deleteFiles',
                        path : me.currentPath,
                        names : Ext.encode(names)
                    },
                    success : function (response, request) {
                        if (Ext.ux.Utils.ajaxResponseHasError(response)) {
                            Ext.ux.Utils.ajaxResponseShowError(response);
                        } else {
                            var json = Ext.decode(response.responseText);
                            if (json.message.length) {
                                Ext.ux.Utils.alert(__.error_msg, json.message);
                            }
                            me.getStore().load();
                            me.clearDetailsPanel();
                        }
                    }
                });
            }
        }

        Ext.MessageBox.confirm(__.message, __.del_selection_question, deleteRecord);
    },

    onOpenFile : function (grid) {
        var row;
        if (row = this.getSelectionModel().getSelection()) {
            this.openByType(row[0]);
        }
    },

    openByType : function (rec) {
        switch (rec.get('type')) {
            case 'image':
                this.onViewImage();
                break;
            case 'video':
                this.onViewVideo();
                break;
            case 'audio':
                this.onViewAudio();
                break;
            case 'archive':
                this.onViewArchive(rec);
                break;
        }
    },

    onViewImage : function () {
        var me = this, row;
        if (row = me.getSelectionModel().getSelection()) {
            Ext.ux.Utils.showImage(row[0].get('url'), row[0].get('name'));
        }
    },

    onViewVideo : function () {
        var me = this, row;
        if (row = me.getSelectionModel().getLastSelected()) {
            Ext.ux.Utils.showVideo(row.get('path'), row.get('name'), row.get('option').video.width, row.get('option').video.height);
        }
    },

    onViewAudio : function () {
        var me = this, row;
        if (row = me.getSelectionModel().getLastSelected()) {
            Ext.ux.Utils.showVideo(row.get('path'), row.get('name'), 480, 200, '/modules/UserFiles/ux/img/water.gif');
        }
    },

    onViewArchive : function (rec) {
        var wnd = Ext.create('Ext.window.Window', {
            title : __.archive + rec.get('path'),
            iconCls : 'compress',
            width : 1024,
            height : 800,
            minWidth : 900,
            minHeight : 700,
            maximized : false,
            maximizable : true,
            modal : true,
            plain : true,
            border : false,
            bodyStyle : {
                overflowX : 'hidden',
                overflowY : 'auto'
            },
            items : [{
                xtype : 'userfilesarchive',
                fileName : rec.get('path')
            }]
        });
        wnd.show();
    },

    reloadGrid : function (callbackFn) {
        this.store.proxy.extraParams.path = this.currentPath;
        if (Ext.isFunction(callbackFn)) {
            this.getStore().load({
                callback : function (records, operation, success) {
                    callbackFn(records, operation, success);
                }
            });
        } else {
            this.getStore().load();
        }
        this.getSelectionModel().deselectAll();
    },

    isDisablePaste : function (path) {
        return (this.clipboardPath === this.currentPath) || !this.clipboard.length;
    }
});

