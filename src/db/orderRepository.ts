import { getDatabase } from './database';
import type { Order, OrderWithCustomer, OrderWithCustomerAndTurkey, PortionType, SizePreference } from '../models/types';

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
  targetWeight: number | null,
  portionType: PortionType = 'whole',
  sizePreference: SizePreference | null = null
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO orders (session_id, customer_id, target_weight, portion_type, size_preference) VALUES (?, ?, ?, ?, ?)',
    [sessionId, customerId, targetWeight, portionType, sizePreference]
  );
  return result.lastInsertRowId;
}

export async function updateOrder(
  id: number,
  customerId: number,
  targetWeight: number | null,
  portionType: PortionType = 'whole',
  sizePreference: SizePreference | null = null
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE orders SET customer_id = ?, target_weight = ?, portion_type = ?, size_preference = ? WHERE id = ?',
    [customerId, targetWeight, portionType, sizePreference, id]
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
  turkeyCount: number;
  orderCount: number;
}

export async function getSessionSummary(sessionId: number): Promise<SessionSummary> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ totalWeight: number; totalRevenue: number; matchedCount: number; turkeyCount: number; orderCount: number }>(`
    SELECT
      COALESCE((
        SELECT SUM(
          CASE WHEN o2.portion_type = 'half' THEN t2.actual_weight / 2.0 ELSE t2.actual_weight END
        )
        FROM orders o2
        JOIN turkeys t2 ON o2.turkey_id = t2.id
        WHERE o2.session_id = ? AND o2.turkey_id IS NOT NULL
      ), 0) as totalWeight,
      COALESCE((
        SELECT SUM(
          CASE WHEN o2.portion_type = 'half' THEN t2.actual_weight / 2.0 ELSE t2.actual_weight END
          * s2.price_per_kg
        )
        FROM orders o2
        JOIN sessions s2 ON o2.session_id = s2.id
        JOIN turkeys t2 ON o2.turkey_id = t2.id
        WHERE o2.session_id = ? AND o2.turkey_id IS NOT NULL
      ), 0) as totalRevenue,
      (SELECT COUNT(*) FROM orders o2 JOIN turkeys t2 ON o2.turkey_id = t2.id WHERE o2.session_id = ? AND o2.turkey_id IS NOT NULL) as matchedCount,
      (SELECT COUNT(*) FROM turkeys WHERE session_id = ?) as turkeyCount,
      (SELECT COUNT(*) FROM orders WHERE session_id = ?) as orderCount
  `, [sessionId, sessionId, sessionId, sessionId, sessionId]);
  return result ?? { totalWeight: 0, totalRevenue: 0, matchedCount: 0, turkeyCount: 0, orderCount: 0 };
}

export async function getNextInvoiceNumber(year: number): Promise<string> {
  const db = await getDatabase();
  const yearPrefix = String(year).slice(-2);
  const result = await db.getFirstAsync<{ count: number }>(`
    SELECT COUNT(*) as count
    FROM orders o
    JOIN sessions s ON o.session_id = s.id
    WHERE o.status = 'invoiced'
      AND s.date >= ? AND s.date <= ?
  `, [`${year}-01-01`, `${year}-12-31`]);
  const nextNum = (result?.count ?? 0) + 1;
  return `${yearPrefix}${String(nextNum).padStart(3, '0')}`;
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
