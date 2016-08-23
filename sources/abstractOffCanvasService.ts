'use strict';

export interface OffCanvasView {
	id: string;
	element: HTMLElement
}

export interface IOffCanvasService {
	activateView( view: OffCanvasView ): void;
	addTransitionCallback( from: string, to: string, callback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> } ): void;
	changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean ): Promise<void>;
	dismissCurrentView(): Promise<void>;
	fixateView( view: OffCanvasView ): void;
	getRegisteredViews(): Array<OffCanvasView>;
	isShowingView( viewIdentifier?: string ): boolean;
	registerView( viewIdentifier: string, element: HTMLElement ): OffCanvasView;
	replaceCurrentViewWith( viewIdentifier: string ): void;
	setBaseView( view: OffCanvasView ): void;
	showView( viewIdentifier: string ): void;
}

export abstract class AbstractOffCanvasService implements IOffCanvasService {

	protected baseView: OffCanvasView;
	protected registeredViews = new Map<string, OffCanvasView>();
	protected transitionCallbacks = new Map<string, Array<{ ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> }>>();
	protected viewStack = new Array<OffCanvasView>();


	abstract activateView( view: OffCanvasView ): void;

	addTransitionCallback( from: string, to: string, callback: { ( prevView: OffCanvasView, nextView: OffCanvasView ): Promise<void> } ) {
		const id = from + '-' + to;

		if ( !this.transitionCallbacks.has( id ) ) {
			this.transitionCallbacks.set( id, [] );
		}

		this.transitionCallbacks.get( id ).push( callback );
	}

	abstract changeView( prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean ): Promise<void>;

	dismissCurrentView() {
		if ( !this.isShowingView() ) {
			return;
		}

		const prevView = this.viewStack.pop();
		const nextView = this.viewStack[ this.viewStack.length - 1 ];

		return this.changeView( prevView, nextView, false );
	}

	abstract fixateView( view: OffCanvasView ): void;

	getRegisteredViews() {
		return Array.from( this.registeredViews.values() );
	}

	isShowingView( viewIdentifier?: string ) {
		if ( !this.viewStack.length ) {
			return false;
		}

		return viewIdentifier ? ( this.viewStack[ this.viewStack.length - 1 ] ).id == viewIdentifier : this.viewStack.length > 1;
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

	replaceCurrentViewWith( viewIdentifier: string ) {
		const newView = this.registeredViews.get( viewIdentifier );

		if ( newView && this.viewStack.indexOf( newView ) == -1 ) {
			const currentView = this.viewStack.pop();
			this.viewStack.push( newView );

			this.changeView( currentView, newView, true );
		}
	}

	setBaseView( view: OffCanvasView ) {
		this.baseView = view;
		this.viewStack = [ this.baseView ];

		this.activateView( this.baseView );
	}

	showView( viewIdentifier: string ) {
		if ( viewIdentifier == this.baseView.id ) {
			return;
		}

		const view = this.registeredViews.get( viewIdentifier );

		if ( view && this.viewStack.indexOf( view ) == -1 ) {
			this.viewStack.push( view );

			const prevView = this.viewStack[ this.viewStack.length - 2 ];
			const nextView = this.viewStack[ this.viewStack.length - 1 ];

			this.changeView( prevView, nextView, false );
		}
	}

}