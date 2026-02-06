import React from 'react';
import { Card, Text, Chip } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { OrderWithCustomerAndTurkey } from '../models/types';

interface Props {
  order: OrderWithCustomerAndTurkey;
  onPress: () => void;
}

export default function MatchingCard({ order, onPress }: Props) {
  const isMatched = order.status === 'matched' && order.actual_weight != null;

  const diff = isMatched
    ? order.actual_weight! - order.target_weight
    : null;

  return (
    <Card
      style={[styles.card, isMatched ? styles.matchedBorder : styles.pendingBorder]}
      onPress={onPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <Text variant="titleMedium">{order.customer_name}</Text>
          <Text variant="bodyMedium">
            Zielgewicht: {order.target_weight.toFixed(1)} kg
          </Text>
          {isMatched && (
            <Text variant="bodyMedium" style={styles.actualWeight}>
              Tatsächlich: {order.actual_weight!.toFixed(1)} kg ({diff! >= 0 ? '+' : ''}{diff!.toFixed(1)} kg)
            </Text>
          )}
        </View>
        <Chip
          style={isMatched ? styles.matchedChip : styles.pendingChip}
          textStyle={styles.chipText}
          icon={isMatched ? 'check' : 'clock-outline'}
        >
          {isMatched ? 'Zugeordnet' : 'Offen'}
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
  actualWeight: {
    color: '#388E3C',
    fontWeight: '600',
  },
  matchedChip: {
    backgroundColor: '#C8E6C9',
  },
  pendingChip: {
    backgroundColor: '#FFE0B2',
  },
  chipText: {
    fontSize: 11,
  },
});
