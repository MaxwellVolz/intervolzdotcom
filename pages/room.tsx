'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect';
import Stats from 'three/examples/jsm/libs/stats.module';
import initScene from '../pages/lib/initScene';
import loadGLTFRoom from '../pages/lib/loadGLTFRoom';
import MonitorDisplay from '../pages/lib/monitorDisplay';
import HNtoCanvas from '../pages/lib/HNtoCanvas';

export default function KiraScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const orbitMaxDistance = 1.0;

    useEffect(() => {
        if (!mountRef.current) return;

        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let renderer: THREE.WebGLRenderer;
        let orbitControls: OrbitControls;
        let asciiEffect: AsciiEffect | null = null;
        let usingAscii = false;
        let stats: Stats;
        let mirrorSphereCamera: THREE.CubeCamera;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const OOI: Record<string, THREE.Object3D> = {};
        const monitorDisplays: Record<string, MonitorDisplay> = {};
        const clock = new THREE.Clock();

        init();

        async function init() {
            const result = initScene();
            scene = result.scene;
            camera = result.camera;
            renderer = result.renderer;

            const { scene: roomScene, OOI: loadedOOI, animations } = await loadGLTFRoom();
            Object.assign(OOI, loadedOOI);

            const monitorConfigs = [
                { key: 'main_monitor', label: 'Main Monitor', desktop: '/textures/main.jpg', post_app: '/textures/main.jpg'},
                { key: 'top_monitor', label: 'Top Monitor', desktop: '/textures/top.jpg' , post_app: '/textures/discord.jpg'},
                { key: 'vertical_monitor', label: 'Vertical Monitor', desktop: '/textures/vertical.jpg' , post_app: '/textures/vertical.jpg'},
            ];

            for (const { key, label, desktop, post_app } of monitorConfigs) {
                const monitor = OOI[key];
                if (!monitor || !monitor.isMesh) continue;

                const steps = [
                    `booting ${label}`,
                    // 'mounting /dev/data',
                    // 'loading modules',
                    // 'launching UI core',
                    'system initialized.',
                ];

                const display = new MonitorDisplay(steps, desktop, () => {
                    console.log(`🟢 ${label} boot complete`);

                    const delay = 500 + Math.random() * 3000; // Between 1–5 seconds


                    if (key === 'vertical_monitor') {
                      const mesh = OOI[key] as THREE.Mesh;
                      const material = mesh.material as THREE.MeshBasicMaterial;
                      const canvas = (material.map as THREE.CanvasTexture).image as HTMLCanvasElement;
                    
                      setTimeout(async () => {
                        await HNtoCanvas(display.canvas);
                        display.texture.needsUpdate = true;
                      }, 1000 + Math.random() * 2000);
                    }

                    else{
                      setTimeout(() => {
                        display.setImage(post_app);
                        console.log(`🖼 ${label} loaded image: ${post_app}`);
                      }, delay);
                    }

                });

                monitorDisplays[key] = display;

                monitor.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).material = new THREE.MeshBasicMaterial({
                            map: display.texture,
                            side: THREE.DoubleSide,
                            toneMapped: false,
                        });
                    }
                });
            }

            monitorDisplays['main_monitor'].updateText('New message');

            scene.add(roomScene);


                      
            if (animations.length > 0) {
              const mixer = new THREE.AnimationMixer(roomScene);
              console.log('✅ animations:', animations.map(a => a.name));
            
              animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.play();
              });
            
              // Save mixer to be updated per frame
              OOI.mixer = mixer;
            }

            const targetPosition = OOI.sphere.position.clone().add(new THREE.Vector3(0, 0.2, -0.3));
            camera.position.copy(targetPosition.clone().add(new THREE.Vector3(-2, 2, -3)));
            camera.lookAt(targetPosition);

            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
            mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget);
            scene.add(mirrorSphereCamera);
            OOI.sphere.material = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });

            mountRef.current!.appendChild(renderer.domElement);
            renderer.setAnimationLoop(animate);

            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.minDistance = 0.2;
            orbitControls.maxDistance = orbitMaxDistance;
            orbitControls.enableDamping = true;
            orbitControls.target.copy(targetPosition);

            stats = new Stats();
            mountRef.current!.appendChild(stats.dom);

            window.addEventListener('resize', onWindowResize);
            renderer.domElement.addEventListener('pointerdown', onPointerDown);
        }

        function onPointerDown(event: PointerEvent) {
            const element = usingAscii ? asciiEffect!.domElement : renderer.domElement;
            const rect = element.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            for (const intersect of intersects) {
                for (const key in monitorDisplays) {
                    const monitor = OOI[key];
                    if (intersect.object === monitor || monitor.children.includes(intersect.object)) {
                        monitorDisplays[key].handleClick();
                        return;
                    }
                }

                if (
                    intersect.object === OOI.sphere ||
                    OOI.sphere.children.includes(intersect.object) ||
                    intersect.object === OOI.monitor_small ||
                    OOI.monitor_small.children.includes(intersect.object)
                ) {
                    toggleAsciiEffect();
                    return;
                }
            }
        }

        function toggleAsciiEffect() {
            if (!mountRef.current) return;

            if (!usingAscii) {
                asciiEffect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
                asciiEffect.setSize(window.innerWidth, window.innerHeight);
                asciiEffect.domElement.style.position = 'absolute';
                asciiEffect.domElement.style.top = '0';
                asciiEffect.domElement.style.left = '0';
                asciiEffect.domElement.style.color = 'white';
                asciiEffect.domElement.style.backgroundColor = 'black';

                mountRef.current.replaceChild(asciiEffect.domElement, renderer.domElement);

                orbitControls.dispose();
                orbitControls = new OrbitControls(camera, asciiEffect.domElement);
                orbitControls.minDistance = 0.4;
                orbitControls.maxDistance = orbitMaxDistance;
                orbitControls.enableDamping = true;
                orbitControls.target.copy(OOI.sphere.position).add(new THREE.Vector3(0, 0.2, -0.3));

                asciiEffect.domElement.addEventListener('pointerdown', onPointerDown);
                usingAscii = true;
            } else {
                if (asciiEffect) {
                    asciiEffect.domElement.removeEventListener('pointerdown', onPointerDown);
                    asciiEffect.domElement.parentElement?.replaceChild(renderer.domElement, asciiEffect.domElement);
                    asciiEffect = null;
                }

                orbitControls.dispose();
                orbitControls = new OrbitControls(camera, renderer.domElement);
                orbitControls.minDistance = 0.4;
                orbitControls.maxDistance = orbitMaxDistance;
                orbitControls.enableDamping = true;
                orbitControls.target.copy(OOI.sphere.position).add(new THREE.Vector3(0, 0.2, -0.3));

                renderer.domElement.addEventListener('pointerdown', onPointerDown);
                usingAscii = false;
            }
        }

        function animate() {
            if (OOI.sphere && mirrorSphereCamera) {
                OOI.sphere.visible = false;
                OOI.sphere.getWorldPosition(mirrorSphereCamera.position);
                mirrorSphereCamera.update(renderer, scene);
                OOI.sphere.visible = true;
            }

            orbitControls.update();
            stats.update();

            const delta = clock.getDelta();
            OOI.mixer?.update(delta);

            if (usingAscii && asciiEffect) {
                asciiEffect.render(scene, camera);
            } else {
                renderer.render(scene, camera);
            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (asciiEffect) asciiEffect.setSize(window.innerWidth, window.innerHeight);
        }

        return () => {
            renderer?.dispose();
            window.removeEventListener('resize', onWindowResize);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
}
