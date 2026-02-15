import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import {
  getInvoiceSettings,
  saveInvoiceSettings,
  INVOICE_DEFAULTS,
  type InvoiceSettings,
} from '../../src/db/settingsRepository';

export default function InvoiceSettingsScreen() {
  const [settings, setSettings] = useState<InvoiceSettings>(INVOICE_DEFAULTS);
  const [snackbar, setSnackbar] = useState('');
  const [dirty, setDirty] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getInvoiceSettings().then((s) => {
        setSettings(s);
        setDirty(false);
      });
    }, [])
  );

  const update = (key: keyof InvoiceSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    await saveInvoiceSettings(settings);
    setDirty(false);
    setSnackbar('Einstellungen gespeichert');
  };

  const handleReset = () => {
    setSettings(INVOICE_DEFAULTS);
    setDirty(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleLarge" style={styles.title}>Rechnungsvorlage</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Hier kannst du die Texte auf der Rechnung anpassen.
        </Text>

        <TextInput
          label="Produktbezeichnung"
          value={settings.productName}
          onChangeText={(v) => update('productName', v)}
          style={styles.input}
          placeholder={INVOICE_DEFAULTS.productName}
        />

        <TextInput
          label="Hinweistext"
          value={settings.footerNote}
          onChangeText={(v) => update('footerNote', v)}
          style={styles.input}
          multiline
          numberOfLines={3}
          placeholder={INVOICE_DEFAULTS.footerNote}
        />

        <TextInput
          label="Grußtext"
          value={settings.closingText}
          onChangeText={(v) => update('closingText', v)}
          style={styles.input}
          multiline
          numberOfLines={2}
          placeholder={INVOICE_DEFAULTS.closingText}
        />

        <TextInput
          label="Dankestext"
          value={settings.thanksText}
          onChangeText={(v) => update('thanksText', v)}
          style={styles.input}
          placeholder={INVOICE_DEFAULTS.thanksText}
        />

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={handleReset}
            style={styles.button}
          >
            Zurücksetzen
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            disabled={!dirty}
          >
            Speichern
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    color: '#3E2723',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8D6E63',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  button: {
    minWidth: 120,
  },
});
