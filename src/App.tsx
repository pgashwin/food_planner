import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider, useApp } from './context/AppContext';
import { HomeBrowseProvider } from './context/HomeBrowseContext';
import { CookPage } from './pages/CookPage';
import { HomePage } from './pages/HomePage';
import { MealDetailPage } from './pages/MealDetailPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PantryPage } from './pages/PantryPage';
import { SettingsPage } from './pages/SettingsPage';

function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress color="primary" size={40} />
      <Typography color="text.secondary" variant="body1">
        Loading your kitchen…
      </Typography>
    </Box>
  );
}

function AppRoutes() {
  const { loading, household } = useApp();

  if (loading) return <LoadingScreen />;

  if (!household.onboardingComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pantry" element={<PantryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/meal/:id" element={<MealDetailPage />} />
        <Route path="/cook/:id" element={<CookPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <HomeBrowseProvider>
          <AppRoutes />
        </HomeBrowseProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
