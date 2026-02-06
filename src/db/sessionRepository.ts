import { getDatabase } from './database';
import type { Session, SessionWithCount } from '../models/types';

export async function getAllSessions(): Promise<SessionWithCount[]> {
  const db = await getDatabase();
  return db.getAllAsync<SessionWithCount>(`
    SELECT s.*, COALESCE(c.order_count, 0) as order_count
    FROM sessions s
    LEFT JOIN (
      SELECT session_id, COUNT(*) as order_count
      FROM orders
      GROUP BY session_id
    ) c ON s.id = c.session_id
    ORDER BY s.date DESC
  `);
}

export async function getSessionById(id: number): Promise<Session | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Session>('SELECT * FROM sessions WHERE id = ?', [id]);
}

export async function createSession(date: string, pricePerKg: number): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO sessions (date, price_per_kg) VALUES (?, ?)',
    [date, pricePerKg]
  );
  return result.lastInsertRowId;
}

export async function updateSession(
  id: number,
  date: string,
  pricePerKg: number,
  status: 'active' | 'completed'
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE sessions SET date = ?, price_per_kg = ?, status = ? WHERE id = ?',
    [date, pricePerKg, status, id]
  );
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM orders WHERE session_id = ?', [id]);
  await db.runAsync('DELETE FROM turkeys WHERE session_id = ?', [id]);
  await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
}
