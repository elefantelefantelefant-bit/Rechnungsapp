import React from 'react';
import { Card, Text, Chip } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { OrderWithCustomerAndTurkey } from '../models/types';
import { SIZE_LABELS, PORTION_LABELS } from '../utils/sizeClassification';
import { formatKg } from '../utils/formatters';

interface Props {
  order: OrderWithCustomerAndTurkey;
  onPress: () => void;
}

export default function MatchingCard({ order, onPress }: Props) {
  const isMatched = (order.status === 'matched' || order.status === 'invoiced') && order.actual_weight != null;
  const isHalf = order.portion_type === 'half';
  const isWeightMode = order.target_weight != null;

  const billableWeight = isMatched && isHalf ? order.actual_weight! / 2 : order.actual_weight;

  const orderInfo = isWeightMode
    ? `Zielgewicht: ${order.target_weight!.toFixed(1)} kg`
    : `${PORTION_LABELS[order.portion_type]} · ${SIZE_LABELS[order.size_preference!]}`;

  const diff = isMatched && isWeightMode
    ? order.actual_weight! - order.target_weight!
    : null;

  return (
    <Card
      style={[styles.card, isMatched ? styles.matchedBorder : styles.pendingBorder]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium">{order.customer_name}</Text>
            {isHalf && (
              <Chip style={styles.halfChip} textStyle={styles.halfChipText}>½</Chip>
            )}
          </View>
          <Text variant="bodyMedium">{orderInfo}</Text>
          {isMatched && (
            <Text variant="bodyMedium" style={styles.actualWeight}>
              {isHalf
                ? `Pute: ${formatKg(order.actual_weight!)} · Anteil: ${formatKg(billableWeight!)}`
                : `Tatsächlich: ${formatKg(order.actual_weight!)}${diff != null ? ` (${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg)` : ''}`
              }
            </Text>
          )}
        </View>
        <Chip
          style={order.status === 'invoiced' ? styles.invoicedChip : isMatched ? styles.matchedChip : styles.pendingChip}
          textStyle={styles.chipText}
          icon={order.status === 'invoiced' ? 'receipt' : isMatched ? 'check' : 'clock-outline'}
        >
          {order.status === 'invoiced' ? 'Berechnet' : isMatched ? 'Zugeordnet' : 'Offen'}
        </Chip>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  pendingBorder: {
    borderLeftColor: '#F57C00',
  },
  matchedBorder: {
    borderLeftColor: '#388E3C',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  halfChip: {
    backgroundColor: '#E3F2FD',
    height: 22,
  },
  halfChipText: {
    fontSize: 10,
    lineHeight: 14,
  },
  actualWeight: {
    color: '#388E3C',
    fontWeight: '600',
  },
  matchedChip: {
    backgroundColor: '#C8E6C9',
  },
  invoicedChip: {
    backgroundColor: '#BBDEFB',
  },
  pendingChip: {
    backgroundColor: '#FFE0B2',
  },
  chipText: {
    fontSize: 11,
  },
});
