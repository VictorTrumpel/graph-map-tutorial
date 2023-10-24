import { Ground } from './Ground';
import { Group, Vector2, Raycaster, PerspectiveCamera, Scene, Mesh } from 'three';
import { Renderer } from './Renderer';
import { IActionScene } from '@/IActionScene';
import { v4 as uuidv4 } from 'uuid';

export class House {
  readonly model: Group;
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly ground: Ground;
  readonly raycaster = new Raycaster();
  readonly id: string;

  private _isMount: boolean = false;

  onMount: (() => void) | null = null;

  private handlePointerMove = (event: MouseEvent) => {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.moveAlognGround(pointer);
  };

  private handleMountHouse = () => {
    this.mountHouse();
  };

  constructor(actionScene: IActionScene, model: Group) {
    this.model = model;

    this.model.userData = this;

    this.attachMeshes();
    this.setOpacity(0.5);

    this.renderer = actionScene.renderer;
    this.camera = actionScene.camera;
    this.scene = actionScene.scene;
    this.ground = actionScene.ground;
    this.id = uuidv4();

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('dblclick', this.handleMountHouse);
  }

  get isMount() {
    return this._isMount;
  }

  moveAlognGround(pointer: Vector2) {
    this.raycaster.setFromCamera(pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.ground)[0];

    if (intersects?.point) {
      this.model.position.x = intersects.point.x;
      this.model.position.z = intersects.point.z;
    }
  }

  mountHouse() {
    window.removeEventListener('pointermove', this.handlePointerMove);
    this.setOpacity(1);
    this._isMount = true;

    this.onMount?.();

    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('dblclick', this.handleMountHouse);
  }

  private attachMeshes() {
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material = child.material.clone();
        child.userData = this;
      }
    });
  }

  private setOpacity(opacity: number) {
    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.transparent = true;
        child.material.opacity = opacity;
      }
    });
  }
}
