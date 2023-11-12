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
  readonly id: string;
  readonly configInfo: (typeof assetsConfig)[number];

  sphereController: Mesh | null = null;

  private _isMount: boolean = false;

  private _name = '';

  private label: CSS2DObject | null = null;

  onHouseArmPointerDown: () => void = () => null;
  onHouseArmPointerUp: () => void = () => null;
  onSaveHouse: () => void = () => null;
  onMount: () => void = () => null;

  constructor(model: Group, config: (typeof assetsConfig)[number], id?: string) {
    this.model = model;

    this.model.userData = this;

    this.attachMeshes();

    this.id = id || uuidv4();
    this.configInfo = config;
  }

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
}
