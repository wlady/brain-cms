Ext.define('module.UserFiles.ux.FilesModel', {
    extend: 'Ext.data.Model',
    idProperty: 'path',
    fields: [
        {
            name: 'path'
        }, {
            name: 'name'
        }, {
            name: 'extension'
        }, {
            name: 'lastmod',
            type: 'date',
            dateFormat: 'M d, Y H:i'
        }, {
            name: 'size',
            type: 'int'
        }, {
            name: 'dir',
            type: 'boolean'
        }, {
            name: 'width'
        }, {
            name: 'height'
        }, {
            name: 'url'
        }, {
            name: 'icon'
        }, {
            name: 'type'
        }, {
            name: 'option'
        }]
});
