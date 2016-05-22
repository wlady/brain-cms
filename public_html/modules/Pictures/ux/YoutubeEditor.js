Ext.ns('App');
Ext.define('module.Pictures.ux.YoutubeEditor', {
	extend : 'Ext.form.Panel',
	originalId : 0,
	fid : 0,
	albumId : 0,
	trackResetOnLoad : true,
	title : __.youtube_editor,
	url : App.baseUrl,
	baseParams : {
		_m : 'Pictures',
		_a : 'saveRow'
	},
	loadMask : true,
	bodyStyle : 'padding:5px;',
	assignedModulesStore : null,
	iconsWin : null,
	constructor : function(config) {
		var me = this;
		if (config) {
			if (config.id) {
				this.originalId = this.fid = config.id;
			}
			if (config.c_id) {
				this.albumId = config.c_id;
			}
		}
		this.items = [ {
			xtype : 'fieldset',
			title : __.youtube_info,
			collapsible : false,
			collapsed : false,
			items : [ {
				xtype : 'hiddenfield',
				name : 'id'
			}, {
				xtype : 'hiddenfield',
				name : 'album_id',
				value : this.albumId
			}, {
				xtype : 'hidden',
				name : 'external',
				value : 'true'
			}, {
				xtype : 'hidden',
				name : 'photo'
			}, {
				xtype : 'fieldcontainer',
				layout : 'hbox',
				anchor : '90%',
				fieldLabel : __.youtube_code,
				items : [ {
					xtype : 'textfield',
					itemId : 'video_code',
					name : 'video_code',
					width : 150,
					padding : '0 10 0 0'
				}, {
					xtype : 'button',
					iconCls : 'ic-download',
					text : __.youtube_get,
					scope : this,
					handler : function() {
						var code = me.getForm().findField('video_code').getValue();
						Ext.Ajax.request({
							url : App.baseUrl,
							params : {
								_m : 'Pictures',
								_a : 'getYouTubeData',
								code : code,
								item : me.fid
							},
							success : function(response, request) {
								if (Ext.ux.Utils.ajaxResponseHasError(response)) {
									Ext.ux.Utils.ajaxResponseShowError(response);
								} else {
                                    var json = Ext.decode(response.responseText);
									var frm = me.getForm();
									if (json.title) {
										frm.findField('title').setValue(json.title);
									}
									var file = Ext.String.format('http://img.youtube.com/vi/{0}/default.jpg', code);
									Ext.DomHelper.overwrite('yphoto' + me.originalId, Ext.String.format('<a href="javascript:Ext.ux.Utils.showImage(\'{0}\')"><img src="/thumb/?src={0}&w=120&h=120" alt="" border="0" height="120" /></a>', file), true).show(true).frame();
									frm.findField('photo').setValue(file);
									if (json.html) {
										var containers = me.query('container[itemId=preview]');
										if (containers) {
											containers[0].getEl().setHTML(json.html);
											jwplayer("myFlwPlayer" + me.fid).setup({
												file : "http://www.youtube.com/v/" + code + "?fs=1&amp;hl=en_US&amp;rel=0",
												width : 400,
												height : 300
											});
										}
									}
								}
							}
						})
					}
				} ]
			}, {
				xtype : 'textfield',
				fieldLabel : __.title,
				name : 'title',
				anchor : '90%'
			}, {
				xtype : 'enumtruefalsecombo',
				fieldLabel : __.active,
				name : 'active',
				hiddenName : 'active'
			}, {
				xtype : 'enumtruefalsecombo',
				fieldLabel : __.featured,
				name : 'featured',
				hiddenName : 'featured'
			}, {
				xtype : 'fieldcontainer',
				fieldLabel : __.youtube_icon,
				anchor : '90%',
				items : [ {
					xtype : 'panel',
					height : 170,
					tbar : [ {
						text : __.browse,
						tooltip : __.browse,
						iconCls : 'ic-browse',
						handler : function() {
							Ext.create('module.UserFiles.ux.Window', {
								uploadPath : App.imagesDir,
								singleSelect : true,
								filters : [ {
									title : __.image_files,
									extensions : App.picsExtentions
								} ],
								callback : function(selectedRows, path) {
									var frm = me.getForm();
									var data = selectedRows[0].data;
									if (data.path) {
										Ext.DomHelper.overwrite('yphoto' + me.originalId, Ext.String.format('<a href="javascript:Ext.ux.Utils.showImage(\'{0}\')"><img src="/thumb/?src={0}&w=120&h=120" alt="" border="0" height="120" /></a>', data.path), true).show(true).frame();
										frm.findField('photo').setValue(data.path);
									}
								}
							});
						}
					}, '-', {
						text : __.youtube_icon,
						tooltip : __.youtube_icon_tt,
						iconCls : 'ic-youtubeIcon',
						handler : function() {
							var code = me.getForm().findField('video_code').getValue();
							Ext.Ajax.request({
								url : App.baseUrl,
								params : {
									_m : 'Pictures',
									_a : 'getYouTubeData',
									code : code
								},
								success : function(response, request) {
									if (Ext.ux.Utils.ajaxResponseHasError(response)) {
										Ext.ux.Utils.ajaxResponseShowError(response);
									} else {
										me.iconsWin = Ext.create('module.Pictures.ux.Chooser', {
											id : 'youtube-img-chooser-dlg',
											modal : true,
											closeAction : 'close',
											code : code,
											listeners : {
												selected : Ext.bind(me.insertSelectedImage, me)
											}
										});
										me.iconsWin.show();
									}
								}
							})
						}
					}, '-', {
						text : __.clear,
						tooltip : __.clear,
						iconCls : 'ic-del',
						handler : function() {
							Ext.DomHelper.overwrite('yphoto' + me.originalId, '');
							me.getForm().findField('photo').setValue('');
						}
					} ],
					items : [ {
						xtype : 'container',
						html : '<div id="yphoto' + this.originalId + '" style="padding:10px;"><img src="/modules/Admin/img/loader.gif" width="16" height="16" alt="" /></div>'
					} ]
				} ]
			} ]
		}, {
			xtype : 'fieldset',
			title : __.youtube_preview,
			/*collapsible: false,
			 collapsed: false,*/
			items : [ {
				xtype : 'container',
				itemId : 'preview',
				border : false,
				height : 320
			} ]
		} ];
		this.dockedItems = [ {
			xtype : 'toolbar',
			ui : 'footer',
			dock : 'bottom',
			margin : '20 0 20 0',
			layout : {
				pack : 'center'
			},
			items : [ {
				text : __.save_exit,
				iconCls : 'ic-save_exit',
				scope : this,
				handler : function() {
					var frm = this.getForm();
					if (frm.isValid()) {
						frm.submit({
							success : function() {
								me.fireEvent('close', me);
							}
						});
					} else {
						Ext.ux.Utils.alert(__.errors, __.pls_fix);
					}
				}
			}, {
				text : __.save,
				iconCls : 'ic-save',
				scope : this,
				handler : function() {
					var frm = this.getForm();
					if (frm.isValid()) {
						frm.submit({
							success : function(form, action) {
								if (!this.fid && action.result.id) {
									form.findField('id').setValue(action.result.id);
								}
								Ext.ux.Utils.popup(__.info_msg, __.data_saved);
							}
						});
					} else {
						Ext.ux.Utils.alert(__.errors, __.pls_fix);
					}
				}
			}, {
				text : __.close,
				iconCls : 'ic-close',
				handler : function() {
					me.fireEvent('close', me);
				}
			} ]
		} ];
		Ext.apply(this, config || {});
		this.callParent(arguments);
		this.on({
			close : this.closeContainer,
			destroy : this.destroyContainer,
			scope : this
		});
	},

	loadPhoto : function() {
		var id = this.originalId;
		var frm = this.getForm();
		if (frm) {
			var photo = frm.findField('photo').getValue();
			if (!Ext.isEmpty(photo)) {
				var img = Ext.String.format('<a href="javascript:Ext.ux.Utils.showImage(\'{0}\')"><img src="/thumb/?src={0}&w=120&h=120" alt="" height="120" /></a>', photo);
				Ext.DomHelper.overwrite('yphoto' + id, img, true).show(true).frame();
			} else {
				this.hideLoader();
			}
		} else {
			this.hideLoader();
		}
	},

	loadPreview : function() {
		var me = this;
		var id = this.originalId;
		var frm = this.getForm();
		if (id) {
			var code = frm.findField('video_code').getValue();
			if (!Ext.isEmpty(code)) {
				Ext.Ajax.request({
					url : App.baseUrl,
					params : {
						_m : 'Pictures',
						_a : 'getYouTubeData',
						code : code,
						item : me.fid
					},
					success : function(response, request) {
						var json = Ext.decode(response.responseText);
						if (json.success && json.html) {
							var containers = me.query('container[itemId=preview]');
							if (containers) {
								containers[0].getEl().setHTML(json.html);
								jwplayer("myFlwPlayer" + me.fid).setup({
									file : "http://www.youtube.com/v/" + code + "?fs=1&amp;hl=en_US&amp;rel=0",
									width : 400,
									height : 300
								});
							}
						}
					}
				});
			}
		}
	},

	loadData : function() {
		this.loadPhoto();
		this.loadPreview();
	},

	hideLoader : function() {
		Ext.DomHelper.overwrite('yphoto' + this.originalId, '', true);
	},

	insertSelectedImage : function(rec) {
		var frm = this.getForm();
		if (frm) {
			frm.findField('photo').setValue(rec.get('url'));
			this.loadPhoto();
		}
	},

	closeContainer : function(form) {
		var grid = Ext.getCmp('pictures-grid-' + form.albumId);
		if (grid && (!parseInt(form.fid) || form.getForm().isDirty())) {
			grid.getStore().load();
		}
		form.fireEvent('destroy', form);
	},

	destroyContainer : function(form) {
		Ext.ux.Utils.removeModulePanel('youtube-panel-' + form.originalId);
	}
});
