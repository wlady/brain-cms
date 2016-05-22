/**
 *  module.GoogleMaps.ux.LatLngControl
 *
 *  ExtJS 4 google map helper by wlady2001 at gmail dot com
 *
 */
/**
 * LatLngControl class displays the LatLng and pixel coordinates
 * underneath the mouse within a container anchored to it.
 * @param {google.maps.Map} map Map to add custom control to.
 */
Ext.define('module.GoogleMaps.ux.LatLngControl', {
    extend: 'google.maps.OverlayView',
    node: null,
    map: null,
    constructor: function (config) {
        if (Ext.isEmpty(config.map)) {
            return false;
        }
        Ext.apply(this, config || {});
        this.callParent();
        /**
         * Offset the control container from the mouse by this amount.
         */
        this.ANCHOR_OFFSET = new google.maps.Point(8, 8);

        /**
         * Pointer to the HTML container.
         */
        this.node = this.createHtmlNode();

        // Add control to the map. Position is irrelevant.
        this.map.controls[google.maps.ControlPosition.TOP].push(this.node);

        // Bind this OverlayView to the map so we can access MapCanvasProjection
        // to convert LatLng to Point coordinates.
        this.setMap(this.map);

        // Register an MVC property to indicate whether this custom control
        // is visible or hidden. Initially hide control until mouse is over map.
        this.set('visible', false);
    },

    getPosition: function (latLng) {
        var projection = this.getProjection();
        return projection.fromLatLngToContainerPixel(latLng);
    },

    createHtmlNode: function () {
        var divNode = document.createElement('div');
        divNode.id = 'latlng-control';
        divNode.index = 100;
        return divNode;
    },

    visible_changed: function () {
        this.node.style.display = this.get('visible') ? '' : 'none';
    },

    updatePosition: function (latLng) {
        var point = this.getPosition(latLng);
        // Update control position to be anchored next to mouse position.
        this.node.style.left = point.x + this.ANCHOR_OFFSET.x + 'px';
        this.node.style.top = point.y + this.ANCHOR_OFFSET.y + 'px';

        // Update control to display latlng and coordinates.
        this.node.innerHTML = [latLng.toUrlValue(6)].join('');
    },

    draw: function () {
    }
});
