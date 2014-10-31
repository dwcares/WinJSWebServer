(function () {
    "use strict";

    // msgrid
    // msmanipulation / handjs
    // scroll overflow style
    // position sticky? samples

    /**************** Pull to Refresh *******************/
    var pullToRefresh = WinJS.Class.define(
        function Control_ctor(element, options) {
            this.element = element || document.createElement("div");
            //element.winControl = this;

            // options defaults
            this._pullBoxHeight = 80;
            this._pullHintLabel = "Pull to refresh";
            this._releaseHintLabel = "Release to refresh";
            this._refreshing = false;
            this._createVisualTree();
            this._initPullToRefreshBehavior();

            WinJS.UI.setOptions(this, options);
        }, {

            //Public members
            refreshing: {
                get: function () {
                    return this._refreshing;
                },
                set: function (value) {

                    if (this._refreshing && !value) {
                        // After the refresh, return to the default state
                        WinJS.Utilities.removeClass(this._outerScroller, "touch-loading");
                        this._outerScroller.disabled = false;

                        // Scroll back to the top of the list
                        this._scrollTo(this._outerScroller, this._pullBoxHeight)
                    } else if (!this._refreshing && value) {
                        WinJS.Utilities.addClass(this._outerScroller, "touch-loading");
                        this._outerScroller.disabled = true;
                        this._pullLabel.innerText = "Loading...";
                    }
                    this._refreshing = value;
                }
            },
            pullHintLabel: {
                get: function () {
                    return this._pullHintLabel;
                },
                set: function (value) {
                    this._pullHintLabel = value;

                    if (!this.refreshing) {
                        this._pullLabel.innerText = this._pullHintLabel;
                    }
                }
            },
            releaseHintLabel: {
                get: function () {
                    return this._releaseHintLabel;
                },
                set: function (value) {
                    this._releaseHintLabel = value;

                    if (!this.refreshing) {
                        this.element.querySelector(".touch-pullLabel").innerText = this._releaseHintLabel;
                    }
                }
            },
            _createVisualTree: function () {
                var contentToAdd = '<div class="touch-outer">'
                            + '<div class="touch-pullBox">'
                            + '<progress class="touch-pullProgress win-ring"></progress>'
                            + '<div class="touch-pullArrow"></div>'
                            + '<div class="touch-pullLabel"></div></div>'
                            + '<div class="touch-inner"></div></div>';

                this.element.insertAdjacentHTML('beforeend', contentToAdd);

                this._outerScroller = this.element.querySelector(".touch-outer");
                this._innerScroller = this.element.querySelector(".touch-inner");
                this._pullLabel = this.element.querySelector(".touch-pullLabel");
                this._pullArrow = this.element.querySelector(".touch-pullArrow");

                while (this.element.firstChild !== this._outerScroller) {
                    this._innerScroller.appendChild(this.element.firstChild);
                }

            },
            _initPullToRefreshBehavior: function () {
                var that = this;
                var MS_MANIPULATION_STATE_ACTIVE = 1; // A contact is touching the surface and interacting with content
                var MS_MANIPULATION_STATE_INERTIA = 2; // The content is still moving, but contact with the surface has ended 
                var _outerScroller = this._outerScroller;
                var _pullLabel = this._pullLabel;
                var _pullArrow = this._pullArrow;

                _outerScroller.scrollTop = this._pullBoxHeight;
                _outerScroller.addEventListener("scroll", onScroll);
                _outerScroller.addEventListener("MSManipulationStateChanged", onManipualationStateChanged);

                function onScroll(e) {
                    var rotationAngle = 180 * ((that._pullBoxHeight - _outerScroller.scrollTop) / that._pullBoxHeight) + 90;
                    _pullArrow.style.transform = "rotate(" + rotationAngle + "deg)";

                    // Change the label once you pull to the top
                    if (_outerScroller.scrollTop === 0) {
                        _pullLabel.innerText = that._releaseHintLabel;
                    } else {
                        _pullLabel.innerText = that._pullHintLabel;
                    }
                };

                function handlePromise(promise) {
                    promise.then(function () {
                        that.refreshing = false;
                    });
                }

                function onManipualationStateChanged(e) {
                    // Check to see if they lifted while pulled to the top
                    if (e.currentState == MS_MANIPULATION_STATE_INERTIA &&
                        e.lastState == MS_MANIPULATION_STATE_ACTIVE &&
                        _outerScroller.scrollTop === 0) {

                        that.refreshing = true;
                        that.dispatchEvent("refresh", { setPromise: handlePromise });
                    }
                };
            },
            _scrollTo: function (element, position) {
                if (element.msZoomTo) {
                    element.msZoomTo({
                        contentX: 0,
                        contentY: position,
                        viewporX: 0,
                        viewportY: 0
                    });
                } else {
                    element.scrollTop = position;
                }
            }
        }, {
        });

    WinJS.Namespace.define("TouchControls", {
        PullToRefresh: pullToRefresh,
    });

    WinJS.Class.mix(TouchControls.PullToRefresh,
        WinJS.Utilities.createEventProperties("refresh"),
        WinJS.UI.DOMEventMixin);

})();