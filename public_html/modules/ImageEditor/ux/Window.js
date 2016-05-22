Ext.ns('App');
App.canvasStackSize = 100;
Ext.define('module.ImageEditor.ux.Window', {
	extend : 'Ext.window.Window',
	alias : 'widget.imageeditor',
	title : __.ImageEditor,
	resizable : true,
	maximized : true,
	autoRender : true,
	autoShow : true,
	iconCls : 'ImageEditor-icon',
	modal : true,
	layout : 'fit',
	record : null,
	cropArea : null,
	cropper : null,
	referenceToImage : null,
	currentWidth : 0,
	currentHeight : 0,
	canvasStack : [],
	canvasRedoStack : [],
	tempCanvas : null,
	camanCtl : null,
	constructor : function(config) {
		var me = this;
		Ext.apply(this, config);
		this.currentWidth = this.record.get('width');
		this.currentHeight = this.record.get('height');
		this.items = [ {
			xtype : 'container',
			header : false,
			autoScroll : true,
			itemId : 'imgContainer',
			items : [ {
				xtype : 'image',
				src : this.record.get('url'),
				width : this.currentWidth,
				height : this.currentHeight,
				itemId : 'imageEl'
			} ]
		} ];
		this.dockedItems = [ {
			xtype : 'toolbar',
			collapsible : 'true',
			plugins : 'responsive',
			itemId : 'tBar',
			items : [ {
				tooltip : __.undo_tt,
				iconCls : 'ic-undo',
				itemId : 'undoBtn',
				disabled : true,
				handler : Ext.bind(me.onUndoClick, me)
			}, {
				tooltip : __.redo_tt,
				iconCls : 'ic-redo',
				itemId : 'redoBtn',
				disabled : true,
				handler : Ext.bind(me.onRedoClick, me)
			}, {
				xtype : 'label',
				text : 'Image Size'
			}, {
				xtype : 'numberfield',
				width : 90,
				itemId : 'imgWidth',
				value : this.currentWidth,
				maxValue : this.currentWidth,
				minValue : 16,
				enableKeyEvents : true,
				listeners : {
					change : Ext.bind(me.onWidthClick, me),
					keypress : Ext.bind(me.onSizeKeyPress, me)
				}
			}, {
				xtype : 'numberfield',
				width : 90,
				itemId : 'imgHeight',
				value : this.currentHeight,
				maxValue : this.currentHeight,
				minValue : 16,
				enableKeyEvents : true,
				listeners : {
					change : Ext.bind(me.onHeightClick, me),
					keypress : Ext.bind(me.onSizeKeyPress, me)
				}
			}, {
				text : __.resize,
				tooltip : __.resize_tt,
				iconCls : 'ic-expand',
				itemId : 'scaleBtn',
				disabled : true,
				handler : Ext.bind(me.onResizeClick, me)
			}, {
				text : __.crop,
				tooltip : __.crop_tt,
				iconCls : 'ic-crop',
				itemId : 'cropBtn',
				disabled : true,
				handler : Ext.bind(me.onCropClick, me)
			}, {
				text : __.transform,
				tooltip : __.transform_tt,
				iconCls : 'ic-repeat',
				menu : {
					items : [ {
						text : __.dgr90,
						iconCls : 'ic-repeat',
						handler : Ext.bind(me.onRotate, me, [ 0 ])
					}, {
						text : __.dgr180,
						iconCls : 'ic-repeat',
						handler : Ext.bind(me.onRotate, me, [ 1 ])
					}, {
						text : __.dgr270,
						iconCls : 'ic-repeat',
						handler : Ext.bind(me.onRotate, me, [ 2 ])
					}, '-', {
						text : __.fliphor,
						iconCls : 'fliphor',
						handler : Ext.bind(me.onFlipHorizontal, me)
					}, {
						text : __.flipver,
						iconCls : 'flipver',
						handler : Ext.bind(me.onFlipVertical, me)
					} ]
				}
			}, {
				text : __.color,
				tooltip : __.color_tt,
				iconCls : 'ic-sliders',
				hidden : App.isDisableEffectsImage,
				handler : Ext.bind(me.onColorClick, me)
			}, {
				text : __.presets,
				tooltip : __.presets_tt,
				iconCls : 'ic-magic',
				hidden : App.isDisableEffectsImage,
				menu : {
					items : [ {
						text : 'Vintage',
						handler : Ext.bind(me.onPresetClick, me, [ 'vintage' ])
					}, {
						text : 'Lomo',
						handler : Ext.bind(me.onPresetClick, me, [ 'lomo' ])
					}, {
						text : 'Clarity',
						handler : Ext.bind(me.onPresetClick, me, [ 'clarity' ])
					}, {
						text : 'Sin City',
						handler : Ext.bind(me.onPresetClick, me, [ 'sinCity' ])
					}, {
						text : 'Sunrise',
						handler : Ext.bind(me.onPresetClick, me, [ 'sunrise' ])
					}, {
						text : 'Cross Process',
						handler : Ext.bind(me.onPresetClick, me, [ 'crossProcess' ])
					}, {
						text : 'Orange Peel',
						handler : Ext.bind(me.onPresetClick, me, [ 'orangePeel' ])
					}, {
						text : 'Love',
						handler : Ext.bind(me.onPresetClick, me, [ 'love' ])
					}, {
						text : 'Grungy',
						handler : Ext.bind(me.onPresetClick, me, [ 'grungy' ])
					}, {
						text : 'Jarques',
						handler : Ext.bind(me.onPresetClick, me, [ 'jarques' ])
					}, {
						text : 'Pinhole',
						handler : Ext.bind(me.onPresetClick, me, [ 'pinhole' ])
					}, {
						text : 'Old Boot',
						handler : Ext.bind(me.onPresetClick, me, [ 'oldBoot' ])
					}, {
						text : 'Glowing Sun',
						handler : Ext.bind(me.onPresetClick, me, [ 'glowingSun' ])
					}, {
						text : 'Hazy Days',
						handler : Ext.bind(me.onPresetClick, me, [ 'hazyDays' ])
					}, {
						text : 'Her Majesty',
						handler : Ext.bind(me.onPresetClick, me, [ 'herMajesty' ])
					}, {
						text : 'Nostalgia',
						handler : Ext.bind(me.onPresetClick, me, [ 'nostalgia' ])
					}, {
						text : 'Hemingway',
						handler : Ext.bind(me.onPresetClick, me, [ 'hemingway' ])
					}, {
						text : 'Concentrate',
						handler : Ext.bind(me.onPresetClick, me, [ 'concentrate' ])
					} ]
				}
			}, '->', {
				xtype : 'label',
				itemId : 'cropCoordinates',
				text : ''
			} ]
		}, {
			xtype : 'toolbar',
			ui : 'footer',
			dock : 'bottom',
			margin : '10 0 10 0',
			layout : {
				pack : 'center'
			},
			defaults : {
				width : 80
			},
			items : [ {
				text : __.save,
				iconCls : 'ic-save',
				scope : this,
				width : 85,
				handler : Ext.bind(this.onOk, this)
			}, {
				text : __.cancel,
				iconCls : 'ic-close',
				width : 95,
				handler : Ext.bind(this.onClose, this)
			} ]
		} ];
		this.callParent();
	},

	onResize : function() {
		var me = this;
		me.canvasStack = [];
		me.canvasRedoStack = [];
		me.resetCropArea();
		var obj = this.query('image[itemId=imageEl]');
		if (Ext.isArray(obj) && obj.length) {
			me.referenceToImage = obj[0].el.dom;
			$(me.referenceToImage).Jcrop({
				onSelect : Ext.bind(me.showCoords, me),
				onChange : Ext.bind(me.showCoords, me)
			}, function() {
				me.cropper = this;
				me.pushToStack(0, 0, me.currentWidth, me.currentHeight, 0, 0, me.currentWidth, me.currentHeight);
			});
		}
		me.showInfo();
		me.updateLayout();
		Ext.EventManager.on(document, 'keypress', function(e) {
			if (e.getKey() == 26) {
				// Ctrl-Z
				me.onUndoClick();
			} else if (e.getKey() == 25) {
				// Ctrl-Y
				me.onRedoClick();
			}
		});
	},

	onOk : function() {
		var me = this, data, canvasIndex = me.canvasStack.length - 1;
		data = me.canvasStack[canvasIndex];
		me.currentWidth = data.width;
		me.currentHeight = data.height;
		src = data.canvas.toDataURL('image/png');
		Ext.Ajax.request({
			url : App.baseUrl,
			params : {
				_m : 'ImageEditor',
				_a : 'save',
				src : me.record.get('path'),
				data : data.canvas.toDataURL('image/png')
			},
			success : function(response, request) {
				if (Ext.ux.Utils.ajaxResponseHasError(response)) {
					Ext.ux.Utils.ajaxResponseShowError(response);
				} else {
					var fm = Ext.getCmp('bcmsfilemanager');
					if (fm) {
						fm.getStore().load();
					}
					me.close();
				}
			}
		});
	},

	onClose : function() {
		this.canvasStack = [];
		this.canvasRedoStack = [];
		Ext.EventManager.un(document, 'keypress');
		this.close();
	},

	onRotate : function(mode) {
		this.pushToStackRotate(mode);
		// any changes will reset redo stack
		this.canvasRedoStack = [];
		this.applyChanges();
	},

	onFlipHorizontal : function() {
		this.pushToStackScale(this.currentWidth * -1, 0, this.currentWidth, this.currentHeight, -1, 1);
		// any changes will reset redo stack
		this.canvasRedoStack = [];
		this.applyChanges();
	},

	onFlipVertical : function() {
		this.pushToStackScale(0, this.currentHeight * -1, this.currentWidth, this.currentHeight, 1, -1);
		// any changes will reset redo stack
		this.canvasRedoStack = [];
		this.applyChanges();
	},

	onSizeKeyPress : function(el, e, eOpts) {
		if (e.getCharCode() == Ext.EventObject.ENTER) {
			this.onResizeClick();
		}
	},

	onWidthClick : function(el, newValue, oldValue) {
		var tb = this.getDockedItems()[1];
		var scaleFactor = (newValue * 100) / oldValue;
		var heightCtrl = tb.getComponent('imgHeight');
		heightCtrl.suspendEvent('change');
		var h = heightCtrl.getValue();
		heightCtrl.setValue(Math.round((h * scaleFactor) / 100));
		tb.getComponent('scaleBtn').setDisabled(false);
		heightCtrl.resumeEvent('change');
	},

	onHeightClick : function(el, newValue, oldValue) {
		var tb = this.getDockedItems()[1];
		var scaleFactor = (newValue * 100) / oldValue;
		var widthCtrl = tb.getComponent('imgWidth');
		widthCtrl.suspendEvent('change');
		var w = widthCtrl.getValue();
		widthCtrl.setValue(Math.round((w * scaleFactor) / 100));
		tb.getComponent('scaleBtn').setDisabled(false);
		widthCtrl.resumeEvent('change');
	},

	onUndoClick : function() {
		var me = this, canvas;
		var tb = this.getDockedItems()[1];
		if (me.canvasStack.length) {
			canvas = me.canvasStack.pop();
			me.canvasRedoStack.push(canvas);
			me.applyChanges();
		} else {
			tb.getComponent('undoBtn').setDisabled(me.canvasStack.length < 2);
			tb.getComponent('redoBtn').setDisabled(me.canvasRedoStack.length < 1);
		}
	},

	onRedoClick : function() {
		var me = this, canvas;
		var tb = this.getDockedItems()[1];
		if (me.canvasRedoStack.length) {
			canvas = me.canvasRedoStack.pop();
			me.canvasStack.push(canvas);
			me.applyChanges();
		} else {
			tb.getComponent('undoBtn').setDisabled(me.canvasStack.length < 2);
			tb.getComponent('redoBtn').setDisabled(me.canvasRedoStack.length < 1);
		}
	},

	onResizeClick : function() {
		var me = this;
		var tb = me.getDockedItems()[1];
		var widthCtrl = tb.getComponent('imgWidth');
		var heightCtrl = tb.getComponent('imgHeight');
		if (widthCtrl.isValid() && heightCtrl.isValid()) {
			me.pushToStack(0, 0, me.currentWidth, me.currentHeight, 0, 0, widthCtrl.getValue(), heightCtrl.getValue());
			// any changes will reset redo stack
			me.canvasRedoStack = [];
		}
		me.applyChanges();
	},

	onCropClick : function() {
		var me = this;
		var tb = me.getDockedItems()[1];
		var widthCtrl = tb.getComponent('imgWidth');
		var heightCtrl = tb.getComponent('imgHeight');
		if (widthCtrl.isValid() && heightCtrl.isValid()) {
			me.pushToStack(me.cropArea.x, me.cropArea.y, me.cropArea.w, me.cropArea.h, 0, 0, me.cropArea.w, me.cropArea.h);
			// any changes will reset redo stack
			me.canvasRedoStack = [];
		}
		me.applyChanges();
	},

	onColorClick : function() {
		var me = this;
		var tb = this.getDockedItems();
		tb[1].getComponent('cropBtn').setDisabled(true);
		tb[1].getComponent('scaleBtn').setDisabled(true);
		this.resetCropArea();
		me.showInfo();
		me.cropper.release();
		Ext.each(tb, function(item, key) {
			if (key) {
				this.setDisabled(true);
			}
		});
		var colorWnd = Ext.create('module.ImageEditor.ux.Color');
		colorWnd.on('close', function() {
			if (this.ctx) {
				var tmp = me.referenceToImage;
				me.referenceToImage = this.ctx.canvas;
				me.pushToStack(0, 0, me.currentWidth, me.currentHeight, 0, 0, me.currentWidth, me.currentHeight);
				me.referenceToImage = tmp;
				// any changes will reset redo stack
				me.canvasRedoStack = [];
				me.applyChanges();
			}
			Ext.each(tb, function(item, key) {
				this.setDisabled(false);
			});
		});
	},

	onPresetClick : function(preset) {
		var me = this;
		me.tempCanvas = document.createElement("canvas");
		me.tempCanvas.width = me.currentWidth;
		me.tempCanvas.height = me.currentHeight;
		me.ctx = me.tempCanvas.getContext("2d");
		me.ctx.clearRect(0, 0, me.currentWidth, me.currentHeight);
		me.ctx.drawImage(me.referenceToImage, 0, 0);
		me.camanCtl = Caman(me.ctx.canvas, function() {
			me.el.mask(__.processing);
			this[preset]();
			this.render(function() {
				var tmp = me.referenceToImage;
				me.referenceToImage = me.camanCtl.canvas;
				me.pushToStack(0, 0, me.currentWidth, me.currentHeight, 0, 0, me.currentWidth, me.currentHeight);
				me.referenceToImage = tmp;
				// any changes will reset redo stack
				me.canvasRedoStack = [];
				me.applyChanges();
				me.el.unmask();
			});
		});
	},

	applyChanges : function() {
		var me = this, src = '', data, canvasIndex = me.canvasStack.length - 1;
		var tb = this.getDockedItems()[1];
		var widthCtrl = tb.getComponent('imgWidth');
		var heightCtrl = tb.getComponent('imgHeight');
		if (widthCtrl.isValid() && heightCtrl.isValid()) {
			data = me.canvasStack[canvasIndex];
			me.currentWidth = data.width;
			me.currentHeight = data.height;
			src = data.canvas.toDataURL('image/png');
			widthCtrl.suspendEvent('change');
			widthCtrl.setDisabled(true);
			widthCtrl.setValue(me.currentWidth);
			widthCtrl.setMaxValue(me.currentWidth);
			widthCtrl.resumeEvent('change');
			widthCtrl.setDisabled(false);
			heightCtrl.suspendEvent('change');
			heightCtrl.setDisabled(true);
			heightCtrl.setValue(me.currentHeight);
			heightCtrl.setMaxValue(me.currentHeight);
			heightCtrl.resumeEvent('change');
			heightCtrl.setDisabled(false);
			var obj = this.query('image[itemId=imageEl]');
			if (Ext.isArray(obj) && obj.length) {
				var container = this.query('[itemId=imgContainer]');
				var curImg = Ext.query('[id=' + container[0].id + '] img');
				if (curImg && curImg.length) {
					Ext.each(curImg, function() {
						this.src = src;
						this.style.width = me.currentWidth + 'px';
						this.style.height = me.currentHeight + 'px';
					});
				}
				obj[0].width = me.currentWidth;
				obj[0].height = me.currentHeight;
				var jcropContainer = Ext.query('.jcrop-holder');
				jcropContainer[0].style.width = me.currentWidth + 'px';
				jcropContainer[0].style.height = me.currentHeight + 'px';
			}
		} else {
			widthCtrl.reset();
			heightCtrl.reset();
		}
		tb.getComponent('cropBtn').setDisabled(true);
		tb.getComponent('scaleBtn').setDisabled(true);
		tb.getComponent('undoBtn').setDisabled(me.canvasStack.length < 2);
		tb.getComponent('redoBtn').setDisabled(me.canvasRedoStack.length < 1);
		this.updateLayout();
		this.resetCropArea();
		me.showInfo();
		me.cropper.release();
	},

	showCoords : function(c) {
		var tb = this.getDockedItems()[1];
		var fld = tb.getComponent('cropCoordinates');
		this.cropArea = c;
		if (this.cropArea.w && this.cropArea.h) {
			tb.getComponent('cropBtn').setDisabled(false);
		} else {
			tb.getComponent('cropBtn').setDisabled(true);
			this.resetCropArea();
		}
		this.showInfo();
	},

	showInfo : function() {
		var me = this;
		var tb = this.getDockedItems()[1];
		var fld = tb.getComponent('cropCoordinates');
		if (this.cropArea.w && this.cropArea.h) {
			fld.setText(Ext.String.format('Crop Tool: {0},{1}; {2},{3}; {4},{5}', this.cropArea.x, this.cropArea.y, this.cropArea.x2, this.cropArea.y2, this.cropArea.w, this.cropArea.h));
		} else {
			fld.setText('');
		}
	},

	resetCropArea : function() {
		this.cropArea = {
			x : 0,
			y : 0,
			x2 : 0,
			y2 : 0,
			w : 0,
			h : 0
		};
	},

	pushToStack : function(sx, sy, sw, sh, dx, dy, dw, dh, scx, scy) {
		var me = this;
		me.tempCanvas = document.createElement("canvas");
		me.tempCanvas.width = dw;
		me.tempCanvas.height = dh;
		me.ctx = me.tempCanvas.getContext("2d");
		me.ctx.clearRect(0, 0, dw, dh);
		if (!Ext.isEmpty(scx) && !Ext.isEmpty(scy)) {
			me.ctx.scale(scx, scy);
		}
		me.ctx.drawImage(me.referenceToImage, sx, sy, sw, sh, dx, dy, dw, dh);
		if (me.canvasStack.length > App.canvasStackSize) {
			me.canvasStack.shift();
		}
		me.canvasStack.push({
			width : dw,
			height : dh,
			canvas : me.ctx.canvas
		});
	},

	pushToStackScale : function(sx, sy, sw, sh, scx, scy) {
		var me = this;
		me.tempCanvas = document.createElement("canvas");
		me.tempCanvas.width = sw;
		me.tempCanvas.height = sh;
		me.ctx = me.tempCanvas.getContext("2d");
		me.ctx.clearRect(0, 0, sw, sh);
		me.ctx.scale(scx, scy);
		me.ctx.drawImage(me.referenceToImage, sx, sy, sw, sh);
		if (me.canvasStack.length > App.canvasStackSize) {
			me.canvasStack.shift();
		}
		me.canvasStack.push({
			width : sw,
			height : sh,
			canvas : me.ctx.canvas
		});
	},

	pushToStackRotate : function(mode) {
		var me = this, angle, cx, cy, tmp;
		me.tempCanvas = document.createElement("canvas");
		switch (mode) {
		case 0:
			// 90 degrees
			angle = Math.PI / 2;
			cx = 0;
			cy = -me.currentHeight;
			tmp = me.currentWidth;
			me.currentWidth = me.currentHeight;
			me.currentHeight = tmp;
			break;
		case 1:
			// 180 degrees
			angle = Math.PI;
			cx = -me.currentWidth;
			cy = -me.currentHeight;
			break;
		case 2:
			// 270 degrees
			angle = Math.PI / -2;
			cx = -me.currentWidth;
			cy = 0;
			tmp = me.currentWidth;
			me.currentWidth = me.currentHeight;
			me.currentHeight = tmp;
			break;
		}
		me.tempCanvas.width = me.currentWidth;
		me.tempCanvas.height = me.currentHeight;
		me.ctx = me.tempCanvas.getContext("2d");
		me.ctx.clearRect(0, 0, me.currentWidth, me.currentHeight);
		me.ctx.save();
		me.ctx.rotate(angle);
		me.ctx.translate(cx, cy);
		me.ctx.drawImage(me.referenceToImage, 0, 0);
		me.ctx.restore();
		if (me.canvasStack.length > App.canvasStackSize) {
			me.canvasStack.shift();
		}
		me.canvasStack.push({
			width : me.currentWidth,
			height : me.currentHeight,
			canvas : me.ctx.canvas
		});
	}
});
