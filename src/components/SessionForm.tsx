import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface Props {
  onSubmit: (date: string, pricePerKg: number) => void;
  onCancel: () => void;
}

export default function SessionForm({ onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const [date, setDate] = useState(today);
  const [price, setPrice] = useState('');
  const [dateError, setDateError] = useState('');
  const [priceError, setPriceError] = useState('');

  const handleSubmit = () => {
    let valid = true;

    // Validate date (YYYY-MM-DD or DD.MM.YYYY)
    let normalizedDate = date;
    const dottedMatch = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dottedMatch) {
      normalizedDate = `${dottedMatch[3]}-${dottedMatch[2].padStart(2, '0')}-${dottedMatch[1].padStart(2, '0')}`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      setDateError('Format: TT.MM.JJJJ oder JJJJ-MM-TT');
      valid = false;
    } else {
      setDateError('');
    }

    // Validate price
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setPriceError('Gültigen Preis eingeben');
      valid = false;
    } else {
      setPriceError('');
    }

    if (valid) {
      onSubmit(normalizedDate, parsedPrice);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Neue Sitzung</Text>

      <TextInput
        label="Datum"
        value={date}
        onChangeText={setDate}
        placeholder="TT.MM.JJJJ"
        style={styles.input}
        error={!!dateError}
      />
      {dateError ? <Text style={styles.error}>{dateError}</Text> : null}

      <TextInput
        label="Preis pro kg (€)"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="z.B. 15,50"
        style={styles.input}
        error={!!priceError}
      />
      {priceError ? <Text style={styles.error}>{priceError}</Text> : null}

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
