import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import DrawerNavigator from './DrawerNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading, setNavigationRef } = useContext(AuthContext);
  const navigationRef = React.useRef();

  useEffect(() => {
    if (setNavigationRef && navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [setNavigationRef]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? (
        <DrawerNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: true, title: 'Register' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
