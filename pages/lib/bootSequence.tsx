import * as THREE from 'three';

interface BootStep {
    text: string;
    type?: 'info' | 'error' | 'success';
    delay?: number;
    dots?: number;
    retry?: boolean;
    post?: string;
}

export function createMonitorBootCanvas(onComplete?: () => void) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Flip canvas and shift for monitor UV
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    ctx.translate(0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const steps: BootStep[] = [
        { text: 'booting system', type: 'info' },
        // { text: 'mounting /dev/data', post: 'mount successful', dots: 4 },
        // { text: 'failure', type: 'error', post: 'mount successful' },
        // { text: 'mounting /dev/data', dots: 3 },
        // { text: 'mounting successful', type: 'success' },
        // { text: 'loading modules', type: 'info', dots: 3 },
        // { text: 'launching UI core', type: 'info', dots: 2 },
        { text: 'system initialized.', type: 'success' },
    ];

    const image = new Image();
    image.src = '/textures/mush.jpg';

    let currentStep = 0;
    let y = 40;
    let timer: any;

    function drawText(text: string, y: number, color: string = 'lime') {
        ctx.fillStyle = 'black';
        ctx.fillRect(-canvas.width * 0.5, y - 40, canvas.width * 0.5, 50);

        ctx.fillStyle = color;
        ctx.font = '16px monospace';
        ctx.fillText(text, 10, y);
        texture.needsUpdate = true;
    }

    function typeText(line: string, y: number, color: string, done: () => void) {
        let i = 0;

        function nextChar() {
            drawText(line.slice(0, i + 1) + '_', y, color);
            i++;
            if (i < line.length) {
                timer = setTimeout(nextChar, 40 + Math.random() * 50);
            } else {
                drawText(line, y, color);
                timer = setTimeout(done, 500);
            }
        }

        nextChar();
    }

    function nextStep() {
        if (currentStep >= steps.length) {
            console.log("drawing image...")
            const drawImageToCanvas = () => {
                ctx.save(); // 🛟 Save current transform stack
            
                // Flip and shift to match monitor UV transform
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                // ctx.translate(canvas.width*.5, 0);
            
                // Clear and draw image (use right-side of canvas)
                ctx.clearRect(0, 0, canvas.width * 0.5, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                // ctx.drawImage(image, -canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);

                ctx.restore(); // 🔁 Reset transform stack
            
                texture.needsUpdate = true;
                onComplete?.();
            };
            
            if (image.complete && image.naturalWidth !== 0) {
                drawImageToCanvas(); // ✅ if already loaded from cache
            } else {
                image.onload = drawImageToCanvas; // ✅ if loading now
            }
            return;
        }

        const step = steps[currentStep];
        const color =
            step.type === 'error' ? 'red' :
            step.type === 'success' ? 'lime' : 'white';

        typeText(step.text, y, color, () => {
            if (step.dots) {
                let dots = 0;
                const dotLoop = () => {
                    drawText(step.text + '.'.repeat(dots % (step.dots + 1)), y, color);
                    dots++;
                    if (dots <= step.dots) {
                        timer = setTimeout(dotLoop, 700);
                    } else {
                        y += 30;
                        currentStep++;
                        timer = setTimeout(nextStep, 500);
                    }
                };
                dotLoop();
            } else if (step.retry) {
                let retries = 0;
                const tryMount = () => {
                    drawText(`${step.text}`, y, 'red');
                    texture.needsUpdate = true;
                    retries++;
                    if (retries < 2) {
                        timer = setTimeout(tryMount, 1000);
                    } else {
                        y += 30;
                        drawText(step.post!, y, 'lime');
                        y += 30;
                        currentStep++;
                        timer = setTimeout(nextStep, 1000);
                    }
                };
                timer = setTimeout(tryMount, 700);
            } else {
                y += 30;
                currentStep++;
                timer = setTimeout(nextStep, step.delay || 400);
            }
        });
    }

    nextStep();

    return { canvas, texture, destroy: () => clearTimeout(timer) };
}
