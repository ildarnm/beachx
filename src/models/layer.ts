import { Drawable } from "../interfaces/drawable";

export class Layer {
    private context: CanvasRenderingContext2D;
    private drawable: Drawable | undefined;

    constructor(containerRef: HTMLElement) {
        this.context = this.getCanvasContext(containerRef);
    }

    add(drawable: Drawable) {
        this.drawable = drawable;
        this.drawable.init(this.context);
    }

    draw() {
      this.drawable?.draw();
    }

    private getCanvasContext(containerRef: HTMLElement): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        canvas.width = containerRef.clientWidth;
        canvas.height = containerRef.clientHeight;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.right = '0';
        canvas.style.bottom = '0';
        containerRef.appendChild(canvas);
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Failed to get 2d context');
        }
        return context;
    }
}
