'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import initScene from '../pages/lib/initScene';
import loadGLTFRoom from '../pages/lib/loadGLTFRoom';
import MonitorDisplay from '../pages/lib/monitorDisplay';
import HNtoCanvas from '../pages/lib/HNtoCanvas';
import { RendererManager } from '../pages/lib/rendererManager';

export default function KiraScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const orbitMaxDistance = 1.0;

  useEffect(() => {
    if (!mountRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let orbitControls: OrbitControls;
    let stats: Stats;
    let mirrorSphereCamera: THREE.CubeCamera;
    let mirrorSphereCamera2: THREE.CubeCamera;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const OOI: Record<string, THREE.Object3D> = {};
    const monitorDisplays: Record<string, MonitorDisplay> = {};
    const clock = new THREE.Clock();
    let rendererManager: RendererManager;
    const renderModeButtons: Record<string, RenderMode> = {
      render_button_1: 'normal',
      render_button_2: 'ascii',
      render_button_3: 'anaglyph',
      render_button_4: 'parallax', // or 'stereo'
    };
    
    init();

    async function init() {
      const result = initScene();
      scene = result.scene;
      camera = result.camera;
      renderer = result.renderer;
      rendererManager = new RendererManager(renderer);

      const { scene: roomScene, OOI: loadedOOI, animations } = await loadGLTFRoom();
      Object.assign(OOI, loadedOOI);

      const monitorConfigs = [
        { key: 'main_monitor', label: 'Main Monitor', desktop: '/textures/main.jpg', post_app: '/textures/main.jpg' },
        { key: 'top_monitor', label: 'Top Monitor', desktop: '/textures/top.jpg', post_app: '/textures/discord.jpg' },
        { key: 'vertical_monitor', label: 'Vertical Monitor', desktop: '/textures/vertical.jpg', post_app: '/textures/vertical.jpg' },
      ];

      for (const { key, label, desktop, post_app } of monitorConfigs) {
        const monitor = OOI[key];
        if (!monitor || !monitor.isMesh) continue;

        const steps = [`booting ${label}`, 'system initialized.'];

        const display = new MonitorDisplay(steps, desktop, () => {
          console.log(`🟢 ${label} boot complete`);

          const delay = 500 + Math.random() * 3000;

          if (key === 'vertical_monitor') {
            const mesh = OOI[key] as THREE.Mesh;
            const material = mesh.material as THREE.MeshBasicMaterial;
            const canvas = (material.map as THREE.CanvasTexture).image as HTMLCanvasElement;

            setTimeout(async () => {
              await HNtoCanvas(display.canvas);
              display.texture.needsUpdate = true;
            }, 1000 + Math.random() * 2000);
          } else {
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
        console.log('✅ animations:', animations.map((a) => a.name));
        animations.forEach((clip) => mixer.clipAction(clip).play());
        OOI.mixer = mixer;
      }

      const targetPosition = OOI.sphere.position.clone().add(new THREE.Vector3(0, 0.2, -0.3));
      camera.position.copy(targetPosition.clone().add(new THREE.Vector3(-2, 2, -3)));
      camera.lookAt(targetPosition);

      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);
      mirrorSphereCamera = new THREE.CubeCamera(0.05, 50, cubeRenderTarget);
      scene.add(mirrorSphereCamera);

      const cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(1024);
      mirrorSphereCamera2 = new THREE.CubeCamera(0.05, 50, cubeRenderTarget2);
      scene.add(mirrorSphereCamera2);

      OOI.sphere.material = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });
      OOI.sphere2.material = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget2.texture });

      mountRef.current!.appendChild(rendererManager.domElement);
      rendererManager.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animate);

      orbitControls = new OrbitControls(camera, rendererManager.domElement);
      orbitControls.minDistance = 0.2;
      orbitControls.maxDistance = orbitMaxDistance;
      orbitControls.enableDamping = true;
      orbitControls.target.copy(targetPosition);

      stats = new Stats();
      mountRef.current!.appendChild(stats.dom);

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
        for (const key in monitorDisplays) {
          const monitor = OOI[key];
          if (intersect.object === monitor || monitor.children.includes(intersect.object)) {
            monitorDisplays[key].handleClick();
            return;
          }
        }

        if (intersect.object === OOI.resume_pdf) {
          const confirmed = window.confirm('Open resume.pdf?');
          if (confirmed) {
            window.open('/downloads/mvolz_resume.pdf', '_blank');
          }
          return;
        }

        for (const [buttonKey, mode] of Object.entries(renderModeButtons)) {
          const button = OOI[buttonKey];
          if (!button) continue;
        
          if (intersect.object === button || button.children.includes(intersect.object)) {
            const oldEl = rendererManager.domElement;
            rendererManager.switch(mode);
            const newEl = rendererManager.domElement;
        
            if (oldEl !== newEl) {
              mountRef.current!.replaceChild(newEl, oldEl);
        
              orbitControls.dispose();
              orbitControls = new OrbitControls(camera, newEl);
              orbitControls.minDistance = 0.4;
              orbitControls.maxDistance = orbitMaxDistance;
              orbitControls.enableDamping = true;
              orbitControls.target.copy(OOI.sphere.position).add(new THREE.Vector3(0, 0.2, -0.3));
              orbitControls.update();
        
              newEl.addEventListener('pointerdown', onPointerDown);
            }
        
            return;
          }
        }
      }
    }

    function animate() {
      if (OOI.sphere && mirrorSphereCamera) {
        OOI.sphere.visible = false;
        OOI.sphere.getWorldPosition(mirrorSphereCamera.position);
        mirrorSphereCamera.update(renderer, scene);
        OOI.sphere.visible = true;
      }
      
      if (OOI.sphere2 && mirrorSphereCamera2) {
        OOI.sphere2.visible = false;
        OOI.sphere2.getWorldPosition(mirrorSphereCamera2.position);
        mirrorSphereCamera2.update(renderer, scene);
        OOI.sphere2.visible = true;
      }

      orbitControls.update();
      stats.update();

      const delta = clock.getDelta();
      OOI.mixer?.update(delta);

      rendererManager.render(scene, camera);
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
