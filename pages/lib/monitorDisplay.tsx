import * as THREE from 'three';

export class MonitorDisplay {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private timer: number | undefined;
  private currentStep = 0;
  private y = 40;
  private readonly image: HTMLImageElement;
  private readonly steps: string[];
  private onComplete?: () => void;
  private hasCompleted = false;

  constructor(steps: string[], imageSrc: string, onComplete?: () => void) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.translate(0, this.canvas.height);
    this.ctx.scale(1, -1);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.needsUpdate = true;

    this.steps = steps;
    this.image = new Image();
    this.image.src = imageSrc;
    this.onComplete = onComplete;

    this.nextStep();
  }

  private drawText(text: string, color: string = 'lime') {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, this.y - 20, this.canvas.width * 0.5, 30);
    this.ctx.fillStyle = color;
    this.ctx.font = '16px monospace';
    this.ctx.fillText(text, 10, this.y);
    this.texture.needsUpdate = true;
  }

  private nextStep() {
    if (this.currentStep >= this.steps.length) {
      this.drawFinalImage();
      return;
    }

    const line = this.steps[this.currentStep];
    let i = 0;
    const color = line.toLowerCase().includes('fail') ? 'red' : 'white';

    const typeLine = () => {
      this.drawText(line.slice(0, i) + '_', color);
      i++;
      if (i <= line.length) {
        this.timer = window.setTimeout(typeLine, 30 + Math.random() * 40);
      } else {
        this.drawText(line, color);
        this.y += 30;
        this.currentStep++;
        this.timer = window.setTimeout(() => this.nextStep(), 400);
      }
    };

    typeLine();
  }

  private drawFinalImage() {
    const draw = () => {
      this.ctx.save();
      this.ctx.translate(this.canvas.width, 0);
      this.ctx.scale(-1, 1);
      this.y = 0;
      this.ctx.clearRect(0, 0, this.canvas.width * 0.5, this.canvas.height);
      this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
      this.texture.needsUpdate = true;
      
      if (!this.hasCompleted) {
        this.hasCompleted = true;
        this.onComplete?.();
      }
    };

    if (this.image.src) {
      if (this.image.complete && this.image.naturalWidth !== 0) {
        draw();
      } else {
        this.image.onload = draw;
      }
    }
  }

  public updateText(text: string, color: string = 'lime') {
    if(this.y > 500){
      this.ctx.clearRect(0, 0, this.canvas.width * 0.5, this.canvas.height);
      this.y = 0;
    }
    this.ctx.fillStyle = color;
    this.ctx.font = '16px monospace';
    this.ctx.fillText(text, 10, this.y);
    this.texture.needsUpdate = true;
    this.y += 30;

  }

  public setImage(src: string) {
    if (src) this.image.src = src;

    this.image.onload = () => this.drawFinalImage();
  }

  public handleClick() {
    this.updateText(`clicked at ${(Date.now() / 1000).toFixed(2)}s`, 'cyan');
  }

  public destroy() {
    clearTimeout(this.timer);
  }
}