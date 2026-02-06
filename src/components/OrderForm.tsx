import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Menu } from 'react-native-paper';
import { getAllCustomers } from '../db/customerRepository';
import type { Customer } from '../models/types';

interface Props {
  onSubmit: (customerId: number, targetWeight: number) => void;
  onCancel: () => void;
}

export default function OrderForm({ onSubmit, onCancel }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [weightError, setWeightError] = useState('');

  useEffect(() => {
    getAllCustomers().then(setCustomers);
  }, []);

  const handleSubmit = () => {
    let valid = true;

    if (!selectedCustomer) {
      setCustomerError('Kunde auswählen');
      valid = false;
    } else {
      setCustomerError('');
    }

    const parsedWeight = parseFloat(weight.replace(',', '.'));
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      setWeightError('Gültiges Gewicht eingeben');
      valid = false;
    } else {
      setWeightError('');
    }

    if (valid && selectedCustomer) {
      onSubmit(selectedCustomer.id, parsedWeight);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Bestellung hinzufügen</Text>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            style={styles.dropdown}
            contentStyle={styles.dropdownContent}
          >
            {selectedCustomer ? selectedCustomer.name : 'Kunde auswählen...'}
          </Button>
        }
      >
        {customers.length === 0 ? (
          <Menu.Item title="Keine Kunden vorhanden" disabled />
        ) : (
          customers.map((c) => (
            <Menu.Item
              key={c.id}
              title={c.name}
              onPress={() => {
                setSelectedCustomer(c);
                setMenuVisible(false);
              }}
            />
          ))
        )}
      </Menu>
      {customerError ? <Text style={styles.error}>{customerError}</Text> : null}

      <TextInput
        label="Zielgewicht (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="z.B. 7,0"
        style={styles.input}
        error={!!weightError}
      />
      {weightError ? <Text style={styles.error}>{weightError}</Text> : null}

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Abbrechen
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          Speichern
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  dropdownContent: {
    justifyContent: 'flex-start',
  },
  input: {
    marginBottom: 8,
  },
  error: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  button: {
    minWidth: 100,
  },
});
