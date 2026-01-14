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
      const storedUser = await AsyncStorage.getItem('user');

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth state check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, token) => {
    await AsyncStorage.multiSet([
      ['token', token],
      ['user', JSON.stringify(userData)],
    ]);
    setUser(userData);
  };

  const logout = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
  setUser(null);
};

  const setNavigationRef = (ref) => {
    navigationRef.current = ref;
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        setNavigationRef,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
