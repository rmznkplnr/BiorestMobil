import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  const userInfo = {
    name: 'Admin',
    email: 'admin@biorest.com',
    phone: '+90 555 123 4567',
    address: 'İstanbul, Türkiye',
  };

  const menuItems = [
    {
      icon: 'bell-outline',
      title: 'Bildirim Ayarları',
      screen: 'NotificationSettings',
    },
    {
      icon: 'cog-outline',
      title: 'Cihaz Ayarları',
      screen: 'DeviceSettings',
    },
    {
      icon: 'history',
      title: 'Geçmiş',
      screen: 'History',
    },
    {
      icon: 'chart-bar',
      title: 'İstatistikler',
      screen: 'Statistics',
    },
    {
      icon: 'help-circle-outline',
      title: 'Yardım ve Destek',
    },
    {
      icon: 'information-outline',
      title: 'Hakkında',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Profil</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Hesap ayarlarınızı yönetin
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Profil Bilgileri */}
        <Card elevation="medium" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle" size={80} color={theme.colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userEmail}>{userInfo.email}</Text>
              <Text style={styles.userPhone}>{userInfo.phone}</Text>
              <Text style={styles.userAddress}>{userInfo.address}</Text>
            </View>
          </View>
        </Card>

        {/* Hesap Ayarları */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Hesap Ayarları</Text>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              style={styles.menuItem}
              onPress={() => item.screen && navigation.navigate(item.screen as any)}>
              <View style={styles.menuItemContent}>
                <Icon name={item.icon} size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Icon name="chevron-right" size={24} color={theme.colors.text.secondary} />
              </View>
            </Card>
          ))}
        </View>

        {/* Çıkış Yap */}
        <Button
          title="Çıkış Yap"
          variant="secondary"
          onPress={() => {}}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  userAddress: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    marginBottom: theme.spacing.sm,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    margin: theme.spacing.lg,
  },
});

export default ProfileScreen; 