import React from 'react';
import { Card, Text, IconButton, Chip } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { OrderWithCustomerAndTurkey, Session } from '../models/types';
import { formatEuro, formatKg } from '../utils/formatters';
import { SIZE_LABELS, PORTION_LABELS } from '../utils/sizeClassification';

interface Props {
  order: OrderWithCustomerAndTurkey;
  session: Session;
  onDelete: () => void;
  onGenerateInvoice: () => void;
}

export default function OrderCard({ order, session, onDelete, onGenerateInvoice }: Props) {
  const isMatched = order.actual_weight != null;
  const isInvoiced = order.status === 'invoiced';
  const isHalf = order.portion_type === 'half';
  const billableWeight = isMatched ? (isHalf ? order.actual_weight! / 2 : order.actual_weight!) : null;
  const totalPrice = billableWeight != null ? billableWeight * session.price_per_kg : null;

  const orderDescription = order.target_weight != null
    ? `Zielgewicht: ${order.target_weight.toFixed(1)} kg`
    : `${PORTION_LABELS[order.portion_type]} · ${SIZE_LABELS[order.size_preference!]}`;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium">{order.customer_name}</Text>
            {isHalf && (
              <Chip style={styles.halfChip} textStyle={styles.halfText}>½</Chip>
            )}
            {isInvoiced && (
              <Chip style={styles.invoicedChip} textStyle={styles.invoicedText}>Berechnet</Chip>
            )}
          </View>
          <Text variant="bodyMedium">{orderDescription}</Text>
          {isMatched && (
            <>
              <Text variant="bodyMedium" style={styles.matchedText}>
                {isHalf ? `Gewicht (½): ${formatKg(billableWeight!)}` : `Gewicht: ${formatKg(order.actual_weight!)}`}
              </Text>
              <Text variant="bodyMedium" style={styles.priceText}>
                Betrag: {formatEuro(totalPrice!)}
              </Text>
            </>
          )}
          {order.customer_phone ? (
            <Text variant="bodySmall">{order.customer_phone}</Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          {isMatched && (
            <IconButton
              icon="file-document-outline"
              size={20}
              onPress={onGenerateInvoice}
              iconColor="#6D4C41"
            />
          )}
          <IconButton
            icon="delete-outline"
            size={20}
            onPress={onDelete}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
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
    gap: 8,
  },
  halfChip: {
    backgroundColor: '#E3F2FD',
    height: 24,
  },
  halfText: {
    fontSize: 10,
    lineHeight: 14,
  },
  invoicedChip: {
    backgroundColor: '#C8E6C9',
    height: 24,
  },
  invoicedText: {
    fontSize: 10,
    lineHeight: 14,
  },
  matchedText: {
    color: '#6D4C41',
    fontWeight: '600',
  },
  priceText: {
    color: '#5D4037',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
