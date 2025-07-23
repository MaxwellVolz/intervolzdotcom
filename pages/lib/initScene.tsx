// lib/initScene.ts
import * as THREE from 'three';

export function initScene(): {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
} {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xffffff, 0.17);
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000);
  camera.position.set(1, 5, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 8);
  scene.add(ambientLight);

  return { scene, camera, renderer };
}
