export class HouseNode {
  readonly id: string;
  readonly children: Set<HouseNode>;
  readonly childrenIds: Set<string>;

  constructor(id: string) {
    this.id = id;
    this.children = new Set();
    this.childrenIds = new Set();
  }
}

export class HousesGraph {
  readonly graph: Map<string, HouseNode> = new Map();

  addChildren(node1: HouseNode, node2: HouseNode) {
    if (node1.childrenIds.has(node2.id)) {
      return;
    }

    node1.children.add(node2);
    node2.children.add(node1);

    node1.childrenIds.add(node2.id);
    node2.childrenIds.add(node1.id);

    this.graph.set(node1.id, node1);
    this.graph.set(node2.id, node2);
  }

  hasPath(startNode: HouseNode, nodeToFind: HouseNode) {
    const visitedNodes = new Set<string>();

    const queue = [startNode];

    while (queue.length) {
      const node = queue.pop();

      if (node === undefined) break;

      if (visitedNodes.has(node.id)) continue;

      if (node.id === nodeToFind.id) {
        return true;
      }

      visitedNodes.add(node.id);

      queue.push(...node.children);
    }

    return false;
  }

  getPath(node1: HouseNode, node2: HouseNode) {}
}
