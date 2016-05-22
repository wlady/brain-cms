Ext.define('YoutubeIcons', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'code', type: 'string'},
        {name: 'name', type: 'string'}
    ]
});

/**
 * @class module.Pictures.ux.IconBrowser
 * @extends Ext.view.View
 */
Ext.define('module.Pictures.ux.IconBrowser', {
    extend: 'Ext.view.View',
    alias: 'widget.youtubeiconbrowser',

    uses: 'Ext.data.Store',
    id: 'yt-chooser-view',
    singleSelect: true,
    overItemCls: 'x-view-over',
    itemSelector: 'div.thumb-wrap',
    tpl: [
        '<tpl for=".">',
        '<div class="thumb-wrap">',
        '<div class="thumb">',
        '<img src="{url}" width="120" height="90" />',
        '</div>',
        '</div>',
        '</tpl>'
    ],

    initComponent: function () {
        this.store = Ext.create('Ext.data.Store', {
            model: 'YoutubeIcons',
            data: [
                {code: this.code, name: "default.jpg"},
                {code: this.code, name: "1.jpg"},
                {code: this.code, name: "2.jpg"},
                {code: this.code, name: "3.jpg"}
            ]
        });
        this.callParent(arguments);
    },

    prepareData: function (data) {
        Ext.apply(data, {
            url: Ext.String.format('http://img.youtube.com/vi/{0}/{1}', data.code, data.name)
        });
        return data;
    }
});
