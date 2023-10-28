import { Scene } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { IActionScene } from '@/IActionScene';
import { House } from '@/shared/House';
import { IndexDB } from '@/IndexDB';
import { PathRenderer } from '@/feature/PathRenderer';

export class MainFlowScene {
  private actionScene: IActionScene;

  private scene: Scene;

  private assetMap: Map<string, GLTF>;

  private indexDb: IndexDB = new IndexDB();

  private housesMap = new Map<string, House>();

  private handleMountHouse = (house: House, title: string) => {
    this.housesMap.set(house.id, house);

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
  }

  async start() {
    await this.mountHousesFromIndexDb();
    new PathRenderer(this.actionScene, this.housesMap);
  }

  mountDraftHouseOnScene(assetTitle: string) {
    const house = this.createHouseByAssetTitle(assetTitle);

    if (!house) return;

    house.onMount = () => this.handleMountHouse(house, assetTitle);

    this.scene.add(house.model);
  }

  private async mountHousesFromIndexDb() {
    const housesInfo = await this.indexDb.getAllHousesInfo();

    for (const info of housesInfo) {
      const house = this.createHouseByAssetTitle(info.assetTitle, info.id);

      if (!house) continue;

      this.scene.add(house.model);

      this.housesMap.set(house.id, house);

      house.model.position.x = info.positionX;
      house.model.position.z = info.positionZ;

      house.mountHouse();
    }
  }

  private createHouseByAssetTitle(assetTitle: string, id?: string) {
    const houseGLTF = this.assetMap.get(assetTitle);

    if (!houseGLTF) return null;

    const houseModel = houseGLTF.scene.clone(true);

    const house = new House(this.actionScene, houseModel, id);

    return house;
  }
}
