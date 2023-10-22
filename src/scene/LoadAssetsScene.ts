import { Scene, PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { PathLine } from '@/shared/PathLine';
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

  private raycaster = new Raycaster();

  private assetMap = new Map<string, GLTF>();

  private pathLine: PathLine | null = null;
  private fromHouse: House | null = null;

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

  handleCreateFrom = () => {};

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.pathLine) {
      this.scene.remove(this.pathLine);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
  };

  handleWindowDbClick = (event: MouseEvent) => {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(pointer, this.camera);

    const firstIntersect = this.raycaster.intersectObjects(this.scene.children, true)[0];

    const house = firstIntersect?.object?.userData;

    const isRealHouse = house instanceof House;

    if (!isRealHouse || !house.isMount) return;

    const hasPointFrom = Boolean(this.fromHouse && this.pathLine);
    if (this.fromHouse !== house && hasPointFrom) {
      this.pathLine!.setFromTo(
        [this.fromHouse!.model.position.x, 0, this.fromHouse!.model.position.z],
        [house.model.position.x, 0, house.model.position.z]
      );
      this.fromHouse = null;
      this.pathLine = null;

      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('mousemove', this.handleMouseMove);

      return;
    }

    if (this.fromHouse === null) {
      this.fromHouse = house;

      this.pathLine = new PathLine();
      this.pathLine.setFromTo(
        [house.model.position.x, 0, house.model.position.z],
        [house.model.position.x, 0, house.model.position.z]
      );
      this.scene.add(this.pathLine);

      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('mousemove', this.handleMouseMove);
    }
  };

  handleMouseMove = (event: MouseEvent) => {
    if (!this.pathLine || !this.fromHouse) return;

    const pointer = new Vector2();

    pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.ground)[0];

    if (!intersects) return;

    this.pathLine.setFromTo(
      [this.fromHouse.model.position.x, 0, this.fromHouse.model.position.z],
      [intersects.point.x, 0, intersects.point.z]
    );
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

  createPathLine() {}

  async start() {
    window.addEventListener('dblclick', this.handleWindowDbClick);
  }
}
