import { Scene, Raycaster, Vector2, PerspectiveCamera, Renderer } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { IActionScene } from '@/IActionScene';
import { House } from '@/shared/House';
import { PathLine } from '@/shared/PathLine';
import { IndexDB } from '@/IndexDB';

export class MainFlowScene {
  private actionScene: IActionScene;

  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: Renderer;

  private assetMap: Map<string, GLTF>;

  private raycaster = new Raycaster();

  private pathLine: PathLine | null = null;
  private fromHouse: House | null = null;

  private indexDb: IndexDB = new IndexDB();

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.pathLine) {
      this.scene.remove(this.pathLine);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
  };

  private handleWindowDbClick = (event: MouseEvent) => {
    const pointer = this.getPointerPosition(event);

    this.raycaster.setFromCamera(pointer, this.camera);

    const firstIntersect = this.raycaster.intersectObjects(this.scene.children, true)[0];

    const house = firstIntersect?.object?.userData;

    this.createPathFrom(house);
  };

  private handleMouseMove = (event: PointerEvent) => {
    if (!this.pathLine || !this.fromHouse) return;

    const pointer = this.getPointerPosition(event);

    this.aimPathLine(pointer);
  };

  private handleMountHouse = (house: House, title: string) => {
    this.indexDb.saveHouseInfo({
      id: house.id,
      positionX: house.model.position.x,
      positionZ: house.model.position.z,
      assetTitle: title,
    });
  };

  constructor(actionScene: IActionScene, assetMap: Map<string, GLTF>) {
    this.assetMap = assetMap;
    this.actionScene = actionScene;
    this.scene = actionScene.scene;
    this.renderer = actionScene.renderer;
    this.camera = actionScene.camera;
  }

  async start() {
    window.addEventListener('dblclick', this.handleWindowDbClick);
  }

  createPathFrom(house: unknown) {
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
      window.removeEventListener('pointermove', this.handleMouseMove);

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
      window.addEventListener('pointermove', this.handleMouseMove);
    }
  }

  createHouse(houseTitle: string) {
    const houseGLTF = this.assetMap.get(houseTitle);

    if (!houseGLTF) return;

    const houseModel = houseGLTF.scene.clone(true);

    const house = new House(this.actionScene, houseModel);

    house.onMount = () => this.handleMountHouse(house, houseTitle);

    this.scene.add(house.model);
  }

  private aimPathLine(pointer: Vector2) {
    if (!this.fromHouse || !this.pathLine) {
      throw new Error('Need fromHouse to aim');
    }

    this.raycaster.setFromCamera(pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.actionScene.ground)[0];

    if (!intersects) return;

    this.pathLine.setFromTo(
      [this.fromHouse.model.position.x, 0, this.fromHouse.model.position.z],
      [intersects.point.x, 0, intersects.point.z]
    );
  }

  private getPointerPosition(event: PointerEvent | MouseEvent) {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    return pointer;
  }
}
