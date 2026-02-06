import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import CustomerForm from '../../src/components/CustomerForm';
import { getCustomerById, updateCustomer } from '../../src/db/customerRepository';
import type { Customer } from '../../src/models/types';

export default function CustomerEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = parseInt(id, 10);
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    getCustomerById(customerId).then(setCustomer);
  }, [customerId]);

  const handleUpdate = async (name: string, phone: string) => {
    await updateCustomer(customerId, name, phone);
    router.back();
  };

  if (!customer) {
    return (
      <View style={styles.loading}>
        <Text>Laden...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${customer.name} bearbeiten` }} />
      <CustomerForm
        initialName={customer.name}
        initialPhone={customer.phone}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        title="Kunde bearbeiten"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
