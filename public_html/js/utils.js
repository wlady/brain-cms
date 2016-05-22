var featureDetector =
{
	init: function() {
		var t = document.createElement('a');
		t.id = 'testLink',
		t.href = '/test/test/test/';
		document.body.appendChild(t);
		// old IE gives wrong number of splitted parts after this operation
		var l = document.getElementById('testLink');
		var t1 = l.pathname.split('/');
		l.parentNode.removeChild(l);
		this.oldIE = (t1.length==4);
	}
}

var zeroPadding = true;
var minNights = 3;
var maxNights = 28;

function IsEmail (email) {
	var reg = /^([A-Za-z0-9_\-\.])+\@(([A-Za-z0-9_\-])+\.)+[A-Za-z]{2,4}$/;
	return reg.test(email);
}

function IsPhone (phone) {
	var reg = /^.[0-9]{10,13}$/;
	return reg.test(phone);
}

function ValidateForm(frmId){
	var errors = 0, checkForm = '.requiredField';;
	if (typeof(frmId)!=='undefined') {
		checkForm = '#'+frmId+' .requiredField';
	}
	$(checkForm).each (function () {
		var block = $(this);
		if ('' == block.val()) {
			block.css('backgroundColor', '#FF0000');
			block.focus(function() {
				block.css('backgroundColor', '#FFF');
			});
			errors++;
		} else {
			if (block.attr('id').match(/(.*?)email(.*?)/i)) {
				if (!IsEmail (block.val())) {
					alert('Please insert correct email address.');
					block.css('backgroundColor', '#FF0000');
					block.focus(function() {
						block.css('backgroundColor', '#FFF');
					});
					errors = -1000;
				}
			} else {
				block.css('backgroundColor', '');
			}
		}
	});
	if (errors == 0) {
		return true;
	} else if (errors > 0) {
		alert('Please fill all required fields.');
		return false;
	} else if (errors < 0) {
		return false;
	}
}

function ValidateSignupForm() {
	var val, errors = 0;
	if (!IsEmail($('#signupEmail').val())) {
		alert("Wrong Email Address");
		return false;
	}
	$.ajax({
		type: "POST",
		url: "/signup/",
		data: $('#signupEmail').serialize(),
		dataType: "json",
		success: function(results) {
			// clear the form
			$('#signup')[0].reset();
			if (results.message) {
				$('#msgBody').html(results.message);
				$('#msgPopup').lightbox_me();
			}
		}
	});
	return true;
}

function ValidateInquireForm() {
	var val, errors = 0;
	if (ValidateForm('inquireForm')) {
		val = $('#FName').val();
		if (val == "First Name") {
			$('#FName').css('backgroundColor', '#FF0000');
			$('#FName').focus(function() {
				$('#FName').css('backgroundColor', '#FFF');
			});
			errors++;
		}
		val = $('#LName').val();
		if (val == "Last Name") {
			$('#LName').css('backgroundColor', '#FF0000');
			$('#LName').focus(function() {
				$('#LName').css('backgroundColor', '#FFF');
			});
			errors++;
		}
		val = $('#Phone').val();
		if (!parseInt(val)) {
			$('#Phone').val('');
		}
		val = $('#Arrival').val();
		if (val == "Arrival") {
			$('#Arrival').val('');
		}
		val = $('#Departure').val();
		if (val == "Departure") {
			$('#Departure').val('');
		}
		val = $('#Comment').val();
		if (val == "Comment") {
			$('#Comment').val('');
		}
		if (errors == 0) {
			return true;
		} else if (errors > 0) {
			alert("Please fill all required fields.");
		}
	}
	return false;
}
function SendContactForm() {
	if (ValidateForm('contactForm')) {
		$('#contactForm').submit();
	}
}
function SendInquireForm() {
	if (ValidateInquireForm()) {
		$.ajax({
			type: "POST",
			url: "/property_details/inquire/",
			data: $('#inquireForm').serialize(),
			dataType: "json",
			success: function(results) {
				// clear the form
				$('#inquireForm')[0].reset();
				if (results.message) {
					alert(results.message);
				}
			}
		});
	}
	return false;
}

