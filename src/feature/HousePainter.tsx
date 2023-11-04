import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { House } from '@/shared/House';
import { IActionScene } from '@/IActionScene';
import { IndexDB } from '@/IndexDB';
import { assetsConfig } from '@/constants/assetsConfig';

export class HousePainter {
  private actionScene: IActionScene;
  private indexDb: IndexDB = new IndexDB();
  private assetMap: Map<string, GLTF>;

  readonly housesMap = new Map<string, House>();

  constructor(actionScene: IActionScene, assetMap: Map<string, GLTF>) {
    this.actionScene = actionScene;
    this.assetMap = assetMap;

    this.mountHousesFromIndexDb();
  }

  private handleMountHouse = (house: House, title: string) => {
    this.housesMap.set(house.id, house);

    this.indexDb.saveHouseInfo({
      id: house.id,
      positionX: house.model.position.x,
      positionZ: house.model.position.z,
      assetTitle: title,
      houseName: house.name,
    });
  };

  mountDraftHouseOnScene(assetTitle: string) {
    const house = this.createHouseByAssetTitle(assetTitle);

    if (!house) return;

    house.createSphereController();
    house.createHouseLabel();

    house.onMount = () => this.handleMountHouse(house, assetTitle);

    this.actionScene.scene.add(house.model);
  }

  private async mountHousesFromIndexDb() {
    const housesInfo = await this.indexDb.getAllHousesInfo();

    for (const info of housesInfo) {
      const house = this.createHouseByAssetTitle(info.assetTitle, info.id);

      if (!house) continue;

      house.name = info.houseName;

      this.actionScene.scene.add(house.model);

      this.housesMap.set(house.id, house);

      house.model.position.x = info.positionX;
      house.model.position.z = info.positionZ;

      house.createHouseLabel();

      house.mountHouse();
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
}
