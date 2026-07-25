import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactsPage from "./pages/ContactsPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/common/PrivateRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes - Anyone can access */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - Need to be logged in */}
          <Route element={<PrivateRoute />}>
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback - If URL doesn't exist, go to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
