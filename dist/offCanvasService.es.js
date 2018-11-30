/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var AbstractOffCanvasService = /** @class */ (function () {
    function AbstractOffCanvasService() {
        this.registeredViews = {};
        this.transitionCallbacks = {};
        this.viewStack = new Array();
    }
    AbstractOffCanvasService.prototype.addTransitionCallback = function (from, to, transitionCallback, skipOrCleanupCallback) {
        var id = from + '-' + to;
        if (!this.transitionCallbacks.hasOwnProperty(id)) {
            this.transitionCallbacks[id] = [];
        }
        this.transitionCallbacks[id].push({
            transitionCallback: transitionCallback,
            skipOrCleanupCallback: skipOrCleanupCallback
        });
    };
    AbstractOffCanvasService.prototype.dismissCurrentView = function (skipTransitions) {
        if (skipTransitions === void 0) { skipTransitions = false; }
        if (!this.viewStack.length) {
            return Promise.resolve();
        }
        var prevView = this.viewStack.pop();
        var nextView = this.viewStack[this.viewStack.length - 1];
        return this.changeView(prevView, nextView, false, skipTransitions);
    };
    AbstractOffCanvasService.prototype.getNumberOfViewsOnViewstack = function () {
        return this.viewStack.length;
    };
    AbstractOffCanvasService.prototype.getRegisteredViews = function () {
        var result = new Array();
        for (var key in this.registeredViews) {
            result.push(this.registeredViews[key]);
        }
        return result;
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
        this.registeredViews[viewIdentifier] = view;
        this.fixateView(view);
        return view;
    };
    AbstractOffCanvasService.prototype.replaceCurrentViewWith = function (viewIdentifier, skipTransitions) {
        if (skipTransitions === void 0) { skipTransitions = false; }
        var newView = this.registeredViews[viewIdentifier];
        if (newView) {
            if (this.viewStack.length > 0 && this.viewStack.indexOf(newView) === -1) {
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
        if (this.baseView && viewIdentifier === this.baseView.id) {
            return Promise.resolve();
        }
        var view = this.registeredViews[viewIdentifier];
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
        delete this.registeredViews[viewIdentifier];
    };
    return AbstractOffCanvasService;
}());

var OffCanvasService = /** @class */ (function (_super) {
    __extends(OffCanvasService, _super);
    function OffCanvasService() {
        return _super !== null && _super.apply(this, arguments) || this;
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
        // Before fixating the previous view, we need to store its scrollTop position, so that we can later jump back to
        // this position, when the view will be re-activated.
        var bodyScrollLeft = document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft) || 0;
        var bodyScrollTop = document.body.scrollTop || (document.documentElement && document.documentElement.scrollTop) || 0;
        // This also applies to all sub-elements that have been scrolled
        var scrollingInfo = [];
        var subElements = prevView.element.querySelectorAll('*');
        for (var i = 0, max = subElements.length; i < max; i++) {
            var element = subElements[i];
            if (element.scrollLeft || element.scrollTop) {
                scrollingInfo.push({
                    element: element,
                    scrollLeft: element.scrollLeft,
                    scrollTop: element.scrollTop
                });
            }
        }
        this.fixateView(prevView);
        prevView.element.scrollLeft = bodyScrollLeft;
        prevView.element.scrollTop = bodyScrollTop;
        scrollingInfo.forEach(function (scrollInfo) {
            scrollInfo.element.scrollLeft = scrollInfo.scrollLeft;
            scrollInfo.element.scrollTop = scrollInfo.scrollTop;
        });
        // collect all callback functions, i.e. also those that have been registered using wildcards
        var callbacks = new Array();
        function collectTransitionCallbacks(transitionId) {
            if (service.transitionCallbacks.hasOwnProperty(transitionId)) {
                callbacks = callbacks.concat(service.transitionCallbacks[transitionId]);
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

export { OffCanvasService };
