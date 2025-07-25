'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import initEarth from '@/lib/initEarth';
import { RendererManager } from '@/lib/RendererManager';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export default function EarthScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const orbitMaxDistance = 1.0;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let orbitControls: OrbitControls;
    let stats: Stats;
    let gui: GUI;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const OOI: Record<string, THREE.Object3D> = {};
    const clock = new THREE.Clock();
    let rendererManager: RendererManager;

    const debugSettings = {
        chaseSatellite: false,
    }

    useEffect(() => {
        if (!mountRef.current) return;

        init();

        async function init() {
            const result = initEarth();
            scene = result.scene;
            camera = result.camera;
            renderer = result.renderer;
            rendererManager = new RendererManager(renderer);

            // Earth
            const earthRadius = 63.71; // 6371 km
            const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 32);
            const earthMat = new THREE.MeshStandardMaterial({ color: 0x2244dd, roughness: 1 });
            const earth = new THREE.Mesh(earthGeo, earthMat);
            scene.add(earth);
            OOI.earth = earth;
            // === Satellite Orbit Pivot ===
            const satellitePivot = new THREE.Object3D();
            scene.add(satellitePivot);

            // === Satellite ===
            const satellite = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0xff2222 })
            );
            satellite.position.set(421.57, 0, 0); // 42157 km = GEO
            satellitePivot.add(satellite);

            // === Beam (Cone) ===
            const beamHeight = 421.57;
            const beamRadius = 10;
            const beamGeo = new THREE.ConeGeometry(beamRadius, beamHeight, 32, 1, true);

            // Translate base of cone to origin — this is key!
            beamGeo.translate(0, -beamHeight / 2, 0);

            // Beam material
            const beamMat = new THREE.MeshStandardMaterial({
                color: 0x22ffee,
                transparent: true,
                opacity: 0.5
            });
            const beam = new THREE.Mesh(beamGeo, beamMat);

            // 1. Place beam at satellite world position
            beam.position.copy(satellite.getWorldPosition(new THREE.Vector3()));

            // 2. Calculate direction from satellite to Earth
            const target = new THREE.Vector3(0, 0, 0); // Earth
            const dir = new THREE.Vector3().subVectors(target, beam.position).normalize();

            // 3. Set rotation using quaternion that rotates cone from +Y → dir
            const up = new THREE.Vector3(0, -1, 0); // default cone direction
            beam.quaternion.setFromUnitVectors(up, dir);

            // 4. Add beam to scene
            scene.add(beam);

            // Create a line from satellite to origin
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const points = [
                satellite.getWorldPosition(new THREE.Vector3()), // start at satellite
                new THREE.Vector3(0, 0, 0)                       // end at origin
            ];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const debugLine = new THREE.Line(lineGeometry, lineMaterial);

            scene.add(debugLine);
            OOI.debugLine = debugLine;



            // Camera
            camera.position.set(0, 0, 250);
            camera.lookAt(0, 0, 0);

            // Controls
            orbitControls = new OrbitControls(camera, rendererManager.domElement);
            orbitControls.target.set(0, 0, 0);
            orbitControls.minDistance = 70;
            orbitControls.maxDistance = 60000;
            orbitControls.enableDamping = true;
            orbitControls.dampingFactor = 0.05;

            // Add renderer canvas to the DOM
            mountRef.current!.appendChild(renderer.domElement);

            // Render loop
            renderer.setAnimationLoop(() => {
                const p1 = satellite.getWorldPosition(new THREE.Vector3());
                OOI.debugLine.geometry.setFromPoints([p1, new THREE.Vector3(0, 0, 0)]);
                satellitePivot.rotation.y += 0.001;

                // === Beam follow logic ===
                beam.position.copy(p1);

                const earthPos = new THREE.Vector3(0, 0, 0);
                const dir = new THREE.Vector3().subVectors(earthPos, p1).normalize();

                const up = new THREE.Vector3(0, -1, 0); // match your original cone orientation
                beam.quaternion.setFromUnitVectors(up, dir);

                if (debugSettings.chaseSatellite) {
                    const satPos = satellite.getWorldPosition(new THREE.Vector3());
                    orbitControls.target.copy(satPos);
                }


                orbitControls?.update();
                renderer.render(scene, camera);
                stats?.update();
            });

            // Stats
            stats = new Stats();
            mountRef.current!.appendChild(stats.dom);

            gui = new GUI();
            gui.add(debugSettings, 'chaseSatellite').name('Follow Satellite').onChange((value: boolean) => {
                if (value) {
                    const satPos = satellite.getWorldPosition(new THREE.Vector3());
                    orbitControls.target.copy(satPos);
                } else {
                    orbitControls.target.set(0, 0, 0); // Earth
                }
                orbitControls.update();
            });

            // Events
            window.addEventListener('resize', onWindowResize);
            rendererManager.domElement.addEventListener('pointerdown', onPointerDown);
        }

        function onPointerDown(event: PointerEvent) {
            const element = rendererManager.domElement;
            const rect = element.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            for (const intersect of intersects) {
                console.log(`intersect ${intersect}`);

            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            rendererManager.setSize(window.innerWidth, window.innerHeight);
        }

        return () => {
            renderer?.dispose();
            window.removeEventListener('resize', onWindowResize);
            rendererManager.domElement.removeEventListener('pointerdown', onPointerDown);
        };
    }, []);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
}
