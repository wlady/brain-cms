Ext.ns('App');

Ext.override(Ext.data.proxy.Ajax, {
	getMethod : function(request) {
		return 'POST';
	}
});

Ext.override(Ext.form.Panel, {
	initComponent : function(arguments) {
		this.on('beforeadd', function(me, field) {

			function setRequired(field) {
				if (field.allowBlank === false) {
					field.cls = field.cls ? field.cls + " required-field" : "required-field";
				}
			}

			if (!field.isXType('field') && field.isXType('container')) {
				fields = field.query('field');
				Ext.each(fields, setRequired);
			} else {
				setRequired(field);
			}
		});

		this.callParent(arguments);
	}
});

Ext.apply(Ext.form.field.VTypes, {
	latitude : function(v) {
		return (!isNaN(parseFloat(v)) && isFinite(v) && v >= -90 && v <= 90);
	},
	latitudeText : 'Must be between -90 and 90 degrees'
});

Ext.apply(Ext.form.field.VTypes, {
	longitude : function(v) {
		return (!isNaN(parseFloat(v)) && isFinite(v) && v >= -180 && v <= 180);
	},
	longitudeText : 'Must be between -180 and 180 degrees'
});

Ext.apply(Ext.form.field.VTypes, {
	hexnumber : function(v) {
		return /^[a-fA-F0-9]+$/.test(v);
	},
	hexnumberText : 'Invalid hex number'
});

Ext.apply(Ext.Array, {
	// Merge multiple arrays into one and leave non-unique items in place
	// see Ext.Array#union
	united : function() {
		var args = this.slice(arguments), array = [], i, ln;
		for (i = 0, ln = args.length; i < ln; i++) {
			array = array.concat(args[i]);
		}
		return array;
	}
});

Ext.require([ 'Ext.state.CookieProvider', 'Ext.state.LocalStorageProvider' ]);

