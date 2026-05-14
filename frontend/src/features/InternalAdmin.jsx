import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Tabs,
  Tab,
  Alert,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import {
  HiOutlineLightBulb,
  HiLightBulb,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { useModal } from "../store/ModalContext";

const InternalAdmin = () => {
  const { showConfirm, showPrompt } = useModal();
  const [isAdminDark, setIsAdminDark] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showGate, setShowGate] = useState(true);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [clients, setClients] = useState([]);

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);

  // Edit/Form States
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    description: "",
    category: "Service",
  });

  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    status: "Active",
    company: "",
  });

  const [editingOrder, setEditingOrder] = useState(null);
  const [orderForm, setOrderForm] = useState({
    user_id: 1,
    total_amount: 0,
    status: "Pending",
  });

  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    author_id: 1,
  });

  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showMobileModal, setShowMobileModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL + "/api/internal";

  const fetchData = async () => {
    try {
      const [prodRes, orderRes, postRes, clientRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/posts`),
        axios.get(`${API_BASE}/clients`),
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
      setPosts(postRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Products
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(
          `${API_BASE}/products/${editingProduct.id}`,
          productForm,
        );
      } else {
        await axios.post(`${API_BASE}/products`, productForm);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        price: 0,
        description: "",
        category: "Service",
      });
      fetchData();
      setMessage("Product updated");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    showConfirm(
      "Are you sure you want to remove this product from the inventory?",
      async () => {
        await axios.delete(`${API_BASE}/products/${id}`);
        fetchData();
        showPrompt(
          "Product has been successfully removed.",
          "Inventory Updated",
          "success",
        );
      },
      "Delete Product",
    );
  };

  // Handlers for Clients
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put(`${API_BASE}/clients/${editingClient.id}`, clientForm);
      } else {
        await axios.post(`${API_BASE}/clients`, clientForm);
      }
      setShowClientModal(false);
      setEditingClient(null);
      setClientForm({ name: "", email: "", status: "Active", company: "" });
      fetchData();
      setMessage("Client roster updated");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteClient = async (id) => {
    showConfirm(
      "Are you sure you want to remove this client from the roster?",
      async () => {
        await axios.delete(`${API_BASE}/clients/${id}`);
        fetchData();
        showPrompt("Client removed successfully.", "Roster Updated", "success");
      },
      "Remove Client",
    );
  };

  const deleteOrder = async (id) => {
    showConfirm(
      "Are you sure you want to delete this order record?",
      async () => {
        await axios.delete(`${API_BASE}/orders/${id}`);
        fetchData();
        showPrompt(
          "Order record has been deleted.",
          "Order Deleted",
          "success",
        );
      },
      "Delete Order",
    );
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        await axios.put(`${API_BASE}/orders/${editingOrder.id}`, orderForm);
      } else {
        await axios.post(`${API_BASE}/orders`, orderForm);
      }
      setShowOrderModal(false);
      setEditingOrder(null);
      setOrderForm({ user_id: 1, total_amount: 0, status: "Pending" });
      fetchData();
      setMessage("Order record updated");
    } catch (err) {
      console.error(err);
    }
  };

  const deletePost = async (id) => {
    showConfirm(
      "Are you sure you want to delete this community post?",
      async () => {
        await axios.delete(`${API_BASE}/posts/${id}`);
        fetchData();
        showPrompt("Post has been deleted.", "Post Deleted", "success");
      },
      "Delete Post",
    );
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await axios.put(`${API_BASE}/posts/${editingPost.id}`, postForm);
      } else {
        await axios.post(`${API_BASE}/posts`, postForm);
      }
      setShowPostModal(false);
      setEditingPost(null);
      setPostForm({ title: "", content: "", author_id: 1 });
      fetchData();
      setMessage("Post updated");
    } catch (err) {
      console.error(err);
    }
  };

  const adminStyles = {
    backgroundColor: isAdminDark ? "#0a0a0a" : "#f0f2f5",
    color: isAdminDark ? "#ffffff" : "#1a1a1a",
    minHeight: "100vh",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    paddingTop: "3rem",
    paddingBottom: "4rem",
  };

  const containerStyles = {
    border: isAdminDark
      ? "1px solid rgba(255, 255, 255, 0.15)"
      : "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "15px",
    padding: "3rem",
    backgroundColor: isAdminDark ? "#1a1a1a" : "#ffffff",
    boxShadow: isAdminDark
      ? "0 10px 40px rgba(0,0,0,0.6)"
      : "0 5px 25px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    minHeight: "85vh",
    marginBottom: "5rem",
    marginTop: "0",
  };

  return (
    <div style={adminStyles}>
      <Modal
        show={showGate}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        centered
        contentClassName={
          isAdminDark
            ? "bg-dark text-light border-secondary shadow-lg"
            : "shadow-lg"
        }
      >
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            <HiOutlineLockClosed
              style={{
                fontSize: "4rem",
                color: isAdminDark ? "#0dcaf0" : "#0d6efd",
                opacity: 0.9,
              }}
            />
          </div>
          <h2 className="mb-3 fw-bold">Internal Usage Only</h2>
          <p
            className={isAdminDark ? "text-secondary mb-4" : "text-muted mb-4"}
          >
            This system contains sensitive enterprise data. <br />
            Unauthorized access is strictly prohibited.
          </p>
          <div className="d-grid gap-2 col-8 mx-auto">
            <Button
              variant={isAdminDark ? "info" : "primary"}
              size="lg"
              onClick={() => {
                setShowGate(false);
                setIsAuthorized(true);
              }}
            >
              Enter System
            </Button>
            <Button
              variant="link"
              className={isAdminDark ? "text-secondary" : "text-muted"}
              onClick={() => (window.location.href = "/")}
            >
              Return to Public Site
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Container
        style={{
          ...containerStyles,
          filter: isAuthorized ? "none" : "blur(10px)",
        }}
        className="px-3 px-md-5"
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <h1
            className={`${isAdminDark ? "text-info" : "text-dark"} text-center text-md-start mb-3 mb-md-0 w-100`}
            style={{
              fontSize: "1.5rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontSize: "calc(12px + 1.5vw)",
                display: "inline-block",
                maxWidth: "100%",
              }}
            >
              Internal Management System
            </span>
          </h1>
          <Button
            variant="link"
            className="p-0 border-0 shadow-none text-decoration-none d-none d-md-block"
            onClick={() => setIsAdminDark(!isAdminDark)}
            style={{
              fontSize: "1.8rem",
              color: isAdminDark ? "#e0e0e0" : "#212529",
              opacity: 0.8,
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseOut={(e) => (e.currentTarget.style.opacity = 0.8)}
          >
            {isAdminDark ? <HiLightBulb /> : <HiOutlineLightBulb />}
          </Button>
        </div>

        <div className="d-block d-md-none mb-4 text-center px-2">
          <Form.Group className="mb-3 mx-auto" style={{ maxWidth: "400px" }}>
            <Form.Label
              className="text-secondary small fw-bold mb-3 d-block text-center"
              style={{ letterSpacing: "1px" }}
            >
              SELECT MANAGEMENT VIEW
            </Form.Label>
            <div className="dropdown w-100 mb-3">
              <Button
                variant={isAdminDark ? "outline-info" : "outline-primary"}
                className="w-100 on-brand-dropdown-toggle d-flex justify-content-between align-items-center py-3 px-4"
                onClick={(e) => {
                  const menu = e.currentTarget.nextElementSibling;
                  menu.classList.toggle("show");
                }}
                style={{
                  borderRadius: "12px",
                  backgroundColor: isAdminDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#fff",
                  border: `1px solid ${isAdminDark ? "rgba(13, 202, 240, 0.4)" : "rgba(13, 110, 253, 0.4)"}`,
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: isAdminDark ? "#0dcaf0" : "#0d6efd",
                }}
              >
                <span className="flex-grow-1 text-center">
                  {
                    {
                      products: "Services & Solutions",
                      clients: "Strategic Partners",
                      orders: "Transaction Records",
                      posts: "Community Governance",
                    }[activeTab]
                  }
                </span>
                <i className="bi bi-chevron-down ms-2"></i>
              </Button>
              <div
                className={`dropdown-menu ${isAdminDark ? "dropdown-menu-dark" : ""} w-100 shadow-lg border-secondary anim-slide-in`}
                style={{
                  backgroundColor: isAdminDark ? "#0a0a0a" : "#fff",
                  borderRadius: "12px",
                  marginTop: "8px",
                  padding: "8px",
                  border: `1px solid ${isAdminDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  zIndex: 2000,
                }}
              >
                {[
                  { id: "products", label: "Services & Solutions" },
                  { id: "clients", label: "Strategic Partners" },
                  { id: "orders", label: "Transaction Records" },
                  { id: "posts", label: "Community Governance" },
                ].map((tab) => (
                  <div
                    key={tab.id}
                    className={`dropdown-item py-3 px-4 rounded-3 mb-1 d-flex align-items-center justify-content-center ${activeTab === tab.id ? (isAdminDark ? "active bg-info text-dark" : "active bg-primary text-white") : isAdminDark ? "text-light" : "text-dark"}`}
                    onClick={(e) => {
                      setActiveTab(tab.id);
                      e.currentTarget.parentElement.classList.remove("show");
                    }}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant={isAdminDark ? "info" : "primary"}
              className="w-100 py-3 mb-3 shadow-sm"
              onClick={() => setShowMobileModal(true)}
              style={{ fontSize: "0.9rem", fontWeight: "600" }}
            >
              View & Edit{" "}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Button>
          </Form.Group>
        </div>

        {/* Mobile Management Modal */}
        <Modal
          show={showMobileModal}
          onHide={() => setShowMobileModal(false)}
          fullscreen="sm-down"
          centered
          contentClassName={
            isAdminDark ? "bg-dark text-light" : "bg-light text-dark"
          }
        >
          <Modal.Header closeButton closeVariant={isAdminDark ? "white" : ""}>
            <div
              className="d-flex justify-content-between align-items-center w-100 me-3"
              style={{ minWidth: 0 }}
            >
              <Modal.Title
                style={{
                  fontSize: "clamp(0.85rem, 4vw, 1.25rem)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                  flexShrink: 1,
                }}
              >
                Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Modal.Title>
              <Button
                size="sm"
                variant={isAdminDark ? "info" : "primary"}
                style={{
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontSize: "clamp(0.7rem, 3vw, 0.875rem)",
                  marginLeft: "0.5rem",
                }}
                onClick={() => {
                  if (activeTab === "products") {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      price: 0,
                      description: "",
                      category: "Service",
                    });
                    setShowProductModal(true);
                  } else if (activeTab === "clients") {
                    setEditingClient(null);
                    setClientForm({
                      name: "",
                      email: "",
                      status: "Active",
                      company: "",
                    });
                    setShowClientModal(true);
                  } else if (activeTab === "orders") {
                    setEditingOrder(null);
                    setOrderForm({
                      user_id: 1,
                      total_amount: 0,
                      status: "Pending",
                    });
                    setShowOrderModal(true);
                  } else if (activeTab === "posts") {
                    setEditingPost(null);
                    setPostForm({ title: "", content: "", author_id: 1 });
                    setShowPostModal(true);
                  }
                }}
              >
                + Add New
              </Button>
            </div>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="p-3">
              {activeTab === "products" && (
                <div>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className={`p-3 border-bottom ${isAdminDark ? "border-secondary" : "border-light"}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">{p.name}</h6>
                          <small className="text-secondary">
                            ${p.price} • {p.category}
                          </small>
                        </div>
                        <Badge bg="secondary">ID: {p.id}</Badge>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          className="flex-grow-1"
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm(p);
                            setShowProductModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "clients" && (
                <div>
                  {clients.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 border-bottom ${isAdminDark ? "border-secondary" : "border-light"}`}
                    >
                      <h6 className="mb-0 fw-bold">{c.name}</h6>
                      <small className="text-secondary d-block mb-2">
                        {c.company} • {c.email}
                      </small>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          className="flex-grow-1"
                          onClick={() => {
                            setEditingClient(c);
                            setClientForm(c);
                            setShowClientModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deleteClient(c.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "orders" && (
                <div>
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className={`p-3 border-bottom ${isAdminDark ? "border-secondary" : "border-light"}`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <h6 className="mb-0 fw-bold">Order #{o.id}</h6>
                          <small className="text-secondary">
                            Amount: ${o.total_amount} • {o.status}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          className="flex-grow-1"
                          onClick={() => {
                            setEditingOrder(o);
                            setOrderForm(o);
                            setShowOrderModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deleteOrder(o.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "posts" && (
                <div>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className={`p-3 border-bottom ${isAdminDark ? "border-secondary" : "border-light"}`}
                    >
                      <h6 className="mb-0 fw-bold">{post.title}</h6>
                      <small className="text-secondary d-block mb-2">
                        Author ID: {post.author_id}
                      </small>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          className="flex-grow-1"
                          onClick={() => {
                            setEditingPost(post);
                            setPostForm(post);
                            setShowPostModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowMobileModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {message && (
          <Alert variant="success" dismissible onClose={() => setMessage(null)}>
            {message}
          </Alert>
        )}

        <style>
          {`
            .custom-admin-tabs {
              border-bottom: 2px solid ${isAdminDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} !important;
            }
            .custom-admin-tabs .nav-link {
              color: ${isAdminDark ? "#888" : "#666"} !important;
              border: none !important;
              padding: 1rem 2rem;
              font-weight: 500;
              transition: all 0.3s ease;
              position: relative;
            }
            .custom-admin-tabs .nav-link:hover {
              color: ${isAdminDark ? "#fff" : "#000"} !important;
              background: transparent !important;
            }
            .custom-admin-tabs .nav-link.active {
              color: ${isAdminDark ? "#0dcaf0" : "#0d6efd"} !important;
              background: transparent !important;
              font-weight: 700;
            }
            .custom-admin-tabs .nav-link.active::after {
              content: "";
              position: absolute;
              bottom: 0;
              left: 20%;
              right: 20%;
              height: 3px;
              background: ${isAdminDark ? "#0dcaf0" : "#0d6efd"};
              border-radius: 3px;
            }
            .table-responsive {
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid ${isAdminDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"};
            }
            .table {
              margin-bottom: 0 !important;
            }
            .table th:last-child, .table td:last-child {
              border-right: none !important;
            }
            .table th:first-child, .table td:first-child {
              border-left: none !important;
            }
            .table thead tr:first-child th {
              border-top: none !important;
            }
          `}
        </style>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-5 custom-admin-tabs d-none d-md-flex"
        >
          <Tab eventKey="products" title="Services">
            <div className="d-none d-md-flex justify-content-between mb-3 align-items-center mt-3">
              <h3>Revenue Generating Solutions</h3>
              <Button
                variant={isAdminDark ? "info" : "dark"}
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    price: 0,
                    description: "",
                    category: "Service",
                  });
                  setShowProductModal(true);
                }}
              >
                Add New Solution
              </Button>
            </div>
            <div className="d-none d-md-block">
              <Table
                striped
                bordered
                hover
                responsive
                variant={isAdminDark ? "dark" : "light"}
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className={isAdminDark ? "text-light" : ""}>
                          {p.id}
                        </span>
                      </td>
                      <td>
                        <span className={isAdminDark ? "text-light" : ""}>
                          {p.name}
                        </span>
                      </td>
                      <td>
                        <span className={isAdminDark ? "text-light" : ""}>
                          ${p.price}
                        </span>
                      </td>
                      <td>
                        <span className={isAdminDark ? "text-light" : ""}>
                          {p.category}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={isAdminDark ? "info" : "outline-primary"}
                          className="me-2"
                          onClick={() => {
                            setEditingProduct(p);
                            setProductForm(p);
                            setShowProductModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={isAdminDark ? "danger" : "outline-danger"}
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="clients" title="Clients">
            <div className="d-none d-md-flex justify-content-between mb-3 align-items-center mt-3">
              <h3>Strategic Partners</h3>
              <Button
                variant={isAdminDark ? "info" : "dark"}
                onClick={() => {
                  setEditingClient(null);
                  setClientForm({
                    name: "",
                    email: "",
                    status: "Active",
                    company: "",
                  });
                  setShowClientModal(true);
                }}
              >
                Add New Client
              </Button>
            </div>
            <div className="d-none d-md-block">
              <Table
                striped
                bordered
                hover
                responsive
                variant={isAdminDark ? "dark" : "light"}
              >
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className={isAdminDark ? "text-light" : ""}>
                          {c.name}
                        </span>
                        <br />
                        <small
                          className={
                            isAdminDark ? "text-info opacity-75" : "text-muted"
                          }
                        >
                          {c.email}
                        </small>
                      </td>
                      <td>
                        <span className={isAdminDark ? "text-light" : ""}>
                          {c.company}
                        </span>
                      </td>
                      <td>
                        <Badge
                          bg={c.status === "Active" ? "success" : "warning"}
                          className={isAdminDark ? "text-dark" : ""}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={isAdminDark ? "info" : "outline-primary"}
                          className="me-2"
                          onClick={() => {
                            setEditingClient(c);
                            setClientForm(c);
                            setShowClientModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={isAdminDark ? "danger" : "outline-danger"}
                          onClick={() => deleteClient(c.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="orders" title="Orders">
            <div className="mt-3 d-none d-md-block">
              <h3>Transaction Records</h3>
              <div className="d-none d-md-block">
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  variant={isAdminDark ? "dark" : "light"}
                >
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>User ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.user_id}</td>
                        <td>${o.total_amount}</td>
                        <td>{o.status}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteOrder(o.id)}
                          >
                            Cancel / Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Tab>

          <Tab eventKey="posts" title="Posts">
            <div className="mt-3 d-none d-md-block">
              <h3>Community Governance</h3>
              <div className="d-none d-md-block">
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  variant={isAdminDark ? "dark" : "light"}
                >
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author ID</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td>{post.title}</td>
                        <td>{post.author_id}</td>
                        <td>
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deletePost(post.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Tab>
        </Tabs>

        {/* Product Modal */}
        <Modal
          show={showProductModal}
          onHide={() => setShowProductModal(false)}
          contentClassName={
            isAdminDark ? "bg-dark text-light border-secondary" : ""
          }
        >
          <Modal.Header closeButton closeVariant={isAdminDark ? "white" : ""}>
            <Modal.Title>
              {editingProduct ? "Edit" : "Add"} Solution
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleProductSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowProductModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="info">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Client Modal */}
        <Modal
          show={showClientModal}
          onHide={() => setShowClientModal(false)}
          contentClassName={
            isAdminDark ? "bg-dark text-light border-secondary" : ""
          }
        >
          <Modal.Header closeButton closeVariant={isAdminDark ? "white" : ""}>
            <Modal.Title>{editingClient ? "Edit" : "Add"} Client</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleClientSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={clientForm.name}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={clientForm.email}
                  onChange={(e) =>
                    setClientForm({ ...clientForm, email: e.target.value })
                  }
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowClientModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="info">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Order Modal */}
        <Modal
          show={showOrderModal}
          onHide={() => setShowOrderModal(false)}
          contentClassName={
            isAdminDark ? "bg-dark text-light border-secondary" : ""
          }
        >
          <Modal.Header closeButton closeVariant={isAdminDark ? "white" : ""}>
            <Modal.Title>{editingOrder ? "Edit" : "Add"} Order</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleOrderSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="number"
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={orderForm.user_id}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      user_id: parseInt(e.target.value),
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control
                  type="number"
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={orderForm.total_amount}
                  onChange={(e) =>
                    setOrderForm({
                      ...orderForm,
                      total_amount: parseFloat(e.target.value),
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={orderForm.status}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowOrderModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="info">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Post Modal */}
        <Modal
          show={showPostModal}
          onHide={() => setShowPostModal(false)}
          contentClassName={
            isAdminDark ? "bg-dark text-light border-secondary" : ""
          }
        >
          <Modal.Header closeButton closeVariant={isAdminDark ? "white" : ""}>
            <Modal.Title>{editingPost ? "Edit" : "Add"} Post</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handlePostSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={postForm.title}
                  onChange={(e) =>
                    setPostForm({ ...postForm, title: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={postForm.content}
                  onChange={(e) =>
                    setPostForm({ ...postForm, content: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Author ID</Form.Label>
                <Form.Control
                  type="number"
                  className={
                    isAdminDark ? "bg-dark text-light border-secondary" : ""
                  }
                  value={postForm.author_id}
                  onChange={(e) =>
                    setPostForm({
                      ...postForm,
                      author_id: parseInt(e.target.value),
                    })
                  }
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowPostModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="info">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default InternalAdmin;
