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
        let suzanneMesh: THREE.Object3D | null = null;
        let isSpinning = false;
        let spinTarget = 0;
        let spinProgress = 0;


        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000);
        camera.position.set(0, 1, 8);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        const rendererManager = new RendererManager(renderer);
        renderer.outputEncoding = THREE.SRGBColorSpace;
        renderer.physicallyCorrectLights = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Helpers
        scene.add(new THREE.GridHelper(10, 10));
        scene.add(new THREE.AxesHelper(5));

        // Orbit controls
        orbitControls = new OrbitControls(camera, rendererManager.domElement);
        orbitControls.minDistance = 2.0;
        orbitControls.maxDistance = 10.0;
        orbitControls.enableDamping = true;
        orbitControls.target.set(0, 0, 0);

        // Raycasting
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onPointerDown = (event: PointerEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            const suzanneHit = intersects.find((hit) => hit.object.name === 'Suzanne');
            if (suzanneHit && suzanneMesh) {
                isSpinning = !isSpinning;
                if (isSpinning) {
                    spinTarget = suzanneMesh.rotation.y + Math.PI * 2 * 5; // one full spin
                    spinProgress = 0;
                }
                console.log(`🌀 Suzanne ${isSpinning ? 'started' : 'stopped'} spinning`);
            }
        };



        renderer.domElement.addEventListener('pointerdown', onPointerDown);

        // Load GLTF
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/jsm/libs/draco/');
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load('/models/gltf/suzanne.glb', (gltf) => {
            gltf.scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh && child.name === 'Suzanne') {
                    suzanneMesh = child;
                    console.log('✅ Suzanne mesh found');
                }
            });
            scene.add(gltf.scene);
        });

        // Animate
        const animate = () => {
            requestAnimationFrame(animate);

            if (isSpinning && suzanneMesh) {
                const current = suzanneMesh.rotation.y;
                const delta = spinTarget - current;

                if (Math.abs(delta) > 0.001) {
                    suzanneMesh.rotation.y += delta * 0.01; // <-- lerp factor
                } else {
                    suzanneMesh.rotation.y = spinTarget;
                    isSpinning = false;
                    console.log('✅ Spin complete');
                }
            }

            orbitControls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            renderer.dispose();
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
            if (mountRef.current?.firstChild) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
}
