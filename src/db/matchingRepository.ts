import { getDatabase } from './database';

export async function matchTurkeyToOrder(turkeyId: number, orderId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE turkeys SET order_id = ? WHERE id = ?',
    [orderId, turkeyId]
  );
  await db.runAsync(
    "UPDATE orders SET turkey_id = ?, status = 'matched' WHERE id = ?",
    [turkeyId, orderId]
  );
}

export async function unmatchOrder(orderId: number, turkeyId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE turkeys SET order_id = NULL WHERE id = ?',
    [turkeyId]
  );
  await db.runAsync(
    "UPDATE orders SET turkey_id = NULL, status = 'pending' WHERE id = ?",
    [orderId]
  );
}
