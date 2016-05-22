/**
* Ext.ux.form.field.CanvasColorPicker
*
*   By wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.CanvasColorPicker', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.canvascolorpicker',
	trigger1Cls: 'currentColor',
	matchFieldWidth: false,
	maskRe: /[0-9A-Fa-f]/,
	maxLength: 6,
	enforceMaxLength: true,
	defaultColor: '',
	initComponent: function() {
		this.callParent();
	},

	createPicker: function() {
		var me = this,
			component = Ext.create('Ext.panel.Panel', {
				title: 'Pick Color',
				html: '<canvas id="canvas-color-picker" width="256" height="256"></canvas>',
				floating: true,
				padding: 0,
				//width: 256,
				//height: 256,
				renderTo: Ext.getBody(),
				listeners: {
					render: function() {
						/*

						We can use generated gradients but the image looks better
						
						var padding = 0;
						var canvas = document.getElementById('canvas-color-picker');
						var context = canvas.getContext('2d');
						me.drawGradients(context);
						canvas.addEventListener('mousedown', function(e) {
							var mousePos = me.getMousePos(canvas, e),
								imageData = context.getImageData(padding, padding, 256, 256),
								data = imageData.data,
								x = mousePos.x - padding,
								y = mousePos.y - padding,
								r = data[((256 * y) + x) * 4],
								g = data[((256 * y) + x) * 4 + 1],
								b = data[((256 * y) + x) * 4 + 2];
							me.setValue((16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1).toUpperCase());
						}, false);

						*/
						var padding = 0, imageObj = new Image();
						imageObj.onload = function() {
							var canvas = document.getElementById('canvas-color-picker');
							var context = canvas.getContext('2d');
							canvas.addEventListener('mousedown', function(e) {
								var mousePos = me.getMousePos(canvas, e),
									imageData = context.getImageData(padding, padding, imageObj.width, imageObj.width),
									data = imageData.data,
									x = mousePos.x - padding,
									y = mousePos.y - padding,
									r = data[((imageObj.width * y) + x) * 4],
									g = data[((imageObj.width * y) + x) * 4 + 1],
									b = data[((imageObj.width * y) + x) * 4 + 2];
								me.setValue((16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1).toUpperCase());
							}, false);
							context.drawImage(imageObj, padding, padding);
						};
						imageObj.src = '/modules/Admin/ux/css/images/color-picker.png';
					}
				},
				tools: [{
					type: 'close',
					tooltip: __.hideproductstree,
					handler: function() {
						me.collapse();
					}
				}]
			});
		return component;
	},

	afterRender: function() {
		var me = this;
		me.callParent();
		me.triggerCell.item(0).set({
			'data-qtip': __.pickcolor
		});
	},

	onChange: function() {
		var value = this.getValue();
		this.setValue(Ext.isEmpty(value) ? this.defaultColor : value);
		var cbox = Ext.query('div.currentColor', this.el.dom);
		if (Ext.isArray(cbox)) {
			cbox[0].style.backgroundColor = '#'+(this.getValue() ? this.getValue() : 'FFF');
		}
	},

	onExpand: function() {
		var value = this.getValue();
		this.setValue(Ext.isEmpty(value) ? this.defaultColor  : value);
	},
	
	getMousePos: function(canvas, e) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	},

	drawGradients: function (ctx) {
		var grad = ctx.createLinearGradient(0, 0, 250, 0);
		grad.addColorStop(0,     '#FF0000');
		grad.addColorStop(1 / 8, '#FF00FF');
		grad.addColorStop(2 / 8, '#8000FF');
		grad.addColorStop(3 / 8, '#0040FF')
		grad.addColorStop(4 / 8, '#00FFFF');
		grad.addColorStop(5 / 8, '#00FF40');
		grad.addColorStop(6 / 8, '#0BED00');
		grad.addColorStop(7 / 8, '#FFFF00');
		grad.addColorStop(1,     '#FF0000');
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, 256, 256);
		var grad2 = ctx.createLinearGradient(0, 0, 0, 256);
		grad2.addColorStop(0.02,  '#FFFFFF');
		grad2.addColorStop(0.45,   'transparent');
		grad2.addColorStop(0.55,   'transparent');
		grad2.addColorStop(1,     '#000000');
		ctx.fillStyle = grad2;
		ctx.fillRect(0, 0, 256, 256);
	}

});
