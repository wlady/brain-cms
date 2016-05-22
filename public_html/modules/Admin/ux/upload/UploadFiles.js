Ext.Loader.setPath({
    'Ext.ux' : './lib'
});

Ext.define('Ext.ux.upload.UploadFiles', {
    requires : [
        'Ext.ux.upload.Dialog'
    ],
    constructor: function (config) {
        this.url = config.url;
        this.params = config.params;
        this.path = config.path;
        Ext.create('Ext.container.Viewport', {
            layout : 'fit'
        });
        var dialog = Ext.create('Ext.ux.upload.Dialog', {
            dialogTitle: 'File Uploader',
            iconCls: 'ic-browse',
            uploadUrl: this.url + '?_m=' + this.params._m + '&_a=' + this.params._a + '&path=' + this.path,
            callback: config.callback,
            listeners: {
                uploadcomplete: function () {
                    this.callback();
                    this.close();
                },
                show: function (me, eOpts) {
                    var self = Ext.get(me.id),
                        queue = self.component.panel.queue,
                        gridview = self.component.panel.grid.getView();
                    //this is drop zone text
                    //gridview.emptyText = '<div id="file-drop-panel" class="dropZoneTitle"><h3>' + __.dropfileszone + '</h3><p>' + __.maxfilesize + App.max_file_size + '</p></div>';
                    gridview.refresh();

                    queue.on('queuechange', function (me) {
                        gridview.refresh();
                    });

                    function cancel(e) {
                        e.stopPropagation && e.stopPropagation();
                        e.preventDefault && e.preventDefault();
                    }

                    function addEventHandler(obj, evt, handler) {
                        if (obj.addEventListener) {// W3C method
                            obj.addEventListener(evt, handler, false);
                        }
                        else if (obj.attachEvent) {// IE method
                            obj.attachEvent('on' + evt, handler);
                        }
                        else {// old school method
                            obj['on' + evt] = handler;
                        }
                    }

                    addEventHandler(self.dom, 'dragover', cancel);
                    addEventHandler(self.dom, 'dragenter', cancel);
                    addEventHandler(self.dom, 'drop', function (e) {
                        cancel.call(this, e);

                        self.component.panel.queue.addFiles(e.dataTransfer.files);

                        return false;
                    });

                }
            }
        });
        dialog.show();
    }
});
