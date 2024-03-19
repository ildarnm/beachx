import { WaveLayer } from "./wave-layer";
import { WAVE_LAYER_COUNT } from "../../constants/wave-layer-count";
import { LAYER_COLORS } from "../../constants/layer-colors";

const WAVE_LAYERS_DRAWING_DELTA = 10;

export class Wave {
  #drawingTime = 0;
  #leavingTime = 0;
  #layer: WaveLayer[] = [];

  get isWaveCoveredBeach(): boolean {
    return this.#layer.every(layer => layer.isLayerCoveredBeach)
  }

  get isWaveLeftBeach(): boolean {
    return this.#layer.every(layer => layer.isLayerLeftBeach)
  }

  constructor(private context: CanvasRenderingContext2D) {
    this.#generateWaveLayers();
  }

  drawComingWave() {
    this.#leavingTime = 0;
    this.#drawingTime++;

   // this.#clearCanvas();
    this.#layer.forEach((layer, index) => {
      if (this.#drawingTime > WAVE_LAYERS_DRAWING_DELTA * index) {
        layer.drawComing();
      }
    });
  }

  drawLeavingWave() {
    this.#clearCanvas();
    this.#leavingTime++
    this.#drawingTime = 0;
    this.#layer.forEach((layer, index) => {
      if (this.#leavingTime > 20 * (this.#layer.length - index)) {
        layer.drawLeaving();
      } else {
        layer.drawLayer();
      }
    });
  }

  #generateWaveLayers() {
    for (let i = 0; i < WAVE_LAYER_COUNT; i++) {
      this.#layer.push(new WaveLayer(this.context, LAYER_COLORS[i] ?? LAYER_COLORS[0]));
    }
  }

  #clearCanvas(): void {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }
}
