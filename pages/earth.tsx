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
    let beam: THREE.Mesh;

    const earthRadius = 63.71; // with scale

    const debugSettings = {
        chaseSatellite: false,
        orbiting: true,
        orbitRadius: 421.57,
        orbitInclination: 0,
        coneYawOffset: 0,
        conePitchOffset: 0,
    };

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
            const earthRadius = 63.71;
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
            satellitePivot.add(satellite);

            function updateOrbit() {
                satellite.position.set(debugSettings.orbitRadius + earthRadius, 0, 0);
                updateBeam();
            }


            function updateBeam() {
                if (beam) {
                    scene.remove(beam);
                    beam.geometry.dispose();
                    beam.material.dispose();
                }

                const beamHeight = debugSettings.orbitRadius + earthRadius;
                const beamRadius = 10;
                const beamGeo = new THREE.ConeGeometry(beamRadius, beamHeight, 32, 1, true);
                beamGeo.translate(0, -beamHeight / 2, 0);

                const beamMat = new THREE.MeshStandardMaterial({
                    color: 0x22ffee,
                    transparent: true,
                    opacity: 0.5,
                });

                beam = new THREE.Mesh(beamGeo, beamMat);
                scene.add(beam);
            }


            updateOrbit();


            // === Debug Line ===
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const lineGeometry = new THREE.BufferGeometry();
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

            // Add renderer canvas to DOM
            mountRef.current!.appendChild(renderer.domElement);

            // Render loop
            renderer.setAnimationLoop(() => {
                if (debugSettings.orbiting) {
                    satellitePivot.rotation.y += 0.001;
                }

                const satPos = satellite.getWorldPosition(new THREE.Vector3());
                debugLine.geometry.setFromPoints([satPos, new THREE.Vector3(0, 0, 0)]);

                // Beam logic
                beam.position.copy(satPos);
                const dir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), satPos).normalize();
                const up = new THREE.Vector3(0, -1, 0);
                beam.quaternion.setFromUnitVectors(up, dir);

                // Apply offsets
                const yaw = THREE.MathUtils.degToRad(debugSettings.coneYawOffset);
                const pitch = THREE.MathUtils.degToRad(debugSettings.conePitchOffset);
                const offsetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
                beam.quaternion.multiply(offsetQuat);

                if (debugSettings.chaseSatellite) {
                    orbitControls.target.copy(satPos);
                }

                orbitControls?.update();
                renderer.render(scene, camera);
                stats?.update();
            });

            // Stats
            stats = new Stats();
            mountRef.current!.appendChild(stats.dom);

            // GUI
            gui = new GUI();
            gui.add(debugSettings, 'chaseSatellite').name('Follow Satellite').onChange(() => {
                orbitControls.target.set(0, 0, 0);
                orbitControls.update();
            });
            gui.add(debugSettings, 'orbiting').name('Orbit Enabled');
            gui.add(debugSettings, 'orbitRadius', 100, 600).name('Orbit Radius (1000 km)').onChange(updateOrbit);
            // gui.add(debugSettings, 'orbitInclination', -90, 90).name('Inclination (°)').onChange(updateOrbit);
            gui.add(debugSettings, 'coneYawOffset', -45, 45).name('Cone Yaw (°)');
            gui.add(debugSettings, 'conePitchOffset', -45, 45).name('Cone Pitch (°)');

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
