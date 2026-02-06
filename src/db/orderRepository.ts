import { getDatabase } from './database';
import type { Order, OrderWithCustomer, OrderWithCustomerAndTurkey } from '../models/types';

export async function getOrdersBySession(sessionId: number): Promise<OrderWithCustomer[]> {
  const db = await getDatabase();
  return db.getAllAsync<OrderWithCustomer>(`
    SELECT o.*, c.name as customer_name, c.phone as customer_phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.session_id = ?
    ORDER BY o.created_at DESC
  `, [sessionId]);
}

export async function getOrderById(id: number): Promise<Order | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Order>('SELECT * FROM orders WHERE id = ?', [id]);
}

export async function createOrder(
  sessionId: number,
  customerId: number,
  targetWeight: number
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO orders (session_id, customer_id, target_weight) VALUES (?, ?, ?)',
    [sessionId, customerId, targetWeight]
  );
  return result.lastInsertRowId;
}

export async function updateOrder(
  id: number,
  customerId: number,
  targetWeight: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE orders SET customer_id = ?, target_weight = ? WHERE id = ?',
    [customerId, targetWeight, id]
  );
}

export async function deleteOrder(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM orders WHERE id = ?', [id]);
}

export async function updateOrderStatus(id: number, status: Order['status']): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
}

export interface SessionSummary {
  totalWeight: number;
  totalRevenue: number;
  matchedCount: number;
}

export async function getSessionSummary(sessionId: number): Promise<SessionSummary> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ totalWeight: number; totalRevenue: number; matchedCount: number }>(`
    SELECT
      COALESCE(SUM(t.actual_weight), 0) as totalWeight,
      COALESCE(SUM(t.actual_weight * s.price_per_kg), 0) as totalRevenue,
      COUNT(t.id) as matchedCount
    FROM orders o
    JOIN sessions s ON o.session_id = s.id
    LEFT JOIN turkeys t ON o.turkey_id = t.id
    WHERE o.session_id = ? AND o.turkey_id IS NOT NULL
  `, [sessionId]);
  return result ?? { totalWeight: 0, totalRevenue: 0, matchedCount: 0 };
}

export async function getOrdersWithMatchingInfo(sessionId: number): Promise<OrderWithCustomerAndTurkey[]> {
  const db = await getDatabase();
  return db.getAllAsync<OrderWithCustomerAndTurkey>(`
    SELECT o.*, c.name as customer_name, c.phone as customer_phone, t.actual_weight
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    LEFT JOIN turkeys t ON o.turkey_id = t.id
    WHERE o.session_id = ?
    ORDER BY o.status ASC, o.created_at DESC
  `, [sessionId]);
}
