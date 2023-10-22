import { Button } from 'antd';
import { LoadAssetsScene } from './scene/LoadAssetsScene';

export const HouseMenu = ({ scene }: { scene: LoadAssetsScene }) => {
  const handleClick = (title: string) => {
    scene.createHouse(title);
  };

  return (
    <ul>
      <Button onClick={() => handleClick('castle')}>Замок</Button>
      <Button onClick={() => handleClick('pizzashop')}>Пиццерия</Button>
      <Button onClick={() => handleClick('shack')}>Лачуга</Button>
      <Button onClick={() => handleClick('woodhouse')}>Изба</Button>
    </ul>
  );
};
