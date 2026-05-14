import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  Badge,
  Button,
  Dropdown,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useCart } from "../store/CartContext";
import { useAuth } from "../store/AuthContext";
import AuthModal from "./AuthModal";

const AppNavbar = ({ isDarkMode }) => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isPopping, setIsPopping] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (cartCount > 0) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleShowAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <>
      <Navbar
        expanded={expanded}
        onToggle={(nextExpanded) => setExpanded(nextExpanded)}
        expand="lg"
        className="navbar fixed-top"
        variant={isDarkMode ? "dark" : "light"}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>
            bizcorp
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto" onClick={() => setExpanded(false)}>
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/shop">
                Solutions
              </Nav.Link>
              <Nav.Link as={Link} to="/forum">
                Engage
              </Nav.Link>
              <Nav.Link as={Link} to="/internal">
                Internal
              </Nav.Link>
              <Nav.Link as={Link} to="/details">
                Site Details
              </Nav.Link>
            </Nav>
            <Nav
              className="align-items-center"
              onClick={() => setExpanded(false)}
            >
              <Nav.Link
                as={Link}
                to="/cart"
                className={`d-flex align-items-center cart-icon-nav ${isPopping ? "popping" : ""}`}
              >
                <i className="bi bi-cart3 fs-5"></i>{" "}
                <Badge bg="dark" text="white" className="ms-1">
                  {cartCount}
                </Badge>
              </Nav.Link>

              {user ? (
                <Dropdown align="end" className="ms-3">
                  <Dropdown.Toggle
                    variant="link"
                    id="user-dropdown"
                    className="p-0 text-decoration-none d-flex align-items-center"
                  >
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: "32px",
                        height: "32px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={isDarkMode ? "text-light" : "text-dark"}>
                      {user.username}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>{user.job_title}</Dropdown.Header>
                    <Dropdown.Item onClick={logout} className="text-danger">
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link
                    onClick={() => handleShowAuth("login")}
                    className="login-link me-3 hover-pointer"
                  >
                    Login
                  </Nav.Link>
                  <Button
                    className={`btn-start-trial ${isDarkMode ? "dark-mode" : ""}`}
                    onClick={() => handleShowAuth("join")}
                  >
                    Join Us
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AuthModal
        show={showAuth}
        onHide={() => setShowAuth(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default AppNavbar;
