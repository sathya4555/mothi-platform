import QueryProvider from '@/providers/QueryProvider'
import { AuthProvider } from '@/context/AuthContext'
import AppRouter from '@/router/AppRouter'

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  )
}

export default App
