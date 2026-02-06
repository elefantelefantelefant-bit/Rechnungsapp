import { Tabs } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6D4C41',
        tabBarInactiveTintColor: '#9E9E9E',
        headerStyle: { backgroundColor: '#EFEBE9' },
        headerTintColor: '#3E2723',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sitzungen',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Kunden',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
