from flask import Blueprint, jsonify, request
from models.models import Product, Order, db

shop_bp = Blueprint('shop', __name__)

@shop_bp.route('/products', methods=['GET'])
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

@shop_bp.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    new_order = Order(
        user_id=data.get('user_id'),
        total_price=data.get('total_price'),
        items=data.get('items')
    )
    db.session.add(new_order)
    db.session.commit()
    return jsonify({'message': 'Order placed successfully', 'order_id': new_order.id})
