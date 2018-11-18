'use strict';

export interface OffCanvasView {
	id: string;
	element: HTMLElement;
}

type RegisteredViewsMap = { [key: string]: OffCanvasView };
type TransitionCallbacksMap = { [key: string]: Array<{ transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback?: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } }> };

export interface IOffCanvasService {
	activateView( view: OffCanvasView ): void;
	addTransitionCallback( from: string, to: string, transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback?: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } ): void;
	changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean ): Promise<void>;
	dismissCurrentView( skipTransitions?: boolean ): Promise<void>;
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

	protected baseView?: OffCanvasView;
	protected registeredViews: RegisteredViewsMap = {};
	protected transitionCallbacks: TransitionCallbacksMap = {};
	protected viewStack = new Array<OffCanvasView>();


	abstract activateView( view: OffCanvasView ): void;

	addTransitionCallback( from: string, to: string, transitionCallback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }, skipOrCleanupCallback?: { ( prevView: OffCanvasView, nextView: OffCanvasView ): void } ) {
		const id = from + '-' + to;

		if ( !this.transitionCallbacks.hasOwnProperty( id ) ) {
			this.transitionCallbacks[id] = [];
		}

		this.transitionCallbacks[id].push( {
			transitionCallback: transitionCallback,
			skipOrCleanupCallback: skipOrCleanupCallback
		} );
	}

	abstract changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean ): Promise<void>;

	dismissCurrentView( skipTransitions: boolean = false ) {
		if ( !this.viewStack.length ) {
			return Promise.resolve();
		}

		const prevView = this.viewStack.pop();
		const nextView = this.viewStack[ this.viewStack.length - 1 ];

		return this.changeView( prevView!, nextView, false, skipTransitions );
	}

	abstract fixateView( view: OffCanvasView ): void;

	getNumberOfViewsOnViewstack() {
		return this.viewStack.length;
	}

	getRegisteredViews() {
		const result = new Array<OffCanvasView>();

		for (var key in this.registeredViews) {
			result.push(this.registeredViews[key]);
		}

		return result;
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

		this.registeredViews[viewIdentifier] = view;
		this.fixateView( view );

		return view;
	}

	replaceCurrentViewWith( viewIdentifier: string, skipTransitions: boolean = false ) {
		const newView = this.registeredViews[viewIdentifier];

		if ( newView ) {
			if ( this.viewStack.length > 0 && this.viewStack.indexOf( newView ) === -1 ) {
				const currentView = this.viewStack.pop();
				this.viewStack.push( newView );

				return this.changeView( currentView!, newView, true, skipTransitions );
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
		if ( this.baseView && viewIdentifier === this.baseView.id ) {
			return Promise.resolve();
		}

		const view = this.registeredViews[viewIdentifier];

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
		delete this.registeredViews[viewIdentifier];
	}

}