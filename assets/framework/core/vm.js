var vm = {}

vm.show = function () {
    var args = Array.prototype.slice.call(arguments);
    if(ViewManager)
        return ViewManager.show(...args);
    else
        console.log("ViewManager has not created yet ")
}

vm.hide = function (view, b) {
    if(ViewManager)
        return ViewManager.hide(view, b);
    else
        console.log("ViewManager has not created yet ")
}

window.vm = vm;
