import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../services/authService';
import { CommonActions } from '@react-navigation/native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await AsyncStorage.clear();
      setUser(null);
      console.log('✅ Logout successful');

      // Reset navigation stack to Login after logout
      if (navigationRef.current) {
        navigationRef.current.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setNavigationRef = (ref) => {
    navigationRef.current = ref;
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return user;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser, setNavigationRef }}>
      {children}
    </AuthContext.Provider>
  );
};
