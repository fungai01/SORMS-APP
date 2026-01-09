import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import {useAuth} from '../context/AuthContext'; // USER-only UI: no role switching

// User Screens
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import UserBookingsScreen from '../screens/user/UserBookingsScreen';
// (Tối giản) Chỉ giữ 2 tab chính cho USER: Home + Bookings + Profile
// Các màn Rooms/Orders/Services sẽ truy cập từ Home bằng nút điều hướng khi cần.
import UserRoomsScreen from '../screens/user/UserRoomsScreen';
import UserOrdersScreen from '../screens/user/UserOrdersScreen';
import UserServicesScreen from '../screens/user/UserServicesScreen';

// Common
import ProfileScreen from '../screens/ProfileScreen';

import UserBookingDetailScreen from '../screens/user/UserBookingDetailScreen';
import UserCreateBookingScreen from '../screens/user/UserCreateBookingScreen';
import UserOrderDetailScreen from '../screens/user/UserOrderDetailScreen';

import type {RoleStackParamList, UserTabParamList} from './types';

const Stack = createNativeStackNavigator<RoleStackParamList>();
const UserTab = createBottomTabNavigator<UserTabParamList>();

// Move tabBarIcon renderers out to avoid react/no-unstable-nested-components warnings
const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="home" size={size || 24} color={color} />
);
const EventIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="event" size={size || 24} color={color} />
);
const PersonIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="person" size={size || 24} color={color} />
);

/**
 * User Tab Navigator
 */
const UserTabNavigator: React.FC = () => {
  return (
    <UserTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <UserTab.Screen
        name="UserDashboard"
        component={UserDashboardScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: HomeIcon,
        }}
      />
      <UserTab.Screen
        name="UserBookings"
        component={UserBookingsScreen}
        options={{
          tabBarLabel: 'Đặt phòng',
          tabBarIcon: EventIcon,
        }}
      />
      <UserTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Tài khoản',
          tabBarIcon: PersonIcon,
        }}
      />
    </UserTab.Navigator>
  );
};



/**
 * Role-based Navigator
 */
const RoleBasedNavigator: React.FC = () => {
  // UI tối giản: luôn dùng flow USER.
  // Rooms / Orders / Services không nằm trong tab, nhưng vẫn có route để Home điều hướng tới.

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="UserTabs" component={UserTabNavigator} />

      {/* Extra screens reachable via navigation from Home */}
      <Stack.Screen name="UserRooms" component={UserRoomsScreen} />
      <Stack.Screen name="UserOrders" component={UserOrdersScreen} />
      <Stack.Screen name="UserServices" component={UserServicesScreen} />

      {/* User flows */}
      <Stack.Screen name="UserBookingDetail" component={UserBookingDetailScreen} />
      <Stack.Screen name="UserCreateBooking" component={UserCreateBookingScreen} />
      <Stack.Screen name="UserOrderDetail" component={UserOrderDetailScreen} />
    </Stack.Navigator>
  );
};

export default RoleBasedNavigator;
