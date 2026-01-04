import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import apiClient from '../../services/apiClient';

interface Service {
  id: number;
  code: string;
  name: string;
  description?: string;
  unitPrice: number;
  unitName: string;
  isActive: boolean;
}

const UserServicesScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getServices();
      if (response.success && response.data) {
        const allServices = Array.isArray(response.data) ? response.data : [];
        // Filter only active services
        setServices(allServices.filter((s: Service) => s.isActive));
      }
    } catch (error) {
      console.error('Load services error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          <Text style={styles.title}>Dịch vụ</Text>
          <Text style={styles.subtitle}>Xem danh sách dịch vụ có sẵn</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2196F3"
              style={styles.loader}
            />
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
            </View>
          ) : (
            services.map(service => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCode}>{service.code}</Text>
                </View>
                {service.description && (
                  <Text style={styles.descriptionText}>
                    {service.description}
                  </Text>
                )}
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    {formatCurrency(service.unitPrice)}
                  </Text>
                  <Text style={styles.unitText}>/{service.unitName}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  serviceCode: {
    fontSize: 14,
    color: '#666',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default UserServicesScreen;
