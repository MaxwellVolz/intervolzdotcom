'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CCDIKSolver, CCDIKHelper } from 'three/examples/jsm/animation/CCDIKSolver';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect';

export default function KiraScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        let scene: THREE.Scene,
            camera: THREE.PerspectiveCamera,
            renderer: THREE.WebGLRenderer,
            orbitControls: OrbitControls,
            asciiEffect: AsciiEffect | null = null,
            usingAscii = false,
            stats: Stats,
            gui: GUI,
            raycaster = new THREE.Raycaster(),
            mouse = new THREE.Vector2(),
            mirrorSphereCamera: THREE.CubeCamera;

        const OOI: any = {};

        init();

        async function init() {
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0xffffff, 0.17);
            scene.background = new THREE.Color(0xffffff);

            camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000);
            camera.position.set(1, 5, 5);

            const ambientLight = new THREE.AmbientLight(0xffffff, 8);
            scene.add(ambientLight);

            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/jsm/libs/draco/');
            const gltfLoader = new GLTFLoader();
            gltfLoader.setDRACOLoader(dracoLoader);

            const gltf = await gltfLoader.loadAsync('/models/gltf/room.glb');

            gltf.scene.traverse(n => {
                if (n.name === 'boule') OOI.sphere = n;
                if (n.name === 'vertical_monitor') OOI.vertical_monitor = n;
                if (n.name === 'main_monitor') OOI.main_monitor = n;
                if (n.name === 'top_monitor') OOI.top_monitor = n;
            });

            scene.add(gltf.scene);

            // camera position and lookat
            const targetPosition = OOI.sphere.position.clone().add(new THREE.Vector3(0, 0, -.3));
            camera.position.copy(targetPosition.clone().add(new THREE.Vector3(-2, 2, -3)));
            camera.lookAt(targetPosition);

            // sphere renderer
            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
            mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget);
            scene.add(mirrorSphereCamera);
            OOI.sphere.material = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });

            // renderer setup
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.physicallyCorrectLights = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current!.appendChild(renderer.domElement);
            renderer.setAnimationLoop(animate);

            // orbit controls
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.minDistance = 0.2;
            orbitControls.maxDistance = 1.2;
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
                if (intersect.object === OOI.sphere || OOI.sphere.children.includes(intersect.object)) {
                    toggleAsciiEffect();
                    break;
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
        
                // Update controls
                orbitControls.dispose();
                orbitControls = new OrbitControls(camera, asciiEffect.domElement);
                orbitControls.minDistance = 0.4;
                orbitControls.maxDistance = 2.0;
                orbitControls.enableDamping = true;
                orbitControls.target.copy(OOI.sphere.position).add(new THREE.Vector3(0, 0, -.3));
        
                // Move event listener
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
                orbitControls.maxDistance = 2.0;
                orbitControls.enableDamping = true;
                orbitControls.target.copy(OOI.sphere.position).add(new THREE.Vector3(0, 0, -.3));

        
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
            gui?.destroy();
            window.removeEventListener('resize', onWindowResize);
            renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
}
