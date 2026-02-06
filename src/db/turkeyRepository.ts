import { getDatabase } from './database';
import type { Turkey } from '../models/types';

export async function getTurkeysBySession(sessionId: number): Promise<Turkey[]> {
  const db = await getDatabase();
  return db.getAllAsync<Turkey>(
    'SELECT * FROM turkeys WHERE session_id = ? ORDER BY created_at DESC',
    [sessionId]
  );
}

export async function createTurkey(sessionId: number, weight: number): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO turkeys (session_id, actual_weight) VALUES (?, ?)',
    [sessionId, weight]
  );
  return result.lastInsertRowId;
}

export async function deleteTurkey(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM turkeys WHERE id = ?', [id]);
}

export async function getUnmatchedTurkeysBySession(sessionId: number): Promise<Turkey[]> {
  const db = await getDatabase();
  return db.getAllAsync<Turkey>(
    'SELECT * FROM turkeys WHERE session_id = ? AND order_id IS NULL ORDER BY actual_weight ASC',
    [sessionId]
  );
}

export async function getTurkeyForOrder(orderId: number): Promise<Turkey | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Turkey>(
    'SELECT * FROM turkeys WHERE order_id = ?',
    [orderId]
  );
}
