/**
 * @class module.pictures.ux.Chooser
 * @extends Ext.window.Window
 */
Ext.define('module.Pictures.ux.Chooser', {
    extend: 'Ext.window.Window',
    uses: 'module.Pictures.ux.IconBrowser',
    height: 120,
    width: 520,
    title: __.youtube_icons,
    iconCls: 'youtubeIcon',
    border: false,
    bodyBorder: false,

    /**
     * initComponent is a great place to put any code that needs to be run when a new instance of a component is
     * created. Here we just specify the items that will go into our Window, plus the Buttons that we want to appear
     * at the bottom. Finally we call the superclass initComponent.
     */
    initComponent: function () {
        this.items = [
            {
                xtype: 'panel',
                height: 96,
                items: {
                    xtype: 'youtubeiconbrowser',
                    code: this.code,
                    listeners: {
                        scope: this,
                        itemdblclick: this.fireImageSelected
                    }
                }
            }
        ];

        this.callParent(arguments);

        /**
         * Specifies a new event that this component will fire when the user selects an item. The event is fired by the
         * fireImageSelected function below. Other components can listen to this event and take action when it is fired
         */
        this.on({
            close: this.closeContainer,
            scope: this
        });
    },

    /**
     * Fires the 'selected' event, informing other components that an image has been selected
     */
    fireImageSelected: function () {
        var selectedImage = this.down('youtubeiconbrowser').selModel.getSelection()[0];

        if (selectedImage) {
            this.fireEvent('selected', selectedImage);
            this.close();
        }
    },

    closeContainer: function (form) {
        var youtubeiconbrowser = this.down('youtubeiconbrowser');
        if (youtubeiconbrowser) {
            Ext.destroy(youtubeiconbrowser);
        }
        this.destroy();
    }
});
