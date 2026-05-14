from flask import Blueprint, jsonify, request
from models.models import Product, Order, Post, User, Client, db

internal_bp = Blueprint('internal', __name__)

# --- PRODUCTS MANAGEMENT ---
@internal_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'description': p.description,
        'category': p.category,
        'image_url': p.image_url
    } for p in products])

@internal_bp.route('/products', methods=['POST'])
def add_product():
    data = request.json
    p = Product(
        name=data['name'],
        price=data['price'],
        description=data.get('description', ''),
        category=data.get('category', 'Standard'),
        image_url=data.get('image_url', '')
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'message': 'Product added'})

@internal_bp.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.json
    p = Product.query.get_or_404(id)
    p.name = data.get('name', p.name)
    p.price = data.get('price', p.price)
    p.description = data.get('description', p.description)
    p.category = data.get('category', p.category)
    p.image_url = data.get('image_url', p.image_url)
    db.session.commit()
    return jsonify({'message': 'Product updated'})

@internal_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    p = Product.query.get_or_404(id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Product deleted'})

# --- ORDERS MANAGEMENT ---
@internal_bp.route('/orders', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    return jsonify([{
        'id': o.id,
        'user_id': o.user_id,
        'total_price': o.total_price,
        'created_at': o.created_at.isoformat(),
        'items': o.items
    } for o in orders])

@internal_bp.route('/orders/<int:id>', methods=['DELETE'])
def delete_order(id):
    o = Order.query.get_or_404(id)
    db.session.delete(o)
    db.session.commit()
    return jsonify({'message': 'Order deleted'})

# --- FORUM MANAGEMENT ---
@internal_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'content': p.content,
        'channel': p.channel
    } for p in posts])

@internal_bp.route('/posts/<int:id>', methods=['DELETE'])
def delete_post(id):
    p = Post.query.get_or_404(id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})

# --- CLIENTS MANAGEMENT ---
@internal_bp.route('/clients', methods=['GET'])
def get_clients():
    # Fetch from Client table
    clients = Client.query.all()
    client_list = [{
        'id': f"c{c.id}",
        'name': c.name,
        'email': c.email,
        'status': c.status,
        'company': c.company,
        'created_at': c.created_at.isoformat() if c.created_at else None,
        'type': 'client'
    } for c in clients]

    # Fetch recorded users from User table (excluding is_admin if applicable, else checking role)
    # Based on models.py, User has a 'role' field
    users = User.query.filter(User.role != 'admin').all()
    user_list = [{
        'id': f"u{u.id}",
        'name': u.username,
        'email': 'Registered account',
        'status': 'Registered',
        'company': u.job_title,
        'created_at': None,
        'type': 'user'
    } for u in users]

    return jsonify(client_list + user_list)

@internal_bp.route('/clients', methods=['POST'])
def add_client():
    data = request.json
    c = Client(
        name=data['name'],
        email=data.get('email', ''),
        status=data.get('status', 'Active'),
        company=data.get('company', '')
    )
    db.session.add(c)
    db.session.commit()
    return jsonify({'message': 'Client added', 'id': c.id})

@internal_bp.route('/clients/<int:id>', methods=['PUT'])
def update_client(id):
    data = request.json
    c = Client.query.get_or_404(id)
    c.name = data.get('name', c.name)
    c.email = data.get('email', c.email)
    c.status = data.get('status', c.status)
    c.company = data.get('company', c.company)
    db.session.commit()
    return jsonify({'message': 'Client updated'})

@internal_bp.route('/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    c = Client.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Client deleted'})
