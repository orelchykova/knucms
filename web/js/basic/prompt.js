(function (global) {
    function showPrompt(msg, func) {
        var closePrompt = function() {
            $('.popup').remove();
            $('.overlay').remove();
        };
        var popup = '<div class="panel panel-default popup">' +
                    '<div class="panel-body">' +
                    '<h3>' + msg + '</h3>' +
                    '<p>' +
                    '<button type="button" class="btn btn-default popup-ok">Ок</button>' +
                    '<button type="button" class="btn btn-default popup-cancel">Отмена</button>' +
                    '</p>' +
                    '</div>' +
                    '</div>' +
                    '<div class="overlay"></div>';

        $('body').append(popup);
        $('.popup-cancel').on('click', function() {
            closePrompt();
        });
        $('.popup-ok').on('click', function() {
            func();
            closePrompt();
        });
    }
    global.openPrompt = showPrompt;
})(this);