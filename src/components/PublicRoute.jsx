import { Navigate } from 'react-router-dom'
import Loader from './Loader.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'

function PublicRoute({ children }) {
  const { user, authLoading } = useAuthContext()

  if (authLoading) return <Loader />
  if (user) return <Navigate to="/dashboard" replace />

  return children
}

export default PublicRoute