function selectMenuItem() {
	var tmp = document.location.pathname.split('/');
	$('#mainmenu li>a').each (function (key, item) {
		var tmp1 = item.pathname.split('/');
		var ind = featureDetector.oldIE ? 0 : 1;
		if (tmp1[1]=='search' && (tmp[ind]=='properties' || tmp[ind]=='property')) {
			$(this).parent().toggleClass('current');
			$(this).prev().show();
		} else if (tmp1[ind]==tmp[1]) {
			$(this).parent().toggleClass('current');
			$(this).prev().show();
		}
	});
}

function ensureNumeric(e) {
	var k = (typeof e.charCode == "undefined" ? e.keyCode : e.charCode);
	if (k < 32 || e.ctrlKey || e.altKey || e.metaKey) {
		return true;
	}
	return (k >= 48 && k <= 57);
}

function setCookie(name, value, expire, path, domain, secure) {
	document.cookie = name + "=" +escape( value ) +
		( ( expire ) ? ";expires=" + expire.toGMTString() : "" ) +
		( ( path ) ? ";path=" + path : "" ) +
		( ( domain ) ? ";domain=" + domain : "" ) +
		( ( secure ) ? ";secure" : "" );
}

function getCookie(nm) {
	if (document.cookie.length > 0) {
		var re1 = /\s*;\s*/;
		var cooks = document.cookie.split(re1);
		var re2 = /\s*=\s*/;
		for ( i=0; i<cooks.length; i++ ) {
				var parts = cooks[i].split(re2,2);
				if (nm == parts[0]) {
					return unescape(parts[1]);
				}
		}
	}
	return "";
}

function deleteCookie(Name) {
	expireDate = new Date;
	expireDate.setDate(expireDate.getDate()-1);
	document.cookie = Name + "=; expires=" + expireDate.toGMTString();
}

function zDate(x){
	if (!zeroPadding) {
		return x;
	} else {
		return(x<0||x>9?'':'0')+ x;
	}
}

function showCalendar(elem, prop) {
	currentMonth = 0;
	$('#priceQuoteDiv').hide();
	$('div.btn_blue.price_btn.book_btn').hide();
	$('#priceQuoteDiv').css('left', priceQuoteOffs);
	$('#priceQuoteDiv').css('top', $(elem)[0].offsetTop);
	$('#priceQuoteDiv').show();
	$('#priceQuote').html('<div style="padding:10px"><img src="/img/progress.gif" width="16" height="16" alt="" /><span style="color:red;font-weight:bold;" > Loading Real Time Availability & Pricing</span></div>');
	$('#book input[name=prop_id]').val(prop);
	$('#book input[name=book_check_in]').val($('#searchdate').val());
	$('#book input[name=book_check_out]').val($('#searchdate_out').val());
	$('#book input[name=book_nights]').val($('#searchstay').val());
	$.ajax({
		type: "POST",
		url: "/search/price_quote/",
		data: {
			prop_id: prop,
			book_check_in: $('#searchdate').val(),
			book_check_out: $('#searchdate_out').val(),
			book_nights: $('#searchstay').val()
		},
		dataType: "json",
		success: function(results) {
			if (results.success) {
				$('#priceQuote').html(results.data);
				setTimeout(
					function() {
						$('#book_check_in').datepicker({
							minDate: 2,
							maxDate: '+2Y',
							dateFormat: 'm/d/yy',
							changeMonth: true,
							changeYear: true,
							onSelect: function (dates){
								$('#book_check_out').datepicker("option", { minDate: dates });
								updateCalendar2_1();
							}
						});
						$('#book_check_out').datepicker({
							minDate: 2,
							maxDate: '+2Y',
							dateFormat: 'm/d/yy',
							changeMonth: true,
							changeYear: true,
							onSelect: function (dates){
								updateCalendar3();
							}
						});
						updateCalendar2();
					},
					100
				);
			}
		},
		failure: function() {
			$('#priceQuote').html("We're sorry, this feature is temporarily unavailable. Please try again later.");
		}
	});
}

