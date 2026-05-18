import os

class Config:
    # Get base directory of the backend folder
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # Database — Render provides postgres:// but SQLAlchemy requires postgresql://
    _db_url = os.environ.get('DATABASE_URL') or \
        f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'dev.db')}"
    SQLALCHEMY_DATABASE_URI = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,   # discard stale connections after Neon auto-suspend
        "pool_recycle": 300,     # recycle connections every 5 min
    }
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'avif', 'webp', 'pdf', 'docx', 'txt'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
