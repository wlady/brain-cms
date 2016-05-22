/**
 * A control that allows selection of range in a list
 * # Example usage
 *     @example
 *     Ext.create('Ext.ux.form.field.MultiSelectSlider', {
 *	    valueField : 'id',
 *	    fieldLabel : 'multiSelectSlider Component',
 *	    displayField : 'text',
 *	    tipsField : 'text',
 *	    maxStoreRecords : 2,
 *	    store : new Ext.data.ArrayStore({
 *	        fields : [ 'id', 'text' ],
 *		    data : [ [ 't_1', 'Test Data_1' ], [ 't_2', 'Test Data_2' ], [ 't_3', 'Test Data_3' ] ]
 *		    }),
 *	    width : '95%'
 *   });
 *
 *   or
 *
 *   {
 *      xtype : 'multiselectslider',
 *	    valueField : 'id',
 *	    fieldLabel : 'multiSelectSlider Component',
 *	    displayField : 'text',
 *	    tipsField : 'text',
 *	    maxStoreRecords : 2,
 *	    store : new Ext.data.ArrayStore({
 *	        fields : [ 'id', 'text' ],
 *		    data : [ [ 't_1', 'Test Data_1' ], [ 't_2', 'Test Data_2' ], [ 't_3', 'Test Data_3' ] ]
 *		    }),
 *	    width : '95%'
 *   }
 */

/**
 * Note: When you create an object  "maxStoreRecords" the default is 20
 */