function adjustSearchCheckOut() {
	if (parseInt($('#searchstay').val()) && $('#searchdate').val().length) {
		dt1 = new Date($('#searchdate').val());
		dt2 = new Date(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()+parseInt($('#searchstay').val(),10), 0, 0, 0, 0);
		$('#searchdate_out').val(zDate(dt2.getMonth()+1)+'/'+zDate(dt2.getDate())+'/'+dt2.getFullYear());
	}
}

function adjustSearchNights() {
	if ($('#searchdate').val().length && $('#searchdate_out').val().length) {
		var hold = [$('#searchdate').val(), $('#searchdate_out').val(), $('#searchstay').val()];
		dt1 = new Date($('#searchdate').val());
		dt2 = new Date($('#searchdate_out').val());
		if (dt1.getTime()>dt2.getTime()) {
			return;
		}
		var nights = Math.abs(Math.ceil((dt2 - dt1)/86400000));
		if (nights>maxNights) {
			nights = $('#searchstay').val(maxNights);
			adjustSearchCheckOut();
			return;
		}
		if (nights<minNights) {
			nights = $('#searchstay').val(minNights);
			adjustSearchCheckOut();
			return;
		}
		$('#searchstay').val(nights);
	} else {
		$('#searchstay').val('');
	}
}

function setPage(val) {
	var loc = document.location;
	var s = loc.search;
	if (s.match(/pageNum=/)) {
		if (s.match(/pageNum=(\w+)/)) {
			s = s.replace(/pageNum=\w+/, 'pageNum='+val);
		} else {
			s = s.replace(/pageNum=/, 'pageNum='+val);
		}
	} else {
		if (!s.length) {
			s = '?pageNum='+val;
		} else if (s.indexOf('?')!=-1) {
			s += '&pageNum='+val;
		} else {
			s += '?pageNum='+val;
		}
	}
	if (!s.match(/token=/)) {
		var token = Math.round(Math.random()*1000);
		if ($('#token')) {
			token = $('#token').val();
		}
		s += '&token='+token;
	}
	document.location.href = document.location.protocol+'//'+document.location.host+document.location.pathname+s;
}

function setPerPage(val) {
	var loc = document.location;
	var s = loc.search;
	if (s.match(/perPage=/)) {
		if (s.match(/perPage=(\w+)/)) {
			s = s.replace(/perPage=\w+/, 'perPage='+val);
		} else {
			s = s.replace(/perPage=/, 'perPage='+val);
		}
	} else {
		if (!s.length) {
			s = '?perPage='+val;
		} else if (s.indexOf('?')!=-1) {
			s += '&perPage='+val;
		} else {
			s += '?perPage='+val;
		}
	}
	if (!s.match(/token=/)) {
		var token = Math.round(Math.random()*1000);
		if ($('#token')) {
			token = $('#token').val();
		}
		s += '&token='+token;
	}
	document.location.href = document.location.protocol+'//'+document.location.host+document.location.pathname+s;
}

function setSortOrder(val) {
	var loc = document.location;
	var s = loc.search;
	if (s.match(/sort=/)) {
		if (s.match(/sort=(\w+)/)) {
			s = s.replace(/sort=\w+/, 'sort='+val);
		} else {
			s = s.replace(/sort=/, 'sort='+val);
		}
	} else {
		if (s.indexOf('?')!=-1) {
			s += '&sort='+val;
		} else {
			s += '?sort='+val;
		}
	}
	document.location.href = document.location.protocol+'//'+document.location.host+document.location.pathname+s;
}

