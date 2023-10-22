export class IndexDB {
  private name = 'houses';
  private version = 3;

  private openRequest: IDBOpenDBRequest;

  handleSuccessOpened = () => {};

  handleUpgradeNeeded = () => {
    const db = this.openRequest.result;

    db.createObjectStore(this.name, { keyPath: 'id' });
  };

  constructor() {
    this.openRequest = indexedDB.open(this.name, this.version);

    this.openRequest.onupgradeneeded = this.handleUpgradeNeeded;

    this.openRequest.onsuccess = this.handleSuccessOpened;
  }
}
