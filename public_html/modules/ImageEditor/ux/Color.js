Ext.ns('App');
Ext.define('module.ImageEditor.ux.Color', {
    extend: 'Ext.window.Window',
    alias: 'widget.imagecolor',
    title: __.color,
    width: 400,
    height: 400,
    autoRender: true,
    autoShow: true,
    layout: 'form',
    padding: '0 10 0 10',
    modal: true,
    camanEl: null,
    caman: null,
    ctx: null,
    constructor: function (config) {
        var me = this;
        Ext.apply(this, config);
        this.defaults = {
            xtype: 'slider',
            value: 0,
            increment: 1,
            minValue: 0,
            maxValue: 100,
            listeners: {
                changecomplete: Ext.bind(this.doChange, this)
            }
        };
        this.items = [
            {
                fieldLabel: __.brightness,
                name: 'brightness',
                minValue: -100,
            }, {
                fieldLabel: __.contrast,
                name: 'contrast',
                minValue: -100
            }, {
                fieldLabel: __.saturation,
                name: 'saturation',
                minValue: -100
            }, {
                fieldLabel: __.vibrance,
                name: 'vibrance',
                minValue: -100
            }, {
                fieldLabel: __.exposure,
                name: 'exposure',
                minValue: -100
            }, {
                fieldLabel: __.hue,
                name: 'hue'
            }, {
                fieldLabel: __.sepia,
                name: 'sepia'
            }, {
                fieldLabel: __.gamma,
                name: 'gamma',
                increment: 0.1,
                maxValue: 10
            }, {
                fieldLabel: __.noise,
                name: 'noise'
            }, {
                fieldLabel: __.clip,
                name: 'clip'
            }, {
                fieldLabel: __.sharpen,
                name: 'sharpen'
            }, {
                fieldLabel: __.blur,
                name: 'stackBlur'
            }];
        this.dockedItems = [{
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
        this.callParent();
    },

    onShow: function () {
        var me = this;
        var masks = Ext.query('.x-mask');
        Ext.each(masks, function () {
            if (this.style.visibility != 'hidden' && this.style.display != 'none') {
                this.style.opacity = 0;
            }
        });
        var imgs = Ext.query('.jcrop-holder img.x-img');
        if (imgs && imgs.length) {
            var newImg = imgs[0];
            me.camanEl = Ext.DomHelper.insertAfter(Ext.fly(imgs[0]), newImg.outerHTML);
            Ext.fly(imgs[0]).hide();
            if (me.camanEl) {
                me.camanEl.id = 'camanJsImg';
                this.caman = Caman(me.camanEl);
            }
        }
        this.updateLayout();
    },

    doChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        me.caman.revert(false);
        Ext.each(me.query('slider'), function () {
            var val = parseFloat(this.getValue(), 0);
            if (val !== 0) {
                me.caman[this.getName()](val);
            }
        });
        me.caman.render();
    },

    onOk: function () {
        var el = Ext.get('camanJsImg');
        this.ctx = el.dom.getContext("2d");
        el.remove();
        this.close();
    },

    onClose: function () {
        Ext.get('camanJsImg').remove();
        this.close();
    },

    onDestroy: function () {
        var imgs = Ext.query('.jcrop-holder img.x-img');
        if (imgs && imgs.length) {
            Ext.fly(imgs[0]).show();
        }
    }

});
