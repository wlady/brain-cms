/**
 *  module.GoogleMaps.ux.MercatorProjection
 *
 *  ExtJS 4 google map helper by wlady2001 at gmail dot com
 *
 */
Ext.ns('App');

Ext.define('module.GoogleMaps.ux.MercatorProjection', {
    constructor: function () {
        this.pixelOrigin = new google.maps.Point(App.gmapTileSize / 2, App.gmapTileSize / 2);
        this.pixelsPerLonDegree = App.gmapTileSize / 360;
        this.pixelsPerLonRadian = App.gmapTileSize / (2 * Math.PI);
    },

    fromLatLngToPoint: function (latLng, opt_point) {
        var me = this;
        var point = opt_point || new google.maps.Point(0, 0);
        var origin = me.pixelOrigin;

        point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree;

        // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
        // 89.189.  This is about a third of a tile past the edge of the world tile.

        var siny = me.bound(Math.sin(me.degreesToRadians(latLng.lat())), -0.9999, 0.9999);
        point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian;
        return point;
    },

    fromPointToLatLng: function (point) {
        var me = this;
        var origin = me.pixelOrigin;
        var lng = (point.x - origin.x) / me.pixelsPerLonDegree;
        var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian;
        var lat = me.radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
        return new google.maps.LatLng(lat, lng);
    },

    bound: function (value, opt_min, opt_max) {
        if (opt_min != null) value = Math.max(value, opt_min);
        if (opt_max != null) value = Math.min(value, opt_max);
        return value;
    },

    radiansToDegrees: function (rad) {
        return rad / (Math.PI / 180);
    },

    degreesToRadians: function (deg) {
        return deg * (Math.PI / 180);
    }

});
