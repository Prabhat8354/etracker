import { Navigate, Outlet } from 'react-router-dom'
import Loader from './Loader.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'

function ProtectedRoute() {
  const { user, authLoading } = useAuthContext()

  if (authLoading) return <Loader />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}

export default ProtectedRoute
