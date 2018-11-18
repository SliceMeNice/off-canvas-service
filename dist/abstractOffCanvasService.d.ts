export interface OffCanvasView {
    id: string;
    element: HTMLElement;
}
declare type RegisteredViewsMap = {
    [key: string]: OffCanvasView;
};
declare type TransitionCallbacksMap = {
    [key: string]: Array<{
        transitionCallback: {
            (prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
        };
        skipOrCleanupCallback?: {
            (prevView: OffCanvasView, nextView: OffCanvasView): void;
        };
    }>;
};
export interface IOffCanvasService {
    activateView(view: OffCanvasView): void;
    addTransitionCallback(from: string, to: string, transitionCallback: {
        (prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    }, skipOrCleanupCallback?: {
        (prevView: OffCanvasView, nextView: OffCanvasView): void;
    }): void;
    changeView(prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean): Promise<void>;
    dismissCurrentView(skipTransitions?: boolean): Promise<void>;
    fixateView(view: OffCanvasView): void;
    getNumberOfViewsOnViewstack(): number;
    getRegisteredViews(): Array<OffCanvasView>;
    isShowingView(viewIdentifier?: string): boolean;
    registerView(viewIdentifier: string, element: HTMLElement): OffCanvasView;
    replaceCurrentViewWith(viewIdentifier: string, skipTransitions: boolean): Promise<void>;
    setBaseView(view: OffCanvasView): void;
    showView(viewIdentifier: string, skipTransitions: boolean): Promise<void>;
    unregisterView(viewIdentifier: string): void;
}
export declare abstract class AbstractOffCanvasService implements IOffCanvasService {
    protected baseView?: OffCanvasView;
    protected registeredViews: RegisteredViewsMap;
    protected transitionCallbacks: TransitionCallbacksMap;
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
    replaceCurrentViewWith(viewIdentifier: string, skipTransitions?: boolean): Promise<void>;
    setBaseView(view: OffCanvasView): void;
    showView(viewIdentifier: string, skipTransitions?: boolean): Promise<void>;
    unregisterView(viewIdentifier: string): void;
}
export {};