import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

const StaffDashboardScreen: React.FC = () => {
  const {user, logout} = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalOrders: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.id) {
        // Get staff tasks/orders
        const response = await apiClient.getStaffTasksForOrder(Number(user.id));
        if (response.success && response.data) {
          const orders = Array.isArray(response.data) ? response.data : [];
          setStats({
            pendingOrders: orders.filter(
              (o: any) => o.status === 'PENDING_STAFF_CONFIRMATION',
            ).length,
            totalOrders: orders.length,
          });
        }
      }
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            Alert.alert('Lỗi', 'Đăng xuất thất bại');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Chào mừng Staff!</Text>
          {user && (
            <>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          )}
        </View>

        <View style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.pendingCard]}>
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Đơn chờ xử lý</Text>
            </View>
            <View style={[styles.statCard, styles.totalCard]}>
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Tổng đơn hàng</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Hành động nhanh</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={loadDashboardData}>
              <Text style={styles.actionButtonText}>🔄 Làm mới dữ liệu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}>
              <Text style={styles.actionButtonText}>🚪 Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
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
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default StaffDashboardScreen;
