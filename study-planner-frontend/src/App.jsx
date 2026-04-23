import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudyMode from './pages/StudyMode';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) {
    return adminOnly ? <Navigate to="/admin/login" /> : <Navigate to="/login" />;
  }
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  
  return children;
};

function App() {
  return (
    <Router>
      
      <Routes>
        {/* User Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/study/:id" element={
          <ProtectedRoute>
            <StudyMode />
          </ProtectedRoute>
        } />

        {/* Admin Portal Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminPanel />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminPanel activeTab="users" />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/sessions" element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout>
              <AdminPanel activeTab="sessions" />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
