/**
 *  module.GoogleMaps.ux.Window
 *
 *  ExtJS 4 google map window by wlady2001 at gmail dot com
 *
 */

/*
 Usage examples.
 Mode 'markers' allows to add multiple markers to the Google map.


 Ext.create('module.GoogleMaps.ux.Window', {
 mode: 'markers',
 markers: [
 {
 marker: {title: '465 Huntington Avenue, Boston, MA, 02215-5597, USA'},
 geoCodeAddr: '465 Huntington Avenue, Boston, MA, 02215-5597, USA'
 },{
 marker: {title: 'Hawaii Maui, USA'},
 geoCodeAddr: 'Hawaii Maui, USA'
 }],
 callback: function(data) {
 if (!Ext.isEmpty(data.markers)) {
 Ext.each(data.markers, function(item) {
 console.log([item.position.lat(), item.position.lng()]);
 });
 }
 }
 });

 Mode 'place' allows to add only one maker to the Google map.

 Ext.create('module.GoogleMaps.ux.Window', {
 mode: 'place',
 setCenter: {
 geoCodeAddr: '4 Yawkey Way, Boston, MA, 02215-3409, USA',
 marker: {title: 'Fenway Park'}
 },
 callback: function(data) {
 if (!Ext.isEmpty(data.markers)) {
 console.log([data.markers[0].position.lat(), data.markers[0].position.lng()]);
 }
 }
 });

 */
Ext.ns('App');

