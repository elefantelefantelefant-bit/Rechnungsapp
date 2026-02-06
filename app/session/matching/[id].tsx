import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Modal, Portal, Divider, Snackbar } from 'react-native-paper';
import { useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import MatchingCard from '../../../src/components/MatchingCard';
import { getSessionById } from '../../../src/db/sessionRepository';
import { getOrdersWithMatchingInfo } from '../../../src/db/orderRepository';
import { getUnmatchedTurkeysBySession } from '../../../src/db/turkeyRepository';
import { matchTurkeyToOrder, unmatchOrder } from '../../../src/db/matchingRepository';
import type { Session, OrderWithCustomerAndTurkey, Turkey } from '../../../src/models/types';

export default function MatchingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = parseInt(id, 10);

  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<OrderWithCustomerAndTurkey[]>([]);
  const [availableTurkeys, setAvailableTurkeys] = useState<Turkey[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomerAndTurkey | null>(null);
  const [showTurkeyModal, setShowTurkeyModal] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const loadData = useCallback(() => {
    getSessionById(sessionId).then(setSession);
    getOrdersWithMatchingInfo(sessionId).then(setOrders);
  }, [sessionId]);

  useFocusEffect(loadData);

  const handleOrderPress = async (order: OrderWithCustomerAndTurkey) => {
    if (order.status === 'matched' && order.turkey_id != null) {
      Alert.alert(
        'Zuordnung aufheben',
        `Zuordnung von ${order.actual_weight?.toFixed(1)} kg zu "${order.customer_name}" wirklich aufheben?`,
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Aufheben',
            style: 'destructive',
            onPress: async () => {
              await unmatchOrder(order.id, order.turkey_id!);
              loadData();
              setSnackbar('Zuordnung aufgehoben');
            },
          },
        ]
      );
    } else {
      const turkeys = await getUnmatchedTurkeysBySession(sessionId);
      if (turkeys.length === 0) {
        Alert.alert('Keine Truthähne', 'Es sind keine unzugeordneten Truthähne verfügbar.');
        return;
      }
      // Sort by best fit (closest to target weight)
      turkeys.sort(
        (a, b) =>
          Math.abs(a.actual_weight - order.target_weight) -
          Math.abs(b.actual_weight - order.target_weight)
      );
      setAvailableTurkeys(turkeys);
      setSelectedOrder(order);
      setShowTurkeyModal(true);
    }
  };

  const handleSelectTurkey = async (turkey: Turkey) => {
    if (!selectedOrder) return;
    await matchTurkeyToOrder(turkey.id, selectedOrder.id);
    setShowTurkeyModal(false);
    setSelectedOrder(null);
    loadData();
    setSnackbar(`${turkey.actual_weight.toFixed(1)} kg → ${selectedOrder.customer_name}`);
  };

  if (!session) {
    return (
      <View style={styles.loading}>
        <Text>Laden...</Text>
      </View>
    );
  }

  const matchedCount = orders.filter((o) => o.status === 'matched').length;
  const formattedDate = session.date.split('-').reverse().join('.');

  const renderTurkeyItem = ({ item, index }: { item: Turkey; index: number }) => {
    const diff = item.actual_weight - (selectedOrder?.target_weight ?? 0);
    const isBestFit = index === 0;

    return (
      <View
        style={[styles.turkeyItem, isBestFit && styles.bestFitItem]}
        onTouchEnd={() => handleSelectTurkey(item)}
      >
        <View style={styles.turkeyInfo}>
          <Text variant="titleMedium" style={isBestFit ? styles.bestFitText : undefined}>
            {item.actual_weight.toFixed(1)} kg
          </Text>
          <Text variant="bodySmall" style={{ color: diff >= 0 ? '#388E3C' : '#D32F2F' }}>
            {diff >= 0 ? '+' : ''}{diff.toFixed(1)} kg
          </Text>
        </View>
        {isBestFit && (
          <View style={styles.bestFitBadge}>
            <Text variant="labelSmall" style={styles.bestFitBadgeText}>Bester Treffer</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Zuordnung ${formattedDate}` }} />

      <View style={styles.header}>
        <Text variant="headlineSmall">Zuordnung</Text>
        <Text variant="titleMedium">
          {matchedCount} / {orders.length} zugeordnet
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: orders.length > 0 ? `${(matchedCount / orders.length) * 100}%` : '0%' },
            ]}
          />
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyMedium">Keine Bestellungen vorhanden</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MatchingCard order={item} onPress={() => handleOrderPress(item)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Modal
          visible={showTurkeyModal}
          onDismiss={() => setShowTurkeyModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Truthahn auswählen
          </Text>
          {selectedOrder && (
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              {selectedOrder.customer_name} — Ziel: {selectedOrder.target_weight.toFixed(1)} kg
            </Text>
          )}
          <Divider style={styles.divider} />
          <FlatList
            data={availableTurkeys}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTurkeyItem}
            ItemSeparatorComponent={() => <Divider />}
            style={styles.turkeyList}
          />
        </Modal>
      </Portal>

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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#EFEBE9',
    gap: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#D7CCC8',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#388E3C',
    borderRadius: 4,
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '70%',
  },
  modalTitle: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    paddingHorizontal: 20,
    paddingTop: 4,
    color: '#757575',
  },
  divider: {
    marginTop: 12,
  },
  turkeyList: {
    maxHeight: 400,
  },
  turkeyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bestFitItem: {
    backgroundColor: '#E8F5E9',
  },
  turkeyInfo: {
    flex: 1,
  },
  bestFitText: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  bestFitBadge: {
    backgroundColor: '#388E3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestFitBadgeText: {
    color: 'white',
  },
});
