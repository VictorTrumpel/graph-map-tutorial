import { useMemo } from 'react';
import { House } from '@/shared/House';
import { HouseNode } from '@/shared/HouseGraph/HousesGraph';
import { Steps } from 'antd';

export const PathTree = ({
  path,
  housesMap,
}: {
  housesMap: Map<string, House>;
  path: HouseNode[];
}) => {
  const items = useMemo(() => {
    return path.map(({ id }) => ({ title: housesMap.get(id)?.name }));
  }, [path]);

  return <Steps direction='vertical' items={items} />;
};
