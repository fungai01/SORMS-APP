import type {NavigatorScreenParams} from '@react-navigation/native';

// User Tab routes
export type UserTabParamList = {
  UserDashboard: undefined;
  UserBookings: undefined;
  UserRooms: undefined;
  UserOrders: undefined;
  UserServices: undefined;
};

// Staff Tab routes
export type StaffTabParamList = {
  StaffDashboard: undefined;
  StaffOrders: undefined;
};

// Root role-based stack
export type RoleStackParamList = {
  UserTabs: NavigatorScreenParams<UserTabParamList>;
  StaffTabs: NavigatorScreenParams<StaffTabParamList>;
  Profile: undefined;

  // User flows
  UserBookingDetail: {bookingId: number};
  UserCreateBooking: undefined;
  UserOrderDetail: {orderId: number};

  // Staff flows
  StaffOrderDetail: {orderId: number};
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};
