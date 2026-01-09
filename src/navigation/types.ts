import type {NavigatorScreenParams} from '@react-navigation/native';

// User Tab routes (tối giản)
export type UserTabParamList = {
  UserDashboard: undefined;
  UserBookings: undefined;
  Profile: undefined;
};

// Root role-based stack (USER-only)
export type RoleStackParamList = {
  UserTabs: NavigatorScreenParams<UserTabParamList>;

  // Extra user flows (opened from Home / Bookings)
  UserBookingDetail: {bookingId: number};
  UserCreateBooking: undefined;
  UserOrderDetail: {orderId: number};

  // Optional: keep these screens reachable from Home buttons later
  UserRooms: undefined;
  UserOrders: undefined;
  UserServices: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};
