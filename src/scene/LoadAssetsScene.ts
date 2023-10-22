import { Scene, PerspectiveCamera, Group } from 'three';
import { Renderer } from '../shared/Renderer';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { IActionScene } from '@/IActionScene';
import { InitScene } from './InitScene';
import { House } from '@/shared/House';
import { Ground } from '@/shared/Ground';

const assets = [
  {
    title: 'castle',
    path: '/castle.glb',
    scale: [0.5, 0.5, 0.5],
  },
  {
    title: 'pizzashop',
    path: '/pizzashop.glb',
    scale: [0.7, 0.7, 0.7],
  },
  {
    title: 'shack',
    path: '/shack.glb',
    scale: [1.1, 1.1, 1.1],
  },
  {
    title: 'woodhouse',
    path: '/woodhouse.glb',
    scale: [1.5, 1.5, 1.5],
  },
];

export class LoadAssetsScene implements IActionScene {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: Renderer;
  readonly ground: Ground;

  private assetMap = new Map<string, GLTF>();

  handleModelLoad = (prop: (typeof assets)[number], gltf: GLTF) => {
    gltf.scene.scale.set(...(prop.scale as [number, number, number]));
    this.assetMap.set(prop.title, gltf);
  };

  handleChankLoad = (event: ProgressEvent<EventTarget>) => {
    console.log((event.loaded / event.total) * 100 + '% loaded');
  };

  handleErrorLoad = (error: ErrorEvent) => {
    console.log('An error happened');
  };

  constructor(scene: InitScene) {
    this.scene = scene.scene;
    this.camera = scene.camera;
    this.renderer = scene.renderer;
    this.ground = scene.ground;

    const loader = new GLTFLoader();

    for (const asset of assets) {
      loader.load(
        asset.path,
        this.handleModelLoad.bind(null, asset),
        this.handleChankLoad,
        this.handleErrorLoad
      );
    }
  }

  createHouse(houseTitle: string) {
    const houseGLTF = this.assetMap.get(houseTitle);

    if (!houseGLTF) return;

    const houseModel = houseGLTF.scene.clone(true);

    const house = new House(this, houseModel);

    this.scene.add(house.model);
  }

  async start() {}
}
