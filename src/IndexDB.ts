type TableCols = {
  id: string;
  positionX: number;
  positionZ: number;
  assetTitle: string;
};

export class IndexDB {
  private name = 'houses';

  private version = 3;

  private openRequest!: IDBOpenDBRequest;

  private db: IDBDatabase | null = null;

  static _INSTANСE: null | IndexDB = null;

  onSuccessOpened: (() => void) | null = null;

  handleSuccessOpened = () => {
    this.db = this.openRequest.result;
    this.onSuccessOpened?.();
  };

  handleUpgradeNeeded = () => {
    const db = this.openRequest.result;

    db.createObjectStore(this.name, { keyPath: 'id' });

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

    const transaction = this.db.transaction(this.name, 'readwrite');
    const store = transaction.objectStore(this.name);
    store.add(info);
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
}
