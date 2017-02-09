'use strict';

export interface OffCanvasView {
	id: string;
	element: HTMLElement
}

export interface IOffCanvasService {
	activateView( view: OffCanvasView ): void;
	addTransitionCallback( from: string, to: string, transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback?: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } ): void;
	changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean ): Promise<void>;
	dismissCurrentView( skipTransitions: boolean ): Promise<void>;
	fixateView( view: OffCanvasView ): void;
	getNumberOfViewsOnViewstack(): number;
	getRegisteredViews(): Array<OffCanvasView>;
	isShowingView( viewIdentifier?: string ): boolean;
	registerView( viewIdentifier: string, element: HTMLElement ): OffCanvasView;
	replaceCurrentViewWith( viewIdentifier: string, skipTransitions: boolean ): Promise<void>;
	setBaseView( view: OffCanvasView ): void;
	showView( viewIdentifier: string, skipTransitions: boolean ): Promise<void>;
	unregisterView( viewIdentifier: string ): void;
}

export abstract class AbstractOffCanvasService implements IOffCanvasService {

	protected baseView: OffCanvasView;
	protected registeredViews = new Map<string, OffCanvasView>();
	protected transitionCallbacks = new Map<string, Array<{ transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } }>>();
	protected viewStack = new Array<OffCanvasView>();


	abstract activateView( view: OffCanvasView ): void;

	addTransitionCallback( from: string, to: string, transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback?: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } ) {
		const id = from + '-' + to;

		if ( !this.transitionCallbacks.has( id ) ) {
			this.transitionCallbacks.set( id, [] );
		}

		this.transitionCallbacks.get( id ).push( {
			transitionCallback: transitionCallback,
			skipOrCleanupCallback: skipOrCleanupCallback
		} );
	}

	abstract changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean ): Promise<void>;

	dismissCurrentView( skipTransitions: boolean = false ) {
		if ( !this.viewStack.length ) {
			return;
		}

		const prevView = this.viewStack.pop();
		const nextView = this.viewStack[ this.viewStack.length - 1 ];

		return this.changeView( prevView, nextView, false, skipTransitions );
	}

	abstract fixateView( view: OffCanvasView ): void;

	getNumberOfViewsOnViewstack() {
		return this.viewStack.length;
	}

	getRegisteredViews() {
		return Array.from( this.registeredViews.values() );
	}

	isShowingView( viewIdentifier?: string ) {
		if ( !this.viewStack.length ) {
			return false;
		}

		if ( !viewIdentifier ) {
			return this.viewStack.length > 1;
		}

		return this.viewStack.some( ( view ) => {
			return view.id === viewIdentifier;
		} );
	}

	isTopmostView( viewIdentifier: string ) {
		if ( !this.viewStack.length ) {
			return false;
		}

		return this.viewStack[ this.viewStack.length - 1 ].id === viewIdentifier;
	}

	registerView( viewIdentifier: string, element: HTMLElement ): OffCanvasView {
		const view = <OffCanvasView>{
			id: viewIdentifier,
			element : element
		};

		this.registeredViews.set( viewIdentifier, view );
		this.fixateView( view );

		return view;
	}

	replaceCurrentViewWith( viewIdentifier: string, skipTransitions: boolean = false ) {
		const newView = this.registeredViews.get( viewIdentifier );

		if ( newView ) {
			if ( this.viewStack.indexOf( newView ) === -1 ) {
				const currentView = this.viewStack.pop();
				this.viewStack.push( newView );

				return this.changeView( currentView, newView, true, skipTransitions );
			} else {
				return Promise.reject( 'The view "' + viewIdentifier + '" is already being shown.' );
			}
		}

		return Promise.reject( 'Unknown view "' + viewIdentifier + '".' );
	}

	setBaseView( view: OffCanvasView ) {
		this.baseView = view;
		this.viewStack = [ this.baseView ];

		this.activateView( this.baseView );
	}

	showView( viewIdentifier: string, skipTransitions: boolean = false ) {
		if ( viewIdentifier === this.baseView.id ) {
			return;
		}

		const view = this.registeredViews.get( viewIdentifier );

		if ( view ) {
			if ( this.viewStack.indexOf( view ) === -1 ) {
				this.viewStack.push( view );

				const prevView = this.viewStack[ this.viewStack.length - 2 ];
				const nextView = this.viewStack[ this.viewStack.length - 1 ];

				return this.changeView( prevView, nextView, false, skipTransitions );
			} else {
				return Promise.reject( 'The view "' + viewIdentifier + '" is already being shown.' );
			}
		}

		return Promise.reject( 'Unknown view "' + viewIdentifier + '".' );
	}

	unregisterView( viewIdentifier: string ): void {
		this.registeredViews.delete( viewIdentifier );
	}

}