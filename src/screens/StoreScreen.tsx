import React, { useState, useEffect, useRef } from 'react';
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
  Modal,
  TextInput,
  Alert,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: any; // Yerel resimler için any tipini kullanıyoruz
  category: 'device' | 'fragrance';
  rating: number;
  reviewCount: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Faunus Uyku Cihazı',
    description: 'Akıllı uyku izleme ve ortam kontrolü cihazı ile uyku kalitenizi artırın. Gece boyunca uyku ritminizi analiz eder.',
    price: 2999.99,
    image: require('../assets/faunus.png'),
    category: 'device',
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: '2',
    name: 'Lavanta Esansı',
    description: 'Sakinleştirici lavanta aromaterapi yağı. Uyku kalitenizi artırmak ve stres seviyenizi düşürmek için idealdir.',
    price: 199.99,
    image: require('../assets/esans.png'),
    category: 'fragrance',
    rating: 4.9,
    reviewCount: 243,
  },
  {
    id: '3',
    name: 'Vanilya Esansı',
    description: 'Rahatlatıcı vanilya aromaterapi yağı. Tatlı ve yumuşak kokusu ile huzurlu bir uyku deneyimi sağlar.',
    price: 189.99,
    image: require('../assets/esans.png'),
    category: 'fragrance',
    rating: 4.7,
    reviewCount: 189,
  },
];

// Ödeme yöntemleri
const paymentMethods = [
  { id: 'credit', name: 'Kredi Kartı', icon: 'credit-card' },
  { id: 'debit', name: 'Banka Kartı', icon: 'card' },
  { id: 'transfer', name: 'Havale/EFT', icon: 'swap-horizontal' },
  { id: 'cash', name: 'Kapıda Ödeme', icon: 'cash' }
];

const StoreScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'device' | 'fragrance'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  
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

  const filteredProducts = selectedCategory === 'all' 
    ? sampleProducts 
    : sampleProducts.filter(product => product.category === selectedCategory);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Ürün sepette var mı kontrol et
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Varsa miktarını artır
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Yoksa sepete ekle
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const handleCheckout = () => {
    setCartVisible(false);
    setCheckoutVisible(true);
  };

  const processPayment = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Hata', 'Lütfen bir ödeme yöntemi seçin');
      return;
    }

    if (!address) {
      Alert.alert('Hata', 'Lütfen adres bilgilerini girin');
      return;
    }

    if (selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'debit') {
      if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
        Alert.alert('Hata', 'Lütfen kart bilgilerinizi eksiksiz girin');
        return;
      }
    }

    // Ödeme işlemi simülasyonu
    Alert.alert(
      'Sipariş Alındı',
      'Siparişiniz başarıyla alındı. Teşekkür ederiz!',
      [
        { 
          text: 'Tamam', 
          onPress: () => {
            setCart([]);
            setCheckoutVisible(false);
            setSelectedPaymentMethod(null);
            setAddress('');
            setCardNumber('');
            setCardExpiry('');
            setCardCVC('');
            setCardName('');
          }
        }
      ]
    );
  };

  const handleFavoritePress = (product: Product) => {
    // Favori işlemleri için
    console.log('Ürün favorilere eklendi:', product.name);
  };

  const handleAddToCartPress = (product: Product) => {
    // Sepete ekleme işlemleri
    addToCart(product);
    console.log('Ürün sepete eklendi:', product.name);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color="#FFD700"
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image 
        source={item.product.image} 
        style={styles.cartItemImage} 
      />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.product.name}</Text>
        <Text style={styles.cartItemPrice}>{item.product.price.toLocaleString('tr-TR')} ₺</Text>
      </View>
      <View style={styles.cartItemQuantity}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const navigateToProductDetail = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['rgba(27, 27, 33, 1)', 'rgba(15, 23, 42, 1)']}
        style={styles.background}
      >
        <Animated.View style={[
          styles.header, 
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          }
        ]}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Mağaza</Text>
          <TouchableOpacity style={styles.cartButton} onPress={() => setCartVisible(true)}>
            <Ionicons name="cart-outline" size={24} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}]
        }}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
            <Text style={styles.welcomeSubtext}>Size özel ürünlerimizi keşfedin</Text>
          </View>
        </Animated.View>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{translateY: Animated.multiply(slideAnim, 1.2)}]
        }}>
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
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {category === 'all' ? 'Tümü' : category === 'device' ? 'Cihazlar' : 'Kokular'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{translateY: Animated.multiply(slideAnim, 1.5)}],
          flex: 1
        }}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {filteredProducts.map((product, index) => (
              <Animated.View 
                key={product.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: Animated.multiply(slideAnim, 1 + (index * 0.2))
                  }]
                }}
              >
                <TouchableOpacity 
                  style={styles.productCard}
                  onPress={() => navigateToProductDetail(product.id)}
                >
                  <LinearGradient
                    colors={['rgba(42, 47, 43, 0.73)', 'rgba(21, 45, 81, 0.9)']}
                    style={styles.productGradient}
                  >
                    <View style={styles.productContent}>
                      <View style={styles.productImageContainer}>
                        <Image
                          source={product.image}
                          style={styles.productImage}
                        />
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">{product.name}</Text>
                        <Text style={styles.productDescription} numberOfLines={2} ellipsizeMode="tail">{product.description}</Text>
                        <View style={styles.productRating}>
                          {renderStars(product.rating)}
                        </View>
                        <View style={styles.productPrice}>
                          <Text style={styles.priceText}>{product.price.toLocaleString('tr-TR')} ₺</Text>
                        </View>
                        <View style={styles.productActions}>
                          <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => handleFavoritePress(product)}
                          >
                            <Ionicons name="heart-outline" size={20} color="#fff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddToCartPress(product)}
                          >
                            <Text style={styles.addButtonText}>Sepete Ekle</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Sepet Modal */}
        <Modal
          visible={cartVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCartVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.cartModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">Sepetim</Text>
                <TouchableOpacity onPress={() => setCartVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {cart.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Ionicons name="cart-outline" size={80} color="#888" />
                  <Text style={styles.emptyCartText} numberOfLines={1} ellipsizeMode="tail">Sepetiniz boş</Text>
                  <TouchableOpacity
                    style={[styles.checkoutButton, {backgroundColor: '#555'}]}
                    onPress={() => setCartVisible(false)}
                  >
                    <Text style={styles.checkoutButtonText} numberOfLines={1} ellipsizeMode="tail">Alışverişe Başla</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <FlatList
                    data={cart}
                    renderItem={renderCartItem}
                    keyExtractor={(item) => item.product.id}
                    style={styles.cartList}
                  />
                  
                  <View style={styles.cartFooter}>
                    <View style={styles.cartTotal}>
                      <Text style={styles.cartTotalLabel} numberOfLines={1} ellipsizeMode="tail">Toplam Tutar:</Text>
                      <Text style={styles.cartTotalAmount} numberOfLines={1} ellipsizeMode="tail">{cartTotal.toLocaleString('tr-TR')} ₺</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.checkoutButton}
                      onPress={handleCheckout}
                    >
                      <Text style={styles.checkoutButtonText} numberOfLines={1} ellipsizeMode="tail">Siparişi Tamamla</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Ödeme Modal */}
        <Modal
          visible={checkoutVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCheckoutVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.checkoutModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">Ödeme</Text>
                <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.checkoutForm}>
                <Text style={styles.checkoutSectionTitle} numberOfLines={1} ellipsizeMode="tail">Teslimat Adresi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adres giriniz"
                  placeholderTextColor="#888"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />

                <Text style={styles.checkoutSectionTitle} numberOfLines={1} ellipsizeMode="tail">Ödeme Yöntemi</Text>
                <View style={styles.paymentMethods}>
                  {paymentMethods.map(method => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodItem,
                        selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                      ]}
                      onPress={() => setSelectedPaymentMethod(method.id)}
                    >
                      <Ionicons name={method.icon} size={24} color={selectedPaymentMethod === method.id ? "#fff" : "#bbb"} />
                      <Text style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                      ]} numberOfLines={1} ellipsizeMode="tail">
                        {method.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'debit') && (
                  <View style={styles.cardDetails}>
                    <Text style={styles.checkoutSectionTitle} numberOfLines={1} ellipsizeMode="tail">Kart Bilgileri</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Kart Üzerindeki İsim"
                      placeholderTextColor="#888"
                      value={cardName}
                      onChangeText={setCardName}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Kart Numarası"
                      placeholderTextColor="#888"
                      keyboardType="number-pad"
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      maxLength={16}
                    />
                    <View style={styles.cardExpiryContainer}>
                      <TextInput
                        style={[styles.input, styles.expiryInput]}
                        placeholder="AA/YY"
                        placeholderTextColor="#888"
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        maxLength={5}
                      />
                      <TextInput
                        style={[styles.input, styles.cvcInput]}
                        placeholder="CVC"
                        placeholderTextColor="#888"
                        keyboardType="number-pad"
                        value={cardCVC}
                        onChangeText={setCardCVC}
                        maxLength={3}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.orderSummary}>
                  <Text style={styles.checkoutSectionTitle} numberOfLines={1} ellipsizeMode="tail">Sipariş Özeti</Text>
                  {cart.map(item => (
                    <View key={item.product.id} style={styles.orderItem}>
                      <Text style={styles.orderItemName} numberOfLines={1} ellipsizeMode="tail">{item.product.name} x{item.quantity}</Text>
                      <Text style={styles.orderItemPrice} numberOfLines={1} ellipsizeMode="tail">
                        {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </Text>
                    </View>
                  ))}
                  <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel} numberOfLines={1} ellipsizeMode="tail">Toplam</Text>
                    <Text style={styles.orderTotalAmount} numberOfLines={1} ellipsizeMode="tail">{cartTotal.toLocaleString('tr-TR')} ₺</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={processPayment}
                >
                  <Text style={styles.payButtonText} numberOfLines={1} ellipsizeMode="tail">Ödemeyi Tamamla</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1B1B21',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.8,
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.9,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#10b981',
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
    marginBottom: 6,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 30, 36, 0.8)',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategory: {
    backgroundColor: '#10b981',
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
    gap: 16,
  },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 200,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  productGradient: {
    padding: 0,
    height: '100%',
    justifyContent: 'space-between',
    borderRadius: 16,
  },
  productContent: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    height: '100%',
    alignItems: 'center',
  },
  productImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  productInfo: {
    flex: 1,
    paddingLeft: 16,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 8,
    maxHeight: 36,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    marginBottom: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 10,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  addButton: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cartModal: {
    backgroundColor: '#1E1E24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '60%',
    maxHeight: '90%',
  },
  checkoutModal: {
    backgroundColor: '#1E1E24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    color: '#94A3B8',
    fontSize: 18,
    marginVertical: 20,
    flexWrap: 'wrap',
  },
  cartList: {
    maxHeight: '60%',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#fff',
    resizeMode: 'contain',
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 15,
    flexWrap: 'wrap',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
    flexWrap: 'wrap',
    width: '90%',
  },
  cartItemPrice: {
    fontSize: 15,
    color: '#10b981',
    flexWrap: 'wrap',
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#10b981',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  cartTotalLabel: {
    fontSize: 18,
    color: '#E2E8F0',
    flexWrap: 'wrap',
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flexWrap: 'wrap',
  },
  checkoutButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  checkoutForm: {
    padding: 20,
  },
  checkoutSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  input: {
    backgroundColor: '#25252D',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethodItem: {
    backgroundColor: '#25252D',
    borderRadius: 16,
    width: '48%',
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }
    }),
  },
  selectedPaymentMethod: {
    backgroundColor: '#10b981',
  },
  paymentMethodText: {
    color: '#94A3B8',
    marginLeft: 10,
    fontSize: 15,
    flexWrap: 'wrap',
    flex: 1,
  },
  selectedPaymentMethodText: {
    color: '#fff',
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 20,
  },
  cardExpiryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryInput: {
    width: '48%',
  },
  cvcInput: {
    width: '48%',
  },
  orderSummary: {
    marginVertical: 20,
    backgroundColor: '#25252D',
    borderRadius: 20,
    padding: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  orderItemName: {
    color: '#E2E8F0',
    fontSize: 15,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 10,
  },
  orderItemPrice: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
    flexWrap: 'wrap',
  },
  orderTotalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flexWrap: 'wrap',
  },
  orderTotalAmount: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '700',
    flexWrap: 'wrap',
  },
  payButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 2,
  },
});

export default StoreScreen; 