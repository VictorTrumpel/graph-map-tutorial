import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  MeshMatcapMaterial,
  PlaneGeometry,
  Mesh,
  MeshLambertMaterial,
  Color,
  Raycaster,
  Vector2,
  Object3D,
  Group,
  Intersection,
  Event,
} from 'three';
import { House } from '@/shared/House';
import { IActionScene } from '@/IActionScene';
import { IndexDB } from '@/IndexDB';
import { assetsConfig } from '@/constants/assetsConfig';

export class HousePainter {
  private indexDb: IndexDB = new IndexDB();
  private assetMap: Map<string, GLTF>;

  readonly housesMap = new Map<string, House>();

  private draftHouse: House | null = null;

  private helperPlane: Mesh | null = null;

  getPointerPosition = (_: PointerEvent | MouseEvent) => new Vector2();
  getIntersectWithSprite: (
    pointer: Vector2,
    sprite: Object3D<Event> | Group | Mesh
  ) => Intersection<Object3D<Event>> | null = () => null;
  addToScene: (element: Object3D<Event> | Group) => void = () => null;
  enableOrbitControl: () => void = () => null;
  disableOrbitControl: () => void = () => null;
  removeFromScene: (element: Object3D<Event> | Group | Mesh) => void = () => null;

  constructor(assetMap: Map<string, GLTF>) {
    this.assetMap = assetMap;

    window.addEventListener('pointerdown', this.handleWindowClick);
    window.addEventListener('pointerdown', this.handlePointerDown);

    this.mountHousesFromIndexDb();
  }

  private handleSaveDraftHouse = () => {
    if (!this.draftHouse) return;
    this.saveHouse(this.draftHouse);
  };

  private handlePointerMove = (event: MouseEvent) => {
    const pointer = this.getPointerPosition(event);
    this.moveHouseAlongGround(pointer);
  };

  private handleArmOfDraftHousePointerDown = () => {
    const houseArm = this.draftHouse?.sphereController;

    if (!this.draftHouse || !houseArm) return;

    const geometry = new PlaneGeometry(100, 100);
    const material = new MeshMatcapMaterial({ opacity: 0, transparent: true });
    this.helperPlane = new Mesh(geometry, material);
    this.helperPlane.position.y = houseArm.position.y;
    this.helperPlane.rotateX(-Math.PI / 2);
    this.helperPlane.renderOrder = 1;

    this.addToScene(this.helperPlane);

    this.disableOrbitControl();

    const sphereMaterial = houseArm.material as MeshLambertMaterial & Color;

    sphereMaterial.color.set(0xffe921);

    window.addEventListener('pointerup', this.handleArmOfDraftHousePointerUp);
    window.addEventListener('pointermove', this.handlePointerMove);
  };

  private handlePointerDown = (event: MouseEvent) => {
    if (!this.draftHouse) return;

    const pointer = this.getPointerPosition(event);

    const firstIntersect = this.getIntersectWithSprite(pointer, this.draftHouse.model);

    const isClickOnSphereController = firstIntersect?.object === this.draftHouse.sphereController;

    if (!isClickOnSphereController || !this.draftHouse.sphereController) return;

    this.handleArmOfDraftHousePointerDown();
  };

  private handleArmOfDraftHousePointerUp = () => {
    const houseArm = this.draftHouse?.sphereController;

    if (!houseArm) return;

    const houseArmMaterial = houseArm.material as MeshLambertMaterial & Color;

    houseArmMaterial.color.set(0x6794ab);

    this.enableOrbitControl();

    if (this.helperPlane) {
      this.removeFromScene(this.helperPlane);
    }

    window.removeEventListener('pointermove', this.handlePointerMove);
  };

  private handleWindowClick = () => {};

  saveHouse(house: House) {
    if (!house) return;

    house.setOpacity(1);
    house.removeArm();

    this.indexDb.saveHouseInfo({
      id: house.id,
      positionX: house.model.position.x,
      positionZ: house.model.position.z,
      assetTitle: house.configInfo.title,
      houseName: house.name,
    });

    house.isMount = true;
  }

  mountDraftHouseOnScene(assetTitle: string) {
    this.draftHouse = this.createDraftHouse(assetTitle);

    if (!this.draftHouse) return;

    this.addToScene(this.draftHouse.model);
  }

  private createDraftHouse(assetTitle: string) {
    const draftHouse = this.createHouseByAssetTitle(assetTitle);

    if (!draftHouse) return null;

    draftHouse.createSphereController();
    draftHouse.createHouseLabel();
    draftHouse.setOpacity(0.5);
    draftHouse.onSaveHouse = this.handleSaveDraftHouse;
    draftHouse.onHouseArmPointerDown = this.handleArmOfDraftHousePointerDown;

    return draftHouse;
  }

  private async mountHousesFromIndexDb() {
    const housesInfo = await this.indexDb.getAllHousesInfo();

    for (const info of housesInfo) {
      const house = this.createHouseByAssetTitle(info.assetTitle, info.id);

      if (!house) continue;

      house.name = info.houseName;

      this.addToScene(house.model);

      this.housesMap.set(house.id, house);

      house.model.position.x = info.positionX;
      house.model.position.z = info.positionZ;

      house.createHouseLabel();

      house.isMount = true;
    }
  }

  private createHouseByAssetTitle(assetTitle: string, id?: string) {
    const houseGLTF = this.assetMap.get(assetTitle);

    const assetConfig = assetsConfig.find(({ title }) => title === assetTitle);

    if (!houseGLTF || !assetConfig) return null;

    const houseModel = houseGLTF.scene.clone(true);

    const house = new House(houseModel, assetConfig, id);

    return house;
  }

  moveHouseAlongGround(pointer: Vector2) {
    const houseArm = this.draftHouse?.sphereController;

    if (!houseArm || !this.helperPlane || !this.draftHouse) return;

    const intersect = this.getIntersectWithSprite(pointer, this.helperPlane);

    if (!intersect) return;

    this.draftHouse.model.position.x = intersect.point.x;
    this.draftHouse.model.position.z = intersect.point.z;
  }
}
