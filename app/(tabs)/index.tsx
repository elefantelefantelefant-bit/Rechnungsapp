import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Modal, Portal } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import SessionCard from '../../src/components/SessionCard';
import SessionForm from '../../src/components/SessionForm';
import { getAllSessions, createSession } from '../../src/db/sessionRepository';
import type { SessionWithCount } from '../../src/models/types';

export default function SessionsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithCount[]>([]);
  const [showForm, setShowForm] = useState(false);

  const loadSessions = useCallback(() => {
    getAllSessions().then(setSessions);
  }, []);

  useFocusEffect(loadSessions);

  const handleCreate = async (date: string, pricePerKg: number) => {
    await createSession(date, pricePerKg);
    setShowForm(false);
    loadSessions();
  };

  return (
    <View style={styles.container}>
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge">Keine Sitzungen vorhanden</Text>
          <Text variant="bodyMedium">Erstelle eine neue Sitzung mit dem + Button</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={() => router.push(`/session/${item.id}`)}
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
          <SessionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowForm(true)}
        label="Neue Sitzung"
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
