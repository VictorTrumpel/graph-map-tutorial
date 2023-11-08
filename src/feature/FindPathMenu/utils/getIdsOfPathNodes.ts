import { TableCols } from '@/IndexDB';

export const getIdsOfPathNodes = (
  houseNameFrom: string,
  houseNameTo: string,
  housesInfo: TableCols[]
) => {
  return housesInfo.reduce(
    (nodeFromToIds, info) => {
      const { houseName, id } = info;

      const isHouseFrom = houseName === houseNameFrom;
      const isHouseTo = houseName === houseNameTo;

      if (isHouseFrom) {
        nodeFromToIds.nodeFromId = id;
      }

      if (isHouseTo) {
        nodeFromToIds.nodeToId = id;
      }

      return nodeFromToIds;
    },
    { nodeFromId: '', nodeToId: '' }
  );
};
