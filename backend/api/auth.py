from flask import Blueprint, jsonify, request
from models.models import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    job_title = data.get('job_title', 'Professional')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    user = User(username=username, role='user', job_title=job_title)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'job_title': user.job_title,
        'token': 'dummy-token'
    })

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    
    # If no username, keep old demo logic for safety/compatibility
    if not username:
        user = User.query.filter_by(username='DemoUser').first()
        if not user:
            try:
                user = User(username='DemoUser', role='admin', job_title='Demo Consultant')
                db.session.add(user)
                db.session.commit()
            except Exception:
                db.session.rollback()
                user = User.query.filter_by(username='DemoUser').first()
    else:
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'job_title': user.job_title,
        'token': 'dummy-token'
    })
