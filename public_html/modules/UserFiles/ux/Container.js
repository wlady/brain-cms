Ext.ns('App');
Ext.define('module.UserFiles.ux.Container', {
    extend: 'Ext.window.Window',
    uses: [
        'module.UserFiles.ux.Grid',
        'module.UserFiles.ux.Tree',
        'module.UserFiles.ux.SearchName',
        'module.UserFiles.ux.SearchResults'
    ],
    alias: 'widget.userfilesmanager',
    title: __.UserFiles,
    //minWidth: 1024,
    //minHeight: 800,
    padding: 0,
    autoShow: true,
    maximized: true,
    minimizable: false,
    iconCls: 'ic-browse',
    modal: true,
    plain: true,
    //constrain: true,
    border: false,
    layout: 'border',
    bodyBorder: false,
    defaults: {
        collapsible: false,
        split: true,
        bodyPadding: 0,
        autoScroll: true,
        border: true
    },
    onEsc: Ext.emptyFn,
    callback: null,
    singleSelect: true,
    search: '',
    constructor: function (config) {
        var me = this;
        Ext.apply(me, config);
        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            padding: '5 5 5 10',
            items: [{
                xtype: 'label',
                id: 'userfilescurrentpath',
                text: __.currentPath
            }]
        }];
        this.items = [
            {
                region: 'west',
                flex: .5,
                items: [
                    {
                        xtype: 'userfilestree',
                        currentPath: this.uploadPath || ''
                    }]
            }, {
                xtype: 'userfilesgrid',
                region: 'center',
                currentPath: this.uploadPath || '',
                search: this.search,
                flex: 1
            }, {
                xtype: 'panel',
                id: 'userfiledetailpanel',
                region: 'east',
                split: false,
                width: 200
            }, {
                xtype: 'panel',
                id: 'userfilessearchpanel',
                title: __.searchresults,
                region: 'north',
                collapsible: true,
                collapsed: true,
                collapseMode: 'mini',
                height: '100%',
                items: [{
                    xtype: 'userfilessearchresults'
                }]
            }];
        this.callParent(arguments);
    }

});
