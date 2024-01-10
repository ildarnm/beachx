import { Drawable } from "../interfaces/drawable";

export class SandRender implements Drawable {
    private context: CanvasRenderingContext2D;

    constructor() {
    }

    init(context: CanvasRenderingContext2D): void {
        this.context = context;
    }

    draw(): void {
        const canvas = this.context.canvas;
        this.context.fillStyle = "#debfa1";
        this.context.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                this.context.fillStyle = "#8a4b00";
                const x = (Math.random() * canvas.width);
                const y = (Math.random() * canvas.height);
                const radius = (Math.random() * 0.5);
                this.context.fillRect(x, y, radius, radius);
            }
        }
    }
}
