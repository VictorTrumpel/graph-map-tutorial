import { HousesGraph } from '@/feature/HouseGraph/HousesGraph';
import { IndexDB } from '@/IndexDB';
import { PathLine } from '@/shared/PathLine';
import { House } from '@/shared/House';
import { HouseNode } from '@/feature/HouseGraph/HousesGraph';
import { Vector2, Intersection, Object3D, Event } from 'three';

export class PathPainter {
  housesPathGraph = new HousesGraph();

  private indexDb: IndexDB = new IndexDB();

  readonly housesMap: Map<string, House>;
  readonly pathMap: Map<string, PathLine> = new Map();

  private houseFrom: House | null = null;
  private fromPathLine: PathLine | null = null;

  getPointerPosition = (_: PointerEvent | MouseEvent) => new Vector2();
  getIntersectWithGround: (pointer: Vector2) => Intersection<Object3D<Event>> | null = () => null;
  getIntersectWithScene: (pointer: Vector2) => Intersection<Object3D<Event>>[] | null = () => null;
  addToScene: (element: Object3D<Event>) => void = () => null;
  removeFromScene: (element: Object3D<Event>) => void = () => null;

  constructor(housesMap: Map<string, House>) {
    this.housesMap = housesMap;

    window.addEventListener('dblclick', this.handleWindowDbClick);

    this.mountPathsFromIndexDb();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.fromPathLine) {
      this.houseFrom = null;
      this.removeFromScene(this.fromPathLine);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
  };

  private handleWindowDbClick = (event: MouseEvent) => {
    const pointer = this.getPointerPosition(event);

    const pickedElement = this.getIntersectWithScene(pointer)?.[0];

    const house = pickedElement?.object?.userData;

    const isHouse = house instanceof House;

    if (!isHouse) return;

    const isPathStarted = this.houseFrom === null;

    if (isPathStarted) {
      this.startMountPathFrom(house);

      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('pointermove', this.handleMouseMove);
      return;
    }

    this.finishMountPathTo(house);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('pointermove', this.handleMouseMove);
  };

  private handleMouseMove = (event: PointerEvent) => {
    if (!this.fromPathLine || !this.houseFrom) return;
    const pointer = this.getPointerPosition(event);
    this.aimPathLine(pointer);
  };

  private startMountPathFrom(house: House) {
    this.houseFrom = house;

    this.fromPathLine = new PathLine();
    this.fromPathLine.setFromTo(
      [house.model.position.x, 0, house.model.position.z],
      [house.model.position.x, 0, house.model.position.z]
    );

    this.addToScene(this.fromPathLine);
  }

  private finishMountPathTo(houseTo: House) {
    const houseFrom = this.houseFrom;
    const fromPathLine = this.fromPathLine;

    const houseGraph = this.housesPathGraph.graph;

    const isPathStarted = houseFrom && fromPathLine;

    if (!isPathStarted) return;

    this.houseFrom = null;
    this.fromPathLine = null;

    const hasAlreadyPath =
      this.pathMap.has(`${houseFrom.id}-${houseTo.id}`) ||
      this.pathMap.has(`${houseTo.id}-${houseFrom.id}`);

    if (hasAlreadyPath) {
      this.removeFromScene(fromPathLine);
      return;
    }

    const positionFrom = houseFrom.model.position;
    const positionTo = houseTo.model.position;

    fromPathLine.setFromTo([positionFrom.x, 0, positionFrom.z], [positionTo.x, 0, positionTo.z]);

    const houseNodeFrom = houseGraph.get(houseFrom.id) || new HouseNode(houseFrom.id);
    const houseNodeTo = houseGraph.get(houseTo.id) || new HouseNode(houseTo.id);

    this.pathMap.set(`${houseFrom.id}-${houseTo.id}`, fromPathLine);

    this.housesPathGraph.addChildren(houseNodeFrom, houseNodeTo);

    this.indexDb.saveHousesGraph(this.housesPathGraph);
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

  private mountPathFromTo(houseFrom: House, houseTo: House) {
    const pathLine = new PathLine();

    pathLine.setFromTo(
      [houseFrom.model.position.x, 0, houseFrom.model.position.z],
      [houseTo.model.position.x, 0, houseTo.model.position.z]
    );

    this.pathMap.set(`${houseFrom.id}-${houseTo.id}`, pathLine);

    this.addToScene(pathLine);
  }

  private aimPathLine(pointer: Vector2) {
    if (!this.houseFrom || !this.fromPathLine) {
      throw new Error('Need fromHouse to aim');
    }

    const intersect = this.getIntersectWithGround(pointer);

    if (!intersect) return;

    this.fromPathLine.setFromTo(
      [this.houseFrom.model.position.x, 0, this.houseFrom.model.position.z],
      [intersect.point.x, 0, intersect.point.z]
    );
  }
}
