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

    let wavePoints: [number, number][] = generateWavePoints(wavePointCount, spaceBetweenPoints);
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
        await drawCurve(ctx, [[-100, 0], ...wavePoints, [ctx.canvas.width + 100, 0]], img);
        wavePoints = wavePoints.map((point, index) => [point[0], point[1] + (coverAnimation ? (deltaForWavePoints[index] + commonDelta) : -(deltaForWavePoints[index] + commonDelta))]);
        if (wavePoints.every(([_, y]) => y > ctx.canvas.height) && coverAnimation) {
            coverAnimation = false;
            deltaForWavePoints = generateWavePointsDelta(wavePointCount);
            wait = 800;
            commonDelta = 5;
        }
        if (wavePoints.every(([_, y]) => y < 0) && !coverAnimation) {
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

function generateWavePoints(wavePointCount: number, spaceBetweenPoints: number): [number, number][] {
    return Array.from({length: wavePointCount + 1}).map((_, index) => [spaceBetweenPoints * index, 0]);
}

function addImageProcess(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}

async function drawCurve(ctx: CanvasRenderingContext2D, ptsa: [number, number][], img: HTMLImageElement) {
    ctx.beginPath();

    await drawLines(ctx, getCurvePoints(ptsa.flat()), img);

    ctx.closePath();
    ctx.fill();
}

function getCurvePoints(pts, tension?, isClosed?, numOfSegments?) {

    // use input value if provided, or use a default value
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [],	// clone array
        x, y,			// our x,y coords
        t1x, t2x, t1y, t2y,	// tension vectors
        c1, c2, c3, c4,		// cardinal points
        st, t, i;		// steps based on num. of segments

    // clone array so we don't change the original
    //
    _pts = pts.slice(0);

    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    } else {
        _pts.unshift(pts[1]);	//copy 1. point and insert at beginning
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]);	//copy last point and append
        _pts.push(pts[pts.length - 1]);
    }

    // ok, lets start..

    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for (i = 2; i < (_pts.length - 4); i += 2) {
        for (t = 0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
            t2x = (_pts[i + 4] - _pts[i]) * tension;

            t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
            t2y = (_pts[i + 5] - _pts[i + 1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
            c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
            c4 = Math.pow(st, 3) - Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}

async function drawLines(ctx: CanvasRenderingContext2D, pts, img) {
    ctx.fillStyle = ctx.createPattern(img, "repeat");
    ctx.fillStyle = "#54a5d5";
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length - 1; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
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
