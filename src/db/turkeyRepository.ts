import { getDatabase } from './database';
import type { Turkey } from '../models/types';

export async function getTurkeysBySession(sessionId: number): Promise<Turkey[]> {
  const db = await getDatabase();
  return db.getAllAsync<Turkey>(
    'SELECT id, session_id, actual_weight, created_at FROM turkeys WHERE session_id = ? ORDER BY created_at DESC',
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

// A turkey is "fully matched" if it has a whole-order OR 2 half-orders pointing to it
export async function getUnmatchedTurkeysBySession(sessionId: number): Promise<Turkey[]> {
  const db = await getDatabase();
  return db.getAllAsync<Turkey>(`
    SELECT t.id, t.session_id, t.actual_weight, t.created_at
    FROM turkeys t
    WHERE t.session_id = ?
      AND t.id NOT IN (
        SELECT o.turkey_id FROM orders o
        WHERE o.turkey_id IS NOT NULL
          AND o.session_id = ?
          AND (
            o.portion_type != 'half'
            OR (SELECT COUNT(*) FROM orders o2 WHERE o2.turkey_id = o.turkey_id AND o2.session_id = ?) >= 2
          )
      )
    ORDER BY t.actual_weight ASC
  `, [sessionId, sessionId, sessionId]);
}

// Turkeys with exactly 1 half-order (room for a second half)
export interface HalfMatchedTurkey extends Turkey {
  paired_customer_name: string;
}

export async function getHalfMatchedTurkeys(sessionId: number): Promise<HalfMatchedTurkey[]> {
  const db = await getDatabase();
  return db.getAllAsync<HalfMatchedTurkey>(`
    SELECT t.id, t.session_id, t.actual_weight, t.created_at, c.name as paired_customer_name
    FROM turkeys t
    JOIN orders o ON o.turkey_id = t.id AND o.portion_type = 'half'
    JOIN customers c ON o.customer_id = c.id
    WHERE t.session_id = ?
    GROUP BY t.id
    HAVING COUNT(o.id) = 1
    ORDER BY t.actual_weight ASC
  `, [sessionId]);
}

export async function getTurkeyForOrder(orderId: number): Promise<Turkey | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Turkey>(
    'SELECT t.id, t.session_id, t.actual_weight, t.created_at FROM turkeys t JOIN orders o ON o.turkey_id = t.id WHERE o.id = ?',
    [orderId]
  );
}
