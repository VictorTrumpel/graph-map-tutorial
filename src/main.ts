import { Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { InitScene } from './InitScene';
import './index.css';

let scene: Scene;

initModels();

function initModels() {
  const loader = new GLTFLoader();

  loader.load(
    // resource URL
    '/castle.glb',
    // called when the resource is loaded
    function (gltf) {
      gltf.scene.scale.set(0.5, 0.5, 0.5);

      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );

  loader.load(
    // resource URL
    '/pizzashop.glb',
    // called when the resource is loaded
    function (gltf) {
      gltf.scene.scale.set(0.7, 0.7, 0.7);

      gltf.scene.translateX(7);

      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );

  loader.load(
    // resource URL
    '/shack.glb',
    // called when the resource is loaded
    function (gltf) {
      gltf.scene.scale.set(1.1, 1.1, 1.1);

      gltf.scene.translateX(-12);

      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );

  loader.load(
    // resource URL
    '/woodhouse.glb',
    // called when the resource is loaded
    function (gltf) {
      gltf.scene.scale.set(1.5, 1.5, 1.5);

      gltf.scene.translateZ(12);

      scene.add(gltf.scene);

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log('An error happened');
    }
  );
}

const initScene = new InitScene();
initScene.start();
