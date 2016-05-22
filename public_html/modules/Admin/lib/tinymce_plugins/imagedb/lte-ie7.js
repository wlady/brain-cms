/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'tinymce-imagedb\'">' + entity + '</span>' + html;
	}
	var icons = {
			'mce-i-icon-contract' : '&#xe000;',
			'mce-i-icon-expand' : '&#xe001;',
			'mce-i-icon-images' : '&#xe002;',
			'mce-i-icon-image' : '&#xe003;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/mce-i-icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};