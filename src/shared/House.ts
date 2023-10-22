import { Ground } from './Ground';
import { Group, Vector2, Raycaster, PerspectiveCamera, Scene, Mesh } from 'three';
import { Renderer } from './Renderer';
import { IActionScene } from '@/IActionScene';

export class House {
  model: Group;
  renderer: Renderer;
  scene: Scene;
  camera: PerspectiveCamera;
  ground: Ground;
  raycaster = new Raycaster();

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
  };

  constructor(actionScene: IActionScene, model: Group) {
    this.model = model;
    this.renderer = actionScene.renderer;
    this.camera = actionScene.camera;
    this.scene = actionScene.scene;
    this.ground = actionScene.ground;

    this.setOpacity(0.5);

    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('dblclick', this.handleStayHouse);
  }

  rotate() {
    this.model.rotateX;
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
