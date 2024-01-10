import { Layer } from "./models/layer";
import { SandRender } from "./models/sand-render";
import { WaveRender } from "./models/wave/wave-render";

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
    const sandLayer = new Layer(containerRef);
    const waveLayer = new Layer(containerRef);

    sandLayer.add(new SandRender());
    sandLayer.draw();

    waveLayer.add(new WaveRender());

    const renderWave = () => {
        waveLayer.draw();
        requestAnimationFrame(() => renderWave());
    }
    renderWave();
}
