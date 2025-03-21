import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient'; // Düzeltilmiş import

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'device' | 'fragrance';
  rating: number;
  reviewCount: number;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Faunus Uyku Cihazı',
    description: 'Akıllı uyku izleme ve ortam kontrolü cihazı',
    price: 2999.99,
    image: 'https://example.com/faunus.jpg',
    category: 'device',
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: '2',
    name: 'Lavanta Esansı',
    description: 'Sakinleştirici lavanta aromaterapi yağı',
    price: 199.99,
    image: 'https://example.com/lavender.jpg',
    category: 'fragrance',
    rating: 4.9,
    reviewCount: 243,
  },
  {
    id: '3',
    name: 'Vanilya Esansı',
    description: 'Rahatlatıcı vanilya aromaterapi yağı',
    price: 189.99,
    image: 'https://example.com/vanilla.jpg',
    category: 'fragrance',
    rating: 4.7,
    reviewCount: 189,
  },
];

const StoreScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'device' | 'fragrance'>('all');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = selectedCategory === 'all' 
    ? sampleProducts 
    : sampleProducts.filter(product => product.category === selectedCategory);

  const addToCart = (productId: string) => {
    setCartCount(prev => prev + 1);
    // Sepet mantığı daha sonra eklenecek
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mağaza</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'device', 'fragrance'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category as 'all' | 'device' | 'fragrance')}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category === 'all' ? 'Tümü' : category === 'device' ? 'Cihazlar' : 'Kokular'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {filteredProducts.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard}>
            <LinearGradient
              colors={['#2c3e50', '#3498db']}
              style={styles.productGradient}
            >
              <View style={styles.productImageContainer}>
                <Image
                  source={product.image ? { uri: product.image } : require('../assets/placeholder.png')}
                  style={styles.productImage}
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <View style={styles.productMeta}>
                  {renderStars(product.rating)}
                  <Text style={styles.reviewCount}>({product.reviewCount} değerlendirme)</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{product.price.toLocaleString('tr-TR')} ₺</Text>
                  <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => addToCart(product.id)}
                  >
                    <Text style={styles.addToCartText}>Sepete Ekle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categories: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 10,
  },
  selectedCategory: {
    backgroundColor: '#4a90e2',
  },
  categoryText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.select({ ios: 90, android: 70 }),
  },
  productCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productGradient: {
    padding: 15,
  },
  productImageContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 10,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewCount: {
    color: '#888',
    marginLeft: 10,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StoreScreen; 