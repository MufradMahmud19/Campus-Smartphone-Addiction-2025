import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration with environment variables
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "campus_smartphone_addiction")

# MySQL connection URL
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create engine with MySQL-specific configurations
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connection before use
    pool_recycle=3600,   # Recycle connections every hour
    echo=False,          # Set to True for SQL debugging
    # MySQL-specific connection arguments
    connect_args={
        "charset": "utf8mb4",
        "autocommit": False,
        "ssl": False,  # Set to True if using SSL
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Test database connection

def test_connection():
    try:
        with engine.connect() as connection:
            # either of these is fine in SQLAlchemy 2.x:
            # connection.execute(text("SELECT 1"))
            connection.exec_driver_sql("SELECT 1")
            print(" Database connection successful!")
            return True
    except Exception as e:
        print(f" Database connection failed: {e}")
        return False
