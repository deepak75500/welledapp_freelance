import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView
} from 'react-native';
import { register } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password || !confirmPassword || !username) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(email, password, username);

    if (result.success) {
      setSuccessMessage('✅ Account created! Logging you in...');
      setTimeout(() => {
        login(result.user);
      }, 1000);
    } else {
      setLoading(false);
      setErrorMessage(result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join WellEd today</Text>

          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#000"
            value={username}
            onChangeText={(text) => { setUsername(text); setErrorMessage(''); }}
            autoCapitalize="words"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#000"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#000"
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Text style={{ color: '#2e7d32', fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm Password"
              placeholderTextColor="#000"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(''); }}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
              <Text style={{ color: '#2e7d32', fontSize: 18 }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 8, textShadowColor: '#a3ffb5', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 32 },
  successBox: { backgroundColor: '#e0f7e9', padding: 16, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#2e7d32' },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorBox: { backgroundColor: '#fde0e0', padding: 16, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#ff3b30' },
  errorText: { color: '#d32f2f', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  input: { backgroundColor: '#fff', color: '#000', padding: 16, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#2e7d32' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeButton: { paddingHorizontal: 12 },
  button: { backgroundColor: '#2e7d32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, elevation: 4 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#555', fontSize: 14 },
  linkTextBold: { color: '#2e7d32', fontWeight: '700' },
});

export default RegisterScreen;
