$(document).ready(function(){
    function changeVisability(menuitem) {
        var sub = menuitem.find('.sub-menu');
        if (sub) {
            sub.toggleClass('open');
        }
    }
    $('.navbar-nav > li').hover(
        function() {
            changeVisability($(this));
        }
    );
});