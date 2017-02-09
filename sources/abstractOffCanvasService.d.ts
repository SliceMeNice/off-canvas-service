export interface OffCanvasView {
    id: string;
    element: HTMLElement;
}
export interface IOffCanvasService {
    activateView(view: OffCanvasView): void;
    addTransitionCallback(from: string, to: string, transitionCallback: {
        (prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    }, skipOrCleanupCallback?: {
        (prevView: OffCanvasView, nextView: OffCanvasView): void;
    }): void;
    changeView(prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean): Promise<void>;
    dismissCurrentView(skipTransitions: boolean): Promise<void>;
    fixateView(view: OffCanvasView): void;
    getNumberOfViewsOnViewstack(): number;
    getRegisteredViews(): Array<OffCanvasView>;
    isShowingView(viewIdentifier?: string): boolean;
    registerView(viewIdentifier: string, element: HTMLElement): OffCanvasView;
    replaceCurrentViewWith(viewIdentifier: string, skipTransitions: boolean): void;
    setBaseView(view: OffCanvasView): void;
    showView(viewIdentifier: string, skipTransitions: boolean): void;
    unregisterView(viewIdentifier: string): void;
}
export declare abstract class AbstractOffCanvasService implements IOffCanvasService {
    protected baseView: OffCanvasView;
    protected registeredViews: Map<string, OffCanvasView>;
    protected transitionCallbacks: Map<string, {
        transitionCallback: (prevView: OffCanvasView, nextView: OffCanvasView) => Promise<void>;
        skipOrCleanupCallback: (prevView: OffCanvasView, nextView: OffCanvasView) => void;
    }[]>;
    protected viewStack: OffCanvasView[];
    abstract activateView(view: OffCanvasView): void;
    addTransitionCallback(from: string, to: string, transitionCallback: {
        (prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    }, skipOrCleanupCallback?: {
        (prevView: OffCanvasView, nextView: OffCanvasView): void;
    }): void;
    abstract changeView(prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean): Promise<void>;
    dismissCurrentView(skipTransitions?: boolean): Promise<void>;
    abstract fixateView(view: OffCanvasView): void;
    getNumberOfViewsOnViewstack(): number;
    getRegisteredViews(): OffCanvasView[];
    isShowingView(viewIdentifier?: string): boolean;
    isTopmostView(viewIdentifier: string): boolean;
    registerView(viewIdentifier: string, element: HTMLElement): OffCanvasView;
    replaceCurrentViewWith(viewIdentifier: string, skipTransitions?: boolean): void;
    setBaseView(view: OffCanvasView): void;
    showView(viewIdentifier: string, skipTransitions?: boolean): void;
    unregisterView(viewIdentifier: string): void;
}
