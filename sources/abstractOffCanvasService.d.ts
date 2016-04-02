export interface OffCanvasView {
    id: string;
    element: HTMLElement;
}
export interface IOffCanvasService {
    activateView(view: OffCanvasView): void;
    addTransitionCallback(from: string, to: string, callback: {
        (prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    }): void;
    changeView(prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    dismissCurrentView(): Promise<void>;
    fixateView(view: OffCanvasView): void;
    isShowingOffCanvasView(viewIdentifier?: string): boolean;
    registerView(viewIdentifier: string, element: HTMLElement): OffCanvasView;
    setBaseView(view: OffCanvasView): void;
    showView(viewIdentifier: string): void;
}
export declare abstract class AbstractOffCanvasService implements IOffCanvasService {
    protected baseView: OffCanvasView;
    protected registeredViews: any;
    protected transitionCallbacks: Map<string, ((prevView: OffCanvasView, nextView: OffCanvasView) => Promise<void>)[]>;
    protected viewStack: OffCanvasView[];
    abstract activateView(view: OffCanvasView): void;
    addTransitionCallback(from: string, to: string, callback: {
        (prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    }): void;
    abstract changeView(prevView: OffCanvasView, nextView: OffCanvasView): Promise<void>;
    dismissCurrentView(): Promise<void>;
    abstract fixateView(view: OffCanvasView): void;
    isShowingOffCanvasView(viewIdentifier?: string): boolean;
    registerView(viewIdentifier: string, element: HTMLElement): OffCanvasView;
    setBaseView(view: OffCanvasView): void;
    showView(viewIdentifier: string): void;
}
