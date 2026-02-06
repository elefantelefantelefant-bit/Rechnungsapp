import React from 'react';
import { Card, Text, IconButton } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import type { Customer } from '../models/types';

interface Props {
  customer: Customer;
  onPress: () => void;
  onDelete: () => void;
}

export default function CustomerCard({ customer, onPress, onDelete }: Props) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <View style={styles.info}>
          <Text variant="titleMedium">{customer.name}</Text>
          {customer.phone ? (
            <Text variant="bodyMedium">{customer.phone}</Text>
          ) : null}
        </View>
        <IconButton
          icon="delete-outline"
          size={20}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
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
});
