import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Vector2, Raycaster, Object3D, Event } from 'three';
import { IActionScene } from '@/IActionScene';
import { PathPainter } from '@/feature/PathPainter';
import { HousePainter } from '@/feature/HousePainter';

export class MainFlowScene {
  private actionScene: IActionScene;

  private assetMap: Map<string, GLTF>;

  private housePainter: HousePainter | null = null;

  private raycaster: Raycaster = new Raycaster();

  pathPainter: PathPainter | null = null;

  constructor(actionScene: IActionScene, assetMap: Map<string, GLTF>) {
    this.assetMap = assetMap;
    this.actionScene = actionScene;
  }

  async start() {
    const housePainter = new HousePainter(this.actionScene, this.assetMap);
    this.housePainter = housePainter;

    this.pathPainter = new PathPainter(housePainter.housesMap);
    this.pathPainter.getPointerPosition = this.getPointerPosition.bind(this);
    this.pathPainter.getIntersectWithGround = this.getIntersectWithGround.bind(this);
    this.pathPainter.getIntersectWithScene = this.getIntersectWithScene.bind(this);
    this.pathPainter.addToScene = this.addToScene.bind(this);
    this.pathPainter.removeFromScene = this.removeFromScene.bind(this);
  }

  mountDraftHouseOnScene(assetTitle: string) {
    this.housePainter?.mountDraftHouseOnScene(assetTitle);
  }

  private getPointerPosition(event: PointerEvent | MouseEvent) {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.actionScene.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.actionScene.renderer.domElement.clientHeight) * 2 + 1;

    return pointer;
  }

  private getIntersectWithGround(pointer: Vector2) {
    this.raycaster.setFromCamera(pointer, this.actionScene.camera);
    return this.raycaster.intersectObject(this.actionScene.ground)[0];
  }

  private getIntersectWithScene(pointer: Vector2) {
    this.raycaster.setFromCamera(pointer, this.actionScene.camera);
    return this.raycaster.intersectObjects(this.actionScene.scene.children, true);
  }

  private addToScene(element: Object3D<Event>) {
    this.actionScene.scene.add(element);
  }

  private removeFromScene(element: Object3D<Event>) {
    this.actionScene.scene.remove(element);
  }
}
