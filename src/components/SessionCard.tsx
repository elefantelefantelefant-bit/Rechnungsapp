import React from 'react';
import { Card, Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import type { SessionWithCount } from '../models/types';

interface Props {
  session: SessionWithCount;
  onPress: () => void;
}

export default function SessionCard({ session, onPress }: Props) {
  const formattedDate = session.date.split('-').reverse().join('.');

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium">{formattedDate}</Text>
        <Text variant="bodyMedium">Preis: {session.price_per_kg.toFixed(2)} €/kg</Text>
        <Text variant="bodySmall">
          {session.order_count} {session.order_count === 1 ? 'Bestellung' : 'Bestellungen'}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
});
