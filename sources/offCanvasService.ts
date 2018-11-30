'use strict';

import {
	AbstractOffCanvasService,
	IOffCanvasService,
	OffCanvasView
} from './abstractOffCanvasService';

export {
	IOffCanvasService,
	OffCanvasView
} from './abstractOffCanvasService';

export class OffCanvasService extends AbstractOffCanvasService implements IOffCanvasService {

	activateView( view: OffCanvasView ) {
		const style = view.element.style;

		style.display = 'block';
		style.height = '';
		style.left = '';
		style.minHeight = window.innerHeight + 'px';
		style.minWidth = Math.min( window.innerWidth, document.body.offsetWidth ) + 'px';
		style.overflow = '';
		style.position = '';
		style.top = '';
		style.width = '';
	}

	changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean ) {
		const service = this;

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

		this.fixateView( prevView );

		prevView.element.scrollLeft = bodyScrollLeft;
		prevView.element.scrollTop = bodyScrollTop;

		scrollingInfo.forEach(function(scrollInfo) {
			scrollInfo.element.scrollLeft = scrollInfo.scrollLeft;
			scrollInfo.element.scrollTop = scrollInfo.scrollTop;
		});

		// collect all callback functions, i.e. also those that have been registered using wildcards
		var callbacks = new Array<{ transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback?: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } }>();

		function collectTransitionCallbacks( transitionId: string ) {
			if ( service.transitionCallbacks.hasOwnProperty( transitionId ) ) {
				callbacks = callbacks.concat( service.transitionCallbacks[ transitionId ] );
			}
		}

		if ( replace === false ) {
			collectTransitionCallbacks( prevView.id + '-' + nextView.id );
			collectTransitionCallbacks( '*-' + nextView.id );
			collectTransitionCallbacks( prevView.id + '-*' );
		} else {
			const intermediateView = this.viewStack[ this.viewStack.length - 2 ];

			// first check for direct transition callbacks
			collectTransitionCallbacks( prevView.id + '-' + nextView.id );

			if ( !callbacks.length ) {
				// if there are no direct transition callbacks, then we use the transition callbacks that uses the intermediate view
				collectTransitionCallbacks( prevView.id + '-' + intermediateView.id );
				collectTransitionCallbacks( prevView.id + '-*' );

				collectTransitionCallbacks( intermediateView.id + '-' + nextView.id );
				collectTransitionCallbacks( '*-' + nextView.id );
			}
		}


		const callbackArguments = [ prevView, nextView ];

		const promises = new Array<Promise<void>>();

		if ( skipTransitions === false ) {
			callbacks.forEach( ( transitionCallback ) => {
				promises.push( transitionCallback.transitionCallback.apply( service, callbackArguments ) );
			} );
		}

		function onTransitionEnd() {
			callbacks.forEach( ( transitionCallback ) => {
				if ( transitionCallback.skipOrCleanupCallback ) {
					transitionCallback.skipOrCleanupCallback.apply( service, callbackArguments );
				}
			} );

			nextView.element.scrollLeft = 0;
			nextView.element.scrollTop = 0;
			service.activateView(nextView);
			window.scrollTo(nextViewScrollLeft, nextViewScrollTop);
		}

		const promise = new Promise<void>( ( resolve, reject ) => {

			if ( promises.length ) {
				Promise.all<void>( promises ).then( () => {
					onTransitionEnd();
					resolve();
				} );
			} else {
				onTransitionEnd();
				resolve();
			}

		} );

		return promise;
	}

	fixateView( view: OffCanvasView ) {
		const style = view.element.style;

		style.height = window.innerHeight + 'px';
		style.left = '0';
		style.minHeight = window.innerHeight + 'px';
		style.minWidth = Math.min( window.innerWidth, document.body.offsetWidth ) + 'px';
		style.overflow = 'hidden';
		style.position = 'fixed';
		style.top = '0';
		style.width = Math.min( window.innerWidth, document.body.offsetWidth ) + 'px';
	}

}