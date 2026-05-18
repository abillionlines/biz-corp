import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useCart } from "../../store/CartContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const solutionImages = [
  "/0047A521-5725-4B89-BCB3-230852DE672F_4_5005_c.jpeg",
  "/6B7B8A05-5F4C-4AC9-8CAB-D2E94BD05830_4_5005_c.jpeg",
  "/D4E61537-4B62-4782-AF36-8390BAEC2CCE_4_5005_c.jpeg",
];

const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 3000;

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [poppingId, setPoppingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async (attempt = 0) => {
      try {
        const res = await axios.get(`${API_BASE}/api/shop/products`);
        if (!cancelled) {
          setProducts(res.data);
          setLoading(false);
          setFailed(false);
        }
      } catch (err) {
        if (cancelled) return;
        if (attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1);
          setTimeout(() => fetchProducts(attempt + 1), RETRY_DELAY_MS);
        } else {
          setLoading(false);
          setFailed(true);
          console.error(err);
        }
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setPoppingId(product.id);
    setTimeout(() => setPoppingId(null), 300);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <Container className="mt-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <h2 className="text-navy text-center text-md-start mb-2 mb-md-0">
            Business Solutions
          </h2>
          <Badge
            bg="info"
            className="px-2 py-1 mt-3 mt-md-0"
            style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
          >
            Enterprise Ready
          </Badge>
        </div>

        {loading && (
          <div className="text-center py-5 text-muted">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            {retryCount === 0
              ? "Loading solutions…"
              : `Connecting to server… (attempt ${retryCount + 1} of ${MAX_RETRIES + 1})`}
          </div>
        )}

        {failed && (
          <div className="text-center py-5 text-muted">
            Unable to load solutions. Please refresh the page.
          </div>
        )}

        <Row>
          {products.map((product, index) => (
            <Col md={4} key={product.id} className="mb-4">
              <Card className="business-card h-100 p-2 border border-secondary shadow-sm">
                <div
                  style={{
                    height: "180px",
                    overflow: "hidden",
                    background: "#eee",
                  }}
                  className="rounded mb-2"
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={solutionImages[index % solutionImages.length]}
                      alt={product.name}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center 15%", // Centered horizontally, brought down 15% vertically
                        transition: "transform 0.5s ease",
                      }}
                      className="card-img-zoom"
                    />
                  </div>
                </div>
                <Card.Body>
                  <Card.Title className="text-navy">{product.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {product.category}
                  </Card.Subtitle>
                  <Card.Text className="small">{product.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-bold fs-5">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      variant={poppingId === product.id ? "success" : "primary"}
                      size="sm"
                      className={`cart-pop-effect-btn ${poppingId === product.id ? "popping" : ""}`}
                      onClick={() => handleAddToCart(product)}
                      style={{ minWidth: "100px" }}
                    >
                      {poppingId === product.id ? "Added!" : "Add to Cart"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default ShopPage;
