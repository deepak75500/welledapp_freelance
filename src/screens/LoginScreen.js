import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator
} from 'react-native';
import { login as loginService } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await loginService(email, password);

    if (result.success) {
      setSuccessMessage('✅ Login successful! Welcome back...');
      setTimeout(() => {
        login(result.user);
      }, 800);
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
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌟</Text>
          <Text style={styles.title}>WellEd</Text>
          <Text style={styles.subtitle}>Professional Wellness App</Text>
        </View>

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
          placeholder="Email"
          placeholderTextColor="#000"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#000"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage('');
            }}
            secureTextEntry={!showPassword}
            editable={!loading}
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={{ color: '#2e7d32', fontSize: 18 }}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>Logging in...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
          disabled={loading}
        >
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkTextBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoEmoji: { fontSize: 64, marginBottom: 16 },
  title: { 
    fontSize: 42, 
    fontWeight: 'bold', 
    color: '#2e7d32', 
    textShadowColor: '#a3ffb5', 
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginBottom: 8
  },
  subtitle: { fontSize: 16, color: '#555' },
  successBox: {
    backgroundColor: '#e0f7e9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  successText: { color: '#2e7d32', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  errorBox: {
    backgroundColor: '#fde0e0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff3b30',
  },
  errorText: { color: '#d32f2f', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  input: { 
    backgroundColor: '#f5f5f5', 
    color: '#000',  // <-- text color changed to black
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#2e7d32',
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: { paddingHorizontal: 12 },
  button: { 
    backgroundColor: '#2e7d32', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8, 
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#555', fontSize: 14 },
  linkTextBold: { color: '#2e7d32', fontWeight: '700' },
});

export default LoginScreen;
