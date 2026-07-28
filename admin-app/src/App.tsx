import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerOnly from "./components/OwnerOnly";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import MenuItems from "./pages/MenuItems";
import Slides from "./pages/Slides";
import Works from "./pages/Works";
import News from "./pages/News";
import Pages from "./pages/Pages";
import Settings from "./pages/Settings";
import ContactSubmissions from "./pages/ContactSubmissions";
import Users from "./pages/Users";

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<OwnerOnly><Products /></OwnerOnly>} />
            <Route path="categories" element={<OwnerOnly><Categories /></OwnerOnly>} />
            <Route path="menu-items" element={<OwnerOnly><MenuItems /></OwnerOnly>} />
            <Route path="slides" element={<OwnerOnly><Slides /></OwnerOnly>} />
            <Route path="works" element={<Works />} />
            <Route path="news" element={<News />} />
            <Route path="pages" element={<OwnerOnly><Pages /></OwnerOnly>} />
            <Route path="settings" element={<OwnerOnly><Settings /></OwnerOnly>} />
            <Route path="contact-submissions" element={<OwnerOnly><ContactSubmissions /></OwnerOnly>} />
            <Route path="users" element={<OwnerOnly><Users /></OwnerOnly>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