Ext.require([
    'Ext.ColorPalette',
    'module.GoogleMaps.ux.MapSearchAddress',
    'module.GoogleMaps.ux.Panel'
]);
Ext.define('module.GoogleMaps.ux.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.gmapwindow',
    title: __.view_map,
    iconCls: 'googleMap',
    modal: true,
    layout: 'fit',
    //maximized: true,
    maximizable: true,
    width: 900,
    height: 600,
    minWidth: 640,
    minHeight: 480,
    closeAction: 'destroy',
    stateful: true,
    stateId: 'googleMapWindowState',
    stateEvents: ['savestate'],
    autoShow: true,
    autoRender: true,
    plain: true,
    // custom
    showGrid: false,
    showCoordinates: false,
    constructor: function (config) {
        var me = this;
        Ext.applyIf(me, config || {});
        // create reference object explicitly
        this.gmappanel = Ext.create('module.GoogleMaps.ux.Panel', {
            id: 'bcmsgooglemap',
            mode: me.mode || 'view',
            zoomLevel: me.zoomLevel || 7,
            gmapType: me.gmapType || 'map',
            mapConfOpts: me.mapConfOpts || ['enableDragging'],
            mapControls: me.mapControls || ['GLargeMapControl', 'GMapTypeControl', 'NonExistantControl'],
            setCenter: me.setCenter || {lat: 0, lng: 0},
            markers: me.markers || []
        });
        this.items = this.gmappanel;
        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {
                    text: __.google_search,
                    menu: {
                        items: [
                            {
                                text: __.google_addr,
                                tooltip: __.google_addr_tt,
                                iconCls: 'ic-find',
                                handler: function (item, e) {
                                    item.up('toolbar').getComponent('searchFieldCoords').hide();
                                    item.up('toolbar').getComponent('searchFieldAddr').show();
                                }
                            }, {
                                text: __.google_coords,
                                tooltip: __.google_coords_tt,
                                iconCls: 'ic-find',
                                handler: function (item, e) {
                                    item.up('toolbar').getComponent('searchFieldAddr').hide();
                                    item.up('toolbar').getComponent('searchFieldCoords').show();
                                }
                            }]
                    }
                }, {
                    xtype: 'mapsearchaddress',
                    width: 335,
                    labelWidth: 80,
                    labelAlign: 'right',
                    fieldLabel: __.google_addr,
                    qtips: __.google_addr_tt,
                    itemId: 'searchFieldAddr',
                    hidden: false,
                    handler: function () {
                        me.gmappanel.geoSearch(this.getValue(), {title: this.getValue()});
                    }
                }, {
                    xtype: 'fieldcontainer',
                    width: 335,
                    labelWidth: 80,
                    labelAlign: 'right',
                    fieldLabel: __.google_coords,
                    qtips: __.google_coords_tt,
                    itemId: 'searchFieldCoords',
                    layout: 'hbox',
                    hidden: true,
                    defaults: {
                        hideLabel: true,
                        hideTrigger: true
                    },
                    items: [
                        {
                            xtype: 'numberfield',
                            decimalPrecision: 6,
                            name: 'lat',
                            itemId: 'lat',
                            vtype: 'latitude',
                            width: 100,
                            padding: '0 5 0 0',
                            listeners: {
                                specialkey: function (f, e) {
                                    if (e.getKey() == e.ENTER) {
                                        me.onCoordsClick();
                                    }
                                }
                            }
                        }, {
                            xtype: 'numberfield',
                            decimalPrecision: 6,
                            name: 'lng',
                            itemId: 'lng',
                            vtype: 'longitude',
                            width: 100,
                            listeners: {
                                specialkey: function (f, e) {
                                    if (e.getKey() == e.ENTER) {
                                        me.onCoordsClick();
                                    }
                                }
                            }
                        }, {
                            xtype: 'button',
                            iconCls: 'clearsearch',
                            itemId: 'clrsearch',
                            handler: Ext.bind(this.onCoordsClearClick, this)
                        }, {
                            xtype: 'button',
                            iconCls: 'search',
                            handler: Ext.bind(this.onCoordsClick, this)
                        }]
                }, '->', {
                    text: __.gmapopts,
                    iconCls: 'ic-preferences',
                    tooltip: __.gmapopts_tt,
                    itemId: 'mapOpts',
                    menu: {
                        items: [
                            {
                                text: __.capturecoords,
                                checked: me.showCoordinates,
                                checkHandler: function (el, state) {
                                    me.showCoordinates = state;
                                    me.gmappanel.fireEvent('showcoordinates', state);
                                    me.fireEvent('savestate');
                                }
                            }, {
                                text: __.viewtilegrid,
                                checked: me.showGrid,
                                checkHandler: function (el, state) {
                                    me.showGrid = state;
                                    me.gmappanel.fireEvent('showgrid', state);
                                    me.fireEvent('savestate');
                                }
                            }, {
                                text: __.tilegridcolor,
                                iconCls: 'palette',
                                menu: {
                                    showSeparator: false,
                                    items: [
                                        Ext.create('Ext.ColorPalette', {
                                            listeners: {
                                                select: function (cp, color) {
                                                    App.gmapGridColor = color;
                                                    cp.up().down('textfield').setValue(color);
                                                    me.gmappanel.fireEvent('redrawgrid');
                                                    me.fireEvent('savestate');
                                                }
                                            }
                                        }), '-', {
                                            xtype: 'textfield',
                                            vtype: 'hexnumber',
                                            maskRe: /^[a-fA-F0-9]+$/,
                                            maxLength: 6,
                                            name: 'color',
                                            value: me.gmapGridColor,
                                            listeners: {
                                                specialkey: function (cp, e) {
                                                    if (e.getKey() == e.ENTER) {
                                                        App.gmapGridColor = cp.getValue();
                                                        me.gmappanel.fireEvent('redrawgrid');
                                                        me.fireEvent('savestate');
                                                    }
                                                }
                                            },
                                            blur: function (cp) {
                                                App.gmapGridColor = cp.getValue();
                                                me.gmappanel.fireEvent('redrawgrid');
                                                me.fireEvent('savestate');
                                            }
                                        }
                                    ]
                                }
                            }]
                    }
                }],
            listeners: {
                afterrender: function (tb) {
                    if (Ext.isArray(tb.items.items)) {
                        Ext.each(tb.items.items, function (obj) {
                            if (obj.qtips) {
                                obj.tip = Ext.create('Ext.tip.ToolTip', {
                                    target: obj.getEl(),
                                    trackMouse: true,
                                    html: obj.qtips
                                });
                            }
                        });
                    }
                    me.applyStateful();
                }
            }
        }, {
            xtype: 'toolbar',
            ui: 'footer',
            dock: 'bottom',
            margin: '10 0 10 0',
            layout: {
                pack: 'center'
            },
            defaults: {
                width: 80
            },
            items: [
                {
                    text: __.ok,
                    scope: this,
                    handler: Ext.bind(this.onOk, this)
                }, {
                    text: __.cancel,
                    handler: Ext.bind(this.onClose, this)
                }]
        }];
        Ext.apply(this, config);
        this.callParent(arguments);
    },

    getState: function () {
        return {showGrid: this.showGrid, showCoordinates: this.showCoordinates, gmapGridColor: App.gmapGridColor};
    },

    applyState: function (state) {
        this.showCoordinates = state.showCoordinates || false;
        this.showGrid = state.showGrid || false;
        App.gmapGridColor = state.gmapGridColor || 'AAA';
    },

    applyStateful: function () {
        var menu = this.getDockedItems()[1].getComponent('mapOpts');
        menu.menu.items.items[0].checked = this.showCoordinates;
        menu.menu.items.items[1].checked = this.showGrid;
        menu.menu.items.items[2].menu.items.items[2].setValue(App.gmapGridColor);
    },

    onCoordsClick: function () {
        var fldset = this.getDockedItems()[1].getComponent('searchFieldCoords');
        if (!Ext.isEmpty(fldset)) {
            var lat = fldset.getComponent('lat'),
                lng = fldset.getComponent('lng');
            if (lat.isValid() && lng.isValid()) {
                var val = Ext.String.format('{0}, {1}', lat.getValue(), lng.getValue());
                this.gmappanel.geoSearchCoordinates(val, {title: val});
            }
        }
    },

    onCoordsClearClick: function () {
        var fldset = this.getDockedItems()[1].getComponent('searchFieldCoords');
        if (!Ext.isEmpty(fldset)) {
            fldset.getComponent('lat').setValue('');
            fldset.getComponent('lng').setValue('');
        }
    },

    onOk: function () {
        if (typeof(this.callback) == 'function') {
            this.callback(this.gmappanel.getUserData());
        }
        this.close();
    },

    onClose: function () {
        this.close();
    }

});
