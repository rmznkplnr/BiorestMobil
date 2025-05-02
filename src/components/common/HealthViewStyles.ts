import { StyleSheet } from 'react-native';

const HealthViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  dateControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  dateButton: {
    padding: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 16,
    padding: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  gridItemLarge: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 12,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  refreshControl: {
    tintColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  placeholderCard: {
    backgroundColor: '#1e2124',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  tabViewContainer: {
    backgroundColor: '#1a1a1a',
    marginBottom: 10,
  },
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tabBarIndicator: {
    backgroundColor: '#2980b9',
    height: 3,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  tabLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#2980b9',
    fontWeight: 'bold',
  },
});

export default HealthViewStyles; 