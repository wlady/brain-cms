Ext.define('module.UserFiles.ux.ArchiveModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'name'
        }, {
            name: 'path'
        }, {
            name: 'size',
            type: 'int'
        }, {
            name: 'dir',
            type: 'boolean'
        }]
});
