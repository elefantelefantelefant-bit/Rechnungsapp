import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface Props {
  initialName?: string;
  initialPhone?: string;
  onSubmit: (name: string, phone: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function CustomerForm({
  initialName = '',
  initialPhone = '',
  onSubmit,
  onCancel,
  title = 'Neuer Kunde',
}: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [nameError, setNameError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Name ist erforderlich');
      return;
    }
    setNameError('');
    onSubmit(name.trim(), phone.trim());
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>{title}</Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        error={!!nameError}
        autoFocus
      />
      {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

      <TextInput
        label="Telefon"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

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
