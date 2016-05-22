Ext.define('Ext.ux.Variables', {
    uses: [
        'Ext.data.ArrayStore'
    ],
    constructor: function () {
        this.availableEditors = Ext.create('Ext.data.ArrayStore', {
            fields: [
                'id', 'text'
            ],
            data: [
                ['tinymce', 'TinyMCE'],
                ['htmleditor', 'ExtJS HtmlEditor']
            ]
        }),
            this.availableLayouts = Ext.create('Ext.data.ArrayStore', {
                fields: [
                    'layout', 'text'],
                data: [
                    ['bcms7', 'BCMS7']
                ]
            }),
            this.availableIcons = Ext.create('Ext.data.ArrayStore', {
                fields: [
                    'size', 'text'
                ],
                data: [
                    ['32', 'Small (32x32)'],
                    ['48', 'Medium (48x48)'],
                    ['64', 'Large (64x64)']
                ]
            }),
            this.availableThemes = Ext.create('Ext.data.ArrayStore', {
                fields: [
                    'id', 'text'
                ],
                data: [
                    ['bcms7', 'BCMS7'],
                    ['bcms7-touch', 'BCMS7-Touch']
                ]
            })
    }
});
