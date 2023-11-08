import { HousesGraph, HouseNode } from './HousesGraph';

test('adds 1 + 2 to equal 3', () => {
  expect(Boolean(new HousesGraph())).toBe(true);
});

describe('Тестирование метода addChildren', () => {
  test(`
    При добавлении ребенка к ноде устанавливается двунаправленная связь. 
    Обе ноды есть друг у друга в детях. 
    Если между нодами уже есть связь, то ничего не происходит.
  `, () => {
    const houseGraph = new HousesGraph();

    const house1 = new HouseNode('1');
    const house2 = new HouseNode('2');
    const house3 = new HouseNode('3');

    houseGraph.addChildren(house1, house2);
    expect(house1.children.size).toBe(1);
    expect(house2.children.size).toBe(1);
    expect(house1.childrenIds.has(house2.id)).toBe(true);
    expect(house2.childrenIds.has(house1.id)).toBe(true);
    expect(houseGraph.map.get(house1.id)).toBe(house1);
    expect(houseGraph.map.get(house2.id)).toBe(house2);

    houseGraph.addChildren(house1, house3);
    expect(house1.children.size).toBe(2);
    expect(house3.children.size).toBe(1);
    expect(house1.childrenIds.has(house3.id)).toBe(true);
    expect(house3.childrenIds.has(house1.id)).toBe(true);
    expect(houseGraph.map.get(house1.id)).toBe(house1);
    expect(houseGraph.map.get(house2.id)).toBe(house2);
    expect(houseGraph.map.get(house3.id)).toBe(house3);

    houseGraph.addChildren(house1, house2);
    expect(house1.children.size).toBe(2);
  });
});

describe('Тестирование метода hasPath', () => {
  test(`
    Если между нодами есть путь, то возвращает true, если пути нет - false.
  `, () => {
    const houseGraph = new HousesGraph();

    const house1 = new HouseNode('1');
    const house2 = new HouseNode('2');
    const house3 = new HouseNode('3');
    const house4 = new HouseNode('4');
    const house5 = new HouseNode('5');

    const house6 = new HouseNode('6');

    houseGraph.addChildren(house1, house2);
    houseGraph.addChildren(house1, house3);
    houseGraph.addChildren(house2, house4);
    houseGraph.addChildren(house4, house3);
    houseGraph.addChildren(house4, house5);
    houseGraph.addChildren(house5, house1);

    expect(houseGraph.hasPath(house1, house5)).toBe(true);
    expect(houseGraph.hasPath(house1, house3)).toBe(true);
    expect(houseGraph.hasPath(house1, house2)).toBe(true);
    expect(houseGraph.hasPath(house1, house4)).toBe(true);
    expect(houseGraph.hasPath(house1, house1)).toBe(true);
    expect(houseGraph.hasPath(house1, house6)).toBe(false);

    expect(houseGraph.hasPath(house5, house3)).toBe(true);
    expect(houseGraph.hasPath(house5, house4)).toBe(true);
    expect(houseGraph.hasPath(house5, house2)).toBe(true);
    expect(houseGraph.hasPath(house5, house6)).toBe(false);
  });

  describe('Тестирование метода dfsFindPaths', () => {
    test(`
      Возвращает все возможные пути между A и D
    `, () => {
      const houseGraph = new HousesGraph();

      const a = new HouseNode('A');
      const b = new HouseNode('B');
      const c = new HouseNode('C');
      const d = new HouseNode('D');
      const e = new HouseNode('E');
      const k = new HouseNode('K');

      houseGraph.addChildren(a, b);
      houseGraph.addChildren(a, k);
      houseGraph.addChildren(b, k);
      houseGraph.addChildren(b, c);
      houseGraph.addChildren(b, d);
      houseGraph.addChildren(c, d);
      houseGraph.addChildren(c, e);
      houseGraph.addChildren(e, d);

      const paths = houseGraph.getAllPaths(a, d);

      const existingPaths = [
        [a, b, c, d],
        [a, b, c, e, d],
        [a, b, d],
        [a, k, b, c, d],
        [a, k, b, c, e, d],
        [a, k, b, d],
      ];

      expect(paths.length).toBe(6);

      for (let i = 0; i < existingPaths.length; i++) {
        const path = paths[i];
        const existPath = existingPaths[i];

        for (let j = 0; j < existPath.length; j++) {
          if (existPath[j] !== path[j]) {
            throw new Error(`результаты отличаются на i=${i} j=${j}`);
          }
        }
      }
    });
  });
});
