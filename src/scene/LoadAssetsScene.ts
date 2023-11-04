import { Scene, PerspectiveCamera } from 'three';
import { Renderer } from '../shared/Renderer';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IActionScene } from '@/IActionScene';
import { InitScene } from './InitScene';
import { Ground } from '@/shared/Ground';
import { assetsConfig } from '@/constants/assetsConfig';

export class LoadAssetsScene implements IActionScene {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: Renderer;
  readonly ground: Ground;
  readonly orbitControls: OrbitControls;

  readonly assetMap = new Map<string, GLTF>();

  private loader: GLTFLoader = new GLTFLoader();

  constructor(scene: InitScene) {
    this.scene = scene.scene;
    this.camera = scene.camera;
    this.renderer = scene.renderer;
    this.ground = scene.ground;
    this.orbitControls = scene.orbitControls;
  }

  async start() {
    for (const asset of assetsConfig) {
      const gltf = await this.loadModel(asset.path);
      // gltf.scene.scale.set(...(asset.scale as [number, number, number]));
      this.assetMap.set(asset.title, gltf);
    }
  }

  async loadModel(path: string): Promise<GLTF> {
    return new Promise((res, rej) => {
      this.loader.load(path, res, () => null, rej);
    });
  }
}
