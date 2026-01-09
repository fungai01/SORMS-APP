import React, {useEffect, useState} from 'react';
import {Image, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native';

import apiClient from '../../services/apiClient';
import {Card, Header, LoadingBlock, Screen} from '../../components/ui/UiKit';

interface Room {
  id: number;
  code: string;
  name: string;
  roomTypeId: number;
  floor: number;
  status: string;
  description?: string;
}

const UserRoomsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRoomsByStatus('AVAILABLE');
      if (response.success && response.data) {
        setRooms(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Load rooms error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#4CAF50';
      case 'OCCUPIED':
        return '#F44336';
      case 'MAINTENANCE':
        return '#FF9800';
      case 'CLEANING':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  return (
    <Screen>
      <Header title="Phòng" subtitle="Danh sách phòng đang có sẵn" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading ? (
          <LoadingBlock />
        ) : rooms.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Không có phòng nào</Text>
          </Card>
        ) : (
          <View style={styles.grid}>
            {rooms.map(room => (
              <Card key={room.id} style={styles.roomCard}>
                <Image
                  source={require('../../assets/img/Room.jpg')}
                  style={styles.roomImage}
                  resizeMode="cover"
                />

                <View style={styles.roomBody}>
                  <View style={styles.roomHeader}>
                    <View style={{flex: 1}}>
                      <Text style={styles.roomName} numberOfLines={1}>
                        {room.name || room.code}
                      </Text>
                      <Text style={styles.roomCode} numberOfLines={1}>
                        {room.code}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusColor(room.status)},
                      ]}>
                      <Text style={styles.statusText} numberOfLines={1}>
                        {room.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Tầng</Text>
                    <Text style={styles.metaValue}>{room.floor}</Text>
                  </View>
                </View>
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
grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  roomCard: {
    padding: 0,
    width: '48%',
  },
  roomImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#F3F4F6',
  },
  roomBody: {
    padding: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  roomCode: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  descriptionText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default UserRoomsScreen;
