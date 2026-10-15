import { Tabs } from 'expo-router';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';


export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
  screenOptions={{
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.surface,
      height: 100,
      overflow: 'visible',
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.tabIconDefault,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
  }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Carnet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="identifier"
        options={{
          title: 'Identifier',
          tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
          tabBarIcon: () => (
            <View style={styles.centerButton}>
              <Ionicons name="scan-outline" size={32} color="#111827" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="carte"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 62,
    height: 62,
    borderRadius: 36,
    backgroundColor: Colors.light.accent, 
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
});