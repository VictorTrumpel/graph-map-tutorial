import { HousesGraph } from './feature/HouseGraph/HousesGraph';

type TableCols = {
  id: string;
  positionX: number;
  positionZ: number;
  assetTitle: string;
  houseName: string;
};

export class IndexDB {
  private name = 'houses';

  private version = 6;

  private openRequest!: IDBOpenDBRequest;

  private db: IDBDatabase | null = null;

  static _INSTANСE: null | IndexDB = null;

  onSuccessOpened: (() => void) | null = null;

  private readonly handleSuccessOpened = () => {
    this.db = this.openRequest.result;
    this.onSuccessOpened?.();
  };

  private readonly handleUpgradeNeeded = () => {
    const db = this.openRequest.result;

    if (!db.objectStoreNames.contains('houses')) {
      db.createObjectStore(this.name, { keyPath: 'id' });
    }

    if (!db.objectStoreNames.contains('housesPaths')) {
      db.createObjectStore('housesPaths');
    }

    this.db = db;
  };

  constructor() {
    if (IndexDB._INSTANСE === null) {
      this.openRequest = indexedDB.open(this.name, this.version);

      this.openRequest.onupgradeneeded = this.handleUpgradeNeeded;

      this.openRequest.onsuccess = this.handleSuccessOpened;

      IndexDB._INSTANСE = this;

      return;
    }

    return IndexDB._INSTANСE;
  }

  saveHouseInfo(info: TableCols) {
    if (!this.db) return;

    const transaction = this.db.transaction('houses', 'readwrite');
    const store = transaction.objectStore('houses');
    store.add(info);
  }

  saveHousesGraph(housesGraph: HousesGraph) {
    if (!this.db) return;
    const transaction = this.db.transaction('housesPaths', 'readwrite');
    const store = transaction.objectStore('housesPaths');
    store.delete('paths');
    store.add(housesGraph, 'paths');
  }

  getAllHousesInfo(): Promise<TableCols[]> {
    return new Promise((res) => {
      if (!this.db) {
        res([]);
        return;
      }

      const transaction = this.db.transaction(this.name, 'readwrite');
      const store = transaction.objectStore(this.name);

      const request = store.getAll();

      request.onsuccess = (event) => {
        const target = event.target as unknown as { result: TableCols[] };
        res(target.result);
        return;
      };

      request.onerror = () => {
        res([]);
      };
    });
  }

  getHousesPaths(): Promise<HousesGraph | undefined> {
    return new Promise((res) => {
      if (!this.db) {
        res(undefined);
        return;
      }

      const transaction = this.db.transaction('housesPaths', 'readwrite');
      const store = transaction.objectStore('housesPaths');

      const request = store.getAll();

      request.onsuccess = (event) => {
        const target = event.target as unknown as { result: HousesGraph[] };
        res(target.result[0]);
        return;
      };

      request.onerror = () => {
        res(undefined);
      };
    });
  }
}
