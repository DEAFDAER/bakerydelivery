#!/usr/bin/env python3
"""
Database initialization script for Bongao Bakery API.
This script creates the database tables and optionally seeds initial data.
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from sqlalchemy.orm import Session
from config.database import engine, SessionLocal, Base
from models.models import User, Category, Product, UserRole
from utils.auth import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def seed_initial_data():
    """Seed the database with initial data."""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@bongao-bakery.com").first()
        if admin_user:
            logger.info("Admin user already exists, skipping user creation")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@bongao-bakery.com",
            username="admin",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        
        # Create sample baker
        baker_user = User(
            email="baker@bongao-bakery.com",
            username="baker1",
            full_name="Maria Santos",
            phone="+63 912 345 6789",
            address="Bongao, Tawi-Tawi",
            hashed_password=get_password_hash("baker123"),
            role=UserRole.BAKER,
            is_active=True
        )
        db.add(baker_user)
        
        # Create sample delivery person
        delivery_user = User(
            email="delivery@bongao-bakery.com",
            username="delivery1",
            full_name="Juan Dela Cruz",
            phone="+63 912 345 6788",
            address="Bongao, Tawi-Tawi",
            hashed_password=get_password_hash("delivery123"),
            role=UserRole.DELIVERY_PERSON,
            is_active=True
        )
        db.add(delivery_user)
        
        # Create sample customer
        customer_user = User(
            email="customer@bongao-bakery.com",
            username="customer1",
            full_name="Ana Rodriguez",
            phone="+63 912 345 6787",
            address="Bongao, Tawi-Tawi",
            hashed_password=get_password_hash("customer123"),
            role=UserRole.CUSTOMER,
            is_active=True
        )
        db.add(customer_user)
        
        db.commit()
        
        # Create sample categories
        categories_data = [
            {"name": "Bread", "description": "Fresh baked bread and rolls"},
            {"name": "Pastries", "description": "Sweet pastries and desserts"},
            {"name": "Cakes", "description": "Custom and ready-made cakes"},
            {"name": "Cookies", "description": "Various types of cookies"},
            {"name": "Pies", "description": "Sweet and savory pies"}
        ]
        
        categories = []
        for cat_data in categories_data:
            category = Category(**cat_data, is_active=True)
            db.add(category)
            categories.append(category)
        
        db.commit()
        
        # Create sample products
        products_data = [
            {
                "name": "Pandesal",
                "description": "Traditional Filipino bread roll",
                "price": 5.0,
                "stock_quantity": 50,
                "category_id": categories[0].id,
                "baker_id": baker_user.id
            },
            {
                "name": "Ensaymada",
                "description": "Sweet bread topped with butter, sugar, and cheese",
                "price": 25.0,
                "stock_quantity": 20,
                "category_id": categories[1].id,
                "baker_id": baker_user.id
            },
            {
                "name": "Ube Cake",
                "description": "Purple yam flavored cake",
                "price": 300.0,
                "stock_quantity": 5,
                "category_id": categories[2].id,
                "baker_id": baker_user.id
            },
            {
                "name": "Chocolate Chip Cookies",
                "description": "Soft and chewy chocolate chip cookies",
                "price": 3.0,
                "stock_quantity": 100,
                "category_id": categories[3].id,
                "baker_id": baker_user.id
            },
            {
                "name": "Apple Pie",
                "description": "Classic apple pie with flaky crust",
                "price": 150.0,
                "stock_quantity": 8,
                "category_id": categories[4].id,
                "baker_id": baker_user.id
            }
        ]
        
        for prod_data in products_data:
            product = Product(**prod_data, is_available=True)
            db.add(product)
        
        db.commit()
        logger.info("Initial data seeded successfully")
        
    except Exception as e:
        logger.error(f"Error seeding initial data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Main function to initialize the database."""
    logger.info("Starting database initialization...")
    
    try:
        # Create tables
        create_tables()
        
        # Seed initial data
        seed_initial_data()
        
        logger.info("Database initialization completed successfully!")
        print("\n" + "="*50)
        print("DATABASE INITIALIZATION COMPLETED")
        print("="*50)
        print("Sample users created:")
        print("Admin: admin@bongao-bakery.com / admin123")
        print("Baker: baker@bongao-bakery.com / baker123")
        print("Delivery: delivery@bongao-bakery.com / delivery123")
        print("Customer: customer@bongao-bakery.com / customer123")
        print("="*50)
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
