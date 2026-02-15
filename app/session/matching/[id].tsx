import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, SectionList } from 'react-native';
import { Text, Modal, Portal, Divider, Snackbar, Banner } from 'react-native-paper';
import { useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import MatchingCard from '../../../src/components/MatchingCard';
import { getSessionById } from '../../../src/db/sessionRepository';
import { getOrdersWithMatchingInfo } from '../../../src/db/orderRepository';
import { getUnmatchedTurkeysBySession, getTurkeysBySession, getHalfMatchedTurkeys, type HalfMatchedTurkey } from '../../../src/db/turkeyRepository';
import { matchTurkeyToOrder, unmatchOrder } from '../../../src/db/matchingRepository';
import type { Session, OrderWithCustomerAndTurkey, Turkey } from '../../../src/models/types';
import { calculateSizeRanges, getTurkeysForSizePreference, formatSizeRanges, type SizeRanges } from '../../../src/utils/sizeClassification';
import { formatKg } from '../../../src/utils/formatters';

interface TurkeySection {
  title: string;
  data: (Turkey | HalfMatchedTurkey)[];
}

export default function MatchingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = parseInt(id, 10);

  const [session, setSession] = useState<Session | null>(null);
  const [orders, setOrders] = useState<OrderWithCustomerAndTurkey[]>([]);
  const [sizeRanges, setSizeRanges] = useState<SizeRanges | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomerAndTurkey | null>(null);
  const [showTurkeyModal, setShowTurkeyModal] = useState(false);
  const [turkeySections, setTurkeySections] = useState<TurkeySection[]>([]);
  const [snackbar, setSnackbar] = useState('');

  const loadData = useCallback(() => {
    getSessionById(sessionId).then(setSession);
    getOrdersWithMatchingInfo(sessionId).then(setOrders);
    getTurkeysBySession(sessionId).then((turkeys) => {
      setSizeRanges(calculateSizeRanges(turkeys));
    });
  }, [sessionId]);

  useFocusEffect(loadData);

  const handleOrderPress = async (order: OrderWithCustomerAndTurkey) => {
    if (order.status === 'invoiced') {
      Alert.alert('Bereits berechnet', 'Diese Bestellung wurde bereits berechnet und kann nicht mehr geändert werden.');
      return;
    }
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
      return;
    }

    const isHalfOrder = order.portion_type === 'half';

    if (isHalfOrder) {
      // Half-order: show half-matched turkeys + unmatched turkeys
      const [halfMatched, unmatched] = await Promise.all([
        getHalfMatchedTurkeys(sessionId),
        getUnmatchedTurkeysBySession(sessionId),
      ]);

      if (halfMatched.length === 0 && unmatched.length === 0) {
        Alert.alert('Keine Puten', 'Es sind keine Puten verfügbar.');
        return;
      }

      const sections: TurkeySection[] = [];

      // Split half-matched turkeys into fitting / other
      if (halfMatched.length > 0) {
        if (order.size_preference && sizeRanges) {
          const fittingHalf = getTurkeysForSizePreference(halfMatched, sizeRanges, order.size_preference);
          const otherHalf = halfMatched.filter((t) => !fittingHalf.includes(t));
          if (fittingHalf.length > 0) {
            sections.push({ title: 'Zweite Hälfte – passend', data: fittingHalf });
          }
          if (otherHalf.length > 0) {
            sections.push({ title: 'Zweite Hälfte – weitere', data: otherHalf });
          }
        } else {
          sections.push({ title: 'Zweite Hälfte verfügbar', data: halfMatched });
        }
      }

      // Split unmatched turkeys into fitting / other
      if (unmatched.length > 0) {
        if (order.size_preference && sizeRanges) {
          const fitting = getTurkeysForSizePreference(unmatched, sizeRanges, order.size_preference);
          const other = unmatched.filter((t) => !fitting.includes(t));
          if (fitting.length > 0) {
            sections.push({ title: 'Neue Pute – passend', data: fitting });
          }
          if (other.length > 0) {
            sections.push({ title: 'Neue Pute – weitere', data: other });
          }
        } else {
          sections.push({ title: 'Neue Pute', data: unmatched });
        }
      }

      setTurkeySections(sections);
      setSelectedOrder(order);
      setShowTurkeyModal(true);
    } else {
      // Whole order or weight-based
      const turkeys = await getUnmatchedTurkeysBySession(sessionId);

      if (turkeys.length === 0) {
        Alert.alert('Keine Puten', 'Es sind keine unzugeordneten Puten verfügbar.');
        return;
      }

      const sections: TurkeySection[] = [];

      if (order.size_preference && sizeRanges) {
        // Category mode: split into fitting / other
        const fitting = getTurkeysForSizePreference(turkeys, sizeRanges, order.size_preference);
        const other = turkeys.filter((t) => !fitting.includes(t));
        if (fitting.length > 0) {
          sections.push({ title: 'Passend', data: fitting });
        }
        if (other.length > 0) {
          sections.push({ title: 'Weitere Puten', data: other });
        }
      } else if (order.target_weight != null) {
        // Weight mode: sort by closest to target weight
        const sorted = [...turkeys].sort(
          (a, b) =>
            Math.abs(a.actual_weight - order.target_weight!) -
            Math.abs(b.actual_weight - order.target_weight!)
        );
        sections.push({ title: '', data: sorted });
      } else {
        sections.push({ title: '', data: turkeys });
      }

      setTurkeySections(sections);
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

  const matchedCount = orders.filter((o) => o.status === 'matched' || o.status === 'invoiced').length;
  const formattedDate = session.date.split('-').reverse().join('.');

  const unmatchedHalfOrders = orders.filter(
    (o) => o.portion_type === 'half' && o.status === 'pending'
  );
  const showOddHalfWarning = unmatchedHalfOrders.length % 2 !== 0;

  const renderTurkeyItem = (item: Turkey | HalfMatchedTurkey, sectionTitle: string) => {
    const isHalfMatched = sectionTitle === 'Zweite Hälfte verfügbar';
    const pairedName = isHalfMatched ? (item as HalfMatchedTurkey).paired_customer_name : null;

    const isWeightMode = selectedOrder?.target_weight != null;
    const diff = isWeightMode ? item.actual_weight - selectedOrder!.target_weight! : null;

    return (
      <View
        style={[styles.turkeyItem, isHalfMatched && styles.halfMatchedItem]}
        onTouchEnd={() => handleSelectTurkey(item)}
      >
        <View style={styles.turkeyInfo}>
          <Text variant="titleMedium">
            {formatKg(item.actual_weight)}
          </Text>
          {pairedName && (
            <Text variant="bodySmall" style={styles.pairedText}>
              Geteilt mit: {pairedName}
            </Text>
          )}
          {diff != null && (
            <Text variant="bodySmall" style={{ color: diff >= 0 ? '#388E3C' : '#D32F2F' }}>
              {diff >= 0 ? '+' : ''}{diff.toFixed(1)} kg
            </Text>
          )}
        </View>
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
        {sizeRanges && (
          <Text variant="bodySmall" style={styles.sizeRangesText}>
            {formatSizeRanges(sizeRanges)}
          </Text>
        )}
      </View>

      {showOddHalfWarning && (
        <Banner
          visible
          icon="alert"
          style={styles.warningBanner}
        >
          Ungerade Anzahl halber Bestellungen ({unmatchedHalfOrders.length} offen)
        </Banner>
      )}

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
            Pute auswählen
          </Text>
          {selectedOrder && (
            <Text variant="bodyMedium" style={styles.modalSubtitle}>
              {selectedOrder.customer_name}
              {selectedOrder.target_weight != null
                ? ` — Ziel: ${selectedOrder.target_weight.toFixed(1)} kg`
                : ` — ${selectedOrder.portion_type === 'half' ? 'Halb' : 'Ganz'}`}
            </Text>
          )}
          <Divider style={styles.divider} />
          <SectionList
            sections={turkeySections}
            keyExtractor={(item) => item.id.toString()}
            renderSectionHeader={({ section }) =>
              section.title ? (
                <Text variant="labelLarge" style={styles.sectionHeader}>
                  {section.title}
                </Text>
              ) : null
            }
            renderItem={({ item, section }) => renderTurkeyItem(item, section.title)}
            ItemSeparatorComponent={() => <Divider />}
            style={styles.turkeyList}
            SectionSeparatorComponent={() => <Divider style={styles.sectionDivider} />}
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
  sizeRangesText: {
    marginTop: 8,
    color: '#5D4037',
    fontStyle: 'italic',
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
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
    minHeight: 250,
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    color: '#5D4037',
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#D7CCC8',
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
  halfMatchedItem: {
    backgroundColor: '#E3F2FD',
  },
  turkeyInfo: {
    flex: 1,
  },
  pairedText: {
    color: '#1565C0',
    fontStyle: 'italic',
  },
});
