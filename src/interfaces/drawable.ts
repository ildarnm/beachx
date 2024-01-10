export interface Drawable {
    draw(): void;
    init(context: CanvasRenderingContext2D): void;
}
