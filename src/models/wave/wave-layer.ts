import { WavePoint } from "./wave-point";
import { WaveFrontPoint } from "./wave-front-point";
import { WAVE_COME_SPEED, WAVE_LEAVE_SPEED } from "../../constants/wave-speed";
import { Color } from "../../interfaces/color";
import { createNoise2D } from "simplex-noise";



export class WaveLayer {
  #yoff = 0.0;
  #points: WavePoint[] = [];
  delta = 0;
  noise2D;

  MAX_FOAM_SIZE = 10
  SOME_THRESHOLD = 200

  get isLayerCoveredBeach(): boolean {
    return this.#points.every(({y}) => y > this.context.canvas.height + WAVE_COME_SPEED);
  }

  get isLayerLeftBeach(): boolean {
    return this.#points.every(({y}) => y < -WAVE_LEAVE_SPEED);
  }

  constructor(private context: CanvasRenderingContext2D) {
    this.noise2D = createNoise2D();
  }

  drawComing(): void {
    this.#generateWavePoints();
    this.#come();
    this.#drawLayer();
  }

  drawLeaving(): void {
    this.#generateWavePoints();
    this.#leave();
    this.#drawLayer();
  }

  #generateWavePoints(): void {
    this.#points = [];
    let xoff = 0;
    for (let x = 0; x <= this.context.canvas.width; x += 40) {
      const y = this.noise2D(xoff, this.#yoff);
      this.#points.push(new WaveFrontPoint(x, (y * 200) + this.delta));
      xoff += 0.05;
    }
    this.#yoff += 0.006;
  }

  #drawLayer(): void {
    this.context.beginPath();

    const points = [
      new WavePoint(0, 0, true),
      new WavePoint(0, this.delta + 100, true),
      ...this.#points,
      new WavePoint(this.context.canvas.width, this.delta + 100, true),
      new WavePoint(this.context.canvas.width, 0, true)
    ];

    this.drawLines(points, 'rgba(100,172,213,0.43)');
    this.context.closePath();
    this.context.fill();

  }

  drawLines(points: WavePoint[], color: Color) {
    this.context.fillStyle = color;

    points.forEach((point, i) => {
      if (point.line) {
        this.context.lineTo(point.x, point.y);
        return;
      }
      const xc = (point.x + points[i + 1].x) / 2;
      const yc = (point.y + points[i + 1].y) / 2;
      this.context.quadraticCurveTo(point.x, point.y, xc, yc);
    });
  }

  #come(): void {
    this.delta = this.delta + WAVE_COME_SPEED;
  }

  #leave(): void {
    this.delta = this.delta - WAVE_LEAVE_SPEED;
  }


   generateFoamTexture(width, height, noiseFunction) {
    const foamTexture = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Generate Perlin noise value for each pixel
        let noiseValue = noiseFunction(x / 100, y / 100);

        // Apply a threshold to create foam
        if (noiseValue > 0.5) { // Adjust this threshold as needed
          foamTexture.push(1); // Represents foam
        } else {
          foamTexture.push(0); // Represents no foam
        }
      }
    }
    return foamTexture;
  }

   drawFoam(context, foamTexture, width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (foamTexture[y * width + x] === 1) {
          context.fillStyle = 'rgba(255, 255, 255, 0.8)'; // White color for foam
          context.fillRect(x, y, 1, 1); // Draw foam pixel
        }
      }
    }
  }
}
