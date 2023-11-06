import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { IActionScene } from '@/IActionScene';
import { PathPainter } from '@/feature/PathPainter';
import { HousePainter } from '@/feature/HousePainter';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { Vector3, Color, SRGBColorSpace } from 'three';
import * as GeometryUtils from 'three/examples/jsm/utils/GeometryUtils';

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

    // const geometry = new LineGeometry();
    // geometry.setPositions([1, 1, 1, 5, 5, 5]);
    // geometry.setColors([1, 1, 1, 1, 1, 1]);

    // const matLine = new LineMaterial({
    //   color: 0xeb6246,
    //   linewidth: 0.01,
    //   vertexColors: true,
    // });

    // const line = new Line2(geometry, matLine);

    // this.actionScene.scene.add(line);
  }

  mountDraftHouseOnScene(assetTitle: string) {
    this.housePainter?.mountDraftHouseOnScene(assetTitle);
  }
}
