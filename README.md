# off-canvas-service

[![Build Status](https://travis-ci.org/SliceMeNice/off-canvas-service.svg?branch=v1.0.0)](https://travis-ci.org/SliceMeNice/off-canvas-service)
[![GitHub issues](https://img.shields.io/github/issues/SliceMeNice/off-canvas-service.svg)](https://github.com/SliceMeNice/off-canvas-service/issues)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/SliceMeNice/off-canvas-service/master/LICENSE.txt)

> A lightweight service that manages off-canvas views. The top view always defines the dimensions of the body element.

## Release History

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