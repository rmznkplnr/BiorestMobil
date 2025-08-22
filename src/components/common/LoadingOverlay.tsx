import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Colors } from '../../constants/Colors';

interface LoadingOverlayProps {
  visible: boolean;
  type?: 'default' | 'health' | 'device' | 'sync' | 'auth';
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  type = 'default',
  title,
  subtitle,
  showProgress = false,
  progress = 0,
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'health':
        return {
          icon: '💓',
          color: '#FF6B6B',
          defaultTitle: 'Sağlık Verileri Yükleniyor...',
          defaultSubtitle: 'Verileriniz analiz ediliyor',
        };
      case 'device':
        return {
          icon: '⌚',
          color: '#4ECDC4',
          defaultTitle: 'Cihaz Bağlanıyor...',
          defaultSubtitle: 'Mi Band 3 ile eşleştiriliyor',
        };
      case 'sync':
        return {
          icon: '🔄',
          color: '#45B7D1',
          defaultTitle: 'Senkronizasyon...',
          defaultSubtitle: 'AWS ile veriler senkronize ediliyor',
        };
      case 'auth':
        return {
          icon: '🔐',
          color: '#A8E6CF',
          defaultTitle: 'Giriş Yapılıyor...',
          defaultSubtitle: 'Hesabınız doğrulanıyor',
        };
      default:
        return {
          icon: '⏳',
          color: '#667eea',
          defaultTitle: 'Yükleniyor...',
          defaultSubtitle: 'Lütfen bekleyin',
        };
    }
  };

  const config = getLoadingConfig();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[styles.gradientContainer, { backgroundColor: config.color }]}
        >
          <View style={styles.content}>
            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
              <Text style={styles.iconText}>{config.icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {title || config.defaultTitle}
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {subtitle || config.defaultSubtitle}
            </Text>

            {/* Loading Indicator */}
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>

            {/* Progress Bar */}
            {showProgress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress}%`, backgroundColor: 'white' }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}

            {/* Animated Dots */}
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, { backgroundColor: 'white' }]} />
              <View style={[styles.dot, { backgroundColor: 'white' }]} />
              <View style={[styles.dot, { backgroundColor: 'white' }]} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    borderRadius: 20,
    padding: 30,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconText: {
    fontSize: 32,
    color: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.6,
  },
});

export default LoadingOverlay; 