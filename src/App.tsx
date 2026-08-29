import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import SearchScreen from './screens/SearchScreen'
import ExerciseDetailScreen from './screens/ExerciseDetailScreen'
import LogWeightScreen from './screens/LogWeightScreen'
import SetsScreen from './screens/SetsScreen'
import SetDetailScreen from './screens/SetDetailScreen'
import ProfileScreen from './screens/ProfileScreen'
import TabBar from './components/TabBar'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function LoginGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/sets" replace />
  return <>{children}</>
}

function TabLayout() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginGuard>
            <LoginScreen />
          </LoginGuard>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/sets" replace />} />

      {/* Tab bar screens */}
      <Route element={<TabLayout />}>
        <Route path="/exercises" element={<HomeScreen />} />
        <Route path="/sets" element={<SetsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
      </Route>

      {/* Full-screen (no tab bar) */}
      <Route
        path="/sets/:setId"
        element={
          <AuthGuard>
            <SetDetailScreen />
          </AuthGuard>
        }
      />
      <Route
        path="/search"
        element={
          <AuthGuard>
            <SearchScreen />
          </AuthGuard>
        }
      />
      <Route
        path="/exercise/:id"
        element={
          <AuthGuard>
            <ExerciseDetailScreen />
          </AuthGuard>
        }
      />
      <Route
        path="/log/:id"
        element={
          <AuthGuard>
            <LogWeightScreen />
          </AuthGuard>
        }
      />

      <Route path="*" element={<Navigate to="/sets" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
