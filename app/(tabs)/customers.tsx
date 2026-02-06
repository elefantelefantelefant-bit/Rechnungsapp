import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { FAB, Text, Modal, Portal } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import CustomerCard from '../../src/components/CustomerCard';
import CustomerForm from '../../src/components/CustomerForm';
import { getAllCustomers, createCustomer, deleteCustomer } from '../../src/db/customerRepository';
import type { Customer } from '../../src/models/types';

export default function CustomersScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);

  const loadCustomers = useCallback(() => {
    getAllCustomers().then(setCustomers);
  }, []);

  useFocusEffect(loadCustomers);

  const handleCreate = async (name: string, phone: string) => {
    await createCustomer(name, phone);
    setShowForm(false);
    loadCustomers();
  };

  const handleDelete = (customer: Customer) => {
    Alert.alert(
      'Kunde löschen',
      `"${customer.name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customer.id);
              loadCustomers();
            } catch {
              Alert.alert('Fehler', 'Kunde kann nicht gelöscht werden, da noch Bestellungen vorhanden sind.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {customers.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">Keine Kunden vorhanden</Text>
          <Text variant="bodyMedium">Erstelle einen neuen Kunden mit dem + Button</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={() => router.push(`/customer/${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Modal
          visible={showForm}
          onDismiss={() => setShowForm(false)}
          contentContainerStyle={styles.modal}
        >
          <CustomerForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowForm(true)}
        label="Neuer Kunde"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6D4C41',
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
});
