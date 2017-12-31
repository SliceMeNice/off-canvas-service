(function (exports) {
    'use strict';

    function __extends(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var AbstractOffCanvasService = (function () {
        function AbstractOffCanvasService() {
            this.registeredViews = new Map();
            this.transitionCallbacks = new Map();
            this.viewStack = new Array();
        }
        AbstractOffCanvasService.prototype.addTransitionCallback = function (from, to, transitionCallback, skipOrCleanupCallback) {
            var id = from + '-' + to;
            if (!this.transitionCallbacks.has(id)) {
                this.transitionCallbacks.set(id, []);
            }
            this.transitionCallbacks.get(id).push({
                transitionCallback: transitionCallback,
                skipOrCleanupCallback: skipOrCleanupCallback
            });
        };
        AbstractOffCanvasService.prototype.dismissCurrentView = function (skipTransitions) {
            if (skipTransitions === void 0) { skipTransitions = false; }
            if (!this.viewStack.length) {
                return;
            }
            var prevView = this.viewStack.pop();
            var nextView = this.viewStack[this.viewStack.length - 1];
            return this.changeView(prevView, nextView, false, skipTransitions);
        };
        AbstractOffCanvasService.prototype.getNumberOfViewsOnViewstack = function () {
            return this.viewStack.length;
        };
        AbstractOffCanvasService.prototype.getRegisteredViews = function () {
            return Array.from(this.registeredViews.values());
        };
        AbstractOffCanvasService.prototype.isShowingView = function (viewIdentifier) {
            if (!this.viewStack.length) {
                return false;
            }
            if (!viewIdentifier) {
                return this.viewStack.length > 1;
            }
            return this.viewStack.some(function (view) {
                return view.id === viewIdentifier;
            });
        };
        AbstractOffCanvasService.prototype.isTopmostView = function (viewIdentifier) {
            if (!this.viewStack.length) {
                return false;
            }
            return this.viewStack[this.viewStack.length - 1].id === viewIdentifier;
        };
        AbstractOffCanvasService.prototype.registerView = function (viewIdentifier, element) {
            var view = {
                id: viewIdentifier,
                element: element
            };
            this.registeredViews.set(viewIdentifier, view);
            this.fixateView(view);
            return view;
        };
        AbstractOffCanvasService.prototype.replaceCurrentViewWith = function (viewIdentifier, skipTransitions) {
            if (skipTransitions === void 0) { skipTransitions = false; }
            var newView = this.registeredViews.get(viewIdentifier);
            if (newView) {
                if (this.viewStack.indexOf(newView) === -1) {
                    var currentView = this.viewStack.pop();
                    this.viewStack.push(newView);
                    return this.changeView(currentView, newView, true, skipTransitions);
                }
                else {
                    return Promise.reject('The view "' + viewIdentifier + '" is already being shown.');
                }
            }
            return Promise.reject('Unknown view "' + viewIdentifier + '".');
        };
        AbstractOffCanvasService.prototype.setBaseView = function (view) {
            this.baseView = view;
            this.viewStack = [this.baseView];
            this.activateView(this.baseView);
        };
        AbstractOffCanvasService.prototype.showView = function (viewIdentifier, skipTransitions) {
            if (skipTransitions === void 0) { skipTransitions = false; }
            if (viewIdentifier === this.baseView.id) {
                return;
            }
            var view = this.registeredViews.get(viewIdentifier);
            if (view) {
                if (this.viewStack.indexOf(view) === -1) {
                    this.viewStack.push(view);
                    var prevView = this.viewStack[this.viewStack.length - 2];
                    var nextView = this.viewStack[this.viewStack.length - 1];
                    return this.changeView(prevView, nextView, false, skipTransitions);
                }
                else {
                    return Promise.reject('The view "' + viewIdentifier + '" is already being shown.');
                }
            }
            return Promise.reject('Unknown view "' + viewIdentifier + '".');
        };
        AbstractOffCanvasService.prototype.unregisterView = function (viewIdentifier) {
            this.registeredViews.delete(viewIdentifier);
        };
        return AbstractOffCanvasService;
    }());

    var OffCanvasService = (function (_super) {
        __extends(OffCanvasService, _super);
        function OffCanvasService() {
            _super.apply(this, arguments);
        }
        OffCanvasService.prototype.activateView = function (view) {
            var style = view.element.style;
            style.display = 'block';
            style.height = '';
            style.left = '';
            style.minHeight = window.innerHeight + 'px';
            style.minWidth = Math.min(window.innerWidth, document.body.offsetWidth) + 'px';
            style.overflow = '';
            style.position = '';
            style.top = '';
            style.width = '';
        };
        OffCanvasService.prototype.changeView = function (prevView, nextView, replace, skipTransitions) {
            var service = this;
            // When showing an off canvas view, the view should become the new main view, so that native UI controls on
            // mobile devices behave exactly the same (become smaller, when scrolling down) as they would for the base view.
            // To accomplish this, we need to get and set (i.e. manage) the scrollTop value of the views.
            // get the scrollTop value of the next view, so that we can set it as the body's scrollTop value later.
            // Also, reset the scrollTop of the next view to 0.
            var nextViewScrollLeft = nextView.element.scrollLeft;
            var nextViewScrollTop = nextView.element.scrollTop;
            // After fixating the previous view, we need to store its scrollTop position, so that we can later jump back to
            // this position, when the view will be re-activated.
            var bodyScrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            var bodyScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            this.fixateView(prevView);
            prevView.element.scrollLeft = bodyScrollLeft;
            prevView.element.scrollTop = bodyScrollTop;
            // collect all callback functions, i.e. also those that have been registered using wildcards
            var callbacks = new Array();
            function collectTransitionCallbacks(transitionId) {
                if (service.transitionCallbacks.has(transitionId)) {
                    callbacks = callbacks.concat(service.transitionCallbacks.get(transitionId));
                }
            }
            if (replace === false) {
                collectTransitionCallbacks(prevView.id + '-' + nextView.id);
                collectTransitionCallbacks('*-' + nextView.id);
                collectTransitionCallbacks(prevView.id + '-*');
            }
            else {
                var intermediateView = this.viewStack[this.viewStack.length - 2];
                // first check for direct transition callbacks
                collectTransitionCallbacks(prevView.id + '-' + nextView.id);
                if (!callbacks.length) {
                    // if there are no direct transition callbacks, then we use the transition callbacks that uses the intermediate view
                    collectTransitionCallbacks(prevView.id + '-' + intermediateView.id);
                    collectTransitionCallbacks(prevView.id + '-*');
                    collectTransitionCallbacks(intermediateView.id + '-' + nextView.id);
                    collectTransitionCallbacks('*-' + nextView.id);
                }
            }
            var callbackArguments = [prevView, nextView];
            var promises = new Array();
            if (skipTransitions === false) {
                callbacks.forEach(function (transitionCallback) {
                    promises.push(transitionCallback.transitionCallback.apply(service, callbackArguments));
                });
            }
            function onTransitionEnd() {
                callbacks.forEach(function (transitionCallback) {
                    if (transitionCallback.skipOrCleanupCallback) {
                        transitionCallback.skipOrCleanupCallback.apply(service, callbackArguments);
                    }
                });
                nextView.element.scrollLeft = 0;
                nextView.element.scrollTop = 0;
                service.activateView(nextView);
                window.scrollTo(nextViewScrollLeft, nextViewScrollTop);
            }
            var promise = new Promise(function (resolve, reject) {
                if (promises.length) {
                    Promise.all(promises).then(function () {
                        onTransitionEnd();
                        resolve();
                    });
                }
                else {
                    onTransitionEnd();
                    resolve();
                }
            });
            return promise;
        };
        OffCanvasService.prototype.fixateView = function (view) {
            var style = view.element.style;
            style.height = window.innerHeight + 'px';
            style.left = '0';
            style.minHeight = window.innerHeight + 'px';
            style.minWidth = Math.min(window.innerWidth, document.body.offsetWidth) + 'px';
            style.overflow = 'hidden';
            style.position = 'fixed';
            style.top = '0';
            style.width = Math.min(window.innerWidth, document.body.offsetWidth) + 'px';
        };
        return OffCanvasService;
    }(AbstractOffCanvasService));

    exports.OffCanvasService = OffCanvasService;

}((this.OffCanvas = this.OffCanvas || {})));