Ext.define('Ext.ux.form.field.MultiSelectSlider', {
	extend : 'Ext.form.FieldContainer',
	mixins: [
		'Ext.util.StoreHolder',
		'Ext.form.field.Field'
	],

	alternateClassName: 'Ext.ux.Multiselectslider',
	alias : [ 'widget.multiselectslider' ],
	requires : [ 'Ext.panel.Panel', 'Ext.view.BoundList', 'Ext.layout.container.Fit', 'Ext.layout.container.HBox', 'Ext.slider.Multi' ],
	layout : {
		type : 'fit',
		align : 'stretch'
	},

	/**
	 * @cfg {String} [title=""] A title for the underlying panel.
	 */

	/**
	 * {Number} [maxStoreRecords=20] Max number of records to store.
	 */
	maxStoreRecords : 20,

	/**
	 * @cfg {Boolean} [initSelectedAll=false] Condition selection at initialization.
	 * selection.
	 */
	initSelectedAll : false,

	/**
	 * @cfg {Boolean} [submitDisabled=true] Submit data if the component is disabled.
	 * selection.
	 */
	submitDisabled : true,

	/**
	 * @cfg {String} [displayField="text"] Name of the desired display field in the dataset.
	 */
	displayField : 'text',

	/**
	 * @cfg {String} [tipsField=undefined] Name of the desired tips field in the dataset.
	 */
	tipsField : undefined,

	/**
	 * @cfg {String} [emptyTipsText='Empty tips'] Text if empty record  from the dataset.
	 */
	emptyTipsText : 'Empty tips',

	/**
	 * @cfg {String} [valueField="text"] Name of the desired value field in the dataset.
	 */
	valueField : 'text',

	/**
	 * @cfg {Boolean} [allowBlank=true] False to require at least one item in the list to be selected, true to allow no
	 * selection.
	 */
	allowBlank : true,

	/** **Note**: this only sets the element's readOnly DOM attribute. Setting `readOnly=true`, for example, will not
	 * disable triggering a ComboBox or Date; it gives you the option of forcing the user to choose via the trigger
	 * without typing in the text box. To hide the trigger use `{@link Ext.form.field.Trigger#hideTrigger hideTrigger}`.
	 */
	readOnly : false,

	/**
	 * @cfg {Number} [minSelections=0] Minimum number of selections allowed.
	 */
	minSelections : 0,

	/**
	 * @cfg {Number} [maxSelections=Number.MAX_VALUE] Maximum number of selections allowed.
	 */
	maxSelections : Number.MAX_VALUE,

	/**
	 * @cfg {String} [blankText="This field is required"] Default text displayed when the control contains no items.
	 */
	blankText : 'This field is required',

	/**
	 * @cfg {String} [minSelectionsText="Minimum {0}item(s) required"]
	 * Validation message displayed when {@link #minSelections} is not met.
	 * The {0} token will be replaced by the value of {@link #minSelections}.
	 */
	minSelectionsText : 'Minimum {0} item(s) required',

	/**
	 * @cfg {String} [maxSelectionsText="Maximum {0} item(s) allowed"]
	 * Validation message displayed when {@link #maxSelections} is not met
	 * The {0} token will be replaced by the value of {@link #maxSelections}.
	 */
	maxSelectionsText : 'Maximum {0} item(s) allowed',

	/**
	 * @cfg {String} [delimiter=","] The string used to delimit the selected values when {@link #getSubmitValue submitting}
	 * the field as part of a form. If you wish to have the selected values submitted as separate
	 * parameters rather than a single delimited parameter, set this to <tt>null</tt>.
	 */
	delimiter : ',',

	/**
	 * @cfg {Ext.data.Store/Array} store The data source to which this MultiSelectSlider is bound (defaults to <tt>undefined</tt>).
	 * Acceptable values for this property are:
	 * <div class="mdetail-params"><ul>
	 * <li><b>any {@link Ext.data.Store Store} subclass</b></li>
	 * <li><b>an Array</b> : Arrays will be converted to a {@link Ext.data.ArrayStore} internally.
	 * <div class="mdetail-params"><ul>
	 * <li><b>1-dimensional array</b> : (e.g., <tt>['Foo','Bar']</tt>)<div class="sub-desc">
	 * A 1-dimensional array will automatically be expanded (each array item will be the combo
	 * {@link #valueField value} and {@link #displayField text})</div></li>
	 * <li><b>2-dimensional array</b> : (e.g., <tt>[['f','Foo'],['b','Bar']]</tt>)<div class="sub-desc">
	 * For a multi-dimensional array, the value in index 0 of each item will be assumed to be the combo
	 * {@link #valueField value}, while the value at index 1 is assumed to be the combo {@link #displayField text}.
	 * </div></li></ul></div></li></ul></div>
	 */

	border : true,

	/**
	 * @cfg {Object} listConfig
	 * An optional set of configuration properties that will be passed to the {@link Ext.view.BoundList}'s constructor.
	 * Any configuration that is valid for BoundList can be included.
	 */
	initComponent : function() {
		var me = this;
		var maxStoreRecords = me.getMaxStoreRecords();

		me.bindStore(me.store, true);
		me.store.removeAt(maxStoreRecords, me.store.getCount() - maxStoreRecords);

		if (!Ext.isDefined(me.valueField)) {
			me.valueField = me.displayField;
		}

		if (!Ext.isDefined(me.tipsField)) {
			me.tipsField = me.displayField;
		}

		me.items = me.setupItems();

		me.callParent();
		me.initField();
	},

	getMaxStoreRecords : function() {
		var me = this;
		me.maxStoreRecords = me.maxStoreRecords < 0 ? 0 : me.maxStoreRecords;

		return me.maxStoreRecords;
	},

	setupItems : function() {
		var me = this;

		var boundListRenderTplWithMask = [
			'<div  class="x-item-disabled x-box-item"',
			' style="border-width: 0px; width: 100%; height: auto; margin: 0px; right: auto; top: 0px;">',
			'<div id="{id}-listWrap" data-ref="listWrap"',
			' class="{baseCls}-list-ct ', Ext.dom.Element.unselectableCls, '">',
			'<ul id="{id}-listEl" data-ref="listEl" class="', Ext.baseCSSPrefix, 'list-plain"',
			'<tpl foreach="ariaAttributes"> {$}="{.}"</tpl>',
			'>',
			'</ul>',
			'</div>',
			//'</div></div>',
			'{%',
			'var pagingToolbar=values.$comp.pagingToolbar;',
			'if (pagingToolbar) {',
			'Ext.DomHelper.generateMarkup(pagingToolbar.getRenderTree(), out);',
			'}',
			'%}',
			{
				disableFormats: true
			}
		];

		me.boundList = Ext.create('Ext.view.BoundList', Ext.apply({
			border : false,
			multiSelect : true,
			store : me.store,
			renderTpl : boundListRenderTplWithMask,
			deferInitialRefresh : false,
			displayField : me.displayField,
			disabled : me.disabled,
			minHeight : 24,
			width : '100%'
		}, me.listConfig));
		me.boundList.on('afterrender', function() {
			var me = this;
			me.initSelectedAll ? me.checkAll() : me.uncheckAll();
		}, me, {
			single : true
		});

		me.multiSlider = Ext.create('Ext.slider.Multi', Ext.apply({
			values : [ 0, 1 ],
			increment : 1,
			vertical : true,
			height : '100%',
			disabled : me.disabled,
			readOnly : me.readOnly,
			style : {
				marginTop : '5px',
				marginBottom : '5px',
				marginRight : '5px'
			},
			useTips : {
				getText : function(el) {
					var recId = el.slider.maxValue - el.value;
					recId = isNaN(recId) ? 0 : recId;
					var record = me.store.getAt(Number(recId));

					return Ext.isDefined(record) ? record.get(me.tipsField) : me.emptyTipsText;
				}
			},
			listeners : {
				scope : this,
				change : function(slider) {
					me.selectBoundList(slider);
				}
			},
			getSubmitValue : function() {
				return null;
			}
		}, me.listConfig));

		me.initMultiSlider();

		me.checked = Ext.create('Ext.button.Button', Ext.apply({
			text : __.select_all,
			iconCls : 'checked',
			handler : Ext.bind(me.checkAll, me)
		}, me.listConfig));

		me.unchecked = Ext.create('Ext.button.Button', Ext.apply({
			text : __.deselect_all,
			iconCls : 'unchecked',
			handler : Ext.bind(me.uncheckAll, me)
		}, me.listConfig));

		var items = [ {
			itemId : 'containerComponents',
			border : true,
			style : {
				borderColor : 'transparent',
				borderStyle : 'solid',
				borderWidth : '1px'
			},
			items : [ {
				border : true,
				tbar : [ me.checked, '-', me.unchecked, me.textField ],
				items : [ {
					border : false,
					layout : 'fit',
					items : [ {
						border : false,
						layout : 'hbox',
						items : [ me.multiSlider, me.boundList ]
					} ]
				} ]
			} ]
		} ];

		me.store.on('datachanged', function(store) {
			var maxStoreRecords = me.getMaxStoreRecords();
			store.removeAt(maxStoreRecords, maxStoreRecords);
			me.initMultiSlider();
		}, me);

		return items;
	},

	selectBoundList : function(slider) {
		var me = this;
		var values = slider.getValues();
		var maxValue = slider.maxValue;

		if (me.store.getCount() > 0) {
			if (!isNaN(values[1])) {
				me.boundList.getSelectionModel().selectRange((maxValue - values[0]), (maxValue - values[1]));
			} else {
				me.boundList.getSelectionModel().selectRange((maxValue - values[0]), (maxValue - values[0]));
			}
		}

        me.validateValue();

	},

	initMultiSlider : function() {
		var me = this;
		var maxValue = me.store.getCount();

		me.multiSlider.setMinValue(1);
		me.multiSlider.setMaxValue(maxValue);

		me.multiSlider.setValue([ 1, maxValue ]);
	},

	checkAll : function() {
		var me = this;

		if (me.readOnly) {
			return;
		}
		me.multiSlider.setValue([ 1, me.store.getCount() ]);
		me.selectBoundList(me.multiSlider);
	},

	uncheckAll : function() {
		var me = this;

		if (me.readOnly) {
			return;
		}

		me.multiSlider.setValue([ 1, me.store.getCount() ]);
		me.boundList.getSelectionModel().deselectAll();
        me.validateValue();
	},

	setValue : function(value) {
		var me = this;
		var arrVal;

		if (!Ext.isString(value)) {
			return;
		}

		if (Ext.isEmpty(value)) {
			me.uncheckAll();
			return;
		}

		arrVal = Ext.isString(me.delimiter) ? value.split(me.delimiter) : null;

		var idxMin = me.store.getCount();
		var idxMax = 0;
		var isFound = false;

		for (var i = 0; i < arrVal.length; i++) {
			var idx = me.store.find(me.valueField, arrVal[i].trim());
			if (idx != -1) {
				isFound = true;
				idxMin = idxMin > idx ? idx : idxMin;
				idxMax = idxMax < idx ? idx : idxMax;
			}
		}
		if (isFound) {
			me.multiSlider.setValue([ me.multiSlider.maxValue - idxMax, me.multiSlider.maxValue - idxMin ]);
			me.selectBoundList(me.multiSlider);
		} else {
			me.uncheckAll();
		}
	},

	getSubmitData : function() {
		var me = this, data = null, val;

		if ((!me.disabled || me.submitDisabled) && me.submitValue) {
			val = me.getSubmitValue();
			if (val !== null) {
				data = {};
				data[me.getName()] = val;
			}
		}
		return data;
	},

	getSubmitValue : function() {
		var me = this;
		return me.getValue();
	},

	getValue : function() {
		var me = this;
		var result = '';

		if (me.boundList.getSelectionModel().hasSelection()) {
			var selectArr = me.boundList.getSelectionModel().getSelection();
			var resultArr = [];

			for (var i = 0; i < selectArr.length; i++) {
				resultArr.push((selectArr[i].get(me.valueField)));
			}
			result = Ext.isString(me.delimiter) ? resultArr.join(me.delimiter) : '';
		}

		return result;
	},

	isValid : function() {
		var me = this;
		var disabled = me.disabled;
		var validate = me.forceValidation || !disabled;

		return validate ? me.validateValue(me.value) : disabled;
	},

	validateValue : function(value) {
		var me = this;
		var errors = me.getErrors(value);
		var isValid = Ext.isEmpty(errors);

		if (!me.preventMark) {
			if (isValid) {
				me.clearInvalid();
			} else {
				me.markInvalid(errors);
			}
		}

		return isValid;
	},

	getErrors : function() {
		var me = this;
		var errors = [];
		var numSelected;
		var values;
		var format = Ext.String.format;

		values = me.boundList.getSelectionModel().getSelection();
		numSelected = values.length;

		if (!me.allowBlank && numSelected < 1) {
			errors.push(me.blankText);
		}
		if (numSelected < me.minSelections) {
			errors.push(format(me.minSelectionsText, me.minSelections));
		}
		if (numSelected > me.maxSelections) {
			errors.push(format(me.maxSelectionsText, me.maxSelections));
		}
		return errors;
	},

	markInvalid : function(errors) {
		// Save the message and fire the 'invalid' event
		var me = this;
		var oldMsg = me.getActiveError();

        me.getComponent('containerComponents').setStyle({
            borderColor :  '#db3333'
        });

		me.setActiveErrors(Ext.Array.from(errors));
		if (oldMsg !== me.getActiveError()) {
			me.updateLayout();
		}
	},

	/**
	 * Clear any invalid styles/messages for this field.
	 *
	 * **Note**: this method does not cause the Field's {@link #validate} or {@link #isValid} methods to return `true`
	 * if the value does not _pass_ validation. So simply clearing a field's errors will not necessarily allow
	 * submission of forms submitted with the {@link Ext.form.action.Submit#clientValidation} option set.
	 */
	clearInvalid : function() {
		// Clear the message and fire the 'valid' event
		var me = this;
		var hadError = me.hasActiveError();

        me.getComponent('containerComponents').setStyle({
            borderColor :  'transparent'
        });

		me.unsetActiveError();
		if (hadError) {
			me.updateLayout();
		}
	},

	clearValue : function() {
		this.uncheckAll();
	},

	onDestroy : function() {
		var me = this;

		me.bindStore(null);
		Ext.destroy(me.dragZone, me.dropZone);
		me.callParent();
	},

	onBindStore: function(store){
		var boundList = this.boundList;

		if (boundList) {
			boundList.bindStore(store);
		}
	},

	setReadOnly : function(readOnly) {
		var me = this;

		readOnly = !!readOnly;
		me.readOnly = readOnly;

		me.multiSlider.setReadOnly(readOnly || me.disabled);

		me.fireEvent('writeablechange', me, readOnly);
	},

	setDisabled : function(disabled) {
		var me = this;

		me.boundList.setDisabled(disabled);
		me.multiSlider.setDisabled(disabled);
		me.multiSlider.setReadOnly(me.readOnly || disabled);

		this.callParent([ disabled ]);
	}
});
