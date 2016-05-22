/**
 *  module.GoogleMaps.ux.Panel
 *
 *  ExtJS 4 google map panel by wlady2001 at gmail dot com
 *
 */
Ext.ns('App');

Ext.require([
    'module.GoogleMaps.ux.CoordMapType'
]);

App.gmapTileSize = 256;

Ext.define('module.GoogleMaps.ux.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.gmappanel',
    /**
     * @cfg {Boolean} border
     * Defaults to <tt>false</tt>.  See {@link Ext.Panel}.<code>{@link Ext.Panel#border border}</code>.
     */
    border: false,


    /**
     * @cfg {Array} respErrors
     * An array of msg/code pairs.
     */
    respErrors: [{
        code: 'UNKNOWN_ERROR',
        msg: 'A geocoding or directions request could not be successfully processed, yet the exact reason for the failure is not known.'
    }, {
        code: 'ERROR',
        msg: 'There was a problem contacting the Google servers.'
    }, {
        code: 'ZERO_RESULTS',
        msg: 'The request did not encounter any errors but returns zero results.'
    }, {
        code: 'INVALID_REQUEST',
        msg: 'This request was invalid.'
    }, {
        code: 'REQUEST_DENIED',
        msg: 'The webpage is not allowed to use the geocoder for some reason.'
    }, {
        code: 'OVER_QUERY_LIMIT',
        msg: 'The webpage has gone over the requests limit in too short a period of time.'
    }],
    /**
     * @cfg {Array} locationTypes
     * An array of msg/code/level pairs.
     */
    locationTypes: [{
        level: 4,
        code: 'ROOFTOP',
        msg: 'The returned result is a precise geocode for which we have location information accurate down to street address precision.'
    }, {
        level: 3,
        code: 'RANGE_INTERPOLATED',
        msg: 'The returned result reflects an approximation (usually on a road) interpolated between two precise points (such as intersections). Interpolated results are generally returned when rooftop geocodes are unavailable for a street address.'
    }, {
        level: 2,
        code: 'GEOMETRIC_CENTER',
        msg: 'The returned result is the geometric center of a result such as a polyline (for example, a street) or polygon (region).'
    }, {
        level: 1,
        code: 'APPROXIMATE',
        msg: 'The returned result is approximate.'
    }],
    /**
     * @cfg {String} respErrorTitle
     * Defaults to <tt>'Error'</tt>.
     */
    respErrorTitle: 'Error',
    /**
     * @cfg {String} geoErrorMsgUnable
     * Defaults to <tt>'Unable to Locate the Address you provided'</tt>.
     */
    geoErrorMsgUnable: 'Unable to Locate the Address you provided',
    /**
     * @cfg {String} geoErrorTitle
     * Defaults to <tt>'Address Location Error'</tt>.
     */
    geoErrorTitle: 'Address Location Error',
    /**
     * @cfg {String} geoErrorMsgAccuracy
     * Defaults to <tt>'The address provided has a low accuracy.<br><br>{0} Accuracy.'</tt>.
     * <div class="mdetail-params"><ul>
     * <li><b><code>ROOFTOP</code></b> : <div class="sub-desc"><p>
     * The returned result is a precise geocode for which we have location information accurate down to street address precision.
     * </p></div></li>
     * <li><b><code>RANGE_INTERPOLATED</code></b> : <div class="sub-desc"><p>
     * The returned result reflects an approximation (usually on a road) interpolated between two precise points (such as intersections). Interpolated results are generally returned when rooftop geocodes are unavailable for a street address.
     * </p></div></li>
     * <li><b><code>GEOMETRIC_CENTER</code></b> : <div class="sub-desc"><p>
     * The returned result is the geometric center of a result such as a polyline (for example, a street) or polygon (region).
     * </p></div></li>
     * <li><b><code>APPROXIMATE</code></b> : <div class="sub-desc"><p>
     * The returned result is approximate.
     * </p></div></li>
     * </ul></div>
     */
    geoErrorMsgAccuracy: 'The address provided has a low accuracy.<br><br>"{0}" Accuracy.<br><br>{1}',
    /**
     * @cfg {String} gmapType
     * The type of map to display, generic options available are: 'map', 'panorama'.
     * Defaults to <tt>'map'</tt>.
     * More specific maps can be used by specifying the google map type:
     * <div class="mdetail-params"><ul>
     * <li><b><code>G_NORMAL_MAP</code></b> : <div class="sub-desc"><p>
     * Displays the default road map view
     * </p></div></li>
     * <li><b><code>G_SATELLITE_MAP</code></b> : <div class="sub-desc"><p>
     * Displays Google Earth satellite images
     * </p></div></li>
     * <li><b><code>G_HYBRID_MAP</code></b> : <div class="sub-desc"><p>
     * Displays a mixture of normal and satellite views
     * </p></div></li>
     * <li><b><code>G_DEFAULT_MAP_TYPES</code></b> : <div class="sub-desc"><p>
     * Contains an array of the above three types, useful for iterative processing.
     * </p></div></li>
     * <li><b><code>G_PHYSICAL_MAP</code></b> : <div class="sub-desc"><p>
     * Displays a physical map based on terrain information.
     * </p></div></li>
     * <li><b><code>G_MOON_ELEVATION_MAP</code></b> : <div class="sub-desc"><p>
     * Displays a shaded terrain map of the surface of the Moon, color-coded by altitude.
     * </p></div></li>
     * <li><b><code>G_MOON_VISIBLE_MAP</code></b> : <div class="sub-desc"><p>
     * Displays photographic imagery taken from orbit around the moon.
     * </p></div></li>
     * <li><b><code>G_MARS_ELEVATION_MAP</code></b> : <div class="sub-desc"><p>
     * Displays a shaded terrain map of the surface of Mars, color-coded by altitude.
     * </p></div></li>
     * <li><b><code>G_MARS_VISIBLE_MAP</code></b> : <div class="sub-desc"><p>
     * Displays photographs taken from orbit around Mars.
     * </p></div></li>
     * <li><b><code>G_MARS_INFRARED_MAP</code></b> : <div class="sub-desc"><p>
     * Displays a shaded infrared map of the surface of Mars, where warmer areas appear brighter and colder areas appear darker.
     * </p></div></li>
     * <li><b><code>G_SKY_VISIBLE_MAP</code></b> : <div class="sub-desc"><p>
     * Displays a mosaic of the sky, as seen from Earth, covering the full celestial sphere.
     * </p></div></li>
     * </ul></div>
     * Sample usage:
     * <pre><code>
     * gmapType: G_MOON_VISIBLE_MAP
     * </code></pre>
     */
    gmapType: 'map',
    /**
     * @cfg {Object} setCenter
     * The initial center location of the map. The map needs to be centered before it can be used.
     * A marker is not required to be specified.
     * More markers can be added to the map using the <code>{@link #markers}</code> array.
     * For example:
     * <pre><code>
     setCenter: {
	geoCodeAddr: '4 Yawkey Way, Boston, MA, 02215-3409, USA',
	marker: {title: 'Fenway Park'}
},

     // or just specify lat/long
     setCenter: {
	lat: 42.345573,
	lng: -71.098326
}
     * </code></pre>
     */
    /**
     * @cfg {Number} zoomLevel
     * The zoom level to initialize the map at, generally between 1 (whole planet) and 40 (street).
     * Also used as the zoom level for panoramas, zero specifies no zoom at all.
     * Defaults to <tt>3</tt>.
     */
    zoomLevel: 3,
    /**
     * @cfg {Number} yaw
     * The Yaw, or rotational direction of the users perspective in degrees. Only applies to panoramas.
     * Defaults to <tt>180</tt>.
     */
    yaw: 180,
    /**
     * @cfg {Number} pitch
     * The pitch, or vertical direction of the users perspective in degrees.
     * Defaults to <tt>0</tt> (straight ahead). Valid values are between +90 (straight up) and -90 (straight down).
     */
    pitch: 0,
    /**
     * @cfg {Boolean} displayGeoErrors
     * True to display geocoding errors to the end user via a message box.
     * Defaults to <tt>false</tt>.
     */
    displayGeoErrors: false,
    /**
     * @cfg {Boolean} minGeoAccuracy
     * The level to display an accuracy error below. Defaults to <tt>ROOFTOP</tt>. For additional information
     * see <a href="http://code.google.com/apis/maps/documentation/reference.html#GGeoAddressAccuracy">here</a>.
     */
    minGeoAccuracy: 'ROOFTOP',
    /**
     * @cfg {Array} mapConfOpts
     * Array of strings representing configuration methods to call, a full list can be found
     * <a href="http://code.google.com/apis/maps/documentation/reference.html#GMap2">here</a>.
     * For example:
     * <pre><code>
     * mapConfOpts: ['enableScrollWheelZoom','enableDoubleClickZoom','enableDragging'],
     * </code></pre>
     */
    /**
     * @cfg {Array} mapControls
     * Array of strings representing map controls to initialize, a full list can be found
     * <a href="http://code.google.com/apis/maps/documentation/reference.html#GControlImpl">here</a>.
     * For example:
     * <pre><code>
     * mapControls: ['GSmallMapControl','GMapTypeControl','NonExistantControl']
     * </code></pre>
     */
    /**
     * @cfg {Array} markers
     * Markers may be added to the map. Instead of specifying <code>lat</code>/<code>lng</code>,
     * geocoding can be specified via a <code>geoCodeAddr</code> string.
     * For example:
     * <pre><code>
     markers: [{
	//lat: 42.339641,
	//lng: -71.094224,
	// instead of lat/lng:
	geoCodeAddr: '465 Huntington Avenue, Boston, MA, 02215-5597, USA',
	marker: {title: 'Boston Museum of Fine Arts'},
	listeners: {
		click: function(e) {
			Ext.Msg.alert('Its fine', 'and its art.');
		}
	}
},{
	lat: 42.339419,
	lng: -71.09077,
	marker: {title: 'Northeastern University'}
}]
     * </code></pre>
     */
    /*
     * @cfg {String} mode
     * Can be
     * - 'view'  - simple google map
     * - 'place' - a single marker can be added by mouse click
     */
    mode: 'place',

    mapTypeId: '',

    markers: [],
    polylines: [],
    polygons: [],
    infowindows: [],

    userData: {
        markers: [],
        polylines: []
    },
    // private
    mapDefined: false,
    // private
    mapDefinedGMap: false,

    latLngControl: false,
    captureCoords: false,

    selectedMarker: false,
    selectedPolygon: false,
    selectedPolylines: false,
    lastCenter: false,

    // shared states values
    stateful: true,
    stateId: 'googleMapWindowState',
    stateEvents: ['dummy'],

    showGridState: false,

    constructor: function (config) {
        Ext.apply(this, config || {});
        this.callParent(arguments);
        this.on({
            afterrender: this.initMap,
            showgrid: this.showGrid,
            redrawgrid: this.redrawGrid,
            showcoordinates: this.setCaptureState,
            mapready: this.mapReadyEvent,
            scope: this
        });
    },

    afterRender: function () {
        var wh = this.ownerCt.getSize();
        Ext.applyIf(this, wh);
        this.callParent(arguments);
        //this.fireEvent('apiready', this, this.initMap());
    },

    initMap: function () {
        this.userData = {
            markers: [],
            polygons: [],
            polylines: []
        };
        if (this.gmapType === 'map') {
            this.gmap = new google.maps.Map(this.body.dom,
                {
                    navigationControl: this.navigationControl,
                    mapTypeControl: this.mapTypeControl,
                    scaleControl: this.scaleControl,
                    zoom: this.zoomLevel,
                    mapTypeId: this.mapTypeId || google.maps.MapTypeId.ROADMAP
                }
            );
            this.mapDefined = true;
            this.mapDefinedGMap = true;
        }
        if (!this.mapDefined && this.gmapType) {
            this.gmap = new google.maps.Map(this.body.dom, {
                zoom: this.zoomLevel,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            this.gmap.setMapType(this.gmapType);
            this.mapDefined = true;
            this.mapDefinedGMap = true;
        }
        this.gmap.cMenuMap = Ext.create('Ext.menu.Menu', {
            title: __.google_context,
            iconCls: 'googleMap',
            items: [{
                text: __.remove_all_objs,
                iconCls: 'del',
                handler: Ext.bind(this.clearAllObjects, this)
            }]
        });
        this.gmap.cMenuMarkers = Ext.create('Ext.menu.Menu', {
            title: __.google_context,
            iconCls: 'googleMap',
            items: [{
                text: __.remove_selected_marker,
                iconCls: 'del',
                handler: Ext.bind(this.removeMarker, this, [this])
            }, {
                text: __.remove_all_markers,
                iconCls: 'del',
                handler: Ext.bind(this.clearAllMarkers, this)
            }]
        });
        this.gmap.cMenuPolygons = Ext.create('Ext.menu.Menu', {
            title: __.google_context,
            iconCls: 'googleMap',
            items: [{
                text: __.remove_selected_polygon,
                iconCls: 'del',
                handler: Ext.bind(this.removePolygon, this, [this])
            }, {
                text: __.remove_all_polygons,
                iconCls: 'del',
                handler: Ext.bind(this.clearAllPolygons, this)
            }]
        });
        this.gmap.cMenuPolylines = Ext.create('Ext.menu.Menu', {
            title: __.google_context,
            iconCls: 'googleMap',
            items: [{
                text: __.remove_selected_polyline,
                iconCls: 'del',
                handler: Ext.bind(this.removePolyline, this, [this])
            }, {
                text: __.remove_all_polylines,
                iconCls: 'del',
                handler: Ext.bind(this.clearAllPolylines, this)
            }]
        });
        google.maps.event.addListenerOnce(this.getMap(), 'tilesloaded', Ext.bind(this.onMapReady, this));
        //google.maps.event.addListener( this.getMap(), 'dragend', Ext.bind( this.dragEnd, this ) );
        this.latLngControl = Ext.create('module.GoogleMaps.ux.LatLngControl', {
            map: this.getMap()
        });
        google.maps.event.addListener(this.getMap(), 'mouseover', Ext.bind(this.coordsVisible, this, [true]));
        google.maps.event.addListener(this.getMap(), 'mouseout', Ext.bind(this.coordsVisible, this, [false]));
        google.maps.event.addListener(this.getMap(), 'mousemove', Ext.bind(this.coordsShow, this));
        google.maps.event.addListener(this.getMap(), 'click', Ext.bind(this.onMapClick, this));
        google.maps.event.addListener(this.getMap(), 'rightclick', function (event) {
            var wnd = me.up('panel').getEl().getBox();
            var point = me.latLngControl.getPosition(event.latLng);
            me.getMap().cMenuMap.showAt(wnd.x + point.x, wnd.y + point.y);
        });
        var me = this;
        me.latlngbounds = new google.maps.LatLngBounds();
        if (!Ext.isEmpty(this.setCenter)) {
            if (Ext.isString(this.setCenter.geoCodeAddr)) {
                this.geoCodeLookup(this.setCenter.geoCodeAddr, this.setCenter.marker, false, true, this.setCenter.listeners);
            } else {
                if (this.gmapType === 'map') {
                    var point = this.fixLatLng(new google.maps.LatLng(this.setCenter.lat, this.setCenter.lng));
                    this.getMap().setCenter(point, this.zoomLevel);
                }
                if (!Ext.isEmpty(this.setCenter.marker) && !Ext.isEmpty(point)) {
                    this.addMarker(point, this.setCenter.marker, this.setCenter.marker.clear);
                }
            }
        }
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.MARKER,
                    google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.POLYLINE
                ]
            },
            markerOptions: {
                editable: true
            },
            polygonOptions: {
                editable: true
            },
            polylineOptions: {
                editable: true
            }
        });
        drawingManager.setMap(this.getMap());
        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
            Ext.apply(polygon, {
                obj: me
            });
            google.maps.event.addListener(polygon, 'rightclick', function (event) {
                this.getMap().selectedPolygon = this;
                var wnd = this.obj.up('panel').getEl().getBox();
                var point = this.obj.latLngControl.getPosition(event.latLng);
                this.getMap().cMenuPolygons.showAt(wnd.x + point.x, wnd.y + point.y);
            });
            me.userData.polygons.push(polygon);
        });
        google.maps.event.addListener(drawingManager, 'polylinecomplete', function (polyline) {
            Ext.apply(polyline, {
                obj: me
            });
            google.maps.event.addListener(polyline, 'rightclick', function (event) {
                this.getMap().selectedPolyline = this;
                var wnd = this.obj.up('panel').getEl().getBox();
                var point = this.obj.latLngControl.getPosition(event.latLng);
                this.getMap().cMenuPolylines.showAt(wnd.x + point.x, wnd.y + point.y);
            });
            me.userData.polylines.push(polyline);
        });
        google.maps.event.addListener(drawingManager, 'markercomplete', function (marker) {
            Ext.apply(marker, {
                obj: me
            });
            if (me.mode == 'place') {
                me.clearMarkers();
            }
            google.maps.event.addListener(marker, 'rightclick', function (event) {
                this.getMap().selectedMarker = this;
                var wnd = this.obj.up('panel').getEl().getBox();
                var point = this.obj.latLngControl.getPosition(event.latLng);
                this.getMap().cMenuMarkers.showAt(wnd.x + point.x, wnd.y + point.y);
            });
            me.userData.markers.push(marker);
        });
        this.showGrid(this.showGridState);
    },

    // private
    onMapReady: function () {
        if (this.mode != 'view') {
            this.addMarkers(this.markers);
        }
        /*
         this.fireEvent('mapready', this);
         */
        var me = this;
        setTimeout(
            function () {
                me.setBounds();
            },
            500
        );
    },

    mapReadyEvent: function () {
        this.setBounds();
    },

    onMapClick: function (o) {
        var clear = this.mode == 'place';
        var point = this.fixLatLng(new google.maps.LatLng(o.latLng.lat(), o.latLng.lng()));
        if (this.mode != 'view') {
            this.addMarker(point, {title: Ext.String.format('{0}, {1}', point.lat(), point.lng())}, clear);
        }
    },

    setBounds: function () {
        if (this.markers.length > 1) {
            this.getMap().fitBounds(this.latlngbounds);
        } else {
            if (this.lastCenter) {
                this.getMap().setCenter(this.lastCenter, this.zoomLevel);
            }
        }
    },

    applyState: function (state) {
        this.showGridState = state.showGrid || false;
        this.captureCoords = state.showCoordinates || false;
    },

    showGrid: function (state) {
        if (!Ext.isEmpty(this.getMap())) {
            if (state) {
                this.getMap().overlayMapTypes.insertAt(0, Ext.create('module.GoogleMaps.ux.CoordMapType'));
            } else {
                if (this.getMap().overlayMapTypes.length) {
                    this.getMap().overlayMapTypes.removeAt(0);
                }
            }
        }
    },

    redrawGrid: function (state) {
        if (this.getMap().overlayMapTypes.length) {
            this.getMap().overlayMapTypes.removeAt(0);
            this.getMap().overlayMapTypes.insertAt(0, Ext.create('module.GoogleMaps.ux.CoordMapType'));
        }
    },

    coordsVisible: function (visible) {
        if (this.getCaptureState()) {
            this.latLngControl.set('visible', visible);
        }
    },

    coordsShow: function (mEvent) {
        if (this.getCaptureState()) {
            this.latLngControl.updatePosition(mEvent.latLng);
        }
    },

    setCaptureState: function (state) {
        this.captureCoords = state;
    },

    getCaptureState: function () {
        return this.captureCoords;
    },

    // private
    onResize: function (w, h) {
        this.superclass.onResize.call(this, w, h);
        // check for the existance of the google map in case the onResize fires too early
        if (!Ext.isEmpty(this.getMap())) {
            google.maps.event.trigger(this.getMap(), 'resize');
            if (this.lastCenter) {
                this.getMap().setCenter(this.lastCenter, this.zoomLevel);
            }
        }
    },

    // private
    setSize: function (width, height, animate) {
        this.superclass.setSize.call(this, width, height, animate);
        // check for the existance of the google map in case setSize is called too early
        if (Ext.isObject(this.getMap())) {
            google.maps.event.trigger(this.getMap(), 'resize');
            if (this.lastCenter) {
                this.getMap().setCenter(this.lastCenter, this.zoomLevel);
            }
        }
    },

    // private
    dragEnd: function () {
        this.lastCenter = this.getMap().getCenter();
    },

    /**
     * Returns the current google map which can be used to call Google Maps API specific handlers.
     * @return {GMap} this
     */
    getMap: function () {
        return this.gmap;
    },

    /**
     * Returns the maps center as a GLatLng object
     * @return {GLatLng} this
     */
    getCenter: function () {
        return this.getMap().getCenter();
    },

    /**
     * Returns the maps center as a simple object
     * @return {Object} this has lat and lng properties only
     */
    getCenterLatLng: function () {
        var ll = this.getCenter();
        return {lat: ll.lat(), lng: ll.lng()};
    },

    /**
     * Creates markers from the array that is passed in. Each marker must consist of at least
     * <code>lat</code> and <code>lng</code> properties or a <code>geoCodeAddr</code>.
     * @param {Array} markers an array of marker objects
     */
    addMarkers: function (markers) {
        if (Ext.isArray(markers)) {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i]) {
                    if (Ext.isString(markers[i].geoCodeAddr)) {
                        this.geoCodeLookup(markers[i].geoCodeAddr, markers[i].marker, false, markers[i].setCenter, markers[i].listeners);
                    } else {
                        var point = new google.maps.LatLng(markers[i].lat, markers[i].lng);
                        this.addMarker(point, markers[i].marker, false, markers[i].setCenter, markers[i].listeners);
                    }
                }
            }
        }
    },

    /**
     * Creates a single marker.
     * @param {Object} point a GLatLng point
     * @param {Object} marker a marker object consisting of at least lat and lng
     * @param {Boolean} clear clear other markers before creating this marker
     * @param {Boolean} center true to center the map on this marker
     * @param {Object} listeners a listeners config
     */
    addMarker: function (point, marker, clear, center, listeners) {
        Ext.applyIf(marker, {});
        if (clear === true) {
            this.clearMarkers();
        }
        if (center === true) {
            this.getMap().setCenter(point, this.zoomLevel)
            this.lastCenter = point;
        }
        this.latlngbounds.extend(point);
        var mark = new google.maps.Marker(Ext.apply(marker, {
            position: point,
            obj: this
        }));
        google.maps.event.addListener(mark, 'rightclick', function (event) {
            this.getMap().selectedMarker = this;
            var wnd = this.obj.up('panel').getEl().getBox();
            var point = this.obj.latLngControl.getPosition(event.latLng);
            this.getMap().cMenuMarkers.showAt(wnd.x + point.x, wnd.y + point.y);
        });
        if (marker.infoWindow) {
            this.createInfoWindow(marker.infoWindow, point, mark);
        }
        this.userData.markers.push(mark);
        mark.setMap(this.getMap());
        if (!Ext.isEmpty(listeners)) {
            for (evt in listeners) {
                google.maps.event.addListener(mark, evt, listeners[evt]);
            }
        }
        return mark;
    },

    /**
     * Creates a single polyline.
     * @param {Array} points an array of polyline points
     * @param {Object} linestyle an object defining the line style to use
     */
    addPolyline: function (points, linestyle) {
        var plinepnts = new google.maps.MVCArray, pline, linestyle = linestyle ? linestyle : {
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        };
        Ext.each(points, function (point) {
            plinepnts.push(new google.maps.LatLng(point.lat, point.lng));
        }, this);
        var pline = new google.maps.Polyline(Ext.apply({
            path: plinepnts
        }, linestyle));
        this.userData.polylines.push(pline);
        pline.setMap(this.getMap());
    },

    /**
     * Creates an Info Window.
     * @param {Object} inwin an Info Window configuration
     * @param {GLatLng} point the point to show the Info Window at
     * @param {GMarker} marker a marker to attach the Info Window to
     */
    createInfoWindow: function (inwin, point, marker) {
        var me = this, infoWindow = new google.maps.InfoWindow({
            content: inwin.content,
            position: point
        });
        if (marker) {
            google.maps.event.addListener(marker, 'click', function () {
                me.hideAllInfoWindows();
                infoWindow.open(me.getMap());
            });
        }
        this.infowindows.push(infoWindow);
        return infoWindow;
    },

    // private
    hideAllInfoWindows: function () {
        for (var i = 0; i < this.infowindows.length; i++) {
            this.infowindows[i].close();
        }
    },

    hideAllObjs: function () {
        Ext.each(this.userData.markers, function (item) {
            item.setMap(null);
        });
        Ext.each(this.userData.polygons, function (item) {
            item.setMap(null);
        });
        Ext.each(this.userData.polylines, function (item) {
            item.setMap(null);
        });
        this.userData = {
            markers: [],
            polygons: [],
            polylines: []
        };
    },

    clearAllObjects: function () {
        var me = this;
        Ext.Msg.show({
            title: __.warning,
            msg: __.are_you_sure,
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.QUESTION,
            minWidth: 400,
            fn: function (btn) {
                if (btn == 'yes') {
                    me.hideAllObjs();
                }
            }
        });
    },

    hidePolygons: function () {
        Ext.each(this.userData.polygons, function (item) {
            item.setMap(null);
        });
        this.userData.polygons = [];
    },

    removePolygon: function (obj) {
        if (!Ext.isEmpty(this.getMap().selectedPolygon)) {
            this.getMap().selectedPolygon.setMap(null);
            this.getMap().selectedPolygon = false;
        }
    },

    clearAllPolygons: function () {
        var me = this;
        Ext.Msg.show({
            title: __.warning,
            msg: __.are_you_sure,
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.QUESTION,
            minWidth: 400,
            fn: function (btn) {
                if (btn == 'yes') {
                    me.hidePolygons();
                }
            }
        });
    },

    hidePolylines: function () {
        Ext.each(this.userData.polylines, function (item) {
            item.setMap(null);
        });
        this.userData.polylines = [];
    },

    removePolyline: function (obj) {
        if (!Ext.isEmpty(this.getMap().selectedPolyline)) {
            this.getMap().selectedPolyline.setMap(null);
            this.getMap().selectedPolyline = false;
        }
    },

    clearAllPolylines: function () {
        var me = this;
        Ext.Msg.show({
            title: __.warning,
            msg: __.are_you_sure,
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.QUESTION,
            minWidth: 400,
            fn: function (btn) {
                if (btn == 'yes') {
                    me.hidePolylines();
                }
            }
        });
    },

    // private
    clearMarkers: function () {
        this.hideAllInfoWindows();
        this.hideMarkers();
    },

    clearAllMarkers: function () {
        var me = this;
        Ext.Msg.show({
            title: __.warning,
            msg: __.are_you_sure,
            buttons: Ext.Msg.YESNO,
            icon: Ext.MessageBox.QUESTION,
            minWidth: 400,
            fn: function (btn) {
                if (btn == 'yes') {
                    me.clearMarkers();
                }
            }
        });
    },

    // private
    hideMarkers: function () {
        Ext.each(this.userData.markers, function (item) {
            item.setMap(null);
        });
        this.userData.markers = [];
    },

    removeMarker: function (obj) {
        if (!Ext.isEmpty(this.getMap().selectedMarker)) {
            this.getMap().selectedMarker.setMap(null);
            this.getMap().selectedMarker = false;
        }
    },

    // private
    showMarkers: function () {
        Ext.each(this.userData.markers, function (item) {
            item.setMap(this.getMap());
        }, this);
    },

    getMarker: function () {
        if (Ext.isArray(this.userData.markers)) {
            return this.userData.markers[this.userData.markers.length - 1];
        }
    },

    getMarkers: function () {
        var markers = [];
        if (Ext.isArray(this.userData.markers)) {
            Ext.each(this.userData.markers, function (item) {
                if (!Ext.isEmpty(item.marker)) {
                    if (!Ext.isEmpty(item.marker.map)) {
                        markers.push(item.marker);
                    }
                } else {
                    if (!Ext.isEmpty(item.map)) {
                        markers.push({title: item.title, position: item.position});
                    }
                }
            });
        }
        return markers;
    },

    getPolygons: function () {
        var polygons = [];
        if (Ext.isArray(this.userData.polygons)) {
            Ext.each(this.userData.polygons, function (item) {
                if (!Ext.isEmpty(item.getMap())) {
                    polygons.push(item);
                }
            });
        }
        return polygons;
    },

    getPolylines: function () {
        var polylines = [];
        if (Ext.isArray(this.userData.polylines)) {
            Ext.each(this.userData.polylines, function (item) {
                if (!Ext.isEmpty(item.getMap())) {
                    polylines.push(item);
                }
            });
        }
        return polylines;
    },

    getUserData: function () {
        return {
            markers: this.getMarkers(),
            polygons: this.getPolygons(),
            polylines: this.getPolylines()
        };
    },

    /**
     * Looks up and address and optionally add a marker, center the map to this location, or
     * clear other markers. Sample usage:
     * <pre><code>
     buttons: [
     {
         text: 'Fenway Park',
         handler: function() {
             var addr = '4 Yawkey Way, Boston, MA, 02215-3409, USA';
             Ext.getCmp('my_map').geoCodeLookup(addr, undefined, false, true, undefined);
         }
     },{
		text: 'Zoom Fenway Park',
		handler: function() {
			Ext.getCmp('my_map').zoomLevel = 19;
			var addr = '4 Yawkey Way, Boston, MA, 02215-3409, USA';
			Ext.getCmp('my_map').geoCodeLookup(addr, undefined, false, true, undefined);
		}
	},{
		text: 'Low Accuracy',
		handler: function() {
			Ext.getCmp('my_map').geoCodeLookup('Paris, France', undefined, false, true, undefined);
		}
	},{


		text: 'Bogus Address',
		handler: function() {
			var addr = 'Some Fake, Address, For, Errors';
			Ext.getCmp('my_map').geoCodeLookup(addr, undefined, false, true, undefined);
		}
	}
     ]
     * </code></pre>
     * @param {String} addr the address to lookup.
     * @param {Object} marker the marker to add (optional).
     * @param {Boolean} clear clear other markers before creating this marker
     * @param {Boolean} center true to set this point as the center of the map.
     * @param {Object} listeners a listeners config
     */
    geoSearch: function (addr, marker) {
        if (this.mode == 'view') {
            marker = null;
        }
        var clear = this.mode == 'place';
        this.geoCodeLookup(addr, marker, clear, true, undefined);
    },

    geoSearchCoordinates: function (coords, marker) {
        if (this.mode == 'view') {
            marker = null;
        }
        var clear = this.mode == 'place';
        var latLng = coords.split(',');
        var lat = parseFloat(latLng[0]);
        var lng = parseFloat(latLng[1]);
        var point = this.fixLatLng(new google.maps.LatLng(lat, lng));
        if (!Ext.isEmpty(point)) {
            this.addMarker(point, marker, clear, true, undefined);
        }
    },

    geoCodeLookup: function (addr, marker, clear, center, listeners) {
        if (!this.geocoder) {
            this.geocoder = new google.maps.Geocoder();
        }
        this.geocoder.geocode({
                address: addr
            }, Ext.bind(this.addAddressToMap, this, [addr, marker, clear, center, listeners], true)
        );
    },
    // private
    centerOnClientLocation: function () {
        this.getClientLocation(function (loc) {
            var point = new google.maps.LatLng(loc.latitude, loc.longitude);
            this.getMap().setCenter(point, this.zoomLevel);
            this.lastCenter = point;
        });
    },

    // private
    getClientLocation: function (fn, errorFn) {
        if (!errorFn) {
            errorFn = Ext.emptyFn;
        }
        if (!this.clientGeo) {
            this.clientGeo = google.gears.factory.create('beta.geolocation');
        }
        geo.getCurrentPosition(Ext.bind(fn, this), errorFn);
    },

    // private
    addAddressToMap: function (response, status, addr, marker, clear, center, listeners) {
        if (!response || status !== 'OK') {
            this.respErrorMsg(status);
        } else {
            var place = response[0].geometry.location;
            var accuracy;
            if (false && accuracy === 0) {
                this.geoErrorMsg(this.geoErrorTitle, this.geoErrorMsgUnable);
            } else {
                if (false && accuracy < this.minGeoAccuracy) {
                    this.geoErrorMsg(this.geoErrorTitle, String.format(this.geoErrorMsgAccuracy, accuracy));
                } else {
                    point = this.fixLatLng(new google.maps.LatLng(place.lat(), place.lng()));
                    this.lastCenter = point;
                    if (center) {
                        this.getMap().setCenter(point, this.zoomLevel);
                    }
                    if (!Ext.isEmpty(marker)) {
                        if (!marker.title) {
                            marker.title = response.formatted_address;
                        }
                        Ext.applyIf(marker, {});
                        this.addMarker(point, marker, clear, false, listeners);
                        if (center) {
                            this.setCenter.marker = marker;
                        }
                    }
                }
            }
        }
    },

    // private
    geoErrorMsg: function (title, msg) {
        if (this.displayGeoErrors) {
            Ext.MessageBox.alert(title, msg);
        }
    },

    // private
    respErrorMsg: function (code) {
        Ext.each(this.respErrors, function (obj) {
            if (code == obj.code) {
                Ext.MessageBox.alert(this.respErrorTitle, obj.msg);
            }
        }, this);
    },

    // private
    // used to inverse the lat/lng coordinates to correct locations on the sky map
    fixLatLng: function (llo) {
        if (this.getMap().getMapTypeId() === 'SKY') {
            if (this.getMap().getCurrentMapType().QO == 'visible') {
                llo.lat(180 - llo.lat());
                llo.lng(180 - llo.lng());
            }
        }
        return llo;
    },

    // private
    getLocationTypeInfo: function (location_type, property) {
        var val = 0;
        Ext.each(this.locationTypes, function (itm) {
            if (itm.code === location_type) {
                val = itm[property];
            }
        });
        return val;
    }

});
