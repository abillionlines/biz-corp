import React from "react";
import { Container, Table, Button, Card, Row, Col } from "react-bootstrap";
import { useCart } from "../../store/CartContext";
import { useAuth } from "../../store/AuthContext";
import { useModal } from "../../store/ModalContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CartPage = () => {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showPrompt } = useModal();

  const handleCheckout = async () => {
    try {
      await axios.post(`${API_BASE}/api/shop/checkout`, {
        user_id: user ? user.id : 0, // Guest user ID is 0 for demo purposes
        total_price: totalPrice,
        items: cart,
      });
      showPrompt(
        "Success! Your business solutions order has been placed.",
        "Purchase Successful",
        "success",
      );
      clearCart();
    } catch (err) {
      console.error(err);
      showPrompt(
        "There was an error processing your order. Please try again.",
        "Order Failed",
        "danger",
      );
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-navy mb-5 pb-3">Your Solutions Cart</h2>
      <Row>
        <Col md={8}>
          <Card className="business-card p-3 no-hover">
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <Table responsive borderless>
                <thead>
                  <tr className="border-bottom">
                    <th>Solution</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-end">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
        <Col md={4}>
          <Card className="business-card p-4 bg-navy text-white no-hover">
            <h4>Order Summary</h4>
            <div className="d-flex justify-content-between mt-3">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span>Tax (0%)</span>
              <span>$0.00</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button
              variant="light"
              className="w-100 mt-4 fw-bold"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Secure Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