function setMode(mode) {
	var loc = document.location;
	var s = loc.search;
	if (s.match(/viewmode=/)) {
		if (s.match(/viewmode=(\w+)/)) {
			s = s.replace(/viewmode=\w+/, 'viewmode='+mode);
		} else {
			s = s.replace(/viewmode=/, 'viewmode='+mode);
		}
	} else {
		if (s.indexOf('?')!=-1) {
			s += '&viewmode='+mode;
		} else {
			s += '?viewmode='+mode;
		}
	}
	document.location.href = document.location.protocol+'//'+document.location.host+document.location.pathname+s;
}

function printThis() {
	var a = window.open('','printing','scrollbars=yes,width=700');
	a.document.open("text/html");
	var strContent = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><link href="/css/reset.css" rel="stylesheet" type="text/css" /><link href="/css/style.css" rel="stylesheet" type="text/css" /><link href="/css/booking_light.css" rel="stylesheet" type="text/css" /><link href="/css/print.css" rel="stylesheet" type="text/css" /></head><body>';
	strContent += document.getElementById('print_area').innerHTML;
	strContent += '</body></html>';
	a.document.write(strContent);
	a.document.close();
	a.focus();
	a.print();
}

function countFavs() {
	var tmp = [];
	var cookies = getCookie('favs');
	if (cookies.length) {
		tmp = cookies.split(',');
	}
	if ($('#fav_number')) {
		$('#fav_number').html('('+tmp.length+')');
	}
	if ($('#fav2_number')) {
		$('#fav2_number').html(tmp.length);
	}
	return tmp.length;
}

function toggleFav(prop_id) {
	$.ajax({
		type: "POST",
		url: "/favorites/",
		data: "action=toggle&prop_id="+prop_id,
		success: function(results) {
			countFavs();
		}
	});
}

function removeFav(prop_id) {
	$.ajax({
		type: "POST",
		url: "/favorites/",
		data: "action=remove&prop_id="+prop_id,
		success: function() {
			$.each($('li.item_wrapper'), function() {
				if ($(this).data('prop')==prop_id) {
					$(this).hide();
				}
			});
			var cnt = countFavs();
			if (!cnt) {
				document.location.href = '/search/';
			}
		}
	});
}

function countCmps() {
	var tmp = [];
	var cookies = getCookie('comps');
	if (cookies.length) {
		tmp = cookies.split(',');
	}
	if ($('#cmp_number')) {
		$('#cmp_number').html('('+tmp.length+')');
	}
	if ($('#cmp2_number')) {
		$('#cmp2_number').html(tmp.length);
	}
	return tmp.length;
}

function toggleCmp(prop_id) {
	$.ajax({
		type: "POST",
		url: "/compare/",
		data: "action=toggle&prop_id="+prop_id,
		success: function(results) {
			countCmps();
		}
	});
}

function removeCmp(prop_id) {
	$.ajax({
		type: "POST",
		url: "/compare/",
		data: "action=toggle&prop_id="+prop_id,
		success: function(results) {
			$.each($('table.table_compare'), function() {
				if ($(this).data('prop')==prop_id) {
					$(this).hide();
				}
			});
			var cnt = countCmps();
			if (!cnt) {
				document.location.href = '/search/';
			}
		}
	});
}

function submitBook(prop_id, price) {
	if ($('#book input[name=book_check_in]').val().length && parseInt($('#book input[name=book_nights]').val()) && parseFloat(price)) {
		$('#book input[name=step]').val(2);
	}
	$('#book input[name=prop_id]').val(unescape(prop_id));
	$('#book').submit();
}

function reloadCaptcha(id) {
	if (typeof id == 'undefined') {
		id = '#captcha';
	}
	if (!$(id) || !$(id).length) {
		return;
	}
	$(id)[0].src = '/mathcaptcha.php?' + Math.random();
}

function scrollToElem(elem, delay) {
	$('html, body').animate({
		scrollTop: elem.offset().top
	}, delay);
	return false;
}

function showElemAt(left, top, el) {
	el.css('left', left);
	el.css('top', top);
	el.show();
}

$(function() {
	featureDetector.init();
	countFavs();
	countCmps();
	selectMenuItem();
});
