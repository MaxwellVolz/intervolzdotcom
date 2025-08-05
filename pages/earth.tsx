'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import initEarth from '@/lib/initEarth';
import { RendererManager } from '@/lib/RendererManager';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import ChartPanel from '@/components/ChartPanel';


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


    const startTimeRef = useRef(performance.now());
    const lastTelemetryTimeRef = useRef(0);
    const telemetryInterval = 1; // seconds


    const earthRadius = 63.71; // with scale

    const telemetry: {
        time: number[];
        alt: number[];
        lat: number[];
        lon: number[];
    } = {
        time: [],
        alt: [],
        lat: [],
        lon: [],
    };

    const maxDurationSeconds = 60;

    const debugSettings = {
        chaseSatellite: false,
        orbiting: true,
        orbitRadius: 421.57,
        orbitInclination: 0,
        coneAzimuthOffset: 0,
        coneElevationOffset: 0,
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

            // Earth Material
            // const earthMat = new THREE.MeshStandardMaterial({ color: 0x2244dd, roughness: 1 });

            const textureLoader = new THREE.TextureLoader();
            const earthTexture = await textureLoader.loadAsync('/textures/bluemarble.jpg');
            const earthMat = new THREE.MeshStandardMaterial({
                map: earthTexture,
                roughness: 1,
            });

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

                const gps = toLatLonAlt(satPos, earthRadius);
                console.log(gps)

                // Live-update debug GUI fields
                // debugSettings.targetLatitude = gps.latitude;
                // debugSettings.targetLongitude = gps.longitude;

                // const now = Math.floor(performance.now() / 1000);

                OOI.debugLine.geometry.setFromPoints([satPos, new THREE.Vector3(0, 0, 0)]);

                const now = (performance.now() - startTimeRef.current) / 1000; // seconds since page load

                if (now - lastTelemetryTimeRef.current >= telemetryInterval) {
                    telemetry.time.push(now);
                    telemetry.alt.push(gps.altitude);
                    telemetry.lat.push(gps.latitude);
                    telemetry.lon.push(gps.longitude);
                    lastTelemetryTimeRef.current = now;

                    // Trim arrays based on max seconds of data
                    while (telemetry.time.length > 0 && (now - telemetry.time[0]) > maxDurationSeconds) {
                        telemetry.time.shift();
                        telemetry.alt.shift();
                        telemetry.lat.shift();
                        telemetry.lon.shift();
                    }
                }

                console.log(telemetry)

                debugLine.geometry.setFromPoints([satPos, new THREE.Vector3(0, 0, 0)]);

                // Beam logic
                beam.position.copy(satPos);

                // Beam points directly at Earth (nadir) initially
                const dir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), satPos).normalize();

                // Define local satellite coordinate frame
                const beamQuat = new THREE.Quaternion();
                const up = new THREE.Vector3(0, -1, 0); // beam default direction in geometry
                beamQuat.setFromUnitVectors(up, dir);

                // Apply az/el offset from local satellite frame
                const az = THREE.MathUtils.degToRad(debugSettings.coneAzimuthOffset);     // horizontal spin
                const el = THREE.MathUtils.degToRad(debugSettings.coneElevationOffset);   // vertical tilt

                // Azimuth: rotate around satellite local Y
                // Elevation: rotate around satellite local X after azimuth
                const azElQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-el, az, 0, 'YXZ')); // negative el to go *down* from nadir

                // Final beam orientation = nadir + offset
                beam.quaternion.copy(beamQuat).multiply(azElQuat);

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

            gui.add(debugSettings, 'coneAzimuthOffset', -180, 180).name('Cone Azimuth (°)');
            gui.add(debugSettings, 'coneElevationOffset', -90, 90).name('Cone Elevation (°)');

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


        function toLatLonAlt(pos: THREE.Vector3, earthRadius: number) {
            const x = pos.x;
            const y = pos.y;
            const z = pos.z;

            const r = Math.sqrt(x * x + y * y + z * z);
            const lat = Math.asin(y / r);                  // radians
            const lon = Math.atan2(z, x);                  // radians
            const alt = r - earthRadius;

            return {
                latitude: THREE.MathUtils.radToDeg(lat),
                longitude: THREE.MathUtils.radToDeg(lon),
                altitude: alt,
            };
        }


        return () => {
            renderer?.dispose();
            window.removeEventListener('resize', onWindowResize);
            rendererManager.domElement.removeEventListener('pointerdown', onPointerDown);
        };
    }, []);

    return (
        <>
            <div ref={mountRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />
            {/* <ChartPanel
                title="Satellite Altitude"
                seriesName="Altitude (km)"
                getData={() => ({ x: telemetry.time, y: telemetry.alt })}
                style={{ top: 10, right: 10 }}
            /> */}
            <ChartPanel
                title="Latitude & Longitude"
                getData={() => {
                    const now = (performance.now() - startTimeRef.current) / 1000;

                    const x = telemetry.time.map(t => now - t); // seconds ago
                    const lat = telemetry.lat.slice();
                    const lon = telemetry.lon.slice();

                    return [
                        {
                            x,
                            y: lat,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Latitude',
                            line: { color: '#33ffcc' },
                        },
                        {
                            x,
                            y: lon,
                            type: 'scatter',
                            mode: 'lines',
                            name: 'Longitude',
                            line: { color: '#ff3366' },
                        },
                    ];
                }}
                style={{ top: 120, left: 10 }}
            />


        </>

    )
}
