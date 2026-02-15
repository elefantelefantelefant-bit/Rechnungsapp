import React from 'react';
import { Card, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { formatEuro, formatKg } from '../utils/formatters';

interface Props {
  totalWeight: number;
  totalRevenue: number;
  matchedCount: number;
  turkeyCount: number;
  orderCount: number;
}

export default function SessionSummaryCard({ totalWeight, totalRevenue, matchedCount, turkeyCount, orderCount }: Props) {
  if (turkeyCount === 0 && orderCount === 0) return null;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>Zusammenfassung</Text>
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={styles.value}>{turkeyCount}</Text>
            <Text variant="bodySmall" style={styles.label}>Puten</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={styles.value}>{orderCount}</Text>
            <Text variant="bodySmall" style={styles.label}>Bestellungen</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="headlineSmall" style={styles.value}>{matchedCount}/{orderCount}</Text>
            <Text variant="bodySmall" style={styles.label}>Zugeordnet</Text>
          </View>
        </View>
        {matchedCount > 0 && (
          <View style={[styles.row, styles.secondRow]}>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.value}>{formatKg(totalWeight)}</Text>
              <Text variant="bodySmall" style={styles.label}>Gesamtgewicht</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.value}>{formatEuro(totalRevenue)}</Text>
              <Text variant="bodySmall" style={styles.label}>Umsatz</Text>
            </View>
          </View>
        )}
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
  secondRow: {
    marginTop: 12,
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
