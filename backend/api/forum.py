from flask import Blueprint, jsonify, request, current_app
from models.models import Post, Reaction, Reply, User, db
from utils.scraper import get_link_metadata
import re
import os
from werkzeug.utils import secure_filename
from sqlalchemy import func
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()

forum_bp = Blueprint('forum', __name__)

def process_file_upload(file):
    if not file:
        return None, None
        
    filename = secure_filename(file.filename)
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    
    # Save original file first
    file.save(upload_path)
    
    # If it's a HEIC/HEIF file, convert it to JPG so browsers can show it
    if filename.lower().endswith(('.heic', '.heif')):
        try:
            image = Image.open(upload_path)
            new_filename = os.path.splitext(filename)[0] + ".jpg"
            new_path = os.path.join(current_app.config['UPLOAD_FOLDER'], new_filename)
            image.save(new_path, "JPEG")
            # Optionally remove original to save space, but keeping it is safer
            # os.remove(upload_path) 
            return f"/static/uploads/{new_filename}", new_filename
        except Exception as e:
            print(f"Conversion error: {e}")
            
    return f"/static/uploads/{filename}", filename

@forum_bp.route('/posts', methods=['GET'])
def get_posts():
    channel = request.args.get('channel')
    query = Post.query
    if channel:
        query = query.filter(Post.channel == channel)
    
    posts = query.order_by(Post.created_at.desc()).all()
    results = []
    for p in posts:
        # Group reactions by type and count them
        reaction_counts = db.session.query(
            Reaction.type, func.count(Reaction.id)
        ).filter(Reaction.post_id == p.id).group_by(Reaction.type).all()
        
        results.append({
            'id': p.id,
            'title': p.title,
            'content': p.content,
            'created_at': p.created_at.isoformat(),
            'attachment_url': p.attachment_url,
            'attachment_name': p.attachment_name,
            'link_preview': p.link_preview,
            'user': {'username': p.user.username, 'job_title': p.user.job_title},
            'reactions': {r_type: count for r_type, count in reaction_counts},
            'replies': [{
                'id': r.id,
                'content': r.content,
                'created_at': r.created_at.isoformat(),
                'user': {'username': r.user.username, 'job_title': r.user.job_title},
                'attachment_url': r.attachment_url,
                'attachment_name': r.attachment_name
            } for r in p.replies]
        })
    return jsonify(results)

@forum_bp.route('/posts', methods=['POST'])
def create_post():
    # Handle multipart for potential direct file uploads
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
        file = request.files.get('file')
    else:
        data = request.json
        file = None

    content = data.get('content', '')
    
    # Simple URL extraction
    urls = re.findall(r'(https?://[^\s<>"]+|www\.[^\s<>"]+)', content)
    preview = get_link_metadata(urls[0]) if urls else None
    
    attachment_url, attachment_name = process_file_upload(file)

    user_id = data.get('user_id')
    if not user_id:
        guest = User.query.filter_by(username='DemoUser').first()
        user_id = guest.id if guest else 1

    new_post = Post(
        title=data.get('title'),
        content=content,
        channel=data.get('channel', 'general-discussion'),
        user_id=user_id,
        attachment_url=attachment_url or data.get('attachment_url'),
        attachment_name=attachment_name or data.get('attachment_name'),
        link_preview=preview
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({'message': 'Post created', 'id': new_post.id})

@forum_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    # Recursively delete replies first if needed, though SQLAlchemy should handle it if set up
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})

@forum_bp.route('/replies/<int:reply_id>', methods=['DELETE'])
def delete_reply(reply_id):
    reply = Reply.query.get_or_404(reply_id)
    db.session.delete(reply)
    db.session.commit()
    return jsonify({'message': 'Reply deleted'})

@forum_bp.route('/posts/<int:post_id>/reply', methods=['POST'])
def add_reply(post_id):
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
        file = request.files.get('file')
    else:
        data = request.json
        file = None

    attachment_url, attachment_name = process_file_upload(file)

    user_id = data.get('user_id')
    if not user_id:
        guest = User.query.filter_by(username='DemoUser').first()
        user_id = guest.id if guest else 1

    reply = Reply(
        content=data.get('content'),
        user_id=user_id,
        post_id=post_id,
        attachment_url=attachment_url or data.get('attachment_url'),
        attachment_name=attachment_name or data.get('attachment_name')
    )
    db.session.add(reply)
    db.session.commit()
    return jsonify({'message': 'Reply added'})

@forum_bp.route('/posts/<int:post_id>/react', methods=['POST'])
def react(post_id):
    data = request.json
    user_id = data.get('user_id')
    r_type = data.get('type')
    
    # Check if user already reacted with this type
    existing = Reaction.query.filter_by(
        post_id=post_id, 
        user_id=user_id, 
        type=r_type
    ).first()
    
    if existing:
        db.session.delete(existing)
        message = 'Reaction removed'
    else:
        new_reaction = Reaction(
            type=r_type,
            post_id=post_id,
            user_id=user_id
        )
        db.session.add(new_reaction)
        message = 'Reaction added'
        
    db.session.commit()
    return jsonify({'message': message})
