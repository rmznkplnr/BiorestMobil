import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';
import { useDevices } from '../context/DeviceContext';

type DevicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DevicesScreen = () => {
  const navigation = useNavigation<DevicesScreenNavigationProp>();
  const { devices } = useDevices();
  
  // Animasyon değerleri
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Sayfa odaklandığında animasyonları başlat
  useFocusEffect(
    React.useCallback(() => {
      // Paralel animasyonlar
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
      
      return () => {
        // Sayfa odağını kaybettiğinde animasyonları sıfırla
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        scaleAnim.setValue(0.9);
      };
    }, [])
  );

  const gradientColors = [
    ['#1e3c72', '#2a5298'], // dark blue
    ['#2C3E50', '#3498db'], // night blue
    ['#373B44', '#4286f4'], // steel blue
    ['#0F2027', '#203A43'], // ocean blue
    ['#000046', '#1CB5E0'], // midnight
    ['#243B55', '#141E30'], // deep sea
  ];

  const getGradientColors = (index: number) => {
    return gradientColors[index % gradientColors.length];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Cihazlarım</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('DeviceManagement')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{translateY: Animated.multiply(slideAnim, 1.2)}]
            }}
          >
            <View style={styles.devicesGrid}>
              {/* Mi Band 3 Kartı */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: Animated.multiply(slideAnim, 1)
                  }, {
                    scale: Animated.add(0.9, Animated.multiply(scaleAnim, 0.1))
                  }]
                }}
              >
                <TouchableOpacity
                  style={[styles.deviceCard, styles.miBandCard]}
                  onPress={() => navigation.navigate('MiBand3')}
                >
                  <LinearGradient
                    colors={['#9C27B0', '#673AB7']}
                    style={styles.deviceGradient}
                  >
                    <View style={styles.deviceHeader}>
                      <Ionicons 
                        name="watch" 
                        size={24} 
                        color="#fff" 
                      />
                     
                    </View>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>Mi Band 3</Text>
                      <Text style={styles.deviceType}>
                        Akıllı Bileklik ile Sağlık Takibi
                      </Text>
                      
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Mevcut Cihazlar */}
              {devices.map((device, index) => (
                <Animated.View
                  key={device.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateY: Animated.multiply(slideAnim, 1 + ((index + 1) * 0.15))
                    }, {
                      scale: Animated.add(0.9, Animated.multiply(scaleAnim, 0.1))
                    }]
                  }}
                >
                  <TouchableOpacity
                    style={styles.deviceCard}
                    onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.deviceId })}
                  >
                    <LinearGradient
                      colors={getGradientColors(index)}
                      style={styles.deviceGradient}
                    >
                      <View style={styles.deviceHeader}>
                        <Ionicons 
                          name={device.type === 'faunus' ? 'bed-outline' : 'watch-outline'} 
                          size={24} 
                          color="#fff" 
                        />
                        <View style={[
                          styles.connectionStatus,
                          device.connected ? styles.connected : styles.disconnected
                        ]} />
                      </View>
                      <View style={styles.deviceInfo}>
                        <Text style={styles.deviceName}>{device.name}</Text>
                        <Text style={styles.deviceType}>
                          {device.type === 'faunus' ? 'Faunus Cihazı' : 'Akıllı Saat'}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.select({ ios: 100, android: 80 }),
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceCard: {
    width: Platform.OS === 'ios' ? '47%' : '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  deviceGradient: {
    padding: Platform.OS === 'ios' ? 18 : 15,
    height: Platform.OS === 'ios' ? 150 : 140,
    width: '100%',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 15,
  },
  connectionStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#f44336',
  },
  deviceInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  deviceType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  miBandCard: {
    width: '100%',
    marginBottom: 15,
  },
  miBandBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  miBandBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  miBandFeature: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
});

export default DevicesScreen; 