Ext.define('Ext.ux.Utils', {
	statics : {
		msgCt : null,

		splitObject : function(object, num) {
			var res = [], i = 0, ptr = 0, parts = Math.ceil(Ext.Object.getSize(object) / num);
			res[ptr] = {};
			Ext.Object.each(object, function(key, value) {
				res[ptr][key] = value;
				if (++i >= parts) {
					i = 0;
					res[++ptr] = {};
				}
			});
			return res;
		},

		createBox : function(t, s) {
			return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
		},

		popup : function(title, format, delay) {
			if (typeof (delay) == 'undefined') {
				delay = 3000;
			}
			if (!this.msgCt) {
				this.msgCt = Ext.core.DomHelper.insertFirst(document.body, {
					id : 'msg-div'
				}, true);
			}
			var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
			var m = Ext.core.DomHelper.append(this.msgCt, Ext.ux.Utils.createBox(title, s), true);
			m.hide();
			m.slideIn('t').ghost("t", {
				delay : delay,
				remove : true
			});
		},

		msg : function(title, message, icon, callback) {
			Ext.MessageBox.show({
				title : title,
				msg : message,
				minWidth : 400,
				buttons : Ext.Msg.OK,
				icon : icon,
				fn : function() {
					Ext.isFunction(callback) ? callback.call() : Ext.emptyFn;
				}
			});
		},

		info : function(title, message, callback) {
			this.msg(title, message, Ext.MessageBox.INFO, callback);
		},

		alert : function(title, message, callback) {
			this.msg(title, message, Ext.MessageBox.ERROR, callback);
		},

		failureFormSubmit : function(form, action, callback) {
			if (action.failureType === Ext.form.action.Action.SERVER_INVALID) {
				// server responded with success = false
				Ext.ux.Utils.alert(__.error_msg, action.result.message || __.common_error, callback);
			}
		},

		formPanelActionfailed : function(form, action) {
			if (!Ext.isDefined(action.failure)) {
				Ext.ux.Utils.failureFormSubmit(form, action);
			}
		},

		ajaxResponseHasError : function(response) {
			try {
				if (Ext.decode(response.responseText).success === false) {
					return true;
				} else {
					return false;
				}
			} catch (e) {
				return false;
			}
		},

		ajaxResponseShowError : function(response, callback) {
			var json = Ext.decode(response.responseText);
			Ext.ux.Utils.alert(__.error_msg, json.message || __.common_error, callback);
		},

		exception : function(proxy, response, operation, eOpts) {
			if (response.status != 200) {
				Ext.ux.Utils.alert(__.error_msg, response.statusText ? (response.status + ': ' + response.statusText) : __.common_error);
			} else {
				if (Ext.ux.Utils.ajaxResponseHasError(response)) {
					Ext.ux.Utils.ajaxResponseShowError(response);
				} else {
					Ext.ux.Utils.alert(__.error_msg, operation.error || __.common_error);
				}
			}
			return false;
		},

		exit : function() {
			Ext.Msg.show({
				title : __.exit,
				msg : __.are_you_sure,
				buttons : Ext.Msg.YESNO,
				icon : Ext.MessageBox.QUESTION,
				minWidth : 400,
				fn : function(btn) {
					if (btn == 'yes') {
						Ext.Ajax.request({
							url : App.baseUrl,
							params : {
								_m : 'Auth',
								_a : 'unAuth'
							},
							success : function(response, request) {
								document.location.href = App.entryPoint;
							}
						});
					}
				}
			});
		},

		purgeCache : function(item, event) {
			Ext.Ajax.request({
				url : App.baseUrl,
				params : {
					_m : 'Modules',
					_a : 'purgeCache'
				},
				success : function(response, request) {
					if (Ext.ux.Utils.ajaxResponseHasError(response)) {
						Ext.ux.Utils.ajaxResponseShowError(response);
					} else {
						Ext.ux.Utils.popup(__.info_msg, __.cache_purged);
					}
				}
			});
		},

		purgeState : function(stateId) {
			Ext.state.Manager.clear(stateId);
			Ext.ux.Utils.popup(__.state_purged, __.reopen_window);
		},

		loadModulePanel : function(module) {
			var path, mod, modules = App.modulesQueue.filter(function(item) {
				if (item.module == module) {
					return item;
				}
			}), icon = App.moduleRecords.findRecord('m_path', module).data.iconPath;

			if (modules.length) {
				mod = modules[0];
				if (!Ext.isEmpty(mod.require)) {
					Ext.require(mod.require);
				} else {
					//Ext.require([mod.component]);
				}
				if (Ext.isEmpty(mod.path)) {
					mod.path = mod.module;
				}
				path = mod.path;
				if (!Ext.isEmpty(mod.type) && mod.type == 'window') {
					var wnd = Ext.create(mod.component, mod.config);
					wnd.show();
				} else {
					this.createModulePanel({
						title : eval("__." + path),
						itemId : mod.module + '-panel',
						iconCls : icon ? icon + '-icon' : mod.module + '-icon',
						closable : true,
						autoScroll : true,
						autoShow : true,
						autoDestroy : true,
						layout : 'card',
						items : Ext.create(mod.component, mod.config)
					});
				}
			}
		},

		createModulePanel : function(config, callback) {
			var tab = App.editorTabs.getComponent(config.id || config.itemId);
			if (tab) {
				App.editorTabs.setActiveTab(tab);
				return;
			} else {
				var stTab = Ext.create('Ext.panel.Panel', config);
				App.editorTabs.add(stTab).show();
				if (Ext.isFunction(callback)) {
					callback();
				}
			}
		},

		removeModulePanel : function(id) {
			App.editorTabs.remove(id);
		},

		runController : function(params, record, callback) {
			var rec;
			if (!Ext.isEmpty(record)) {
				rec = (record.record && typeof (record.record.commit) == 'function') ? record.record : record;
			}
			Ext.Ajax.request({
				url : App.baseUrl,
				params : params,
				success : function(response, request) {
					if (Ext.ux.Utils.ajaxResponseHasError(response)) {
						Ext.ux.Utils.ajaxResponseShowError(response);
						if (!Ext.isEmpty(rec)) {
							rec.reject();
						}
					} else {
						if (!Ext.isEmpty(rec)) {
							rec.commit();
						}
						if (Ext.isFunction(callback)) {
							var json = Ext.decode(response.responseText);
							callback(json);
						}
					}
				},
				failure : function() {
					if (!Ext.isEmpty(rec)) {
						rec.reject();
					}
				}
			});
		},

		delRows : function(grid, parentStore, callback) {
			function delRec(btn) {
				var reader = grid.getStore().getProxy().getReader(), id = reader.idProperty ? reader.idProperty : (reader.metaData ? reader.metaData.id : reader.id);
				if (id && btn == 'yes') {
					var ids = [];
					Ext.each(grid.getSelectionModel().getSelection(), function(row) {
						ids.push(row.data[id]);
					});
					var module = grid.getStore().module;
					if (typeof module == 'undefined') {
						module = grid.getStore().getProxy().extraParams._m;
					}
					Ext.Ajax.request({
						url : App.baseUrl,
						params : {
							_m : module,
							_a : 'delRow',
							id : Ext.encode(ids)
						},
						success : function(response, request) {
							if (Ext.ux.Utils.ajaxResponseHasError(response)) {
								Ext.ux.Utils.ajaxResponseShowError(response);
							} else {
								grid.getStore().load();
								if (Ext.isObject(parentStore)) {
									parentStore.load();
								}
							}
							if (Ext.isFunction(callback)) {
								callback();
							}
						}
					});
				}
			}
			if (grid.getSelectionModel().getSelection().length > 0) {
				Ext.MessageBox.confirm(__.message, __.del_selection_question, delRec);
			} else {
				Ext.ux.Utils.alert(__.error_msg, __.select_recs);
			}
		},

		hidePreloader : function() {
			setTimeout(function() {
				Ext.get('loading').remove();
				Ext.get('loading-mask').fadeOut({
					remove : true
				});
			}, 500);
		},

		initTabs : function(dashboard) {
			var dsh = null;
			if (Ext.isEmpty(dashboard) || dashboard === true) {
				dsh = {
					contentEl : 'dashboard',
					id : 'dashboard-panel',
					title : __.dashboard,
					iconCls : 'ic-bumpLogo',
					closable : false
				};
			}
			App.editorTabs = Ext.create('Ext.tab.Panel', {
				region : 'center',
				ui : 'editortabs',
				header : false,
				layoutOnTabChange : true,
				margins : '0 5 0 0',
				activeTab : 0,
				defaults : {
					autoScroll : true
				},
				enableTabScroll : true,
				plugins : Ext.create('Ext.ux.TabCloseMenu'),
				items : [ dsh ]
			});
		},

		reinitTabs : function() {
			runner.stop(task);
			runner = null;
		},

		showVideo : function(file, title, width, height, image) {
			Shadowbox.open({
				player : 'html',
				content : '<div id="myFlwPlayer"></div>',
				width : width || 600,
				height : height + 4 || 404,
				title : title,
				options : {
					onFinish : function() {
						jwplayer("myFlwPlayer").setup({
							file : file,
							width : width || 600,
							height : height || 400,
							image : image || ''
						}).play();
					}
				}
			});
		},

		showEmbedVideo : function(path) {
			Ext.getBody().mask('Loading');
			Ext.Ajax.request({
				url : App.baseUrl,
				params : {
					_m : 'OEmbed',
					_a : 'getInfo',
					path : path
				},
				success : function(response, request) {
					Ext.getBody().unmask();
					var json = Ext.decode(response.responseText)

					if (Ext.ux.Utils.ajaxResponseHasError(response)) {
						Ext.ux.Utils.ajaxResponseShowError(response);
					} else if (json.data.type == 'video') {
						if (parseInt(json.data.width) > Ext.getBody().getWidth()) {
							var w = parseInt(json.data.width) * .8;
							var h = parseInt(json.data.height) * .8;
							json.data.html = json.data.html.replace(/width="(\d+)"/i, 'width="' + w + '"').replace(/height="(\d+)"/i, 'height="' + h + '"');
							json.data.width = w;
							json.data.height = h;
						}
						Shadowbox.open({
							player : 'html',
							content : json.data.html,
							width : json.data.width,
							height : json.data.height,
							title : json.data.title
						});
					} else {
						Ext.ux.Utils.alert(__.error_msg, __.common_error);
					}
				},
				failure : function() {
					Ext.getBody().unmask();
				}
			});
		},

		showImage : function(img, title) {
			Shadowbox.open({
				player : 'img',
				content : img,
				title : title
			});
		},

		showHTML : function(content) {
			Shadowbox.open({
				player : 'html',
				content : content,
				width : 640,
				height : 400
			});
		},

		showAlbumItem : function(storeId, key, field) {
			if (Ext.isEmpty(field)) {
				field = 'url';
			}
			var urls = [];
			var store = Ext.StoreMgr.lookup(storeId);
			if (store && store.getCount()) {
				store.each(function(rec) {
					urls.push({
						player : 'img',
						title : rec.get('title'),
						content : rec.get(field)
					});
				});
				if (urls.length) {
					Shadowbox.open(urls, key);
				}
			}
		},

		uploaderFileSize : function(size, formatString) {
			var numberFormatString = formatString || '0/i';
			if (size < 1024) {
				return Ext.util.Format.number(size, numberFormatString) + "b";
			} else if (size < 1048576) {
				return Ext.util.Format.number(Math.round(((size * 100) / 1024)) / 100, numberFormatString) + "Kb";
			} else if (size < 1073741824) {
				return Ext.util.Format.number(Math.round(((size * 100) / 1048576)) / 100, numberFormatString) + "Mb";
			} else if (size < 1099511627776) {
				return Ext.util.Format.number(Math.round(((size * 100) / 1073741824)) / 100, numberFormatString) + "Gb";
			} else {
				return Ext.util.Format.number(Math.round(((size * 100) / 1099511627776)) / 100, numberFormatString) + "Tb";
			}
		},

		init : function() {
			App.Vars = Ext.create('Ext.ux.Variables');
			App.sp = Ext.create('Ext.state.LocalStorageProvider');
			if (!App.sp) {
				App.sp = Ext.create('Ext.state.CookieProvider', {
					path : App.baseUrl,
					expires : new Date(new Date().getTime() + 31536000000)
				// 1 year
				});
			}
			Ext.state.Manager.setProvider(App.sp);
			App.curLang = App.sp.get('lang', 'en');
			App.curTheme = Ext.create('Ext.ux.form.field.ThemeCombo');
			this.initTabs();
			// Activity Manager
			task = {
				run : Ext.create('Ext.ux.ReloginForm').run,
				interval : 60000
			};
			runner = Ext.create('Ext.util.TaskRunner');
			runner.start(task);
			//Ext.QuickTips.init();
			Ext.define('ModulesModel', {
				extend : 'Ext.data.Model'
			});
		}
	}
});

Ext.util.Observable.observe(Ext.data.proxy.Ajax);
Ext.data.proxy.Ajax.on({
	exception : Ext.ux.Utils.exception,
	failure : Ext.ux.Utils.exception
});

Ext.util.Observable.observe(Ext.Ajax);
Ext.Ajax.on({
	requestexception : Ext.ux.Utils.exception,
	failure : Ext.ux.Utils.exception
});

Ext.util.Observable.observe(Ext.form.Panel);
Ext.form.Panel.on({
	actionfailed : Ext.ux.Utils.formPanelActionfailed
});

Ext.override(Ext.menu.Menu, {
	onMouseLeave : function(e) {
		var me = this;

		// BEGIN FIX
		var visibleSubmenu = false;
		me.items.each(function(item) {
			if (item.menu && item.menu.isVisible()) {
				visibleSubmenu = true;
			}
		})
		if (visibleSubmenu) {
			//console.log('apply fix hide submenu');
			return;
		}
		// END FIX

		me.deactivateActiveItem();

		if (me.disabled) {
			return;
		}

		me.fireEvent('mouseleave', me, e);
	}
});
