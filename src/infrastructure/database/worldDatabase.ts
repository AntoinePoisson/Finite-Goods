import { catalog } from '../../domain/catalog';
import type { World } from '../../domain/types';

const databaseName = 'finite-goods-v6';
const storeName = 'state';
const worldKey = 'world';

export class VersionConflictError extends Error {}

export function initialWorld(): World {
  return {
    objects: catalog.map((item) => ({ id: item.id, status: 'AVAILABLE', version: 1 })),
    orders: [],
    events: [],
    version: 1
  };
}

export async function readWorld(): Promise<World> {
  const database = await openDatabase();
  const current = await request<World | undefined>(
    database.transaction(storeName).objectStore(storeName).get(worldKey)
  );
  if (current) return current;

  const seeded = initialWorld();
  await putWorld(database, seeded);
  return seeded;
}

export async function writeWorld(world: World, expectedVersion: number) {
  const database = await openDatabase();
  const transaction = database.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  const current = await request<World | undefined>(store.get(worldKey));

  // This optimistic check is the safety net for browsers without Web Locks.
  if (current && current.version !== expectedVersion) {
    transaction.abort();
    throw new VersionConflictError('The local state changed in another tab.');
  }

  store.put(world, worldKey);
  await transactionDone(transaction);
}

export async function resetWorld() {
  const database = await openDatabase();
  const seeded = initialWorld();
  await putWorld(database, seeded);
  return seeded;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    // The database name changes when the catalogue shape changes; schema version 1 stays enough.
    const open = indexedDB.open(databaseName, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(storeName);
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error ?? new Error('Could not open the local database.'));
  });
}

async function putWorld(database: IDBDatabase, world: World) {
  const transaction = database.transaction(storeName, 'readwrite');
  transaction.objectStore(storeName).put(world, worldKey);
  await transactionDone(transaction);
}

function request<T>(operation: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error ?? new Error('Local database request failed.'));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Local database transaction failed.'));
    transaction.onabort = () =>
      reject(transaction.error ?? new VersionConflictError('Local transaction aborted.'));
  });
}
