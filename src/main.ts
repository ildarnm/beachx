import { Point } from "./models/point";

function main() {
    const containerRef = document.getElementById('beach');
    if (!containerRef) {
        return;
    }
    containerRef.style.width = window.innerWidth + 'px';
    containerRef.style.height = window.innerHeight + 'px';
    containerRef.style.position = 'relative';
    drawBeach(containerRef);
}

main();


function drawBeach(containerRef: HTMLElement) {
    drawSand(containerRef);
    drawWave(containerRef);
}

function drawSand(containerRef: HTMLElement) {
    const ctx = getCanvasContext(containerRef);
    if (!ctx) {
        return;
    }
    const canvas = ctx.canvas;
    ctx.fillStyle = "#debfa1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            ctx.fillStyle = "#8a4b00";
            const x = (Math.random() * canvas.width);
            const y = (Math.random() * canvas.height);
            const radius = (Math.random() * 0.5);
            ctx.fillRect(x, y, radius, radius);
        }
    }
}

async function drawWave(containerRef: HTMLElement) {
    const ctx = getCanvasContext(containerRef);
    if (!ctx) {
        return;
    }

    const wavePointCount = 12;
    const spaceBetweenPoints = Math.floor(ctx.canvas.width / wavePointCount);

    let wavePoints: Point[] = generateWavePoints(wavePointCount, spaceBetweenPoints);
    let deltaForWavePoints = generateWavePointsDelta(wavePointCount);
    let coverAnimation = true;
    let wait = 0;
    let commonDelta = 10;
    const img = await addImageProcess('https://static.turbosquid.com/Preview/2014/08/02__00_00_40/water1.jpg8e8853d5-15a3-40c7-9ac9-73b76747d11eLarge.jpg');
    setInterval(async () => {
        if (wait > 0) {
            wait = wait - 1;
            return;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        await drawCurve(ctx, [{ x: -100, y: 0 }, ...wavePoints, { x: ctx.canvas.width + 100, y: 0 }], img);
        wavePoints = wavePoints.map(({ x, y }, index) => {
            const delta = deltaForWavePoints[index] + commonDelta;
            const shift = coverAnimation ? delta : -delta;
            return ({ x, y: y + shift });
        });
        if (wavePoints.every(({ y }) => y > ctx.canvas.height) && coverAnimation) {
            coverAnimation = false;
            deltaForWavePoints = generateWavePointsDelta(wavePointCount);
            wait = 800;
            commonDelta = 5;
        }
        if (wavePoints.every(({ y }) => y < 0) && !coverAnimation) {
            coverAnimation = true;
            wavePoints = generateWavePoints(wavePointCount, spaceBetweenPoints);
            deltaForWavePoints = generateWavePointsDelta(wavePointCount);
            wait = 1000;
            commonDelta = 10;
        }
    }, 1)

}

function generateWavePointsDelta(wavePointCount: number) {
    return Array.from({length: wavePointCount + 1}).map((_) => Math.abs(Math.random() - 0.5));
}

function generateWavePoints(wavePointCount: number, spaceBetweenPoints: number): Point[] {
    return Array.from({length: wavePointCount + 1}).map((_, index) => ({ x: spaceBetweenPoints * index, y: 0 }));
}

function addImageProcess(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

async function drawCurve(ctx: CanvasRenderingContext2D, points: Point[], img: HTMLImageElement) {
    ctx.beginPath();

    await drawLines(ctx, points, img);

    ctx.closePath();
    ctx.fill();
}

async function drawLines(ctx: CanvasRenderingContext2D, points: Point[], img: HTMLImageElement) {
    ctx.fillStyle = ctx.createPattern(img, "repeat");
    ctx.fillStyle = "#54a5d5";
    const [firstPoint, ...otherPoints] = points;
    if (firstPoint) {
        ctx.moveTo(firstPoint.x, firstPoint.y);
    }
    otherPoints.forEach(({ x, y }) => ctx.lineTo(x, y));
}

function getCanvasContext(containerRef: HTMLElement): CanvasRenderingContext2D | null {
    const canvas = document.createElement('canvas');
    canvas.width = containerRef.clientWidth;
    canvas.height = containerRef.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.right = '0';
    canvas.style.bottom = '0';
    containerRef.appendChild(canvas);
    return canvas.getContext('2d');
}
