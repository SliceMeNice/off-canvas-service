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

	changeView( prevView: OffCanvasView, nextView: OffCanvasView ) {
		const service = this;

		// When showing an off canvas view, the view should become the new main view, so that native UI controls on
		// mobile devices behave exactly the same (become smaller, when scrolling down) as they would for the base view.

		// To accomplish this, we need to get and set (i.e. manage) the scrollTop value of the views.

		// get the scrollTop value of the next view, so that we can set it as the body's scrollTop value later.
		// Also, reset the scrollTop of the next view to 0.
		var nextViewScrollTop = nextView.element.scrollTop;
		nextView.element.scrollTop = 0;

		// After fixating the previous view, we need to store its scrollTop position, so that we can later jump back to
		// this position, when the view will be re-activated.
		var bodyScrollTop = document.body.scrollTop;

		this.activateView( nextView );
		this.fixateView( prevView );

		prevView.element.scrollTop = bodyScrollTop;
		document.body.scrollTop = nextViewScrollTop;

		// collect all callback functions, i.e. also those that have been registered using wildcards
		var callbacks = new Array<{ ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }>();

		function collectTransitionCallbacks( transitionId: string ) {
			if ( service.transitionCallbacks.has( transitionId ) ) {
				callbacks = callbacks.concat( service.transitionCallbacks.get( transitionId ) );
			}
		}

		collectTransitionCallbacks( prevView.id + '-' + nextView.id );
		collectTransitionCallbacks( '*-' + nextView.id );
		collectTransitionCallbacks( prevView.id + '-*' );

		const callbackArguments = [ prevView, nextView ];

		const promises = new Array<Promise<void>>();

		callbacks.forEach( ( callback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> } ) => {
			promises.push( callback.apply( service, callbackArguments ) );
		} );

		const promise = new Promise<void>( ( resolve, reject ) => {

			if ( promises.length ) {
				Promise.all<void>( promises ).then( () => {
					resolve();
				} );
			} else {
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