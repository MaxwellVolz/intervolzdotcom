// lib/rendererManager.ts
import * as THREE from 'three';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect';
import { AnaglyphEffect } from 'three/examples/jsm/effects/AnaglyphEffect';
import { ParallaxBarrierEffect } from 'three/examples/jsm/effects/ParallaxBarrierEffect';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect';

export type RenderMode = 'normal' | 'ascii' | 'anaglyph' | 'parallax' | 'stereo';

export class RendererManager {
  private renderer: THREE.WebGLRenderer;
  private currentMode: RenderMode = 'normal';
  private effect: any = null;

  constructor(private baseRenderer: THREE.WebGLRenderer) {
    this.renderer = baseRenderer;
  }

  get domElement(): HTMLElement {
    if (this.effect?.domElement) {
      // Apply required styles for ASCII
      if (this.effect instanceof AsciiEffect) {
        const el = this.effect.domElement;
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.color = 'white';
        el.style.backgroundColor = 'black';
        el.style.pointerEvents = 'auto'; // just in case
        return el;
      }
      return this.effect.domElement;
    }
    return this.renderer.domElement;
  }

  setSize(w: number, h: number) {
    this.renderer.setSize(w, h);
    if (this.effect?.setSize) {
      this.effect.setSize(w, h);
    }
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    if (this.effect) {
      this.effect.render(scene, camera);
    } else {
      this.renderer.render(scene, camera);
    }
  }

  switch(mode: RenderMode) {
    if (this.effect?.dispose) {
      this.effect.dispose();
    }
    this.effect = null;
    this.currentMode = mode;

    console.log(`🎛 Switching to render mode: ${mode}`);

    switch (mode) {
      case 'ascii':
        this.effect = new AsciiEffect(this.renderer, ' .:-+*=%@#', { invert: true });
        break;
      case 'anaglyph':
        this.effect = new AnaglyphEffect(this.renderer);
        break;
      case 'parallax':
        this.effect = new ParallaxBarrierEffect(this.renderer);
        break;
      case 'stereo':
        this.effect = new StereoEffect(this.renderer);
        break;
    }

    this.setSize(window.innerWidth, window.innerHeight);
  }

  get mode(): RenderMode {
    return this.currentMode;
  }
}
