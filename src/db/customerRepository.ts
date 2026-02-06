import { getDatabase } from './database';
import type { Customer } from '../models/types';

export async function getAllCustomers(): Promise<Customer[]> {
  const db = await getDatabase();
  return db.getAllAsync<Customer>('SELECT * FROM customers ORDER BY name ASC');
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Customer>('SELECT * FROM customers WHERE id = ?', [id]);
}

export async function createCustomer(name: string, phone: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO customers (name, phone) VALUES (?, ?)',
    [name, phone]
  );
  return result.lastInsertRowId;
}

export async function updateCustomer(id: number, name: string, phone: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE customers SET name = ?, phone = ? WHERE id = ?',
    [name, phone, id]
  );
}

export async function deleteCustomer(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
}
