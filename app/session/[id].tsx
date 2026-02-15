import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, Modal, Portal, Chip, Button } from 'react-native-paper';
import { useLocalSearchParams, useFocusEffect, Stack, useRouter } from 'expo-router';
import OrderCard from '../../src/components/OrderCard';
import OrderForm from '../../src/components/OrderForm';
import SessionSummaryCard from '../../src/components/SessionSummaryCard';
import { getSessionById } from '../../src/db/sessionRepository';
import {
  getOrdersWithMatchingInfo,
  createOrder,
  deleteOrder,
  updateOrderStatus,
  getSessionSummary,
  type SessionSummary,
} from '../../src/db/orderRepository';
import { generateAndShareInvoice } from '../../src/utils/invoiceService';
import type { Session, OrderWithCustomerAndTurkey, PortionType, SizePreference } from '../../src/models/types';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessionId = parseInt(id, 10);

  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<OrderWithCustomerAndTurkey[]>([]);
  const [summary, setSummary] = useState<SessionSummary>({ totalWeight: 0, totalRevenue: 0, matchedCount: 0, turkeyCount: 0, orderCount: 0 });
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(() => {
    getSessionById(sessionId).then(setSession);
    getOrdersWithMatchingInfo(sessionId).then(setOrders);
    getSessionSummary(sessionId).then(setSummary);
  }, [sessionId]);

  useFocusEffect(loadData);

  const handleAddOrder = async (
    customerId: number,
    targetWeight: number | null,
    portionType: PortionType,
    sizePreference: SizePreference | null
  ) => {
    await createOrder(sessionId, customerId, targetWeight, portionType, sizePreference);
    setShowForm(false);
    loadData();
  };

  const handleDeleteOrder = (order: OrderWithCustomerAndTurkey) => {
    Alert.alert(
      'Bestellung löschen',
      `Bestellung von "${order.customer_name}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteOrder(order.id);
            loadData();
          },
        },
      ]
    );
  };

  const handleGenerateInvoice = async (order: OrderWithCustomerAndTurkey) => {
    if (!session || order.actual_weight == null) return;

    try {
      await generateAndShareInvoice({
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        slaughterDate: session.date,
        actualWeight: order.actual_weight,
        pricePerKg: session.price_per_kg,
        portionType: order.portion_type,
      });
      await updateOrderStatus(order.id, 'invoiced');
      loadData();
    } catch (error) {
      // User cancelled share sheet — don't update status
    }
  };

  if (!session) {
    return (
      <View style={styles.loading}>
        <Text>Laden...</Text>
      </View>
    );
  }

  const formattedDate = session.date.split('-').reverse().join('.');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Sitzung ${formattedDate}` }} />

      <View style={styles.header}>
        <Text variant="headlineSmall">{formattedDate}</Text>
        <Text variant="titleMedium">{session.price_per_kg.toFixed(2)} €/kg</Text>
        <Chip
          style={[
            styles.statusChip,
            session.status === 'active' ? styles.activeChip : styles.completedChip,
          ]}
          textStyle={styles.chipText}
        >
          {session.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
        </Chip>
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            icon="scale"
            onPress={() => router.push(`/session/weighing/${sessionId}`)}
            style={[styles.weighButton, styles.rowButton]}
            contentStyle={{ height: 56 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Wiegen
          </Button>
          <Button
            mode="contained"
            icon="swap-horizontal"
            onPress={() => router.push(`/session/matching/${sessionId}`)}
            style={[styles.matchButton, styles.rowButton]}
            contentStyle={{ height: 56 }}
            labelStyle={{ fontSize: 16, fontWeight: '700' }}
          >
            Zuordnung
          </Button>
        </View>
      </View>

      <SessionSummaryCard
        totalWeight={summary.totalWeight}
        totalRevenue={summary.totalRevenue}
        matchedCount={summary.matchedCount}
        turkeyCount={summary.turkeyCount}
        orderCount={summary.orderCount}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Bestellungen ({orders.length})
      </Text>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyMedium">Noch keine Bestellungen</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              session={session}
              onDelete={() => handleDeleteOrder(item)}
              onGenerateInvoice={() => handleGenerateInvoice(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <Portal>
        <Modal
          visible={showForm}
          onDismiss={() => setShowForm(false)}
          contentContainerStyle={styles.modal}
        >
          <OrderForm
            onSubmit={handleAddOrder}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowForm(true)}
        label="Bestellung hinzufügen"
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
  header: {
    padding: 16,
    backgroundColor: '#EFEBE9',
    gap: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeChip: {
    backgroundColor: '#C8E6C9',
  },
  completedChip: {
    backgroundColor: '#BBDEFB',
  },
  chipText: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  rowButton: {
    flex: 1,
    borderRadius: 12,
  },
  weighButton: {
    backgroundColor: '#6D4C41',
  },
  matchButton: {
    backgroundColor: '#5D4037',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
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
