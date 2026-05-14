from app import create_app
from extensions import db
from models.models import User, Post, Product

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        print("Users count:", User.query.count())
        print("Posts count:", Post.query.count())
        print("Products count:", Product.query.count())
        print("\nPosts detail:")
        for p in Post.query.all():
            print(f"- {p.title} (Channel: {p.channel})")

