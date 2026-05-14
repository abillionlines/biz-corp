import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Nav } from "react-bootstrap";
import { useAuth } from "../store/AuthContext";

const AuthModal = ({ show, onHide, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  const [username, setUsername] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(username);
      } else {
        await register(username, jobTitle);
      }
      onHide();
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="auth-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center fw-bold fs-4">
          {mode === "login" ? "Welcome Back" : "Join the Community"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <Nav
          variant="pills"
          className="justify-content-center mb-4 mt-2 bg-light rounded-pill p-1"
        >
          <Nav.Item>
            <Nav.Link
              active={mode === "login"}
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="rounded-pill px-4"
              style={{ cursor: "pointer" }}
            >
              Login
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={mode === "join"}
              onClick={() => {
                setMode("join");
                setError(null);
              }}
              className="rounded-pill px-4"
              style={{ cursor: "pointer" }}
            >
              Join Us
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {error && (
          <div className="alert alert-danger py-2 text-center fs-7 small mb-3">
            {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold text-muted">
              Username
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="py-2 px-3 border-light-subtle"
            />
          </Form.Group>

          {mode === "join" && (
            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold text-muted">
                Job Title
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="py-2 px-3 border-light-subtle"
              />
            </Form.Group>
          )}

          <Button
            variant="dark"
            type="submit"
            className="w-100 py-2 rounded-3 fw-bold mt-2"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
