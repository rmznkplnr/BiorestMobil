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
  Platform,
  Image,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { signUp, signIn, autoSignIn } from 'aws-amplify/auth';
import { LinearGradient } from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Logo importu
const LogoImage = require('../assets/logo.png');

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tarih seçici için state
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const validateInputs = () => {
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }

    // AWS Cognito şifre gereksinimleri - Minimum uzunluk kontrolü
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return false;
    }

    // Telefon numarası formatlama kontrolü (basit kontrol)
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      setError('Telefon numarası "+" ile başlamalıdır (Örn: +905551234567)');
      return false;
    }

    return true;
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
    setBirthdate(formattedDate);
    hideDatePicker();
  };

  const formatPhoneNumber = (text: string) => {
    // Telefon numarasının + ile başlamasını sağla
    if (text && !text.startsWith('+')) {
      return '+' + text.replace(/\D/g, '');
    }
    return text.replace(/[^+0-9]/g, '');
  };

  const handleRegister = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!validateInputs()) {
        setLoading(false);
        return;
      }

      console.log('Kayıt işlemi başlatılıyor...');
      console.log('Giriş bilgileri:', { 
        email, 
        password: '********',
        phoneNumber: phoneNumber || 'Belirtilmedi',
        birthdate: birthdate || 'Belirtilmedi'
      });

      // Kullanıcı öznitelikleri için obje oluştur
      const userAttributes: any = {
        email,
        name: fullName
      };

      // Opsiyonel alanları ekle
      if (phoneNumber) {
        userAttributes.phone_number = phoneNumber;
      }
      
      if (birthdate) {
        userAttributes.birthdate = birthdate;
      }

      // AWS Amplify Gen 2 için signUp işlemi
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes,
          autoSignIn: true
        }
      });

      console.log('Kayıt cevabı:', { isSignUpComplete, userId, nextStep });

      if (isSignUpComplete) {
        try {
          // autoSignIn etkinleştirildi ise otomatik oturum açar
          const { isSignedIn } = await autoSignIn();
          
          if (isSignedIn) {
            console.log('Otomatik giriş başarılı');
            
            Alert.alert(
              'Kayıt Başarılı',
              'Hesabınız oluşturuldu ve giriş yapıldı.',
              [
                {
                  text: 'Tamam',
                  onPress: () => navigation.navigate('Main')
                }
              ]
            );
          } else {
            // Manuel olarak giriş yapmak gerekebilir
            Alert.alert(
              'Kayıt Başarılı',
              'Hesabınız oluşturuldu. Lütfen giriş yapın.',
              [
                {
                  text: 'Tamam',
                  onPress: () => navigation.navigate('Auth')
                }
              ]
            );
          }
        } catch (signInError) {
          console.log('Otomatik giriş hatası:', signInError);
          Alert.alert(
            'Kayıt Başarılı',
            'Hesabınız oluşturuldu. Lütfen giriş yapın.',
            [
              {
                text: 'Tamam',
                onPress: () => navigation.navigate('Auth')
              }
            ]
          );
        }
      } else {
        if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          // Eğer doğrulama gerekiyorsa
          navigation.navigate('ConfirmAccount', { email });
        } else if (nextStep.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
          try {
            // autoSignIn işlemi tamamlanmamış, tamamlama girişimi
            const { isSignedIn } = await autoSignIn();
            
            if (isSignedIn) {
              Alert.alert(
                'Kayıt Başarılı',
                'Hesabınız oluşturuldu ve giriş yapıldı.',
                [
                  {
                    text: 'Tamam',
                    onPress: () => navigation.navigate('Main')
                  }
                ]
              );
            } else {
              navigation.navigate('Auth');
            }
          } catch (error) {
            navigation.navigate('Auth');
          }
        }
      }
    } catch (error: any) {
      console.log('HATA TÜRÜ:', typeof error);
      
      if (error && typeof error === 'object') {
        console.log('HATA YAPISI:', Object.keys(error));
      }
      
      console.log('Detaylı hata:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Kayıt sırasında bir hata oluştu';
      
      if (error && error.name) {
        console.log('Hata adı:', error.name);
        if (error.name === 'UsernameExistsException') {
          errorMessage = 'Bu e-posta adresi zaten kayıtlı';
        } else if (error.name === 'InvalidPasswordException') {
          errorMessage = 'Şifre gereksinimleri karşılanmıyor: En az 8 karakter uzunluğunda olmalıdır';
        } else if (error.name === 'InvalidParameterException') {
          errorMessage = 'Geçersiz e-posta formatı';
        } else if (error.name === 'NetworkError') {
          errorMessage = 'İnternet bağlantınızı kontrol edin';
        } else {
          errorMessage = `Hata: ${error.name} - ${error.message || 'Detay yok'}`;
        }
      } else if (error && error.message) {
        errorMessage = `Hata mesajı: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = `Kayıt sırasında hata: ${JSON.stringify(error)}`;
      }
      
      setError(errorMessage);
      console.log('Kayıt hatası detayları:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000000"
      />
      <LinearGradient
        colors={['#000000', '#121212', '#1e1e1e']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.subtitle}>Biorest'e Hoş Geldiniz</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kayıt Ol</Text>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>İsim</Text>
                <TextInput
                  style={styles.input}
                  placeholder="İsminizi girin"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresinizi girin"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Telefon Numarası (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+905551234567"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Doğum Tarihi (Opsiyonel)</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatePicker}
                >
                  <Text style={styles.datePickerButtonText}>
                    {birthdate ? birthdate : 'Doğum tarihinizi seçin'}
                  </Text>
                </TouchableOpacity>
                
                {/* Modal DateTimePicker */}
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirmDate}
                  onCancel={hideDatePicker}
                  maximumDate={new Date()}
                  confirmTextIOS="Seç"
                  cancelTextIOS="İptal"
                  title="Doğum Tarihi Seç"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.googleRegisterButton}
                onPress={() => Alert.alert('Google Kayıt', 'Google ile kayıt özelliği yakında eklenecek.')}
              >
                <View style={styles.googleButtonContent}>
                  <Text style={styles.googleLogo}>G</Text>
                  <Text style={styles.googleRegisterText}>Google ile Kayıt Ol</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Auth')}
              >
                <Text style={styles.loginButtonText}>
                  Zaten bir hesabınız var mı? <Text style={styles.loginButtonTextBold}>Giriş yap</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
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
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  logoImage: {
    width: 250,
    height: 150,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
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
  datePickerButton: {
    backgroundColor: 'rgba(70, 70, 70, 0.3)',
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 100, 100, 0.5)',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  googleRegisterButton: {
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
  googleRegisterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  loginButtonTextBold: {
    fontWeight: 'bold',
    color: '#4a90e2',
    opacity: 1,
  },
});

export default RegisterScreen; 