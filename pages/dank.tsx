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

        const conf = {
            followSphere: false,
            turnHead: true,
            ik_solver: true,
            update: updateIK,
        };

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
                if (n.name === 'head') OOI.head = n;
                if (n.name === 'lowerarm_l') OOI.lowerarm_l = n;
                if (n.name === 'Upperarm_l') OOI.Upperarm_l = n;
                if (n.name === 'hand_l') OOI.hand_l = n;
                if (n.name === 'target_hand_l') OOI.target_hand_l = n;
                if (n.name === 'boule') OOI.sphere = n;
                if (n.name === 'Kira_Shirt_left') OOI.kira = n;
            });
            scene.add(gltf.scene);

            const targetPosition = OOI.sphere.position.clone();
            console.log(targetPosition)
            camera.position.copy(targetPosition.clone().add(new THREE.Vector3(50, 50, 0)));
            camera.lookAt(targetPosition);
            OOI.hand_l.attach(OOI.sphere);

            const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
            mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget);
            scene.add(mirrorSphereCamera);

            OOI.sphere.material = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });

            let skinnedMesh: THREE.SkinnedMesh | undefined = undefined;

            OOI.kira.traverse((obj) => {
                if (obj.type === 'SkinnedMesh') {
                    skinnedMesh = obj as THREE.SkinnedMesh;
                }
            });

            if (!skinnedMesh || !skinnedMesh.skeleton) {
                console.error('SkinnedMesh or its skeleton not found');
                return;
            }

            // Safe to access
            OOI.kira.add(skinnedMesh.skeleton.bones[0]);

            const iks = [
                {
                    target: 22,
                    effector: 6,
                    links: [
                        {
                            index: 5,
                            rotationMin: new THREE.Vector3(1.2, -1.8, -0.4),
                            rotationMax: new THREE.Vector3(1.7, -1.1, 0.3),
                        },
                        {
                            index: 4,
                            rotationMin: new THREE.Vector3(0.1, -0.7, -1.8),
                            rotationMax: new THREE.Vector3(1.1, 0, -1.4),
                        },
                    ],
                },
            ];

            IKSolver = new CCDIKSolver(OOI.kira, iks);
            const ccdikhelper = new CCDIKHelper(OOI.kira, iks, 0.01);
            scene.add(ccdikhelper);

            gui = new GUI();
            gui.add(conf, 'followSphere').name('follow sphere');
            gui.add(conf, 'turnHead').name('turn head');
            gui.add(conf, 'ik_solver').name('IK auto update');
            gui.add(conf, 'update').name('IK manual update');
            gui.open();

            renderer = new THREE.WebGLRenderer({ antialias: true });

            renderer.outputEncoding = THREE.SRGBColorSpace;
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

            transformControls = new TransformControls(camera, renderer.domElement);
            transformControls.size = 0.75;
            transformControls.showX = false;
            transformControls.space = 'world';
            transformControls.attach(OOI.target_hand_l);
            scene.add(transformControls.getHelper());

            transformControls.addEventListener('mouseDown', () => (orbitControls.enabled = false));
            transformControls.addEventListener('mouseUp', () => (orbitControls.enabled = true));

            stats = new Stats();
            mountRef.current!.appendChild(stats.dom);

            window.addEventListener('resize', onWindowResize);
        }

        function updateIK() {
            if (IKSolver) IKSolver.update();

            scene.traverse(obj => {
                if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
                    (obj as THREE.SkinnedMesh).geometry.computeBoundingSphere();
                }
            });
        }

        function animate() {
            if (OOI.sphere && mirrorSphereCamera) {
                OOI.sphere.visible = false;
                OOI.sphere.getWorldPosition(mirrorSphereCamera.position);
                mirrorSphereCamera.update(renderer, scene);
                OOI.sphere.visible = true;
            }

            if (OOI.sphere && conf.followSphere) {
                OOI.sphere.getWorldPosition(v0);
                orbitControls.target.lerp(v0, 0.1);
            }

            if (OOI.head && OOI.sphere && conf.turnHead) {
                OOI.sphere.getWorldPosition(v0);
                OOI.head.lookAt(v0);
                OOI.head.rotation.set(OOI.head.rotation.x, OOI.head.rotation.y + Math.PI, OOI.head.rotation.z);
            }

            if (conf.ik_solver) {
                updateIK();
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
