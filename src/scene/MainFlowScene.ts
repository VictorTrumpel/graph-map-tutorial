import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { IActionScene } from '@/IActionScene';
import { PathPainter } from '@/feature/PathPainter';
import { HousePainter } from '@/feature/HousePainter';

export class MainFlowScene {
  private actionScene: IActionScene;

  private assetMap: Map<string, GLTF>;

  private housePainter: HousePainter | null = null;

  pathPainter: PathPainter | null = null;

  constructor(actionScene: IActionScene, assetMap: Map<string, GLTF>) {
    this.assetMap = assetMap;
    this.actionScene = actionScene;
  }

  async start() {
    const housePainter = new HousePainter(this.actionScene, this.assetMap);
    this.housePainter = housePainter;
    this.pathPainter = new PathPainter(this.actionScene, housePainter.housesMap);
  }

  mountDraftHouseOnScene(assetTitle: string) {
    this.housePainter?.mountDraftHouseOnScene(assetTitle);
  }
}
