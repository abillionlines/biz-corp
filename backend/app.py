import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from config import Config

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    
    # Initialize Extensions
    db.init_app(app)
    allowed_origins_env = os.environ.get('ALLOWED_ORIGINS', '*')
    allowed_origins = allowed_origins_env.split(',') if ',' in allowed_origins_env else allowed_origins_env
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)
    
    # Register Blueprints
    from api.forum import forum_bp
    from api.shop import shop_bp
    from api.auth import auth_bp
    from api.bot import bot_bp
    from api.internal import internal_bp
    
    app.register_blueprint(forum_bp, url_prefix='/api/forum')
    app.register_blueprint(shop_bp, url_prefix='/api/shop')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bot_bp, url_prefix='/api/bot')
    app.register_blueprint(internal_bp, url_prefix='/api/internal')
    
    with app.app_context():
        db.create_all()
        
    @app.route('/health')
    def health():
        try:
            db.session.execute(db.text('SELECT 1'))
            return {'status': 'healthy'}
        except Exception:
            return {'status': 'unhealthy'}, 503
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)
