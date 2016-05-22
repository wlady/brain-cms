/**
* Ext.ux.form.field.RandomStringGenerator
*
*   By wlady2001 at gmail dot com
*
*/
Ext.define('Ext.ux.form.field.RandomStringGenerator', {
	extend: 'Ext.form.field.Trigger',
	alias: 'widget.randomstringgenerator',
	trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
	trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger',
	specialKeys: false,
	passwordLength: 8,
	upperCaseOnly: false,
	constructor : function(config) {
		Ext.apply(this, config || {});
		this.callParent(arguments);
		this.on({
			change: this.onChange,
			scope:  this
		});
	},

	afterRender: function(){
		this.callParent();
		this.triggerCell.item(1).set({
			'data-qtip': __.generate_new
		});
		this.triggerCell.item(0).setDisplayed(this.getValue().length!=0);
	},

	onChange: function() {
		this.triggerCell.item(0).setDisplayed(this.getValue().length!=0);
	},

	onTrigger1Click : function(){
		this.setValue('');
		this.triggerCell.item(0).setDisplayed(false);
		this.updateLayout();
	},

	onTrigger2Click : function(){
		this.setValue(this.generate());

		if (this.getValue().length > 0) {
			this.triggerCell.item(0).setDisplayed(true);
			this.updateLayout();
		}
	},

	generate: function() {
		var me = this,
			iteration = 0,
			password = '',
			randomNumber;

		while (iteration < me.passwordLength) {
			randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
			if (!me.specialKeys) {
				if ((randomNumber >=33) && (randomNumber <=47)) { continue; }
				if ((randomNumber >=58) && (randomNumber <=64)) { continue; }
				if ((randomNumber >=91) && (randomNumber <=96)) { continue; }
				if ((randomNumber >=123) && (randomNumber <=126)) { continue; }
			}
			iteration++;
			password += String.fromCharCode(randomNumber);
		}
		return me.upperCaseOnly ? password.toUpperCase() : password;
	}
});
