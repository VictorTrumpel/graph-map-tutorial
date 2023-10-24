import { Scene, PerspectiveCamera } from 'three';
import { Renderer } from '../shared/Renderer';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { IActionScene } from '@/IActionScene';
import { InitScene } from './InitScene';
import { Ground } from '@/shared/Ground';
import { IndexDB } from '@/IndexDB';

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

  readonly assetMap = new Map<string, GLTF>();

  private loader: GLTFLoader = new GLTFLoader();

  constructor(scene: InitScene) {
    this.scene = scene.scene;
    this.camera = scene.camera;
    this.renderer = scene.renderer;
    this.ground = scene.ground;
  }

  async start() {
    for (const asset of assets) {
      const gltf = await this.loadModel(asset.path);
      gltf.scene.scale.set(...(asset.scale as [number, number, number]));
      this.assetMap.set(asset.title, gltf);
    }
  }

  async loadModel(path: string): Promise<GLTF> {
    return new Promise((res, rej) => {
      this.loader.load(path, res, () => null, rej);
    });
  }
}
