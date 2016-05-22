var gRecaptchaCallback = function() {
    $('.g-recaptcha').each(function (index, value) {
        value = $(value);
        value.prop('id', 'g-recaptcha-' + Math.random().toString(36).substring(7));
        grecaptcha.render(value.prop('id'), {sitekey: value.data('sitekey')});
    });
};
