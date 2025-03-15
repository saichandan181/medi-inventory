
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Medicines from './pages/Medicines';
import LowStock from './pages/LowStock';
import ExpiryTracking from './pages/ExpiryTracking';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Analytics from './pages/Analytics';
import StockHistory from './pages/StockHistory';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="medinventory-theme">
      <QueryClientProvider client={queryClient}>
        {/* The Router must be outside the AuthProvider because AuthProvider uses useNavigate hook */}
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/medicines" element={
                <ProtectedRoute>
                  <Medicines />
                </ProtectedRoute>
              } />
              <Route path="/low-stock" element={
                <ProtectedRoute>
                  <LowStock />
                </ProtectedRoute>
              } />
              <Route path="/expiry-tracking" element={
                <ProtectedRoute>
                  <ExpiryTracking />
                </ProtectedRoute>
              } />
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <Suppliers />
                </ProtectedRoute>
              } />
              <Route path="/purchase-orders" element={
                <ProtectedRoute>
                  <PurchaseOrders />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/stock-history" element={
                <ProtectedRoute>
                  <StockHistory />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Invoices />
                </ProtectedRoute>
              } />
              <Route path="/invoices/:invoiceId" element={
                <ProtectedRoute>
                  <InvoiceDetail />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
