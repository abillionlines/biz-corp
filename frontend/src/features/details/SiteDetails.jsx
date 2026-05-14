import React from "react";
import CityBlendBackground from "../../components/CityBlendBackground";

const SiteDetails = () => {
  return (
    <div
      className="site-details-page"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "transparent",
      }}
    >
      <CityBlendBackground
        showParticles={true}
        showCity={false}
        backgroundColor={0x000000}
      />
      <div
        className="container mt-0 pt-5 pt-md-5 text-white"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div
          className="glass-morphism p-3 p-md-5 rounded-4 border border-light border-opacity-25 shadow-lg"
          style={{
            background: "rgba(255, 255, 255, 0.01)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            color: "#ffffff",
            minHeight: "auto",
          }}
        >
          <h1 className="display-4 fw-bold mb-4" style={{ color: "#00f2fe" }}>
            The Build
          </h1>

          <div className="lead mb-4" style={{ color: "#e0e0e0" }}>
            <p>
              What you're looking at isn't a template or a drag-and-drop
              builder. Every screen, interaction, and animation here was
              engineered from scratch — a fully custom platform built on the
              same architecture used by modern SaaS products and enterprise
              applications. The goal was simple: demonstrate what a real,
              production-grade build looks like, from the first line of code to
              a live, running application.
            </p>
            <p>
              We encourage you to actually use it. Sign in, post a message on
              the forum, add something to the cart, open the chat agent. Every
              feature you interact with is connected to a real backend — live
              data, live state, live responses. This isn't a demo skin over
              static content. It's a working system.
            </p>
            <p>
              It's also fully mobile responsive. Pull this up on your phone and
              every layout, animation, and interaction adapts — the 3D
              backgrounds scale, the navigation collapses cleanly, the forum and
              shop work exactly as intended. Responsive design wasn't an
              afterthought here; it was built in from the start.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <h3
                className="h4 border-bottom border-info pb-2 mb-3"
                style={{ color: "#00d2ff" }}
              >
                The Frontend
              </h3>
              <p style={{ color: "#cccccc" }}>
                The user interface is built with <strong>React 18</strong> and
                bundled with <strong>Vite</strong> — the current industry
                standard for fast, modern web applications. The UI is broken
                into isolated, reusable components, meaning every feature (the
                forum, the shop, the admin panel, the 3D backgrounds) lives
                independently and can be updated, replaced, or expanded without
                touching anything else. What that means for you as a client: new
                pages, new features, new designs can be added quickly and
                cleanly — no rebuilding from zero, no risk of breaking what
                already works.
              </p>
            </div>
            <div className="col-md-6">
              <h3
                className="h4 border-bottom border-primary pb-2 mb-3"
                style={{ color: "#00d2ff" }}
              >
                The Backend
              </h3>
              <p style={{ color: "#cccccc" }}>
                Behind the scenes runs a <strong>Python Flask API</strong>{" "}
                connected to a <strong>SQL database</strong> via SQLAlchemy.
                Every piece of data on this site — users, forum posts, products,
                orders, client records — flows through structured API routes
                that handle logic, validation, and storage. This separation
                between frontend and backend is what makes the system genuinely
                scalable: the API can serve a mobile app, a third-party
                integration, or a completely redesigned frontend without any
                changes to the core data layer.
              </p>
            </div>
            <div className="col-md-6">
              <h3
                className="h4 border-bottom border-info pb-2 mb-3"
                style={{ color: "#00d2ff" }}
              >
                What's Already Here
              </h3>
              <p style={{ color: "#cccccc" }}>
                This build ships with a working{" "}
                <strong>authentication system</strong>, a live{" "}
                <strong>message board</strong> with file attachments and
                reactions, an <strong>e-commerce shop</strong> with cart and
                checkout, an <strong>internal admin panel</strong> for managing
                products, clients, and orders, an <strong>AI chat agent</strong>
                , and a <strong>3D rendered background</strong> built with
                Three.js. These aren't mockups — they're functional, connected
                systems. The foundation for almost any product you can imagine
                is already in place.
              </p>
            </div>
            <div className="col-md-6">
              <h3
                className="h4 border-bottom border-primary pb-2 mb-3"
                style={{ color: "#00d2ff" }}
              >
                What Can Be Added
              </h3>
              <p style={{ color: "#cccccc" }}>
                Because the architecture is modular and the API is RESTful,
                expanding this platform is straightforward. Payment processing,
                real-time notifications, role-based access, analytics
                dashboards, CMS integrations, mobile apps, email workflows,
                custom reporting — all of these fit naturally into what's
                already built. The constraints aren't technical. They're just a
                matter of scope and collaboration.
              </p>
            </div>
          </div>

          <div
            className="mt-5 p-4 rounded-3"
            style={{
              background: "rgba(0, 123, 255, 0.08)",
              border: "1px solid rgba(0, 210, 255, 0.2)",
            }}
          >
            <h2 className="h3 mb-3" style={{ color: "#00f2fe" }}>
              Built to Grow With You
            </h2>
            <p className="mb-0" style={{ color: "#e0e0e0" }}>
              The best technology decisions are the ones you don't have to undo
              later. This stack was chosen specifically because it doesn't paint
              you into a corner — it scales from a single-user demo to a
              high-traffic production product without needing to be rewired.
              What changes between here and there is mostly scope.{" "}
              <strong>
                The architecture, the patterns, and the engineering discipline
                are already in place.
              </strong>{" "}
              Bring your requirements, your brand, your goals — and we'll build
              something that actually lasts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;
