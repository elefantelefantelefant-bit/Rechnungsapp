import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const CURRENT_VERSION = 2;

async function needsTableRebuild(database: SQLite.SQLiteDatabase): Promise<boolean> {
  // Check if target_weight still has NOT NULL constraint — if so, rebuild needed
  const cols = await database.getAllAsync<{ name: string; notnull: number }>(
    "PRAGMA table_info(orders)"
  );
  const tw = cols.find((c) => c.name === 'target_weight');
  if (tw && tw.notnull === 1) return true;
  // Also check if portion_type column is missing (never migrated at all)
  if (!cols.some((c) => c.name === 'portion_type')) return true;
  return false;
}

async function rebuildOrdersTable(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.runAsync('PRAGMA foreign_keys = OFF');

  // Drop leftover temp table from any previous failed migration
  await database.runAsync('DROP TABLE IF EXISTS orders_new');

  await database.runAsync(`
    CREATE TABLE orders_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      target_weight REAL,
      portion_type TEXT NOT NULL DEFAULT 'whole',
      size_preference TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      turkey_id INTEGER REFERENCES turkeys(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Copy data — use existing columns, let new columns use defaults
  const cols = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(orders)"
  );
  const colNames = cols.map((c) => c.name);
  const hasPortion = colNames.includes('portion_type');
  const hasSize = colNames.includes('size_preference');

  const selectCols = [
    'id', 'session_id', 'customer_id', 'target_weight', 'status', 'turkey_id', 'created_at',
    ...(hasPortion ? ['portion_type'] : []),
    ...(hasSize ? ['size_preference'] : []),
  ];
  const colList = selectCols.join(', ');

  await database.runAsync(
    `INSERT INTO orders_new (${colList}) SELECT ${colList} FROM orders`
  );

  await database.runAsync('DROP TABLE orders');
  await database.runAsync('ALTER TABLE orders_new RENAME TO orders');
  await database.runAsync('PRAGMA foreign_keys = ON');
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const rebuild = await needsTableRebuild(database);
  if (rebuild) {
    await rebuildOrdersTable(database);
  }
  await database.runAsync(`PRAGMA user_version = ${CURRENT_VERSION}`);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('truthahn.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      price_per_kg REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      target_weight REAL,
      portion_type TEXT NOT NULL DEFAULT 'whole',
      size_preference TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      turkey_id INTEGER REFERENCES turkeys(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS turkeys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      actual_weight REAL NOT NULL,
      order_id INTEGER REFERENCES orders(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((version?.user_version ?? 0) < CURRENT_VERSION) {
    await runMigrations(db);
  }

  return db;
}
