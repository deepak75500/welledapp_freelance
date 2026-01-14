import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation, CommonActions } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmLogout = async () => {
    setShowConfirm(false);
    await logout();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.usernameText}>{user.username}</Text>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      {/* STATS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Wellness Progress</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNumber}>{user.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statNumber}>{user.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowConfirm(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      {/* CONFIRM LOGOUT MODAL */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMsg}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  header: {
    backgroundColor: '#2e7d32',
    padding: 30,
    alignItems: 'center',
  },

  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },

  emailText: {
    fontSize: 14,
    color: '#e8f5e9',
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statCard: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },

  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  statLabel: {
    fontSize: 14,
    color: '#666',
  },

  logoutButtonContainer: {
    marginBottom: 30,
    paddingHorizontal: 16,
  },

  logoutButton: {
    backgroundColor: '#f44336',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  modalMsg: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  cancelBtn: {
    padding: 10,
    marginRight: 10,
  },

  cancelText: {
    color: '#555',
    fontSize: 15,
  },

  confirmBtn: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 6,
  },

  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
