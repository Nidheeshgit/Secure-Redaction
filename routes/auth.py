from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import logging
from models import db, User

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm', '')
        
        if not email or not password:
            flash('Email and password are required.', 'danger')
            return redirect(url_for('auth.register'))
            
        if password != confirm:
            flash('Passwords do not match.', 'danger')
            return redirect(url_for('auth.register'))
            
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'warning')
            return redirect(url_for('auth.register'))
            
        try:
            user = User(email=email, password=generate_password_hash(password))
            db.session.add(user)
            db.session.commit()
            logger.info(f"New user registered: {email}")
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            flash('An error occurred during registration.', 'danger')
            
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
        
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            logger.info(f"User logged in: {email}")
            flash('Welcome back!', 'success')
            return redirect(url_for('main.dashboard'))
            
        logger.warning(f"Failed login attempt for email: {email}")
        flash('Invalid email or password.', 'danger')
        
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logger.info(f"User logged out: {current_user.email}")
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
