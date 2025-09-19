// pages/scene.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RendererManager } from '@/lib/RendererManager';

export default function ScenePage() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let orbitControls: OrbitControls;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000);
    camera.position.set(0, 7, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const rendererManager = new RendererManager(renderer);
    renderer.outputEncoding = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Load GLTF model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/jsm/libs/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load('/models/gltf/north_beach_web.glb', (gltf) => {
      console.log("loading north beach...")
      scene.add(gltf.scene);
    });

    scene.background = new THREE.Color("black"); // not white

    // Lights
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Debug
    // scene.add(new THREE.GridHelper(10, 10)); // size, divisions
    // scene.add(new THREE.AxesHelper(5)); // length of x/y/z axes

    // Orbit Controls
    orbitControls = new OrbitControls(camera, rendererManager.domElement);
    orbitControls.minDistance = 10.0;
    orbitControls.maxDistance = 10000000.0;
    orbitControls.enableDamping = true;
    orbitControls.target.copy(new THREE.Vector3(0, 1, 0));

    // Animation loop
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      if (mountRef.current?.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, []);


  return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
}
