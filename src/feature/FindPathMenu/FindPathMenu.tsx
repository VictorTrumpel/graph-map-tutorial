import { useState } from 'react';
import { HouseNode } from '@/shared/HouseGraph/HousesGraph';
import { Card, Input, Flex, Button, Alert, Form } from 'antd';
import { PathPainter } from '@/feature/PathPainter';
import { IndexDB } from '@/IndexDB';
import { PathTree } from './ui/PathTree';
import { getIdsOfPathNodes } from './utils/getIdsOfPathNodes';
import { createPathsMap } from './utils/createPathsMap';
import { PathLine } from '@/shared/PathLine';
import cn from 'classnames';
import './FindPathMenu.css';

export const FindPathMenu = ({ pathPainter }: { pathPainter: PathPainter | null }) => {
  const [pathsMap, setPathsMap] = useState<Map<string, HouseNode[]>>(new Map());

  const [findError, setFindError] = useState('');

  const [activePath, setActivePath] = useState<HouseNode[]>([]);

  const [activePathId, setActivePathId] = useState<string>('');

  const handlePathClick = (nodesPath: HouseNode[]) => {
    if (!pathPainter) return;

    setColorPathOfNodes(activePath, 0x635c5a);
    setColorPathOfNodes(nodesPath, 0x4096ff);

    setActivePathId(nodesPath.map(({ id }) => id).join());
    setActivePath(nodesPath);
  };

  const handleSearchPath = async (values: { from: string; to: string }) => {
    const houseGraph = pathPainter?.housesPathGraph;

    if (!houseGraph) return;

    const db = new IndexDB();

    const housesInfo = await db.getAllHousesInfo();

    const { nodeFromId, nodeToId } = getIdsOfPathNodes(values.from, values.to, housesInfo);

    const nodeFrom = houseGraph.map.get(nodeFromId);
    const nodeTo = houseGraph.map.get(nodeToId);

    const hasPath = nodeFrom && nodeTo;

    if (!hasPath) {
      setFindError('Маршрут не найден');
      return;
    }

    const possiblePaths = houseGraph.getAllPaths(nodeFrom, nodeTo);
    const pathsMap = createPathsMap(possiblePaths);

    setPathsMap(pathsMap);
    setFindError(possiblePaths.length === 0 ? 'Маршрут не найден' : '');
  };

  const setColorPathOfNodes = (houseNodes: HouseNode[], color: number) => {
    const meshes: PathLine[] = [];

    if (!pathPainter) return meshes;

    for (let i = 0; i < houseNodes.length - 1; i++) {
      const currentNode = houseNodes[i];
      const nextNode = houseNodes[i + 1];

      const pathMesh =
        pathPainter.pathMap.get(`${currentNode.id}-${nextNode.id}`) ||
        pathPainter.pathMap.get(`${nextNode.id}-${currentNode.id}`);

      if (!pathMesh) continue;

      pathMesh.setColor(color);
    }

    return meshes;
  };

  if (!pathPainter) return <></>;

  return (
    <Card rootClassName='find-path-container' title='Найти маршрут'>
      <Form onFinish={handleSearchPath}>
        <Flex gap='middle' vertical>
          <Form.Item
            name='from'
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: 'Поле обязательное' }]}
          >
            <Input placeholder='откуда' />
          </Form.Item>

          <Form.Item
            name='to'
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: 'Поле обязательное' }]}
          >
            <Input placeholder='куда' />
          </Form.Item>

          <Button htmlType='submit' type='primary'>
            Найти
          </Button>
        </Flex>
      </Form>

      {findError ? (
        <Alert type='info' message={findError} style={{ marginTop: '20px' }} />
      ) : (
        <div className='paths-list-container'>
          {[...pathsMap.entries()].map(([pathId, path]) => (
            <Alert
              key={pathId}
              onClick={() => handlePathClick(path)}
              className={cn('path-container', { active: pathId === activePathId })}
              description={<PathTree path={path} housesMap={pathPainter.housesMap} />}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
