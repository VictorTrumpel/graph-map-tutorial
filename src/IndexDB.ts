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

  handleSuccessOpened = () => {
    this.db = this.openRequest.result;
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

    const tx = this.db.transaction(this.name, 'readwrite');
    const store = tx.objectStore(this.name);
    store.add(info);
  }
}
