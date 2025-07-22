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

export default function KiraScene() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        let scene: THREE.Scene,
            camera: THREE.PerspectiveCamera,
            renderer: THREE.WebGLRenderer,
            orbitControls: OrbitControls,
            transformControls: TransformControls,
            stats: Stats,
            gui: GUI,
            IKSolver: any,
            mirrorSphereCamera: THREE.CubeCamera;

        const OOI: any = {};
        const v0 = new THREE.Vector3();


        init();

        async function init() {
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0xffffff, 0.17);
            scene.background = new THREE.Color(0xffffff);

            camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.001, 5000);
            // camera.position.set(0.97, 1.1, 0.73);
            // camera.position.set(3, 5, 5);
            // camera.lookAt(scene.position);

            const ambientLight = new THREE.AmbientLight(0xffffff, 8);
            scene.add(ambientLight);

            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/jsm/libs/draco/');
            const gltfLoader = new GLTFLoader();
            gltfLoader.setDRACOLoader(dracoLoader);

            const gltf = await gltfLoader.loadAsync('/models/gltf/room.glb');

            gltf.scene.traverse(n => {
                if (n.name === 'boule') OOI.sphere = n;
            });
            scene.add(gltf.scene);

            const targetPosition = OOI.sphere.position.clone();
            console.log(targetPosition)
            camera.position.copy(targetPosition.clone().add(new THREE.Vector3(50, 50, 0)));
            camera.lookAt(targetPosition);

            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
            mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget);
            scene.add(mirrorSphereCamera);

            OOI.sphere.material = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });

            renderer = new THREE.WebGLRenderer({ antialias: true });

            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.physicallyCorrectLights = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;

            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current!.appendChild(renderer.domElement);
            renderer.setAnimationLoop(animate);

            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.minDistance = 0.2;
            orbitControls.maxDistance = 1.5;
            orbitControls.enableDamping = true;
            orbitControls.target.copy(targetPosition);

            stats = new Stats();
            mountRef.current!.appendChild(stats.dom);

            window.addEventListener('resize', onWindowResize);
        }

        function animate() {
            if (OOI.sphere && mirrorSphereCamera) {
                OOI.sphere.visible = false;
                OOI.sphere.getWorldPosition(mirrorSphereCamera.position);
                mirrorSphereCamera.update(renderer, scene);
                OOI.sphere.visible = true;
            }

            orbitControls.update();
            renderer.render(scene, camera);
            stats.update();
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        return () => {
            renderer?.dispose();
            gui?.destroy();
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
}
