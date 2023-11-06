import { Button } from 'antd';
import { MainFlowScene } from '../scene/MainFlowScene';
import './HouseMenu.css';

export const HouseMenu = ({ scene }: { scene: MainFlowScene }) => {
  const handleClick = (title: string) => {
    scene.mountDraftHouseOnScene(title);
  };

  return (
    <ul className='houses-menu'>
      <Button onClick={() => handleClick('castle')}>Замок</Button>
      <Button onClick={() => handleClick('pizzashop')}>Пиццерия</Button>
      <Button onClick={() => handleClick('shack')}>Лачуга</Button>
      <Button onClick={() => handleClick('woodhouse')}>Изба</Button>
    </ul>
  );
};
