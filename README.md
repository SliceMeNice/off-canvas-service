# off-canvas-service

[![Build Status](https://travis-ci.org/SliceMeNice/off-canvas-service.svg?branch=v1.0.0)](https://travis-ci.org/SliceMeNice/off-canvas-service)
[![GitHub issues](https://img.shields.io/github/issues/SliceMeNice/off-canvas-service.svg)](https://github.com/SliceMeNice/off-canvas-service/issues)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/SliceMeNice/off-canvas-service/master/LICENSE.txt)

> A lightweight service that manages off-canvas views. The top view always defines the dimensions of the body element.

## Release History

__3.1.0__

  * Before fixating a view, we need to save the scrollLeft and scrollTop values of all scrolled elements inside of this view (not just the body), as the scroll position will be reset during fixating the view. After fixating the view, we can then restore the scroll positions.

__3.0.0__

  * Updated codebase to support ES5 and ES Module builds.
  * Removed dependency to ES6 Map, so you might only need a polyfill for "Promise".

__2.6.3__

  * Just another version bump.

__2.6.2__

  * Added "files" field to package.json, so that the "dist" directory is included when doing an "npm install".

__2.6.1__

  * Just a version bump as I needed to unpublish v2.6.0 from npm.

__2.6.0__

  * Removed postinstall script, so the package can be installed via npm.

__2.5.0__

  * The methods "showView" and "replaceCurrentViewWith" now return a promise.

__2.4.0__

  * Added optional "skipOrCleanupCallback" parameter to the "addTransitionCallback" method that will automatically be called when a transition has finished or has been skipped.

__2.3.0__

  * Added new method "unregisterView".

__2.2.0__

  * Added new method "getNumberOfViewsOnViewstack".

__2.1.0__

  * Added skipTransitions parameter to "showView", "replaceCurrentViewWith" and "dismissCurrentView".

__2.0.0__

  * Renamed "isShowingView" to "isTopmostView", and refactored "isShowingView" to return true, if some view on the stack matches the given identifier.

__1.4.0__

  * Added new method "replaceCurrentViewWith" that can replace the current top view.

__1.3.0__

  * Moved activation of the next view to the end of the view transitions.

__1.2.0__

  * Renamed `isShowingOffCanvasView` to `isShowingView`.

__1.1.1__

  * Fixed cross-browser issues when determining the viewport's scrollLeft / scrollTop value.

__1.1.0__

  * Added method `getRegisteredViews` in order to allow updating styles (min-width, min-height) whenever the viewport resizes.

__1.0.0__

  * Added basic version of the service.