import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Menu, SegmentedButtons } from 'react-native-paper';
import { getAllCustomers } from '../db/customerRepository';
import type { Customer, PortionType, SizePreference } from '../models/types';

type OrderMode = 'weight' | 'category';

interface Props {
  onSubmit: (
    customerId: number,
    targetWeight: number | null,
    portionType: PortionType,
    sizePreference: SizePreference | null
  ) => void;
  onCancel: () => void;
}

export default function OrderForm({ onSubmit, onCancel }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [weightError, setWeightError] = useState('');

  const [mode, setMode] = useState<OrderMode>('category');
  const [portionType, setPortionType] = useState<PortionType>('whole');
  const [sizePreference, setSizePreference] = useState<SizePreference>('medium');

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

    if (mode === 'weight') {
      const parsedWeight = parseFloat(weight.replace(',', '.'));
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        setWeightError('Gültiges Gewicht eingeben');
        valid = false;
      } else {
        setWeightError('');
      }

      if (valid && selectedCustomer) {
        onSubmit(selectedCustomer.id, parsedWeight, 'whole', null);
      }
    } else {
      setWeightError('');
      if (valid && selectedCustomer) {
        onSubmit(selectedCustomer.id, null, portionType, sizePreference);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Bestellung hinzufügen</Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as OrderMode)}
        buttons={[
          { value: 'category', label: 'Kategorie' },
          { value: 'weight', label: 'Gewicht' },
        ]}
        style={styles.modeToggle}
      />

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

      {mode === 'weight' ? (
        <>
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
        </>
      ) : (
        <>
          <Text variant="labelLarge" style={styles.sectionLabel}>Portion</Text>
          <SegmentedButtons
            value={portionType}
            onValueChange={(v) => setPortionType(v as PortionType)}
            buttons={[
              { value: 'whole', label: 'Ganz' },
              { value: 'half', label: 'Halb' },
            ]}
            style={styles.segmented}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>Größe</Text>
          <SegmentedButtons
            value={sizePreference}
            onValueChange={(v) => setSizePreference(v as SizePreference)}
            buttons={[
              { value: 'light', label: 'Leicht' },
              { value: 'medium', label: 'Mittel' },
              { value: 'heavy', label: 'Schwer' },
            ]}
            style={styles.segmented}
          />
        </>
      )}

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
  modeToggle: {
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
  sectionLabel: {
    marginTop: 12,
    marginBottom: 6,
    color: '#5D4037',
  },
  segmented: {
    marginBottom: 4,
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
