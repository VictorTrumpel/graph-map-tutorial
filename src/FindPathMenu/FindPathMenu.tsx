import { Card, Input, Flex, Button } from 'antd';
import { PathPainter } from '@/feature/PathPainter';
import './FindPathMenu.css';

export const FindPathMenu = ({ pathPainter }: { pathPainter: PathPainter | null }) => {
  const handleFindPath = () => {};

  if (!pathPainter) return <></>;

  return (
    <Card rootClassName='find-path-container' title='Построить маршрут'>
      <Flex gap='middle' vertical>
        <Input placeholder='откуда' />
        <Input placeholder='куда' />
        <Button type='primary'>Найти</Button>
      </Flex>
    </Card>
  );
};
