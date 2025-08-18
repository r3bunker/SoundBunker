import type { Chapter } from '../types';

export interface StoredAudiobook {
    key: string; // filename
    title: string;
    author: string;
    narrator: string;
    cover: string;
    chapters: Chapter[];
    fileBuffer: ArrayBuffer;
}

const DB_NAME = 'SmartAudiobookPlayerDB';
const DB_VERSION = 1;
const STORE_NAME = 'audiobooks';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event);
            reject('Error opening DB');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
};

export const addBook = async (book: StoredAudiobook): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(book);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error('Error adding book to DB:', event);
            reject('Error adding book');
        };
    });
};

export const getBook = async (key: string): Promise<StoredAudiobook | undefined> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest).result);
        };
        request.onerror = (event) => {
            console.error('Error getting book from DB:', event);
            reject('Error getting book');
        };
    });
};

export const getAllBooks = async (): Promise<Omit<StoredAudiobook, 'fileBuffer'>[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            const books = (event.target as IDBRequest).result.map((book: StoredAudiobook) => {
                const { fileBuffer, ...bookWithoutBuffer } = book;
                return bookWithoutBuffer;
            });
            resolve(books);
        };
        request.onerror = (event) => {
            console.error('Error getting all books from DB:', event);
            reject('Error getting all books');
        };
    });
};