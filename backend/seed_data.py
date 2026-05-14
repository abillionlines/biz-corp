import os
from app import create_app
from extensions import db
from models.models import User, Post, Reply, Reaction, Product, Order, Client
from datetime import datetime

app = create_app()

def populate():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        print("Populating dummy users...")
        users = [
            User(username="alex_pm", role="user", job_title="Product Manager"),
            User(username="sarah_dev", role="user", job_title="Senior Software Engineer"),
            User(username="mike_marketing", role="user", job_title="Marketing Director"),
            User(username="admin", role="admin", job_title="System Administrator"),
            User(username="john_doe", role="user", job_title="Business Analyst")
        ]
        db.session.add_all(users)
        db.session.commit()

        print("Populating products...")
        products = [
            Product(name='Standard Package', price=99.99, description='Basic service offering for small teams.', category='Service'),
            Product(name='Premium Solution', price=249.99, description='Enterprise level support and scaling.', category='Enterprise'),
            Product(name='Consultation Hour', price=150.00, description='One hour of expert strategic advice.', category='Service')
        ]
        db.session.add_all(products)
        db.session.commit()

        print("Populating orders...")
        orders = [
            Order(user_id=users[0].id, total_price=99.99, items=[{"id": 1, "name": "Standard Package", "price": 99.99, "quantity": 1}]),
            Order(user_id=users[1].id, total_price=249.99, items=[{"id": 2, "name": "Premium Solution", "price": 249.99, "quantity": 1}]),
            Order(user_id=users[2].id, total_price=399.99, items=[{"id": 1, "name": "Standard Package", "price": 99.99, "quantity": 1}, {"id": 5, "name": "Security Audit", "price": 299.00, "quantity": 1}])
        ]
        db.session.add_all(orders)
        db.session.commit()

        print("Populating engagement messages...")
        # General Discussion
        p1 = Post(
            title="Welcome to the team!", 
            content="Excited to start our new project with BizCorp. Looking forward to meeting everyone!",
            channel="general-discussion",
            user_id=users[0].id
        )
        db.session.add(p1)
        db.session.commit()

        r1 = Reply(content="Welcome Alex! Happy to have you on board.", user_id=users[1].id, post_id=p1.id)
        r2 = Reply(content="Congrats Alex! Let's catch up later this week.", user_id=users[2].id, post_id=p1.id)
        r3 = Reply(content="Glad to see the team growing. Check out the onboarding docs.", user_id=users[3].id, post_id=p1.id)
        db.session.add_all([r1, r2, r3])

        # Product Feedback
        p2 = Post(
            title="New feature request: Dark Mode", 
            content="Can we get a dark mode for the dashboard? It's much easier on the eyes during late-night sessions.",
            channel="product-feedback",
            user_id=users[1].id
        )
        db.session.add(p2)
        db.session.commit()

        r4 = Reply(content="I second this! Definitely needed.", user_id=users[0].id, post_id=p2.id)
        r5 = Reply(content="It's actually on the roadmap for Q3.", user_id=users[3].id, post_id=p2.id)
        r6 = Reply(content="I'd love to help beta test that once it's ready.", user_id=users[4].id, post_id=p2.id)
        db.session.add_all([r4, r5, r6])

        # Support
        p3 = Post(
            title="Issue with API access", 
            content="Hey team, I'm getting a 403 error when trying to access the analytics endpoint. Any ideas?",
            channel="support",
            user_id=users[2].id
        )
        db.session.add(p3)
        db.session.commit()

        r7 = Reply(content="I'll look into your permissions right away.", user_id=users[3].id, post_id=p3.id)
        r8 = Reply(content="Make sure you're using the new API key from the dashboard.", user_id=users[1].id, post_id=p3.id)
        db.session.add_all([r7, r8])

        db.session.commit()
        print("Done!")

if __name__ == "__main__":
    populate()
