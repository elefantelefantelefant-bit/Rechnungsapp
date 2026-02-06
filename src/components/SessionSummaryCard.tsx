import React from 'react';
import { Card, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { formatEuro, formatKg } from '../utils/formatters';

interface Props {
  totalWeight: number;
  totalRevenue: number;
  matchedCount: number;
  totalOrders: number;
}

export default function SessionSummaryCard({ totalWeight, totalRevenue, matchedCount, totalOrders }: Props) {
  if (matchedCount === 0) return null;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>Zusammenfassung</Text>
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={styles.value}>{formatKg(totalWeight)}</Text>
            <Text variant="bodySmall" style={styles.label}>Gesamtgewicht</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={styles.value}>{formatEuro(totalRevenue)}</Text>
            <Text variant="bodySmall" style={styles.label}>Umsatz</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={styles.value}>{matchedCount}/{totalOrders}</Text>
            <Text variant="bodySmall" style={styles.label}>Zugeordnet</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#EFEBE9',
  },
  title: {
    color: '#5D4037',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    color: '#6D4C41',
    fontWeight: '700',
  },
  label: {
    color: '#8D6E63',
  },
});
