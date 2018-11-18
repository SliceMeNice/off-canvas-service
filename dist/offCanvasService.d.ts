import { AbstractOffCanvasService, IOffCanvasService, OffCanvasView } from './abstractOffCanvasService';
export { IOffCanvasService, OffCanvasView } from './abstractOffCanvasService';
export declare class OffCanvasService extends AbstractOffCanvasService implements IOffCanvasService {
    activateView(view: OffCanvasView): void;
    changeView(prevView: OffCanvasView, nextView: OffCanvasView, replace: boolean, skipTransitions: boolean): Promise<void>;
    fixateView(view: OffCanvasView): void;
}