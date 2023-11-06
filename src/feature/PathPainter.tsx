import { HousesGraph } from '@/HouseGraph/HousesGraph';
import { IndexDB } from '@/IndexDB';
import { PathLine } from '@/shared/PathLine';
import { House } from '@/shared/House';
import { HouseNode } from '@/HouseGraph/HousesGraph';
import { Camera, Raycaster, Scene, Vector2, Renderer } from 'three';
import { IActionScene } from '@/IActionScene';

export class PathPainter {
  housesPathGraph = new HousesGraph();

  private indexDb: IndexDB = new IndexDB();
  private raycaster: Raycaster = new Raycaster();

  private scene: Scene;
  private camera: Camera;
  private renderer: Renderer;
  private ground: IActionScene['ground'];

  readonly housesMap: Map<string, House>;

  private fromHouse: House | null = null;
  private pathLine: PathLine | null = null;

  constructor(actionScene: IActionScene, housesMap: Map<string, House>) {
    this.scene = actionScene.scene;
    this.camera = actionScene.camera;
    this.renderer = actionScene.renderer;
    this.ground = actionScene.ground;
    this.housesMap = housesMap;

    window.addEventListener('dblclick', this.handleWindowDbClick);

    this.mountPathsFromIndexDb();
  }

  mountPathFromTo(houseFrom: House, houseTo: House) {
    const pathLine = new PathLine();

    pathLine.setFromTo(
      [houseFrom.model.position.x, 0, houseFrom.model.position.z],
      [houseTo.model.position.x, 0, houseTo.model.position.z]
    );

    this.scene.add(pathLine);
  }

  private handleWindowDbClick = (event: MouseEvent) => {
    const pointer = this.getPointerPosition(event);

    this.raycaster.setFromCamera(pointer, this.camera);

    const firstIntersect = this.raycaster.intersectObjects(this.scene.children, true)[0];

    const house = firstIntersect?.object?.userData;

    if (house instanceof House) {
      this.pickHouse(house);
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.pathLine) {
      this.scene.remove(this.pathLine);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
  };

  private handleMouseMove = (event: PointerEvent) => {
    if (!this.pathLine || !this.fromHouse) return;

    const pointer = this.getPointerPosition(event);

    this.aimPathLine(pointer);
  };

  private pickHouse(house: unknown) {
    const isRealHouse = house instanceof House;

    if (!isRealHouse || !house.isMount) return;

    const hasPointFrom = Boolean(this.fromHouse && this.pathLine);

    if (this.fromHouse !== house && hasPointFrom && this.fromHouse) {
      const fromPosition = this.fromHouse.model.position;
      const toPosition = house.model.position;

      this.pathLine!.setFromTo(
        [fromPosition.x, 0, fromPosition.z],
        [toPosition.x, 0, toPosition.z]
      );

      const houseNode1 =
        this.housesPathGraph.graph.get(this.fromHouse.id) || new HouseNode(this.fromHouse.id);
      const houseNode2 = this.housesPathGraph.graph.get(house.id) || new HouseNode(house.id);

      this.housesPathGraph.addChildren(houseNode1, houseNode2);

      this.fromHouse = null;
      this.pathLine = null;

      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('pointermove', this.handleMouseMove);

      this.indexDb.saveHousesGraph(this.housesPathGraph);

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

  private async mountPathsFromIndexDb() {
    const housesGraph = await this.indexDb.getHousesPaths();

    if (!housesGraph) return;

    this.housesPathGraph = new HousesGraph(housesGraph.graph);

    const graph = this.housesPathGraph.graph;

    const queue = [...graph.values()];

    const visitedNodes = new Set<string>();

    while (queue.length) {
      const node = queue.pop();

      if (node === undefined) break;

      if (visitedNodes.has(node.id)) continue;

      visitedNodes.add(node.id);

      const parentHouse = this.housesMap.get(node.id);

      if (!parentHouse) continue;

      for (const childNode of node.children) {
        const childHouse = this.housesMap.get(childNode.id);

        if (!childHouse || visitedNodes.has(childNode.id)) continue;

        this.mountPathFromTo(parentHouse, childHouse);
      }

      queue.push(...node.children);
    }
  }

  private aimPathLine(pointer: Vector2) {
    if (!this.fromHouse || !this.pathLine) {
      throw new Error('Need fromHouse to aim');
    }

    this.raycaster.setFromCamera(pointer, this.camera);

    const intersects = this.raycaster.intersectObject(this.ground)[0];

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
