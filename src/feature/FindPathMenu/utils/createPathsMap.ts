import { HouseNode } from '@/shared/HouseGraph/HousesGraph';

export const createPathsMap = (pathsMatrix: HouseNode[][]) => {
  return pathsMatrix.reduce((map: Map<string, HouseNode[]>, path) => {
    const pathId = path.map(({ id }) => id).join();
    map.set(pathId, path);
    return map;
  }, new Map<string, HouseNode[]>());
};
