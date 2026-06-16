import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Settings'>('Home');

  return (
    <>
      <StatusBar style="auto" />
      {currentScreen === 'Home' ? (
        <HomeScreen onNavigateToSettings={() => setCurrentScreen('Settings')} />
      ) : (
        <SettingsScreen onBack={() => setCurrentScreen('Home')} />
      )}
    </>
  );
}
