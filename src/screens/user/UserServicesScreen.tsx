import React, {useEffect, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';

import apiClient from '../../services/apiClient';
import {Card, Header, LoadingBlock, Screen} from '../../components/ui/UiKit';

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
    <Screen>
      <Header title="Dịch vụ" subtitle="Danh sách dịch vụ có sẵn" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading ? (
          <LoadingBlock />
        ) : services.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
          </Card>
        ) : (
          <View style={{gap: 10}}>
            {services.map(service => (
              <Card key={service.id}>
                <View style={styles.serviceHeader}>
                  <View style={{flex: 1}}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceCode}>{service.code}</Text>
                  </View>
                  <Text style={styles.priceText}>
                    {formatCurrency(service.unitPrice)}
                  </Text>
                </View>

                {service.description ? (
                  <Text style={styles.descriptionText} numberOfLines={3}>
                    {service.description}
                  </Text>
                ) : null}

                <Text style={styles.unitText}>Đơn vị: {service.unitName}</Text>
              </Card>
            ))}
          </View>
        )}

        <View style={{height: 10}} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  serviceCode: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  descriptionText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  unitText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
});

export default UserServicesScreen;
