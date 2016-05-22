Ext.ns('App');
Ext.require([
    'Ext.ux.form.field.MainContainerWrap'
]);
Ext.define('Ext.ux.layouts.bcms7.layout', {
    extend : 'Ext.container.Viewport',
    xtype : 'mainviewport',
    config : {
        cls : 'bcms-dash-viewport',
        requires : [
            'Ext.list.Tree'
        ],
        layout : {
            type : 'vbox',
            align : 'stretch'
        },
        items : [{
            itemId : 'headerBar',
            xtype : 'toolbar',
            cls : 'bcms-dash-dash-headerbar toolbar-btn-shadow',
            height : 44,
            items : [{
                itemId : 'bcmslogo',
                xtype : 'component',
                cls : 'bcms-logo',
                html : '<div class="main-logo"><img src="img/logo-small-white.svg">' + __.bcmsver + '</div>',
                width : 230
            }, {
                ui : 'header',
                iconCls : 'ic-menu',
                cls : 'delete-focus-bg',
                margin : '0 0 0 8',
                handler : function (el) {
                    var me = this,
                        mainViewPort = el.up('mainviewport'),
                        headerBar = mainViewPort.getComponent('headerBar'),
                        bcmslogo = headerBar.getComponent('bcmslogo'),
                        wrapContainer = mainViewPort.getComponent('mainContainerWrap'),
                        navigationList = wrapContainer.getComponent('navigationTreeList'),
                        collapsing = !navigationList.getMicro(),
                        newWidth = collapsing ? 60 : 230;
                    if (Ext.isIE9m || !Ext.os.is.Desktop) {
                        Ext.suspendLayouts();
                        bcmslogo.setWidth(newWidth);
                        navigationList.setWidth(newWidth);
                        navigationList.setMicro(collapsing);
                        Ext.resumeLayouts();
                        wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
                        wrapContainer.updateLayout();
                    } else {
                        if (!collapsing) {
                            navigationList.setMicro(false);
                        }
                        bcmslogo.animate({dynamic : true, to : {width : newWidth}});
                        navigationList.width = newWidth;
                        wrapContainer.updateLayout({isRoot : true});
                        navigationList.el.addCls('nav-tree-animating');
                        if (collapsing) {
                            navigationList.on({
                                afterlayoutanimation : function () {
                                    navigationList.setMicro(true);
                                    navigationList.el.removeCls('nav-tree-animating');
                                },
                                single : true
                            });
                        }
                    }
                }
            }, '->', {
                ui : 'header',
                text : __.purge_cache,
                tooltip : __.purge_cache_tt,
                iconCls : 'ic-purge',
                handler : Ext.ux.Utils.purgeCache
            }, {
                ui : 'header',
                text : __.exit,
                tooltip : __.exit,
                iconCls : 'ic-sign-out',
                handler : Ext.ux.Utils.exit
            }]
        }, {
            itemId : 'mainContainerWrap',
            xtype : 'maincontainerwrap',
            flex : 1,
            items : [{
                itemId : 'navigationTreeList',
                xtype : 'treelist',
                ui : 'navigation',
                width : 230,
                expanderFirst : false,
                expanderOnly : false,
                singleExpand : true,
                listeners : {
                    itemclick : function (record, item) {
                        if (Ext.isEmpty(item.node.childNodes)) {
                            Ext.ux.Utils.loadModulePanel(item.node.data.path);
                        }
                    }
                }
            }, {
                itemId : 'contentPanel',
                xtype : 'container',
                cls : 'bcms-dash-right-main-container',
                layout : 'fit',
                autoHeight : true,
                flex : 1,
                items : App.editorTabs
            }]
        }]
    },
    initComponent : function () {
        var me = this;
        this.treeStore = {
            root : {
                expanded : true,
                children : treeStore
            }
        };
        this.config.items[1].items[0].store = this.treeStore;
        Ext.apply(this, this.config);
        this.callParent(arguments);
        this.on('afterrender', function () {
            Ext.ux.Utils.hidePreloader();
        }, this);
    }
});

