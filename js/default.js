(function () {
    "use strict";

    WinJS.UI.processAll().then(init);

    function init() {
        //var pullToRefresh = document.getElementById("pullToRefresh").winControl;
        //pullToRefresh.addEventListener("refresh", doRefresh);
    };

    function doRefresh(e) {
        setTimeout(function () {
            e.srcElement.winControl.refreshing = false;
        }, 2000);
    }

    function doWork() {
        setTimeout(function () {
        }, 2000);

    }


})();