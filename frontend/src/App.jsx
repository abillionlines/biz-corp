import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import ChatAgent from "./components/ChatAgent";
import ForumPage from "./features/forum/ForumPage";
import ShopPage from "./features/shop/ShopPage";
import CartPage from "./features/shop/CartPage";
import HomePage from "./features/home/HomePage";
import InternalAdmin from "./features/InternalAdmin";
import SiteDetails from "./features/details/SiteDetails";
import { AuthProvider } from "./store/AuthContext";
import { CartProvider } from "./store/CartContext";
import { ModalProvider } from "./store/ModalContext";
import { Container } from "react-bootstrap";

const Layout = ({ children }) => {
  const location = useLocation();
  const isDark =
    location.pathname === "/forum" ||
    location.pathname === "/internal" ||
    location.pathname === "/details";

  const isWhiteBgPage =
    location.pathname === "/shop" || location.pathname === "/cart";

  const showChat = location.pathname === "/" || location.pathname === "/shop";

  return (
    <div
      className={`min-vh-100 d-flex flex-column layout-wrapper ${
        isDark ? "dark-theme" : "light-theme"
      }`}
    >
      <AppNavbar isDarkMode={isDark} />
      <main
        className={`flex-grow-1${isWhiteBgPage ? " white-bg-page" : ""}`}
        style={isWhiteBgPage ? { backgroundColor: "#ffffff" } : {}}
      >
        {children}
      </main>
      {showChat && <ChatAgent />}
      <footer
        className="footer-section py-5 text-center mt-auto"
        style={isWhiteBgPage ? { backgroundColor: "#ffffff" } : {}}
      >
        <Container>
          <small className="footer-text">
            &copy; 2026 bizcorp Systems. All rights reserved.
            <span className="mx-2">|</span>
            Internal Portal Access v2.4
          </small>
        </Container>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/internal" element={<InternalAdmin />} />
                <Route path="/details" element={<SiteDetails />} />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
