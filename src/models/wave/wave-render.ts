import { Drawable } from "../../interfaces/drawable";
import { Wave } from "./wave";

export class WaveRender implements Drawable {
  private context: CanvasRenderingContext2D;
  private wave: Wave | undefined;
  private wait = 50;
  private type: 'coming' | 'leaving' = 'coming';

  init(context: CanvasRenderingContext2D): void {
    this.context = context;
    this.wave = new Wave(this.context);
  }

  draw(): void {
    if (this.wait > 0) {
      this.wait = this.wait - 1;
      return;
    }

    if (this.type === 'coming') {
      this.#drawComingWave();
    } else {
      this.#drawLeavingWave();
    }

    if (this.wave?.isWaveCoveredBeach && this.type === 'coming') {
      this.type = 'leaving';
      this.wait = 50;
    }

    if (this.wave?.isWaveLeftBeach && this.type === 'leaving') {
      this.type = 'coming';
      this.wait = 50;
      this.wave = new Wave(this.context);
    }
  }

  #drawComingWave() {
    this.wave?.drawComingWave();
  }

  #drawLeavingWave() {
    this.wave?.drawLeavingWave();
  }





}
