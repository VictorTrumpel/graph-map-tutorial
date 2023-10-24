export class HouseNode {
  readonly id: string;
  readonly children: Set<HouseNode>;

  constructor(id: string) {
    this.id = id;
    this.children = new Set();
  }
}

export class HousesGraph {
  graph: Map<string, HouseNode> = new Map();

  addChildren(node1: HouseNode, node2: HouseNode) {
    node1.children.add(node2);
    node2.children.add(node1);

    this.graph.set(node1.id, node1);
    this.graph.set(node2.id, node2);
  }

  hasPath(node1: HouseNode, node2: HouseNode) {
    
  }

  getPath(node1: HouseNode, node2: HouseNode) {}
}
