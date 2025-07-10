import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Product, sampleProducts } from './StoreScreen';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  avatarColor: string;
}

// Örnek ürün değerlendirmeleri
const sampleReviews: Record<string, ProductReview[]> = {
  '1': [
    {
      id: '1',
      userName: 'Ayşe Y.',
      rating: 5,
      date: '15.10.2024',
      comment: 'Uyku kalitemi ciddi anlamda artırdı. Uyumadan önce otomatik olarak oda ısısını ve ışığı ayarlıyor, çok memnunum.',
      avatarColor: '#3498db',
    },
    {
      id: '2',
      userName: 'Mehmet K.',
      rating: 4,
      date: '02.09.2024',
      comment: 'Geceleri uykum çok iyileşti, ancak uygulama arayüzü biraz karmaşık. Yine de ürüne değer.',
      avatarColor: '#e74c3c',
    },
    {
      id: '3',
      userName: 'Zeynep A.',
      rating: 5,
      date: '29.08.2024',
      comment: 'Health Connect ile entegrasyonu mükemmel. Sabah kalkınca tüm uyku metriklerimi görebiliyorum. Kesinlikle tavsiye ederim.',
      avatarColor: '#2ecc71',
    }
  ],
  '2': [
    {
      id: '1',
      userName: 'Ahmet B.',
      rating: 5,
      date: '12.11.2024',
      comment: 'Lavanta esansı gerçekten rahatlatıcı, uyku sorunlarım için birebir oldu.',
      avatarColor: '#9b59b6',
    },
    {
      id: '2',
      userName: 'Deniz T.',
      rating: 4,
      date: '05.10.2024',
      comment: 'Koku çok güzel ve kalıcı, ancak şişesi biraz daha büyük olabilirdi.',
      avatarColor: '#f39c12',
    }
  ],
  '3': [
    {
      id: '1',
      userName: 'Selin K.',
      rating: 5,
      date: '20.09.2024',
      comment: 'Vanilya kokusu harika, hem rahatlatıcı hem de oda kokusu olarak kullanılabiliyor.',
      avatarColor: '#1abc9c',
    },
    {
      id: '2',
      userName: 'Caner D.',
      rating: 4,
      date: '15.08.2024',
      comment: 'Güzel bir ürün, fiyatı biraz daha uygun olabilirdi.',
      avatarColor: '#d35400',
    },
    {
      id: '3',
      userName: 'Pınar S.',
      rating: 5,
      date: '01.06.2025',
      comment: 'Vanilya kokusu çok doğal, yapay değil. Uyumadan önce kullanınca huzur veriyor.',
      avatarColor: '#27ae60',
    }
  ]
};

// Örnek teknik özellikler
const technicalSpecs: Record<string, { title: string, value: string }[]> = {
  '1': [
    { title: 'Sensör Teknolojisi', value: 'Temassız IR Sensör' },
    { title: 'Bağlantı', value: 'Bluetooth 5.0, Wi-Fi' },
    { title: 'Pil Ömrü', value: '5-7 gün' },
    { title: 'Ağırlık', value: '450g' },
    { title: 'Boyutlar', value: '15cm x 15cm x 5cm' },
    { title: 'Uygulama Desteği', value: 'iOS, Android' },
    { title: 'Ses Seviyesi', value: '0-80 dB' },
    { title: 'Garanti', value: '2 Yıl' },
  ],
  '2': [
    { title: 'İçerik', value: '%100 Doğal Lavanta Esansı' },
    { title: 'Miktar', value: '50ml' },
    { title: 'Kullanım Süresi', value: '~90 gün' },
    { title: 'Menşei', value: 'Türkiye' },
    { title: 'Koku Yoğunluğu', value: 'Orta-Yüksek' },
    { title: 'Kullanım Alanları', value: 'Uyku, Meditasyon, Aroma Terapi' },
  ],
  '3': [
    { title: 'İçerik', value: '%100 Doğal Vanilya Esansı' },
    { title: 'Miktar', value: '50ml' },
    { title: 'Kullanım Süresi', value: '~90 gün' },
    { title: 'Menşei', value: 'Madagaskar' },
    { title: 'Koku Yoğunluğu', value: 'Orta' },
    { title: 'Kullanım Alanları', value: 'Uyku, Rahatlama, Oda Kokusu' },
  ],
};

