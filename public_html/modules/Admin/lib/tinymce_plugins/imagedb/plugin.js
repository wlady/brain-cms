/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('imagedb', function(editor) {
	function getImageSize(url, callback) {
		var img = document.createElement('img');

		function done(width, height) {
			img.parentNode.removeChild(img);
			callback({width: width, height: height});
		}

		img.onload = function() {
			done(img.clientWidth, img.clientHeight);
		};

		img.onerror = function() {
			done();
		};

		img.src = url;

		var style = img.style;
		style.visibility = 'hidden';
		style.position = 'fixed';
		style.bottom = style.left = 0;
		style.width = style.height = 'auto';

		document.body.appendChild(img);
	}

	function createImageList(callback) {
		return function() {
			var imageList = editor.settings.image_list;

			if (typeof(imageList) == "string") {
				tinymce.util.XHR.send({
					url: imageList,
					success: function(text) {
						callback(tinymce.util.JSON.parse(text));
					}
				});
			} else {
				callback(imageList);
			}
		};
	}

	function showDialog(imageList) {
		var win, data, dom = editor.dom, imgElm = editor.selection.getNode();
		var width, height, src, img_id, imageListCtrl;

		if (!editor.settings.imagedbthumbler) {
			editor.windowManager.alert('Please define imagedbthumbler');
			return;
		}

		function buildImageList() {
			var linkImageItems = [{text: 'None', value: ''}];

			tinymce.each(imageList, function(link) {
				linkImageItems.push({
					text: link.text || link.title,
					value: link.value || link.url,
					menu: link.menu
				});
			});

			return linkImageItems;
		}

		function recalcSize(e) {
			var widthCtrl, heightCtrl, newWidth, newHeight;

			widthCtrl = win.find('#width')[0];
			heightCtrl = win.find('#height')[0];

			newWidth = widthCtrl.value();
			newHeight = heightCtrl.value();

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (e.control == widthCtrl) {
					newHeight = Math.round((newWidth / width) * newHeight);
					heightCtrl.value(newHeight);
				} else {
					newWidth = Math.round((newHeight / height) * newWidth);
					widthCtrl.value(newWidth);
				}
			}

			width = newWidth;
			height = newHeight;
		}

		function onSubmitForm() {
			function waitLoad(imgElm) {
				function selectImage() {
					imgElm.onload = imgElm.onerror = null;
					editor.selection.select(imgElm);
					editor.nodeChanged();
				}

				imgElm.onload = function() {
					if (!data.width && !data.height) {
						dom.setAttribs(imgElm, {
							width: imgElm.clientWidth,
							height: imgElm.clientHeight
						});
					}

					selectImage();
				};

				imgElm.onerror = selectImage;
			}

			var data = win.toJSON();

			if (data.width === '') {
				data.width = null;
			}

			if (data.height === '') {
				data.height = null;
			}

			if (data.style === '') {
				data.style = null;
			}

			var params = '';
			if (data.w !== '') {
				params += '&w='+data.w;
			}
			if (data.h !== '') {
				params += '&h='+data.h;
			}
			if (data.q !== '') {
				params += '&q='+data.q;
			}
			if (data.sx !== '') {
				params += '&sx='+data.sx;
			}
			if (data.sy !== '') {
				params += '&sy='+data.sy;
			}
			if (data.sw !== '') {
				params += '&sw='+data.sw;
			}
			if (data.sh !== '') {
				params += '&sh='+data.sh;
			}
			if (data.aoe) {
				params += '&aoe='+data.aoe;
			}
			if (data.zc) {
				params += '&zc='+data.zc;
			}
			
			data = {
				src: editor.settings.imagedbthumbler + data.img_id + params,
				alt: data.alt,
				width: data.width,
				height: data.height,
				style: data.style
			};

			editor.undoManager.transact(function() {
				if (!data.src) {
					if (imgElm) {
						dom.remove(imgElm);
						editor.nodeChanged();
					}

					return;
				}

				if (!imgElm) {
					data.id = '__mcenew';
					editor.selection.setContent(dom.createHTML('img', data));
					imgElm = dom.get('__mcenew');
					dom.setAttrib(imgElm, 'id', null);
				} else {
					dom.setAttribs(imgElm, data);
				}

				waitLoad(imgElm);
			});
		}

		function removePixelSuffix(value) {
			if (value) {
				value = value.replace(/px$/, '');
			}

			return value;
		}

		function updateSize() {
			getImageSize(this.value(), function(data) {
				if (data.width && data.height) {
					width = data.width;
					height = data.height;

					win.find('#width').value(width);
					win.find('#height').value(height);
				}
			});
		}

		width = dom.getAttrib(imgElm, 'width');
		height = dom.getAttrib(imgElm, 'height');

		var id, w, h, q, sx, sy, sw, sh, aoe, zc;
		src = dom.getAttrib(imgElm, 'src');
		var pattern = /\?id=(\d+)/i;
		var results = src.match(pattern);
		if (results && results.length>1) {
			id = results[1];
		}
		pattern = /w=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			w = results[1];
		}
		pattern = /h=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			h = results[1];
		}
		pattern = /q=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			q = results[1];
		}
		pattern = /sx=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			sx = results[1];
		}
		pattern = /sy=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			sy = results[1];
		}
		pattern = /sw=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			sw = results[1];
		}
		pattern = /sh=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			sh = results[1];
		}
		pattern = /aoe=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			if (results[1]) {
				aoe = results[1];
			}
		}
		pattern = /zc=(\d+)/i;
		results = src.match(pattern);
		if (results && results.length>1) {
			if (results[1]) {
				zc = results[1];
			}
		}

		if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object')) {
			data = {
				img_id: id,
				alt: dom.getAttrib(imgElm, 'alt'),
				width: width,
				height: height,
				w: w,
				h: h,
				q: q,
				sx: sx,
				sy: sy,
				sw: sw,
				sh: sh,
				aoe: aoe,
				zc: zc
			};
		} else {
			imgElm = null;
		}

		if (imageList) {
			imageListCtrl = {
				name: 'target',
				type: 'listbox',
				label: 'Image list',
				values: buildImageList(),
				onselect: function(e) {
					var altCtrl = win.find('#alt');

					if (!altCtrl.value() || (e.lastControl && altCtrl.value() == e.lastControl.text())) {
						altCtrl.value(e.control.text());
					}

					win.find('#img_id').value(e.control.value());
				}
			};
		}

		// General settings shared between simple and advanced dialogs
		var generalFormItems = [
			{name: 'img_id', type: 'filepicker', filetype: 'imagedb', label: 'Image ID', autofocus: true, onchange: updateSize},
			imageListCtrl,
			{name: 'alt', type: 'textbox', label: 'Image description', subtype: 'imagedescr'},
			{
				type: 'container',
				label: 'Dimensions',
				layout: 'flex',
				direction: 'row',
				align: 'center',
				spacing: 5,
				items: [
					{name: 'width', type: 'textbox', maxLength: 3, size: 3, onchange: recalcSize},
					{type: 'label', text: 'x'},
					{name: 'height', type: 'textbox', maxLength: 3, size: 3, onchange: recalcSize},
					{name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions'}
				]
			}
		];

		function updateStyle() {
			function addPixelSuffix(value) {
				if (value.length > 0 && /^[0-9]+$/.test(value)) {
					value += 'px';
				}

				return value;
			}

			var data = win.toJSON();
			var css = dom.parseStyle(data.style);

			dom.setAttrib(imgElm, 'style', '');

			delete css.margin;
			css['margin-top'] = css['margin-bottom'] = addPixelSuffix(data.vspace);
			css['margin-left'] = css['margin-right'] = addPixelSuffix(data.hspace);
			css['border-width'] = addPixelSuffix(data.border);

			win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
		}

		if (editor.settings.image_advtab) {
			// Parse styles from img
			if (imgElm) {
				data.hspace = removePixelSuffix(imgElm.style.marginLeft || imgElm.style.marginRight);
				data.vspace = removePixelSuffix(imgElm.style.marginTop || imgElm.style.marginBottom);
				data.border = removePixelSuffix(imgElm.style.borderWidth);
				data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
			}

			// Advanced dialog shows general+advanced+Thumb tabs
			win = editor.windowManager.open({
				title: 'Insert/edit DB image',
				data: data,
				bodyType: 'tabpanel',
				body: [
					{
						title: 'General',
						type: 'form',
						items: generalFormItems
					},

					{
						title: 'Advanced',
						type: 'form',
						pack: 'start',
						items: [
							{
								label: 'Style',
								name: 'style',
								type: 'textbox'
							},
							{
								type: 'form',
								layout: 'grid',
								packV: 'start',
								columns: 2,
								padding: 0,
								alignH: ['left', 'right'],
								defaults: {
									type: 'textbox',
									maxWidth: 50,
									onchange: updateStyle
								},
								items: [
									{label: 'Vertical space', name: 'vspace'},
									{label: 'Horizontal space', name: 'hspace'},
									{label: 'Border', name: 'border'}
								]
							}
						]
					},
				
					{
						title: 'Thumb',
						type: 'form',
						items: [
							{
								label: 'Width (w)',
								name: 'w',
								type: 'textbox'
							},
							{
								label: 'Height (h)',
								name: 'h',
								type: 'textbox'
							},
							{
								label: 'Quality (q)',
								name: 'q',
								type: 'textbox'
							},
							{
								label: 'Offset X (sy)',
								name: 'sx',
								type: 'textbox'
							},
							{
								label: 'Offset Y (sy)',
								name: 'sy',
								type: 'textbox'
							},
							{
								label: 'Crop to X (sw)',
								name: 'sw',
								type: 'textbox'
							},
							{
								label: 'Crop to Y (sh)',
								name: 'sh',
								type: 'textbox'
							},
							{
								label: 'Enable enlarge (aoe)',
								name: 'aoe',
								type: 'listbox',
								text: 'No',
								values: [
									{text: 'Yes', value: '1'},
									{text: 'No', value: ''},
								]
							},
							{
								label: 'Zoom Crop (zc)',
								name: 'zc',
								type: 'listbox',
								text: 'No',
								values: [
									{text: 'Yes', value: '1'},
									{text: 'No', value: ''},
								]
							}
						]
					}
				],
				onSubmit: onSubmitForm
			});
		} else {
			// Simple default dialog
			win = editor.windowManager.open({
				title: 'Insert/edit DB image',
				data: data,
				body: generalFormItems,
				onSubmit: onSubmitForm
			});
		}
	}

	editor.addButton('imagedb', {
		icon: 'icon-images',
		tooltip: 'Insert/edit DB image',
		onclick: createImageList(showDialog),
		stateSelector: 'img:not([data-mce-object])'
	});

	editor.addMenuItem('imagedb', {
		icon: 'icon-images',
		text: 'Insert DB image',
		onclick: createImageList(showDialog),
		context: 'insert',
		prependToContext: true
	});
});