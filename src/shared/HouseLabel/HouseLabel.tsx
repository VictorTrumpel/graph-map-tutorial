import { ChangeEvent, useState } from 'react';
import { Button, Input, Form, Spin } from 'antd';
import { House } from '../House';
import { IndexDB } from '@/IndexDB';
import { useDebounce } from '../hooks/useDebounce';
import cn from 'classnames';
import './HouseLabel.css';

type PropsType = {
  house: House;
};

export const HouseLabel = ({ house }: PropsType) => {
  const [isMount, setIsMount] = useState(house.isMount);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(house.name);

  const handleSaveHouse = async () => {
    const nameIsEmpty = !Boolean(title);

    if (nameIsEmpty) {
      setError('Имя не может быть пустым');
      return;
    }

    if (error) return;
    house.saveHouse();
    setIsMount(true);
  };

  const checkIsNameUniq = useDebounce(async (name: string) => {
    const db = new IndexDB();

    const houses = await db.getAllHousesInfo();

    const nameIsTaken = houses.some(({ houseName }) => houseName === name);

    if (nameIsTaken) {
      setError('имя уже занято');
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(false);
  }, 300);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const name = e.target.value;
    setTitle(name);
    house.name = name;
    checkIsNameUniq(name);
  };

  return (
    <Form className='house-label' onFinish={handleSaveHouse}>
      <Form.Item className='input-house-address-container' rules={[{ required: true }]}>
        <Input
          disabled={isMount}
          className={cn('input-house-address')}
          placeholder='Адрес'
          value={title}
          status={error ? 'error' : ''}
          onChange={handleNameChange}
          suffix={loading ? <Spin size='small' /> : <></>}
        />
        {error && <div className='ant-form-item-explain-error'>{error}</div>}
      </Form.Item>

      {!isMount && (
        <Button
          disabled={loading || Boolean(error)}
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