const ProductDetailScreen = () => {
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  // Ürünü ID'ye göre bul
  const product = sampleProducts.find(p => p.id === productId);
  
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Ürün bulunamadı</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const productReviews = sampleReviews[productId] || [];
  const specs = technicalSpecs[productId] || [];

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: ProductReview }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{item.userName.charAt(0)}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewUserName}>{item.userName}</Text>
          <View style={styles.reviewRating}>
            {renderStars(item.rating)}
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.productImageContainer}>
          <LinearGradient
            colors={['#2c3e50', '#3498db']}
            style={styles.imageGradient}
          >
            <Image 
              source={product.image} 
              style={styles.productImage} 
              resizeMode="contain"
            />
          </LinearGradient>
        </View>

        <View style={styles.productHeader}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <View style={styles.ratingRow}>
            {renderStars(product.rating)}
            <Text style={styles.reviewCount}>({product.reviewCount} değerlendirme)</Text>
          </View>
          <Text style={styles.productPrice}>{product.price.toLocaleString('tr-TR')} ₺</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'description' && styles.activeTab]}
            onPress={() => setActiveTab('description')}
          >
            <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>Açıklama</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'specs' && styles.activeTab]}
            onPress={() => setActiveTab('specs')}
          >
            <Text style={[styles.tabText, activeTab === 'specs' && styles.activeTabText]}>Teknik Özellikler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>Değerlendirmeler</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'description' && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{product.description}</Text>
              <View style={styles.descriptionDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                  <Text style={styles.detailText}>Hızlı teslimat</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                  <Text style={styles.detailText}>İade garantisi</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                  <Text style={styles.detailText}>Orijinal ürün</Text>
                </View>
                {product.category === 'device' && (
                  <View style={styles.detailRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
                    <Text style={styles.detailText}>2 yıl garanti</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === 'specs' && (
            <View style={styles.specsContainer}>
              {specs.map((spec, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.specRow, 
                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  <Text style={styles.specTitle}>{spec.title}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.reviewsContainer}>
              <View style={styles.averageRating}>
                <Text style={styles.ratingBig}>{product.rating.toFixed(1)}</Text>
                <View>
                  {renderStars(product.rating)}
                  <Text style={styles.totalReviews}>{product.reviewCount} değerlendirme</Text>
                </View>
              </View>

              {productReviews.length > 0 ? (
                <FlatList
                  data={productReviews}
                  renderItem={renderReviewItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.noReviews}>Henüz değerlendirme yapılmamış.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => {
            Alert.alert('Sepete Eklendi', `${product.name} sepete eklendi.`);
          }}
        >
          <Text style={styles.addToCartText}>Sepete Ekle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButtonHeader: {
    padding: 4,
  },
  productImageContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
  },
  imageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.7,
    height: 250,
  },
  productHeader: {
    padding: 16,
    backgroundColor: '#1A1A1A',
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewCount: {
    color: '#BBBBBB',
    fontSize: 14,
    marginLeft: 8,
  },
  productPrice: {
    color: '#3498db',
    fontSize: 22,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#121212',
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  descriptionDetails: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    color: '#ddd',
    fontSize: 14,
    marginLeft: 8,
  },
  specsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  evenRow: {
    backgroundColor: '#222',
  },
  oddRow: {
    backgroundColor: '#1A1A1A',
  },
  specTitle: {
    color: '#999',
    fontSize: 14,
  },
  specValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewsContainer: {
    marginTop: 8,
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  ratingBig: {
    color: '#FFD700',
    fontSize: 40,
    fontWeight: 'bold',
    marginRight: 16,
  },
  totalReviews: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  reviewItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewUserName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
  },
  reviewComment: {
    color: '#ddd',
    fontSize: 14,
    lineHeight: 20,
  },
  noReviews: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  footer: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  addToCartButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen; 