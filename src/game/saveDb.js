const DB_NAME = 'basketball-world-chronicle';
const DB_VERSION = 2;
const SAVE_STORE = 'save-slots';
const META_STORE = 'save-metadata';
// v1.04: saves are stored as gzip-compressed JSON (about 9x smaller than the raw
// structured clone). Older saves stored the universe object directly and still load.
const COMPRESSED_FORMAT = 'gzip-json-v1';

async function compressUniverse(universe) {
  if (typeof CompressionStream === 'undefined' || typeof Blob === 'undefined' || typeof Response === 'undefined') return null;
  const stream = new Blob([JSON.stringify(universe)]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(stream).blob();
}
async function decompressUniverse(blob) {
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(SAVE_STORE)) {
        database.createObjectStore(SAVE_STORE, { keyPath: 'slot' });
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: 'slot' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open save database.'));
  });
}

function requestResult(request, fallbackMessage) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(fallbackMessage));
  });
}

export async function listSaveSlots() {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(META_STORE, 'readonly');
    return await requestResult(transaction.objectStore(META_STORE).getAll(), 'Unable to read save metadata.');
  } finally {
    database.close();
  }
}

export async function loadSaveSlot(slot) {
  const database = await openDatabase();
  try {
    const transaction = database.transaction([SAVE_STORE, META_STORE], 'readonly');
    const [save, metadata] = await Promise.all([
      requestResult(transaction.objectStore(SAVE_STORE).get(slot), 'Unable to load the selected save.'),
      requestResult(transaction.objectStore(META_STORE).get(slot), 'Unable to load save metadata.'),
    ]);
    if (!save) return null;
    if (save.format === COMPRESSED_FORMAT) {
      const { data, ...rest } = save;
      return { ...metadata, ...rest, universe: await decompressUniverse(data) };
    }
    return { ...metadata, ...save };
  } finally {
    database.close();
  }
}

export async function writeSaveSlot(slot, name, universe) {
  const metadata = {
    slot,
    name: name || `Chronicle ${slot}`,
    year: universe.year,
    week: universe.week,
    phase: universe.phase,
    yearReview: Boolean(universe.yearReview),
    version: universe.version ?? 7,
    updatedAt: Date.now(),
  };
  // Compress before the transaction opens: IndexedDB transactions auto-commit
  // as soon as the event loop is awaited.
  const packed = await compressUniverse(universe).catch(() => null);
  const record = packed ? { slot, format: COMPRESSED_FORMAT, data: packed } : { slot, universe };
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction([SAVE_STORE, META_STORE], 'readwrite');
      transaction.objectStore(SAVE_STORE).put(record);
      transaction.objectStore(META_STORE).put(metadata);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Save transaction failed.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Save transaction was aborted.'));
    });
    return metadata;
  } finally {
    database.close();
  }
}

export async function deleteSaveSlot(slot) {
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction([SAVE_STORE, META_STORE], 'readwrite');
      transaction.objectStore(SAVE_STORE).delete(slot);
      transaction.objectStore(META_STORE).delete(slot);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Delete transaction failed.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Delete transaction was aborted.'));
    });
  } finally {
    database.close();
  }
}
