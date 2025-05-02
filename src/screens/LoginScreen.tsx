import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { 
  signIn, 
  getCurrentUser, 
  fetchAuthSession,
  resetPassword,
  confirmResetPassword 
} from 'aws-amplify/auth';
import { LinearGradient } from 'react-native-linear-gradient';

// Logo importu
const LogoImage = require('../assets/logo.png');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Auth durumunu kontrol et
    const checkAuthStatus = async () => {
      try {
        setError(null);
        setInitializing(true);
        
        // Zaten giriş yapmış bir kullanıcı var mı?
        const user = await getCurrentUser();
        console.log('Kullanıcı zaten giriş yapmış:', user.username);
        
        // Ana ekrana yönlendir
        navigation.replace('Main');
      } catch (error) {
        // Giriş yapmamış
        console.log('Kullanıcı giriş yapmamış');
      } finally {
        setInitializing(false);
      }
    };

    checkAuthStatus();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Giriş yapılıyor:', { email });
      
      // SRP Auth ile giriş - Gen 2 formatı
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password
      });
      
      console.log('Giriş başarılı:', isSignedIn);
      
      if (isSignedIn) {
        // Ana ekrana git
        navigation.replace('Main');
      }
    } catch (error: any) {
      console.log('Giriş hatası:', error?.message || 'Bilinmeyen hata');
      console.log('Hata detayları:', error?.code, error?.name);
      // Detaylı hata bilgilerini gösterelim
      console.error('Tam hata:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error) {
        if (error.name === 'UserNotConfirmedException') {
          errorMessage = 'Hesabınızı doğrulamanız gerekiyor';
          navigation.navigate('ConfirmAccount', { email });
          return;
        } else if (error.name === 'NotAuthorizedException') {
          errorMessage = 'Geçersiz e-posta veya şifre';
        } else if (error.name === 'UserNotFoundException') {
          errorMessage = 'Bu e-posta adresi ile kayıtlı hesap bulunamadı';
        } else if (error.name === 'NetworkError' || error.name === 'Network error') {
          errorMessage = 'İnternet bağlantınızı kontrol edin (AWS sunucularına erişilemiyor)';
        } else {
          errorMessage = error.message || 'Bağlantı hatası, lütfen daha sonra tekrar deneyin';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // User Pool'da kullanıcıyı CONFIRM durumuna getir
  const confirmUserInPool = async () => {
    if (!email) {
      setError('Lütfen e-posta adresinizi girin');
      return;
    }
    
    navigation.navigate('ConfirmAccount', { email });
  };

  // Şifreyi sıfırla
  const handleResetPassword = async () => {
    if (!email) {
      setError('Lütfen e-posta adresinizi girin');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await resetPassword({
        username: email
      });
      
      Alert.alert(
        'Şifre Sıfırlama',
        'Şifre sıfırlama talimatları e-posta adresinize gönderildi.'
      );
    } catch (error: any) {
      console.log('Şifre sıfırlama hatası:', error);
      setError('Şifre sıfırlanamadı: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  // Manuel giriş işlemi
  const handleManualLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Manuel giriş yapılıyor:', { email });
      
      // Gen 2 formatında signIn
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password
      });
      
      console.log('Manuel giriş başarılı:', isSignedIn);
      Alert.alert('Giriş Başarılı', 'Ana sayfaya yönlendiriliyorsunuz.');
      navigation.replace('Main');
    } catch (error: any) {
      console.log('Manuel giriş hatası:', error);
      console.log('Hata türü:', typeof error);
      console.log('Hata kodu:', error?.code);
      console.log('Hata mesajı:', error?.message);
      
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      if (error?.name === 'UserNotConfirmedException') {
        errorMessage = 'Hesabınızı doğrulamanız gerekiyor';
        navigation.navigate('ConfirmAccount', { email });
        return;
      } else if (error?.name === 'NotAuthorizedException') {
        errorMessage = 'Geçersiz e-posta veya şifre';
      } else if (error?.name === 'UserNotFoundException') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı hesap bulunamadı';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  if (initializing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#000000', '#121212']}
          style={styles.container}
        >
          <View style={styles.content}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Kontrol ediliyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#121212', '#1e1e1e']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
        </View>
        
        <Text style={styles.subtitle}>Uyku Kalitenizi Artırın</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="E-postanızı girin"
                placeholderTextColor="#8a8a8a"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi girin"
                placeholderTextColor="#8a8a8a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={handleResetPassword}
            >
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.googleLoginButton}
              onPress={() => Alert.alert('Google Giriş', 'Google ile giriş özelliği yakında eklenecek.')}
            >
              <View style={styles.googleButtonContent}>
                <Text style={styles.googleLogo}>G</Text>
                <Text style={styles.googleLoginText}>Google ile Giriş Yap</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>Hesabınız yok mu? <Text style={styles.registerButtonTextBold}>Kayıt Ol</Text></Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>

        </View>
      </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    
  },
  container: {
    flex: 1,
    
    justifyContent: 'center',
    
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
    justifyContent: 'center',
  },
  logoImage: {
    width: 250,
    height: 200,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 0,
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(50, 50, 50, 0.25)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 25,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9,
  },
  input: {
    backgroundColor: 'rgba(70, 70, 70, 0.3)',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.5)',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  registerButtonTextBold: {
    fontWeight: 'bold',
    color: '#4a90e2',
    opacity: 1,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: '#4a90e2',
    fontSize: 15,
    opacity: 0.9,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  testButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.5)',
  },
  testButtonText: {
    color: '#27ae60',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  googleLoginButton: {
    backgroundColor: 'rgba(70, 70, 70, 0.5)',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.5)',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
    backgroundColor: '#4285F4',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
    overflow: 'hidden',
  },
  googleLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen; 