import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaWrapper } from '../components/common/SafeAreaWrapper';
import { Colors } from '../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { PermissionService } from '../services/PermissionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: any;
  showButton?: boolean;
  buttonText?: string;
  buttonAction?: () => void;
}

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // İlk açılışta onboarding durumunu kontrol et
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 Onboarding durumu kontrol ediliyor...');
      setIsCheckingOnboarding(true);
      
      const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      
      if (onboardingCompleted === 'true') {
        console.log('✅ Onboarding zaten tamamlanmış, login sayfasına yönlendiriliyor...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' as never }]
        });
        return;
      }
      
      console.log('📱 İlk kurulum - onboarding gösterilecek');
      setIsCheckingOnboarding(false);
      
    } catch (error) {
      console.error('❌ Onboarding durumu kontrol hatası:', error);
      setIsCheckingOnboarding(false);
    }
  };

  // Onboarding tamamlandığında login'e yönlendir
  const completeOnboarding = async () => {
    try {
      // Onboarding tamamlandı olarak işaretle
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      console.log('✅ Onboarding tamamlandı, login sayfasına yönlendiriliyor...');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }]
      });
    } catch (error) {
      console.error('❌ Onboarding tamamlama hatası:', error);
    }
  };

  // İzinleri ver butonuna basıldığında
  const handlePermissionsGranted = async () => {
    const granted = await PermissionService.requestAllPermissions();
    if (granted) {
      console.log('✅ Tüm izinler verildi, onboarding tamamlanıyor...');
      completeOnboarding();
    } else {
      console.log('❌ Bazı izinler reddedildi');
      Alert.alert(
        'İzinler Gerekli',
        'Uygulamanın düzgün çalışması için tüm izinlerin verilmesi gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Tekrar Dene', onPress: () => handlePermissionsGranted() }
        ]
      );
    }
  };

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      title: 'BioRest Mobil',
      subtitle: 'Sağlığınızı Takip Edin',
      description: 'Mi Band 3 akıllı bilekliğiniz ile sağlık verilerinizi sürekli takip edin, uyku kalitenizi analiz edin ve fitness hedeflerinize ulaşın.',
      image: require('../assets/logo.png'),
      showButton: false,
    },
    {
      id: 2,
      title: 'Sürekli İzleme',
      subtitle: '7/24 Sağlık Takibi',
      description: 'Uygulama arka planda sürekli çalışarak Mi Band 3\'ten veri toplar, analiz eder ve AWS bulut sunucusuna senkronize eder.',
      image: require('../assets/logo.png'),
      showButton: false,
    },
    {
      id: 3,
      title: 'Şartlar ve Koşullar',
      subtitle: 'Kullanım Koşulları',
      description: 'Bu uygulamayı kullanarak aşağıdaki şartları kabul etmiş olursunuz:\n\n• Uygulama sağlık verilerinizi toplar ve işler\n• Veriler AWS bulut sunucusunda güvenli şekilde saklanır\n• Uygulama arka planda sürekli çalışır\n• Bluetooth ve konum izinleri gereklidir',
      image: require('../assets/logo.png'),
      showButton: true,
      buttonText: 'Kabul Ediyorum',
      buttonAction: () => {
        console.log('🔘 Şartlar kabul butonuna tıklandı');
        setAcceptedTerms(true);
        console.log('✅ acceptedTerms güncellendi:', true);
      },
    },
    {
      id: 4,
      title: 'Gizlilik Politikası',
      subtitle: 'Veri Güvenliği',
      description: 'Gizliliğiniz bizim için önemli:\n\n• Sağlık verileriniz sadece size aittir\n• Veriler şifrelenmiş olarak saklanır\n• Üçüncü taraflarla paylaşılmaz\n• Veri silme hakkınız vardır',
      image: require('../assets/logo.png'),
      showButton: true,
      buttonText: 'Kabul Ediyorum',
      buttonAction: () => {
        console.log('🔘 Gizlilik politikası kabul butonuna tıklandı');
        setAcceptedPrivacy(true);
        console.log('✅ acceptedPrivacy güncellendi:', true);
      },
    },
    {
      id: 5,
      title: 'İzinler',
      subtitle: 'Gerekli İzinler',
      description: 'Uygulamanın düzgün çalışması için aşağıdaki izinlere ihtiyacımız var:\n\n• Bluetooth: Mi Band 3 bağlantısı için\n• Konum: Bluetooth tarama için\n• Bildirimler: Arka plan servisi için\n• Health Connect: Sağlık verileri için',
      image: require('../assets/logo.png'),
      showButton: true,
      buttonText: 'İzinleri Ver',
      buttonAction: () => {
        console.log('🔘 İzinleri ver butonuna tıklandı');
        handlePermissionsGranted();
      },
    },
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ x: (currentStep + 1) * width, animated: true });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ x: (currentStep - 1) * width, animated: true });
    }
  };

  const canProceed = () => {
    console.log('🔍 canProceed kontrol ediliyor:', {
      currentStep,
      acceptedTerms,
      acceptedPrivacy
    });
    
    // İlk iki adım (0, 1) - buton yok, her zaman true
    if (currentStep <= 1) {
      return true;
    }
    
    // Şartlar adımı (index 2) - sadece şartları kabul etmek yeterli
    if (currentStep === 2) {
      const result = true; // Bu adımda buton her zaman aktif olmalı
      console.log('📋 Şartlar adımı - canProceed:', result);
      return result;
    }
    
    // Gizlilik adımı (index 3) - şartlar kabul edilmiş olmalı
    if (currentStep === 3) {
      const result = acceptedTerms; // Sadece şartlar yeterli
      console.log('🔒 Gizlilik adımı - canProceed:', result);
      return result;
    }
    
    // İzinler adımı (index 4) - hem şartlar hem gizlilik kabul edilmiş olmalı
    if (currentStep === 4) {
      const result = acceptedTerms && acceptedPrivacy;
      console.log('🔐 İzinler adımı - canProceed:', result);
      return result;
    }
    
    return true;
  };

  const renderStep = (step: OnboardingStep) => (
    <View key={step.id} style={styles.stepContainer}>
      <View style={styles.imageContainer}>
        <Image source={step.image} style={styles.stepImage} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
        
        {step.showButton && (
          <>
            <TouchableOpacity
              style={styles.actionButton} // disabled style'ı kaldırdım
              onPress={() => {
                console.log('🔘 Buton tıklandı! Step:', step.id, 'ButtonText:', step.buttonText);
                if (step.buttonAction) {
                  step.buttonAction();
                } else {
                  console.log('❌ buttonAction tanımlı değil!');
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>{step.buttonText}</Text>
            </TouchableOpacity>
            
            {/* Debug buton durumu */}
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Buton Aktif: {canProceed() ? '✅' : '❌'}
              </Text>
              <Text style={styles.debugText}>
                Step: {step.id}, CurrentStep: {currentStep}
              </Text>
            </View>
          </>
        )}
        
        {/* Debug info */}
        <Text style={styles.debugText}>
          Step: {step.id}, ShowButton: {step.showButton ? 'true' : 'false'}, 
          CanProceed: {canProceed() ? 'true' : 'false'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaWrapper backgroundColor={Colors.primary}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Onboarding kontrol ediliyor mu? */}
      {isCheckingOnboarding ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} / {onboardingSteps.length}
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newStep = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentStep(newStep);
            }}
            style={styles.scrollView}
          >
            {onboardingSteps.map(renderStep)}
          </ScrollView>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentStep === 0 && styles.navButtonHidden]}
              onPress={prevStep}
            >
              <Text style={styles.navButtonText}>Geri</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                styles.navButtonPrimary,
                currentStep === onboardingSteps.length - 1 && styles.navButtonHidden
              ]}
              onPress={nextStep}
            >
              <Text style={styles.navButtonText}>İleri</Text>
            </TouchableOpacity>
          </View>

          {/* Skip Button */}
          {currentStep < onboardingSteps.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate('Main' as never)}
            >
              <Text style={styles.skipButtonText}>Atla</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  progressText: {
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width,
    height: height * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    marginBottom: 30,
  },
  stepImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: Colors.text,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
  },
  actionButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  navButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.text,
    minWidth: 100,
  },
  navButtonPrimary: {
    backgroundColor: Colors.text,
  },
  navButtonHidden: {
    opacity: 0,
  },
  navButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: Colors.text,
    fontSize: 16,
    opacity: 0.8,
  },
  debugText: {
    color: Colors.text,
    fontSize: 12,
    marginTop: 10,
    opacity: 0.6,
  },
  debugContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
}); 