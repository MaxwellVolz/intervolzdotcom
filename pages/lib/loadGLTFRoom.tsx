// lib/loadGLTFRoom.tsx
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';

export default async function loadGLTFRoom(path = '/models/gltf/room.glb') {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/jsm/libs/draco/');
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const gltf = await gltfLoader.loadAsync(path);

  const OOI: Record<string, THREE.Object3D> = {};

  gltf.scene.traverse((n) => {
    if (n.name === 'boule') OOI.sphere = n;
    if (n.name === 'boule2') OOI.sphere2 = n;
    if (n.name === 'vertical_monitor') OOI.vertical_monitor = n;
    if (n.name === 'main_monitor') OOI.main_monitor = n;
    if (n.name === 'top_monitor') OOI.top_monitor = n;
    if (n.name === 'monitor_small') OOI.monitor_small = n;
    if (n.name === 'monitor_small_shelf') OOI.monitor_small_shelf = n;
    if (n.name === 'render_button_1') OOI.render_button_1 = n;
    if (n.name === 'render_button_2') OOI.render_button_2 = n;
    if (n.name === 'render_button_3') OOI.render_button_3 = n;
    if (n.name === 'render_button_4') OOI.render_button_4 = n;
    if (n.name === 'resume_pdf') OOI.resume_pdf = n;
  });

  return { scene: gltf.scene, OOI, animations: gltf.animations };
}
