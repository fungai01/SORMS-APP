import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../context/AuthContext';

// User Screens
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import UserBookingsScreen from '../screens/user/UserBookingsScreen';
import UserOrdersScreen from '../screens/user/UserOrdersScreen';
import UserRoomsScreen from '../screens/user/UserRoomsScreen';
import UserServicesScreen from '../screens/user/UserServicesScreen';

// Staff Screens
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffOrdersScreen from '../screens/staff/StaffOrdersScreen';

// Common
import ProfileScreen from '../screens/ProfileScreen';

import UserBookingDetailScreen from '../screens/user/UserBookingDetailScreen';
import UserCreateBookingScreen from '../screens/user/UserCreateBookingScreen';
import UserOrderDetailScreen from '../screens/user/UserOrderDetailScreen';
import StaffOrderDetailScreen from '../screens/staff/StaffOrderDetailScreen';

import type {
  RoleStackParamList,
  StaffTabParamList,
  UserTabParamList,
} from './types';

const Stack = createNativeStackNavigator<RoleStackParamList>();
const UserTab = createBottomTabNavigator<UserTabParamList>();
const StaffTab = createBottomTabNavigator<StaffTabParamList>();

// Move tabBarIcon renderers out to avoid react/no-unstable-nested-components warnings
const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="home" size={size || 24} color={color} />
);
const EventIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="event" size={size || 24} color={color} />
);
const RoomIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="meeting-room" size={size || 24} color={color} />
);
const CartIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="shopping-cart" size={size || 24} color={color} />
);
const ServiceIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="room-service" size={size || 24} color={color} />
);
const AssignmentIcon = ({color, size}: {color: string; size: number}) => (
  <Icon name="assignment" size={size || 24} color={color} />
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
        name="UserRooms"
        component={UserRoomsScreen}
        options={{
          tabBarLabel: 'Phòng',
          tabBarIcon: RoomIcon,
        }}
      />
      <UserTab.Screen
        name="UserOrders"
        component={UserOrdersScreen}
        options={{
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: CartIcon,
        }}
      />
      <UserTab.Screen
        name="UserServices"
        component={UserServicesScreen}
        options={{
          tabBarLabel: 'Dịch vụ',
          tabBarIcon: ServiceIcon,
        }}
      />
    </UserTab.Navigator>
  );
};

/**
 * Staff Tab Navigator
 */
const StaffTabNavigator: React.FC = () => {
  return (
    <StaffTab.Navigator
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
      <StaffTab.Screen
        name="StaffDashboard"
        component={StaffDashboardScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: HomeIcon,
        }}
      />
      <StaffTab.Screen
        name="StaffOrders"
        component={StaffOrdersScreen}
        options={{
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: AssignmentIcon,
        }}
      />
    </StaffTab.Navigator>
  );
};

/**
 * Role-based Navigator
 */
const RoleBasedNavigator: React.FC = () => {
  const {userRole} = useAuth();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {userRole === 'staff' ? (
        <>
          <Stack.Screen name="StaffTabs" component={StaffTabNavigator} />
          <Stack.Screen
            name="StaffOrderDetail"
            component={StaffOrderDetailScreen}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="UserTabs" component={UserTabNavigator} />
          <Stack.Screen
            name="UserBookingDetail"
            component={UserBookingDetailScreen}
          />
          <Stack.Screen
            name="UserCreateBooking"
            component={UserCreateBookingScreen}
          />
          <Stack.Screen
            name="UserOrderDetail"
            component={UserOrderDetailScreen}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RoleBasedNavigator;
