import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen } from './screens/HomeScreen';
import { EventDetailScreen } from './screens/EventDetailScreen';
import { TicketSelectionScreen } from './screens/TicketSelectionScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { PaymentSuccessScreen } from './screens/PaymentSuccessScreen';
import { MyTicketsScreen } from './screens/MyTicketsScreen';
import { TicketDetailScreen } from './screens/TicketDetailScreen';
import { SearchScreen } from './screens/SearchScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { HelpScreen } from './screens/HelpScreen';
import { FilterScreen } from './screens/FilterScreen';
import { ShareEventScreen } from './screens/ShareEventScreen';
import { PublicProfileScreen } from './screens/PublicProfileScreen';
import { OrganizerLandingScreen } from './screens/organizer/OrganizerLandingScreen';
import { OrganizerRegisterScreen } from './screens/organizer/OrganizerRegisterScreen';
import { OrganizerDashboardScreen } from './screens/organizer/OrganizerDashboardScreen';
import { OrganizerMyEventsScreen } from './screens/organizer/OrganizerMyEventsScreen';
import { OrganizerCreateEventScreen } from './screens/organizer/OrganizerCreateEventScreen';
import { OrganizerScannerScreen } from './screens/organizer/OrganizerScannerScreen';
import { OrganizerSalesScreen } from './screens/organizer/OrganizerSalesScreen';
import { OrganizerProfileScreen } from './screens/organizer/OrganizerProfileScreen';
import { OrganizerAgentsScreen } from './screens/organizer/OrganizerAgentsScreen';
import { OrganizerAddAgentScreen } from './screens/organizer/OrganizerAddAgentScreen';
import { DevLoginScreen } from './screens/developer/DevLoginScreen';
import { DevDashboardScreen } from './screens/developer/DevDashboardScreen';
import { DevUsersScreen } from './screens/developer/DevUsersScreen';
import { DevEventsScreen } from './screens/developer/DevEventsScreen';
import { DevAgentsScreen } from './screens/developer/DevAgentsScreen';

function AppContent() {
  const { screen } = useApp();

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <SplashScreen />;
      case 'onboarding': return <OnboardingScreen />;
      case 'login': return <LoginScreen />;
      case 'register': return <RegisterScreen />;
      case 'home': return <HomeScreen />;
      case 'event-detail': return <EventDetailScreen />;
      case 'ticket-selection': return <TicketSelectionScreen />;
      case 'payment': return <PaymentScreen />;
      case 'payment-success': return <PaymentSuccessScreen />;
      case 'my-tickets': return <MyTicketsScreen />;
      case 'ticket-detail': return <TicketDetailScreen />;
      case 'search': return <SearchScreen />;
      case 'categories': return <CategoriesScreen />;
      case 'favorites': return <FavoritesScreen />;
      case 'profile': return <ProfileScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'settings': return <SettingsScreen />;
      case 'help': return <HelpScreen />;
      case 'filter': return <FilterScreen />;
      case 'share-event': return <ShareEventScreen />;
      case 'public-profile': return <PublicProfileScreen />;
      case 'organizer-landing': return <OrganizerLandingScreen />;
      case 'organizer-register': return <OrganizerRegisterScreen />;
      case 'organizer-dashboard': return <OrganizerDashboardScreen />;
      case 'organizer-my-events': return <OrganizerMyEventsScreen />;
      case 'organizer-create-event': return <OrganizerCreateEventScreen />;
      case 'organizer-scanner': return <OrganizerScannerScreen />;
      case 'organizer-sales': return <OrganizerSalesScreen />;
      case 'organizer-profile': return <OrganizerProfileScreen />;
      case 'organizer-agents': return <OrganizerAgentsScreen />;
      case 'organizer-add-agent': return <OrganizerAddAgentScreen />;
      case 'dev-login': return <DevLoginScreen />;
      case 'dev-dashboard': return <DevDashboardScreen />;
      case 'dev-users': return <DevUsersScreen />;
      case 'dev-events': return <DevEventsScreen />;
      case 'dev-agents': return <DevAgentsScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#06060F] overflow-hidden">
      {renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
