import { ChangeEvent, useState } from 'react';
import { Button, Input, Form } from 'antd';
import { House } from '../House';
import './HouseLabel.css';

type PropsType = {
  house: House;
};

export const HouseLabel = ({ house }: PropsType) => {
  const [isMount, setIsMount] = useState(house.isMount);

  const handleSaveHouse = () => {
    house.mountHouse();
    setIsMount(true);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    house.name = name;
  };

  return (
    <Form className='house-label' onFinish={handleSaveHouse}>
      <Input
        disabled={isMount}
        className='input-house-address'
        defaultValue={house.name}
        placeholder='Адрес'
        onChange={handleNameChange}
      />
      {!isMount && (
        <Button
          htmlType='submit'
          onSubmit={() => console.log('gdsgsd')}
          onPointerDown={handleSaveHouse}
        >
          Сохранить
        </Button>
      )}
    </Form>
  );
};
