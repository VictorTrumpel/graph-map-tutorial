import { useState, ChangeEvent, useMemo } from 'react';
import { HouseNode } from '@/feature/HouseGraph/HousesGraph';
import { Card, Input, Flex, Button, Alert, Steps } from 'antd';
import { PathPainter } from '@/feature/PathPainter';
import { IndexDB } from '@/IndexDB';
import { House } from '@/shared/House';
import cn from 'classnames';
import './FindPathMenu.css';

export const FindPathMenu = ({ pathPainter }: { pathPainter: PathPainter | null }) => {
  const [values, setValues] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const [pathsList, setPathsList] = useState<HouseNode[][]>([]);

  const [findError, setFindError] = useState('');

  const [activePath, setActivePath] = useState<HouseNode[]>([]);

  const [activePathId, setActivePathId] = useState<string>('');

  const handleChange = (name: 'from' | 'to', e: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [name]: e.target.value });
  };

  const handlePathClick = (nodesPath: HouseNode[]) => {
    if (!pathPainter) return;

    for (let i = 0; i < activePath.length - 1; i++) {
      const currentNode = activePath[i];
      const nextNode = activePath[i + 1];

      const pathMesh =
        pathPainter.pathMap.get(`${currentNode.id}-${nextNode.id}`) ||
        pathPainter.pathMap.get(`${nextNode.id}-${currentNode.id}`);

      if (!pathMesh) continue;

      pathMesh.setColor(0x635c5a);
    }

    for (let i = 0; i < nodesPath.length - 1; i++) {
      const currentNode = nodesPath[i];
      const nextNode = nodesPath[i + 1];

      const pathMesh =
        pathPainter.pathMap.get(`${currentNode.id}-${nextNode.id}`) ||
        pathPainter.pathMap.get(`${nextNode.id}-${currentNode.id}`);

      if (!pathMesh) continue;

      pathMesh.setColor(0x4096ff);
    }

    setActivePathId(nodesPath.map(({ id }) => id).join());
    setActivePath(nodesPath);
  };

  const handleFindPath = async () => {
    if (!pathPainter) return;

    const db = new IndexDB();

    const housesInfo = await db.getAllHousesInfo();

    const nodeIdsMap = { from: '', to: '' };

    for (let i = 0; i < housesInfo.length; i++) {
      const { houseName, id } = housesInfo[i];

      if (houseName === values.from) {
        nodeIdsMap.from = id;
      }

      if (houseName === values.to) {
        nodeIdsMap.to = id;
      }

      if (nodeIdsMap.from && nodeIdsMap.to) {
        break;
      }
    }

    const nodeFrom = pathPainter.housesPathGraph.graph.get(nodeIdsMap.from);
    const nodeTo = pathPainter.housesPathGraph.graph.get(nodeIdsMap.to);

    const paths =
      nodeFrom && nodeTo ? pathPainter.housesPathGraph.getAllPaths(nodeFrom, nodeTo) : [];

    setPathsList(paths);
    setFindError(paths.length === 0 ? 'Маршрут не найден' : '');
  };

  if (!pathPainter) return <></>;

  return (
    <Card rootClassName='find-path-container' title='Найти маршрут'>
      <form onSubmit={(e) => e.preventDefault()}>
        <Flex gap='middle' vertical>
          <Input
            placeholder='откуда'
            value={values.from}
            onChange={(e) => handleChange('from', e)}
          />
          <Input placeholder='куда' value={values.to} onChange={(e) => handleChange('to', e)} />
          <Button htmlType='submit' type='primary' onClick={handleFindPath}>
            Найти
          </Button>
        </Flex>
      </form>

      {findError ? (
        <Alert type='info' message={findError} style={{ marginTop: '20px' }} />
      ) : (
        <div className='paths-list-container'>
          {pathsList.map((path, id) => {
            const pathId = path.map(({ id }) => id).join();

            return (
              <Alert
                key={pathId}
                onClick={() => handlePathClick(path)}
                className={cn('path-container', { active: pathId === activePathId })}
                description={<Path path={path} housesMap={pathPainter.housesMap} />}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
};

const Path = ({ path, housesMap }: { housesMap: Map<string, House>; path: HouseNode[] }) => {
  const items = useMemo(() => {
    return path.map(({ id }) => ({ title: housesMap.get(id)?.name }));
  }, [path]);

  return <Steps direction='vertical' items={items} />;
};
