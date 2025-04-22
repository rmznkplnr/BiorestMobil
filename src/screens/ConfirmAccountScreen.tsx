import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Auth } from 'aws-amplify';
import { LinearGradient } from 'react-native-linear-gradient';

type ConfirmAccountScreenRouteProp = RouteProp<RootStackParamList, 'ConfirmAccount'>;
type ConfirmAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ConfirmAccountScreen = () => {
  const navigation = useNavigation<ConfirmAccountScreenNavigationProp>();
  const route = useRoute<ConfirmAccountScreenRouteProp>();
  const { email } = route.params || { email: '' };
  
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmation = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!confirmationCode) {
        setError('Lütfen doğrulama kodunu girin');
        setLoading(false);
        return;
      }

      console.log('Doğrulama kodu gönderiliyor:', { email, code: confirmationCode });

      await Auth.confirmSignUp(email, confirmationCode);

      console.log('Doğrulama başarılı');

      Alert.alert(
        'Hesap Doğrulandı',
        'Hesabınız başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Auth') }]
      );
    } catch (error: any) {
      console.log('Doğrulama hatası:', error);
      
      let errorMessage = 'Doğrulama sırasında bir hata oluştu';
      
      if (error && error.code) {
        if (error.code === 'CodeMismatchException') {
          errorMessage = 'Geçersiz doğrulama kodu';
        } else if (error.code === 'ExpiredCodeException') {
          errorMessage = 'Doğrulama kodu süresi doldu';
        } else if (error.code === 'LimitExceededException') {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin';
        } else {
          errorMessage = `Hata: ${error.code} - ${error.message || 'Detay yok'}`;
        }
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationCode = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('Doğrulama kodu yeniden gönderiliyor:', email);
      await Auth.resendSignUp(email);
      console.log('Yeniden gönderme başarılı');

      Alert.alert(
        'Kod Yeniden Gönderildi',
        'Doğrulama kodu e-posta adresinize yeniden gönderildi. Lütfen spam klasörünüzü de kontrol edin.'
      );
    } catch (error: any) {
      console.log('Kod yeniden gönderme hatası:', error);
      console.log('Hata detayları:', error?.code, error?.name, error?.message);
      
      let errorMessage = 'Kod yeniden gönderilirken bir hata oluştu';
      
      if (error && error.code) {
        if (error.code === 'LimitExceededException') {
          errorMessage = 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin';
        } else if (error.code === 'UserNotFoundException') {
          errorMessage = 'Bu e-posta adresi ile kayıtlı hesap bulunamadı';
        } else if (error.code === 'InvalidParameterException') {
          errorMessage = 'Geçersiz e-posta formatı';
        } else {
          errorMessage = `Hata: ${error.code} - ${error.message || 'Detay yok'}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#1e3c72', '#2a5298']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Hesap Doğrulama</Text>
          <Text style={styles.subtitle}>
            E-posta adresinize gönderilen doğrulama kodunu girin
          </Text>

          <View style={styles.form}>
            <Text style={styles.emailText}>E-posta: {email}</Text>

            <TextInput
              style={styles.input}
              placeholder="Doğrulama Kodu"
              placeholderTextColor="#666"
              value={confirmationCode}
              onChangeText={setConfirmationCode}
              keyboardType="number-pad"
              autoCapitalize="none"
              maxLength={6}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Doğrula</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={resendConfirmationCode}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>Kodu Tekrar Gönder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Auth')}
            >
              <Text style={styles.backButtonText}>Giriş Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ConfirmAccountScreen; 