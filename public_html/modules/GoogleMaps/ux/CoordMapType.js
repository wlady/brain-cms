/**
 *  module.GoogleMaps.ux.CoordMapType
 *
 *  ExtJS 4 google map helper by wlady2001 at gmail dot com
 *
 */
Ext.ns('App');

Ext.require([
    'module.GoogleMaps.ux.MercatorProjection'
]);

Ext.define('module.GoogleMaps.ux.CoordMapType', {
    constructor: function () {
        this.tileSize = new google.maps.Size(App.gmapTileSize, App.gmapTileSize);
    },

    getTile: function (coord, zoom, ownerDocument) {
        var div = ownerDocument.createElement('DIV');
        div.innerHTML = coord;
        div.className = 'gmapTiles';
        div.style.width = this.tileSize.width + 'px';
        div.style.height = this.tileSize.height + 'px';
        if (!Ext.isEmpty(App.gmapGridColor)) {
            div.style.borderColor = '#' + App.gmapGridColor;
        }
        return div;
    }

});
