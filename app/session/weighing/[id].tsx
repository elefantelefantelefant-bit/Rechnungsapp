import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, Keyboard, Alert } from 'react-native';
import { Text, IconButton, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import WeighingKeypad from '../../../src/components/WeighingKeypad';
import { getSessionById } from '../../../src/db/sessionRepository';
import {
  getTurkeysBySession,
  createTurkey,
  deleteTurkey,
} from '../../../src/db/turkeyRepository';
import type { Session, Turkey } from '../../../src/models/types';

export default function WeighingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = parseInt(id, 10);

  const [session, setSession] = useState<Session | null>(null);
  const [turkeys, setTurkeys] = useState<Turkey[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const loadData = useCallback(() => {
    getSessionById(sessionId).then(setSession);
    getTurkeysBySession(sessionId).then(setTurkeys);
  }, [sessionId]);

  useFocusEffect(loadData);

  const handleSubmit = async () => {
    const weight = parseFloat(weightInput);
    if (!weightInput || isNaN(weight) || weight <= 0) return;

    setSaving(true);
    try {
      await createTurkey(sessionId, weight);
      const displayWeight = weightInput.includes('.')
        ? weightInput.replace('.', ',')
        : weightInput;
      setSnackbar(`${displayWeight} kg gespeichert`);
      setWeightInput('');
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (turkey: Turkey) => {
    const displayWeight = turkey.actual_weight.toString().replace('.', ',');
    Alert.alert(
      'Truthahn löschen',
      `Eintrag ${displayWeight} kg wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteTurkey(turkey.id);
            loadData();
          },
        },
      ]
    );
  };

  const displayValue = weightInput.replace('.', ',');
  const formattedDate = session?.date.split('-').reverse().join('.') ?? '';

  const formatTime = (createdAt: string) => {
    return new Date(createdAt + 'Z').toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTurkeyItem = ({ item, index }: { item: Turkey; index: number }) => {
    const number = turkeys.length - index;
    const weight = item.actual_weight.toString().replace('.', ',');
    return (
      <View style={styles.historyRow}>
        <Text style={styles.historyNumber}>#{number}</Text>
        <Text style={styles.historyWeight}>{weight} kg</Text>
        <Text style={styles.historyTime}>{formatTime(item.created_at)}</Text>
        <IconButton
          icon="delete-outline"
          size={22}
          onPress={() => handleDelete(item)}
          iconColor="#B71C1C"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Wiegen – ${formattedDate}` }} />

      {/* Weight Display */}
      <View style={styles.displayArea}>
        <IconButton
          icon="camera"
          mode="outlined"
          size={28}
          onPress={() => {}}
          style={styles.cameraButton}
        />
        <Text style={styles.weightDisplay}>
          {displayValue ? `${displayValue} kg` : '– kg'}
        </Text>
      </View>

      {/* History List */}
      <FlatList
        data={turkeys.slice(0, 10)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTurkeyItem}
        style={styles.historyList}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyMedium">Noch keine Truthähne gewogen</Text>
          </View>
        }
      />

      {/* Keypad */}
      <WeighingKeypad
        value={weightInput}
        onValueChange={setWeightInput}
        onSubmit={handleSubmit}
        disabled={saving || !weightInput}
      />

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={1500}
        style={styles.snackbar}
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
  displayArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#EFEBE9',
  },
  cameraButton: {
    position: 'absolute',
    left: 8,
  },
  weightDisplay: {
    fontSize: 56,
    fontWeight: '700',
    color: '#3E2723',
    fontVariant: ['tabular-nums'],
  },
  historyList: {
    flex: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D7CCC8',
  },
  historyNumber: {
    width: 40,
    fontSize: 14,
    color: '#8D6E63',
    fontWeight: '600',
  },
  historyWeight: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#3E2723',
    fontVariant: ['tabular-nums'],
  },
  historyTime: {
    fontSize: 14,
    color: '#8D6E63',
    marginRight: 4,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  snackbar: {
    backgroundColor: '#2E7D32',
  },
});
