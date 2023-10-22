import { Ground } from './Ground';
import { Group, Vector2, Raycaster, PerspectiveCamera, Scene, Mesh } from 'three';
import { Renderer } from './Renderer';
import { IActionScene } from '@/IActionScene';

export class House {
  readonly model: Group;
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly ground: Ground;
  readonly raycaster = new Raycaster();

  private _isMount: boolean = false;

  handlePointerMove = (event: MouseEvent) => {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.ground)[0];

    if (intersects?.point) {
      this.model.position.x = intersects.point.x;
      this.model.position.z = intersects.point.z;
    }
  };

  handleStayHouse = () => {
    window.removeEventListener('pointermove', this.handlePointerMove);
    this.setOpacity(1);
    this._isMount = true;
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

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('dblclick', this.handleStayHouse);
  }

  get isMount() {
    return this._isMount;
  }

  rotate() {
    this.model.rotateX;
  }

  attachMeshes() {
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
