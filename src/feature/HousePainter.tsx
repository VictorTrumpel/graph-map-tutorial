import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  MeshMatcapMaterial,
  PlaneGeometry,
  Mesh,
  MeshLambertMaterial,
  Color,
  Raycaster,
  Vector2,
} from 'three';
import { House } from '@/shared/House';
import { IActionScene } from '@/IActionScene';
import { IndexDB } from '@/IndexDB';
import { assetsConfig } from '@/constants/assetsConfig';

export class HousePainter {
  private actionScene: IActionScene;
  private indexDb: IndexDB = new IndexDB();
  private assetMap: Map<string, GLTF>;

  readonly housesMap = new Map<string, House>();

  private draftHouse: House | null = null;

  private helperPlane: Mesh | null = null;

  private raycaster = new Raycaster();

  constructor(actionScene: IActionScene, assetMap: Map<string, GLTF>) {
    this.actionScene = actionScene;
    this.assetMap = assetMap;

    window.addEventListener('pointerdown', this.handleWindowClick);

    this.mountHousesFromIndexDb();
  }

  private handleSaveDraftHouse = () => {
    if (!this.draftHouse) return;
    this.saveHouse(this.draftHouse, this.draftHouse?.name);
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

    this.actionScene.scene.add(this.helperPlane);

    this.actionScene.orbitControls.enabled = false;

    const sphereMaterial = houseArm.material as MeshLambertMaterial & Color;

    sphereMaterial.color.set(0xffe921);

    window.addEventListener('pointerup', this.handleArmOfDraftHousePointerUp);
    window.addEventListener('pointermove', this.handlePointerMove);
  };

  private handleArmOfDraftHousePointerUp = () => {
    const houseArm = this.draftHouse?.sphereController;

    if (!houseArm) return;

    const houseArmMaterial = houseArm.material as MeshLambertMaterial & Color;

    houseArmMaterial.color.set(0x6794ab);

    this.actionScene.orbitControls.enabled = true;

    if (this.helperPlane) {
      this.actionScene.scene.remove(this.helperPlane);
    }

    window.removeEventListener('pointermove', this.handlePointerMove);
  };

  private handleWindowClick = () => {};

  saveHouse(house: House, title: string) {
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

    this.actionScene.scene.add(this.draftHouse.model);
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

      console.log('house :>> ', house);

      if (!house) continue;

      house.name = info.houseName;

      console.log('house :>> ', house);

      this.actionScene.scene.add(house.model);

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

    const house = new House(this.actionScene, houseModel, assetConfig, id);

    return house;
  }

  moveHouseAlongGround(pointer: Vector2) {
    const houseArm = this.draftHouse?.sphereController;

    if (!houseArm || !this.helperPlane || !this.draftHouse) return;

    this.raycaster.setFromCamera(pointer, this.actionScene.camera);

    const intersect = this.raycaster.intersectObject(this.helperPlane)[0];

    if (!intersect) return;

    this.draftHouse.model.position.x = intersect.point.x;
    this.draftHouse.model.position.z = intersect.point.z;
  }

  private getPointerPosition(event: PointerEvent | MouseEvent) {
    const pointer = new Vector2();

    pointer.x = (event.clientX / this.actionScene.renderer.domElement.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / this.actionScene.renderer.domElement.clientHeight) * 2 + 1;

    return pointer;
  }
}
