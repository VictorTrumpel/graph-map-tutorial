import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Ground } from './Ground';
import {
  Group,
  Vector2,
  Raycaster,
  Scene,
  PerspectiveCamera,
  Mesh,
  SphereGeometry,
  MeshLambertMaterial,
  Color,
  PlaneGeometry,
  MeshMatcapMaterial,
} from 'three';
import { Renderer } from './Renderer';
import { IActionScene } from '@/IActionScene';
import { v4 as uuidv4 } from 'uuid';
import { HouseLabel } from '@/shared/HouseLabel/HouseLabel';
import { createRoot } from 'react-dom/client';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { assetsConfig } from '@/constants/assetsConfig';

export class House {
  readonly model: Group;
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly ground: Ground;
  readonly raycaster = new Raycaster();
  readonly id: string;
  readonly configInfo: (typeof assetsConfig)[number];
  readonly orbitControls: OrbitControls;

  sphereController: Mesh | null = null;

  private _isMount: boolean = false;

  private _name = '';

  private label: CSS2DObject | null = null;

  onHouseArmPointerDown: () => void = () => null;
  onHouseArmPointerUp: () => void = () => null;
  onSaveHouse: () => void = () => null;
  onMount: () => void = () => null;

  constructor(
    actionScene: IActionScene,
    model: Group,
    config: (typeof assetsConfig)[number],
    id?: string
  ) {
    this.model = model;

    this.model.userData = this;

    this.attachMeshes();

    this.renderer = actionScene.renderer;
    this.camera = actionScene.camera;
    this.scene = actionScene.scene;
    this.ground = actionScene.ground;
    this.id = id || uuidv4();
    this.configInfo = config;
    this.orbitControls = actionScene.orbitControls;

    window.addEventListener('pointerdown', this.handlePointerDown);
  }

  private handlePointerDown = (event: MouseEvent) => {
    const pointer = this.getPointerPosition(event);

    this.raycaster.setFromCamera(pointer, this.camera);

    const firstIntersect = this.raycaster.intersectObject(this.model, true)[0];

    const isClickOnSphereController = firstIntersect?.object === this.sphereController;

    if (!isClickOnSphereController || !this.sphereController) return;

    this.onHouseArmPointerDown();
  };

  get isMount() {
    return this._isMount;
  }

  set isMount(mount: boolean) {
    this._isMount = mount;
  }

  set name(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  removeArm() {
    if (!this.sphereController) return;

    this.model.remove(this.sphereController);
    this.sphereController = null;
  }

  saveHouse() {
    this.onSaveHouse();
  }

  private attachMeshes() {
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = child.material.clone();
        child.userData = this;
      }
    });
  }

  setOpacity(opacity: number) {
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });
  }

  setHouseArmColor(color: number) {
    if (!this.sphereController) return;
    const sphereMaterial = this.sphereController.material as MeshLambertMaterial & Color;
    sphereMaterial.color.set(color);
  }

  createSphereController() {
    const geometry = new SphereGeometry(1, 16, 16);
    const material = new MeshLambertMaterial({ color: 0x6794ab });

    this.sphereController = new Mesh(geometry, material);
    this.sphereController.position.x = this.configInfo.controllerPosition[0];
    this.sphereController.position.y = this.configInfo.controllerPosition[1];
    this.sphereController.position.z = this.configInfo.controllerPosition[2];

    this.sphereController.userData = { msg: 'gdsgds' };

    this.model.add(this.sphereController);
  }

  createHouseLabel() {
    const labelContainer = document.createElement('div');

    const root = createRoot(labelContainer);

    root.render(<HouseLabel house={this} />);

    this.label = new CSS2DObject(labelContainer);
    this.label.layers.set(0);

    this.label.position.x = this.configInfo.labelPosition[0];
    this.label.position.y = this.configInfo.labelPosition[1];
    this.label.position.z = this.configInfo.labelPosition[2];

    this.model.add(this.label);
  }

  private getPointerPosition(event: PointerEvent | MouseEvent) {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    return pointer;
  }
}
