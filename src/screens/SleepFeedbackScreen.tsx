import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Text } from '../components/Text';

const SleepFeedbackScreen = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRating = (value: number) => {
    setRating(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h1">Uyku Geri Bildirimi</Text>
          <Text variant="body" color={theme.colors.text.secondary}>
            Gece uykunuzu değerlendirin
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Uyku Özeti */}
        <Card elevation="medium" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Icon name="bed" size={24} color={theme.colors.primary} />
            <Text variant="h3">Uyku Özeti</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text variant="body" color={theme.colors.text.secondary}>Uyku Süresi</Text>
              <Text variant="h3">7 saat 30 dakika</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="body" color={theme.colors.text.secondary}>Uyku Kalitesi</Text>
              <Text variant="h3">85%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="body" color={theme.colors.text.secondary}>Derin Uyku</Text>
              <Text variant="h3">2 saat 15 dakika</Text>
            </View>
          </View>
        </Card>

        {/* Puanlama */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Uyku Kalitesi Puanı</Text>
          <Card elevation="medium" style={styles.ratingCard}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleRating(value)}
                  style={styles.ratingButton}>
                  <Icon
                    name={value <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={value <= rating ? theme.colors.accent : theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Geri Bildirim */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Geri Bildirim</Text>
          <Card elevation="medium" style={styles.feedbackCard}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Uykunuz hakkında düşüncelerinizi paylaşın..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
            />
          </Card>
        </View>

        {/* Gönder Butonu */}
        <Button
          title="Geri Bildirimi Gönder"
          variant="primary"
          onPress={() => {}}
          style={styles.submitButton}
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
  summaryCard: {
    margin: theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryContent: {
    gap: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  ratingCard: {
    padding: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  ratingButton: {
    padding: theme.spacing.sm,
  },
  feedbackCard: {
    padding: theme.spacing.md,
  },
  feedbackInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    color: theme.colors.text.primary,
  },
  submitButton: {
    margin: theme.spacing.lg,
  },
});

export default SleepFeedbackScreen; 