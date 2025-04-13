import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mağaza</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => setCartVisible(true)}>
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
          <TouchableOpacity 
            key={product.id} 
            style={styles.productCard}
            onPress={() => navigateToProductDetail(product.id)}
          >
            <LinearGradient
              colors={['#2c3e50', '#3498db']}
              style={styles.productGradient}
            >
              <View style={styles.productImageContainer}>
                <Image
                  source={product.image}
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
                    onPress={(e) => {
                      e.stopPropagation(); // Dokunma olayının üst öğelere geçmesini engelle
                      addToCart(product);
                    }}
                  >
                    <Text style={styles.addToCartText}>Sepete Ekle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
              <Text style={styles.modalTitle}>Sepetim</Text>
              <TouchableOpacity onPress={() => setCartVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="cart-outline" size={80} color="#888" />
                <Text style={styles.emptyCartText}>Sepetiniz boş</Text>
                <TouchableOpacity
                  style={[styles.checkoutButton, {backgroundColor: '#555'}]}
                  onPress={() => setCartVisible(false)}
                >
                  <Text style={styles.checkoutButtonText}>Alışverişe Başla</Text>
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
                    <Text style={styles.cartTotalLabel}>Toplam Tutar:</Text>
                    <Text style={styles.cartTotalAmount}>{cartTotal.toLocaleString('tr-TR')} ₺</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                  >
                    <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
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
              <Text style={styles.modalTitle}>Ödeme</Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.checkoutForm}>
              <Text style={styles.checkoutSectionTitle}>Teslimat Adresi</Text>
              <TextInput
                style={styles.input}
                placeholder="Adres giriniz"
                placeholderTextColor="#888"
                value={address}
                onChangeText={setAddress}
                multiline
              />

              <Text style={styles.checkoutSectionTitle}>Ödeme Yöntemi</Text>
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
                    ]}>
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'debit') && (
                <View style={styles.cardDetails}>
                  <Text style={styles.checkoutSectionTitle}>Kart Bilgileri</Text>
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
                <Text style={styles.checkoutSectionTitle}>Sipariş Özeti</Text>
                {cart.map(item => (
                  <View key={item.product.id} style={styles.orderItem}>
                    <Text style={styles.orderItemName}>{item.product.name} x{item.quantity}</Text>
                    <Text style={styles.orderItemPrice}>
                      {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                    </Text>
                  </View>
                ))}
                <View style={styles.orderTotal}>
                  <Text style={styles.orderTotalLabel}>Toplam</Text>
                  <Text style={styles.orderTotalAmount}>{cartTotal.toLocaleString('tr-TR')} ₺</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.payButton}
                onPress={processPayment}
              >
                <Text style={styles.payButtonText}>Ödemeyi Tamamla</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cartModal: {
    backgroundColor: '#212121',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: Dimensions.get('window').height * 0.6,
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  checkoutModal: {
    backgroundColor: '#212121',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    color: '#888',
    fontSize: 18,
    marginVertical: 20,
  },
  cartList: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
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
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#4a90e2',
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#4a90e2',
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
  },
  cartTotalLabel: {
    fontSize: 18,
    color: '#ccc',
  },
  cartTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutForm: {
    padding: 20,
  },
  checkoutSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
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
    backgroundColor: '#333',
    borderRadius: 10,
    width: '48%',
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    backgroundColor: '#4a90e2',
  },
  paymentMethodText: {
    color: '#bbb',
    marginLeft: 10,
    fontSize: 16,
  },
  selectedPaymentMethodText: {
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderItemName: {
    color: '#ddd',
    fontSize: 16,
  },
  orderItemPrice: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  orderTotalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTotalAmount: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StoreScreen; 