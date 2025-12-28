import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { getDailyTasks, updateTaskCompletion, markAllTasksCompleted } from '../services/taskService';
import TaskCard from '../components/TaskCard';

// Import notifications but handle if they fail
let notifyTaskComplete = null;
let notifyAllTasksComplete = null;

try {
  const notifications = require('../services/notificationService');
  notifyTaskComplete = notifications.notifyTaskComplete;
  notifyAllTasksComplete = notifications.notifyAllTasksComplete;
} catch (error) {
  console.log('✓ Notifications service loaded (web platform or not available)');
}

const HomeScreen = () => {
  const { user, login } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCompleted, setAllCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [serverMarkedComplete, setServerMarkedComplete] = useState(false);
  const autoMarkedRef = React.useRef(false);

  useEffect(() => {
    if (user) {
      checkDateAndLoadTasks();
      // Check every minute if day has changed
      const interval = setInterval(checkDateAndLoadTasks, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkDateAndLoadTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = await AsyncStorage.getItem('lastTaskDate');
      
      // If day has changed, clear cached tasks and load new ones
      if (lastDate && lastDate !== today) {
        console.log('📅 New day detected! Auto-loading new random tasks...');
      }
      
      // Save today's date
      await AsyncStorage.setItem('lastTaskDate', today);
      
      loadTasks();
    } catch (error) {
      console.error('Error checking date:', error);
      loadTasks();
    }
  };

  const loadTasks = async () => {
    try {
      const { tasks: dailyTasks, allCompleted } = await getDailyTasks();
      setTasks(dailyTasks);

      const completed = dailyTasks.every(task => task.completed);
      setAllCompleted(completed);
      setServerMarkedComplete(!!allCompleted);
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      setErrorMessage('Failed to load tasks. Please refresh.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Auto-mark complete on server when user finishes all tasks locally
  useEffect(() => {
    if (allCompleted && !serverMarkedComplete && !autoMarkedRef.current) {
      autoMarkedRef.current = true;
      // call markAllCompleted in background
      (async () => {
        try {
          await handleMarkAllCompleted();
        } catch (e) {
          console.error('Auto mark complete failed', e);
        }
      })();
    }
  }, [allCompleted, serverMarkedComplete]);

  const handleTaskToggle = async (taskId, completed) => {
    try {
      const updatedTasks = await updateTaskCompletion(taskId, !completed);
      if (updatedTasks) {
        setTasks(updatedTasks);
        const allDone = updatedTasks.every(task => task.completed);
        setAllCompleted(allDone);
        
        // Notify on task complete (if available)
        if (!completed && notifyTaskComplete) {
          await notifyTaskComplete();
        }
      }
    } catch (error) {
      console.error('❌ Error toggling task:', error);
      setErrorMessage('Failed to update task');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleMarkAllCompleted = async () => {
  if (!allCompleted) {
    setErrorMessage('⚠️ Please complete all tasks first');
    setTimeout(() => setErrorMessage(''), 3000);
    return;
  }

  try {
    console.log('🎯 Marking all tasks as complete...');
    const result = await markAllTasksCompleted();
    
    console.log('📥 Result:', result);
    
    if (result && result.success) {
      // Update user context with new streak
      const updatedUser = {
        ...user,
        currentStreak: result.streak,
        longestStreak: result.longestStreak || user.longestStreak
      };
      
      // Update user in context
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccessMessage(
        `🎉 Amazing! All tasks completed!\n🔥 Streak: ${result.streak} ${result.streak === 1 ? 'day' : 'days'}\n${result.message || ''}`
      );
      
      // Notify
      if (notifyAllTasksComplete) {
        await notifyAllTasksComplete(result.streak);
      }
      
      // Reload after showing message
      setTimeout(async () => {
        setSuccessMessage('');
        // Update AuthContext user so UI reflects new streak immediately
        try {
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          if (login) login(updatedUser);
        } catch (e) {
          console.error('Error updating local user after streak update', e);
        }
        // Reload tasks to reflect any changes
        setTimeout(() => {
          loadTasks();
        }, 300);
      }, 3000);
    } else {
      setErrorMessage(result?.error || result?.message || 'Unable to update streak');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    setErrorMessage('Failed to update. Please try again.');
    setTimeout(() => setErrorMessage(''), 3000);
  }
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading your daily tasks...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please login</Text>
      </View>
    );
  }

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <View style={styles.container}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user.username}!</Text>
        
        <View style={styles.streakContainer}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{user.currentStreak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }
            ]} 
          />
        </View>
      </View>

      {successMessage ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{successMessage}</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Today's Wellness Tasks</Text>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No tasks for today</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => handleTaskToggle(task.id, task.completed)}
            />
          ))
        )}

        {allCompleted ? (
          <View style={styles.allDoneContainer}>
            <Text style={styles.allDoneText}> All tasks completed today 🎉</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.completeButton,
              !allCompleted && styles.completeButtonDisabled
            ]}
            onPress={handleMarkAllCompleted}
            disabled={!allCompleted}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>
              Complete All Tasks First
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationText}>
            {allCompleted 
              ? "I'm waiting how you do tomorrow's tasks! Keep the streak going! 💚"
              : `${totalCount - completedCount} task${totalCount - completedCount === 1 ? '' : 's'} remaining. You've got this!`
            }
          </Text>
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  welcomeHeader: {
    backgroundColor: '#2e7d32',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#e8f5e9',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 12,
    color: '#e8f5e9',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2e7d32',
    borderRadius: 4,
  },
  successBanner: {
    backgroundColor: '#d4edda',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successBannerText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#f8d7da',
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorBannerText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#2e7d32',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationCard: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  motivationEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
  },
  allDoneContainer: {
    backgroundColor: '#e6ffe6',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a6f3a6'
  },
  allDoneText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '600'
  },
});

export default HomeScreen;
