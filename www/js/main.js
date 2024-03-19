(() => {
  // src/models/layer.ts
  var Layer = class {
    constructor(containerRef) {
      this.context = this.getCanvasContext(containerRef);
    }
    add(drawable) {
      this.drawable = drawable;
      this.drawable.init(this.context);
    }
    draw() {
      this.drawable?.draw();
    }
    getCanvasContext(containerRef) {
      const canvas = document.createElement("canvas");
      canvas.width = containerRef.clientWidth;
      canvas.height = containerRef.clientHeight;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.right = "0";
      canvas.style.bottom = "0";
      containerRef.appendChild(canvas);
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to get 2d context");
      }
      return context;
    }
  };

  // src/models/sand-render.ts
  var SandRender = class {
    constructor() {
    }
    init(context) {
      this.context = context;
    }
    draw() {
      const canvas = this.context.canvas;
      this.context.fillStyle = "#debfa1";
      this.context.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
          this.context.fillStyle = "#8a4b00";
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * 0.5;
          this.context.fillRect(x, y, radius, radius);
        }
      }
    }
  };

  // src/models/wave/wave-point.ts
  var WavePoint = class {
    constructor(x = 0, y = 0, line = false) {
      this.x = x;
      this.y = y;
      this.line = line;
    }
  };

  // src/models/wave/wave-front-point.ts
  var WaveFrontPoint = class extends WavePoint {
    constructor(x, y) {
      super(x, y);
    }
  };

  // src/constants/wave-speed.ts
  var WAVE_COME_SPEED = 15;
  var WAVE_LEAVE_SPEED = WAVE_COME_SPEED * 2;

  // node_modules/simplex-noise/dist/esm/simplex-noise.js
  var F2 = 0.5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6;
  var F4 = (Math.sqrt(5) - 1) / 4;
  var G4 = (5 - Math.sqrt(5)) / 20;
  var fastFloor = (x) => Math.floor(x) | 0;
  var grad2 = /* @__PURE__ */ new Float64Array([
    1,
    1,
    -1,
    1,
    1,
    -1,
    -1,
    -1,
    1,
    0,
    -1,
    0,
    1,
    0,
    -1,
    0,
    0,
    1,
    0,
    -1,
    0,
    1,
    0,
    -1
  ]);
  function createNoise2D(random = Math.random) {
    const perm = buildPermutationTable(random);
    const permGrad2x = new Float64Array(perm).map((v) => grad2[v % 12 * 2]);
    const permGrad2y = new Float64Array(perm).map((v) => grad2[v % 12 * 2 + 1]);
    return function noise2D(x, y) {
      let n0 = 0;
      let n1 = 0;
      let n2 = 0;
      const s = (x + y) * F2;
      const i = fastFloor(x + s);
      const j = fastFloor(y + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = x - X0;
      const y0 = y - Y0;
      let i1, j1;
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } else {
        i1 = 0;
        j1 = 1;
      }
      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2;
      const y2 = y0 - 1 + 2 * G2;
      const ii = i & 255;
      const jj = j & 255;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        const gi0 = ii + perm[jj];
        const g0x = permGrad2x[gi0];
        const g0y = permGrad2y[gi0];
        t0 *= t0;
        n0 = t0 * t0 * (g0x * x0 + g0y * y0);
      }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        const gi1 = ii + i1 + perm[jj + j1];
        const g1x = permGrad2x[gi1];
        const g1y = permGrad2y[gi1];
        t1 *= t1;
        n1 = t1 * t1 * (g1x * x1 + g1y * y1);
      }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        const gi2 = ii + 1 + perm[jj + 1];
        const g2x = permGrad2x[gi2];
        const g2y = permGrad2y[gi2];
        t2 *= t2;
        n2 = t2 * t2 * (g2x * x2 + g2y * y2);
      }
      return 70 * (n0 + n1 + n2);
    };
  }
  function buildPermutationTable(random) {
    const tableSize = 512;
    const p = new Uint8Array(tableSize);
    for (let i = 0; i < tableSize / 2; i++) {
      p[i] = i;
    }
    for (let i = 0; i < tableSize / 2 - 1; i++) {
      const r = i + ~~(random() * (256 - i));
      const aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    for (let i = 256; i < tableSize; i++) {
      p[i] = p[i - 256];
    }
    return p;
  }

  // src/models/wave/wave-layer.ts
  var WaveLayer = class {
    constructor(context, color) {
      this.context = context;
      this.color = color;
      this.#yoff = 0;
      this.#points = [];
      this.delta = 0;
      this.MAX_FOAM_SIZE = 10;
      this.SOME_THRESHOLD = 200;
      this.noise2D = createNoise2D();
    }
    #yoff;
    #points;
    get isLayerCoveredBeach() {
      return this.#points.every(({y}) => y > this.context.canvas.height + WAVE_COME_SPEED);
    }
    get isLayerLeftBeach() {
      return this.#points.every(({y}) => y < -WAVE_LEAVE_SPEED);
    }
    drawComing() {
      this.#generateWavePoints();
      this.#come();
      this.#drawLayer();
    }
    drawLayer() {
      this.#drawLayer();
    }
    drawLeaving() {
      this.#generateWavePoints();
      this.#leave();
      this.#drawLayer();
    }
    #generateWavePoints() {
      this.#points = [];
      let xoff = 0;
      for (let x = 0; x <= this.context.canvas.width; x += 5) {
        const y = this.noise2D(xoff, this.#yoff);
        this.#points.push(new WaveFrontPoint(x, y * 100 + this.delta));
        xoff += 5e-3;
      }
      this.#yoff += 6e-3;
    }
    #drawLayer() {
      this.context.beginPath();
      const points = [
        new WavePoint(0, 0, true),
        new WavePoint(0, this.delta + 100, true),
        ...this.#points,
        new WavePoint(this.context.canvas.width, this.delta + 100, true),
        new WavePoint(this.context.canvas.width, 0, true)
      ];
      this.drawLines(points);
      this.context.closePath();
      this.context.fill();
    }
    drawLines(points) {
      this.context.fillStyle = this.color;
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
    #come() {
      this.delta = this.delta + WAVE_COME_SPEED;
    }
    #leave() {
      this.delta = this.delta - WAVE_LEAVE_SPEED;
    }
  };

  // src/constants/wave-layer-count.ts
  var WAVE_LAYER_COUNT = 4;

  // src/constants/layer-colors.ts
  var LAYER_COLORS = ["#c5d5d0", "#a8c1b9", "#6ca5a0", "#265a6a"];

  // src/models/wave/wave.ts
  var WAVE_LAYERS_DRAWING_DELTA = 10;
  var Wave = class {
    constructor(context) {
      this.context = context;
      this.#drawingTime = 0;
      this.#leavingTime = 0;
      this.#layer = [];
      this.#generateWaveLayers();
    }
    #drawingTime;
    #leavingTime;
    #layer;
    get isWaveCoveredBeach() {
      return this.#layer.every((layer) => layer.isLayerCoveredBeach);
    }
    get isWaveLeftBeach() {
      return this.#layer.every((layer) => layer.isLayerLeftBeach);
    }
    drawComingWave() {
      this.#leavingTime = 0;
      this.#drawingTime++;
      this.#layer.forEach((layer, index) => {
        if (this.#drawingTime > WAVE_LAYERS_DRAWING_DELTA * index) {
          layer.drawComing();
        }
      });
    }
    drawLeavingWave() {
      this.#clearCanvas();
      this.#leavingTime++;
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
    #clearCanvas() {
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
  };

  // src/models/wave/wave-render.ts
  var WaveRender = class {
    constructor() {
      this.wait = 50;
      this.type = "coming";
    }
    init(context) {
      this.context = context;
      this.wave = new Wave(this.context);
    }
    draw() {
      if (this.wait > 0) {
        this.wait = this.wait - 1;
        return;
      }
      if (this.type === "coming") {
        this.#drawComingWave();
      } else {
        this.#drawLeavingWave();
      }
      if (this.wave?.isWaveCoveredBeach && this.type === "coming") {
        this.type = "leaving";
        this.wait = 50;
      }
      if (this.wave?.isWaveLeftBeach && this.type === "leaving") {
        this.type = "coming";
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
  };

  // src/main.ts
  function main() {
    const containerRef = document.getElementById("beach");
    if (!containerRef) {
      return;
    }
    containerRef.style.width = window.innerWidth + "px";
    containerRef.style.height = window.innerHeight + "px";
    containerRef.style.position = "relative";
    drawBeach(containerRef);
  }
  main();
  function drawBeach(containerRef) {
    const sandLayer = new Layer(containerRef);
    const waveLayer = new Layer(containerRef);
    sandLayer.add(new SandRender());
    sandLayer.draw();
    waveLayer.add(new WaveRender());
    const renderWave = () => {
      waveLayer.draw();
      requestAnimationFrame(() => renderWave());
    };
    renderWave();
  }
})();
