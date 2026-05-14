import { Container, Row, Col } from "react-bootstrap";
import CityBlendBackground from "../../components/CityBlendBackground";

const HomePage = () => {
  return (
    <div
      className="home-wrapper"
      style={{ position: "relative", minHeight: "100vh" }}
    >
      <CityBlendBackground />
      <section
        className="hero-section"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Container>
          <Row className="align-items-start gx-0 gx-md-5">
            <Col
              lg={12}
              className="p-3 p-md-5"
              style={{
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "32px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(15px)",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
              }}
            >
              <Col lg={7} xs={12}>
                <h1 className="hero-title pe-lg-5 mb-4 mb-lg-0">
                  <span style={{ color: "#0d6efd" }}>bizcorp</span>: your last
                  stop before success
                </h1>
              </Col>
              <Col
                lg={5}
                xs={12}
                className="pt-2 d-flex flex-column align-items-center align-items-lg-start text-center text-lg-start"
                style={{ marginTop: "10px" }}
              >
                <p
                  className="hero-subtitle mb-4 w-100"
                  style={{
                    fontSize: "1.15rem",
                    maxWidth: "450px",
                    lineHeight: "1.6",
                    background: "none",
                    border: "none",
                    padding: "0",
                    backdropFilter: "none",
                  }}
                >
                  Grow your new startup easier than ever. Explore our special
                  features created for companies like yours and investors.
                </p>
                <div
                  className="email-signup-group shadow-sm w-100"
                  style={{ maxWidth: "400px" }}
                >
                  <i className="bi bi-envelope text-muted ms-3 d-flex align-items-center"></i>
                  <input
                    type="email"
                    placeholder={
                      window.innerWidth <= 450
                        ? "Email address"
                        : "Your email address"
                    }
                    className="email-signup-input py-2"
                    style={{ fontSize: "0.9rem" }}
                  />
                  <button
                    className="email-signup-btn py-2 px-4"
                    style={{ fontSize: "0.9rem" }}
                  >
                    let's chat
                  </button>
                </div>
              </Col>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Graphic Section removed as animation is now background */}
    </div>
  );
};

export default HomePage;
