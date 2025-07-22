// pages/leaderboard.tsx

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from '../styles/Leaderboard.module.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const HN_API = 'https://hacker-news.firebaseio.com/v0';

async function fetchTopStories(limit = 10) {
    const ids = await fetch(`${HN_API}/topstories.json`).then(r => r.json());
    const topIds = ids.slice(0, limit);
    const stories = await Promise.all(
        topIds.map(id => fetch(`${HN_API}/item/${id}.json`).then(r => r.json()))
    );
    return stories;
}

function createPanelMesh(title: string, index: number, total: number): THREE.Mesh {
    const box = new THREE.BoxGeometry(24, 1.2, 0.5);

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillText(title.slice(0, 60), 50, 160);

    const textTexture = new THREE.CanvasTexture(canvas);
    textTexture.anisotropy = 16;
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;

    const materials = [
        new THREE.MeshStandardMaterial({ color: '#333' }),
        new THREE.MeshStandardMaterial({ color: '#333' }),
        new THREE.MeshStandardMaterial({ color: '#444' }),
        new THREE.MeshStandardMaterial({ color: '#222' }),
        new THREE.MeshStandardMaterial({ map: textTexture }),
        new THREE.MeshStandardMaterial({ color: '#111' }),
    ];

    const mesh = new THREE.Mesh(box, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const spacing = 2;
    const centerOffset = ((total - 1) * spacing) / 2;
    mesh.position.y = index * -spacing + centerOffset;
    mesh.position.z = 0;

    return mesh;
}

export default function LeaderboardPage() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [sceneReady, setSceneReady] = useState(false);
    const meshRefs = useRef<THREE.Mesh[]>([]);
    const scene = useRef(new THREE.Scene());
    const camera = useRef(new THREE.PerspectiveCamera(75, 1, 0.1, 1000));
    const renderer = useRef<THREE.WebGLRenderer>();
    const swingGroup = useRef(new THREE.Group());

    useEffect(() => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        renderer.current = new THREE.WebGLRenderer({ antialias: true });
        renderer.current.shadowMap.enabled = true;
        renderer.current.setSize(width, height);
        mountRef.current.appendChild(renderer.current.domElement);

        camera.current.aspect = width / height;
        camera.current.updateProjectionMatrix();
        camera.current.position.set(0, 0, 24);

        scene.current.background = new THREE.Color('#101010');

        const controls = new OrbitControls(camera.current, renderer.current.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, 0, 0);
        controls.update();

        const stageGeo = new THREE.CylinderGeometry(32, 32, 0.5, 64);
        const stageMat = new THREE.MeshStandardMaterial({ color: '#222', metalness: 0.5, roughness: 0.8 });
        const stage = new THREE.Mesh(stageGeo, stageMat);
        stage.position.y = -10;
        stage.receiveShadow = true;
        scene.current.add(stage);

        // Anchor swing group at the top
        swingGroup.current.position.set(0, 18, 0);

        const spotlight = new THREE.SpotLight(0xffffff, 30, 100, Math.PI / 9, 0.3, 2);
        spotlight.angle = Math.PI / 7;
        spotlight.penumbra = 0.5;
        spotlight.intensity = 30;
        spotlight.decay = 2;
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.set(2048, 2048);
        spotlight.position.set(0, 0, 0); // top of the swing group

        // Create a target *within* the group at a relative position
        const spotlightTarget = new THREE.Object3D();
        spotlightTarget.position.set(0, -20, 0); // aim below
        swingGroup.current.add(spotlightTarget); // <-- attach target to group
        spotlight.target = spotlightTarget;

        swingGroup.current.add(spotlight);
        scene.current.add(swingGroup.current);
        scene.current.add(spotlight.target); // still required

        const coneGeo = new THREE.ConeGeometry(8, 30, 64, 1, true);
        const coneMat = new THREE.MeshStandardMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const lightCone = new THREE.Mesh(coneGeo, coneMat);
        lightCone.position.set(0, -24, 0);
        swingGroup.current.add(lightCone);

        const lightHousingConeGeo = new THREE.ConeGeometry(3, 2, 32);
        const lightHousingConeMat = new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.9, roughness: 0.2 });
        const lightHousing = new THREE.Mesh(lightHousingConeGeo, lightHousingConeMat);
        lightHousing.position.set(0, -8, 0);
        swingGroup.current.add(lightHousing);

        const rodGeo = new THREE.CylinderGeometry(0.3, 0.3, 8.5, 16);
        const rodMat = new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.6, roughness: 0.3 });
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.set(0, -3, 0);
        swingGroup.current.add(rod);

        const ceilingGeo = new THREE.BoxGeometry(4, 0.5, 4);
        const ceilingMat = new THREE.MeshStandardMaterial({ color: '#111' });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.position.set(0, 18, 0);
        scene.current.add(ceiling);

        const ambient = new THREE.AmbientLight(0xffffff, 0.25);
        scene.current.add(ambient);

        scene.current.fog = new THREE.FogExp2(0x000000, 0.045);
        scene.current.background = new THREE.Color(0x0a0a0a);

        let swingAngle = 0;
        let swingVelocity = 0.001; // subtle continuous movement
        const gravity = 0.00002;
        const damping = 0.999;

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const force = -gravity * Math.sin(swingAngle);
            swingVelocity += force;
            swingVelocity *= damping;
            swingAngle += swingVelocity;
            swingGroup.current.rotation.z = swingAngle;

            spotlight.updateMatrixWorld(); // updates spotlight's position
            spotlight.target.updateMatrixWorld(); // updates target's world position

            controls.update();
            renderer.current!.render(scene.current, camera.current);
        };
        animate();

        setSceneReady(true);

        return () => {
            if (renderer.current && renderer.current.domElement && mountRef.current?.contains(renderer.current.domElement)) {
                mountRef.current.removeChild(renderer.current.domElement);
            }
        };
    }, []);

    useEffect(() => {
        if (!sceneReady) return;

        async function updateLeaderboard() {
            console.log('[HN] Fetching top stories...');
            try {
                const stories = await fetchTopStories(10);
                console.log('[HN] Top Stories:', stories.map(s => s.title));

                meshRefs.current.forEach(mesh => scene.current.remove(mesh));
                meshRefs.current = [];

                stories.forEach((story, i) => {
                    const mesh = createPanelMesh(story.title, i, stories.length);
                    scene.current.add(mesh);
                    meshRefs.current.push(mesh);
                });
            } catch (err) {
                console.error('[HN] Error fetching leaderboard:', err);
            }
        }

        updateLeaderboard();
        const interval = setInterval(updateLeaderboard, 30000);
        return () => clearInterval(interval);
    }, [sceneReady]);

    return <div ref={mountRef} className={styles.canvasContainer}></div>;
}