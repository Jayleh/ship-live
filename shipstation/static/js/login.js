document.addEventListener('DOMContentLoaded', function () {
    // Initialize feature discovery
    let $tapTarget = document.querySelector('.tap-target');
    M.TapTarget.init($tapTarget);

    // Open feature discovery on mousevoer, click to close
    let $menu = document.querySelector('#menu'),
        instance = M.TapTarget.getInstance($tapTarget);

    $menu.addEventListener("click", function () {
        instance.open();
    });
});