import os
import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, send_file, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import logging
from models import db, UploadedFile, RedactionLog
from redactor import redact_file, PATTERNS

main_bp = Blueprint('main', __name__)
logger = logging.getLogger(__name__)

@main_bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return redirect(url_for('auth.login'))

@main_bp.route('/dashboard')
@login_required
def dashboard():
    logs = RedactionLog.query.filter_by(user_id=current_user.id).order_by(RedactionLog.timestamp.desc()).all()
    
    # We pass the log objects directly. 
    # For Chart.js, the frontend will call /api/analytics
    total_files = UploadedFile.query.filter_by(user_id=current_user.id).count()
    total_redactions = sum(log.redacted_count for log in logs)
    
    # Enrich log with original filename for display
    for log in logs:
        if not hasattr(log, 'filename'):
            log.filename = log.file.original_filename if log.file else "Unknown"
            
    return render_template(
        'dashboard.html',
        logs=logs,
        total_files=total_files,
        total_redactions=total_redactions
    )

@main_bp.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file selected.', 'danger')
            return redirect(url_for('main.upload'))
            
        file = request.files['file']
        if file.filename == '':
            flash('No file selected.', 'warning')
            return redirect(url_for('main.upload'))
            
        filename = secure_filename(file.filename)
        input_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)
        file_size = os.path.getsize(input_path)
        
        # Save file record
        uploaded_file = UploadedFile(
            user_id=current_user.id,
            original_filename=filename,
            file_size=file_size
        )
        db.session.add(uploaded_file)
        db.session.commit()

        # Collect options
        active_patterns = {}
        for cat in PATTERNS:
            active_patterns[cat] = request.form.get(f'pattern_{cat}') == 'on'
            
        custom_terms_raw = request.form.get('custom_terms', '[]')
        try:
            custom_terms = json.loads(custom_terms_raw)
        except:
            custom_terms = []
        custom_terms = [str(t).strip() for t in custom_terms if str(t).strip()]
        
        style = request.form.get('style', 'custom')
        custom_label = request.form.get('custom_label', '[REDACTED]')
        
        output_filename = f'redacted_{uploaded_file.id}_{filename}'
        output_path = os.path.join(current_app.config['UPLOAD_FOLDER'], output_filename)
        
        success, count, counts, err = redact_file(
            input_path, output_path, active_patterns, custom_terms,
            style=style, custom_label=custom_label,
            redact_all=True, case_sensitive=False
        )
        
        if not success:
            logger.error(f"Redaction failed for {filename}: {err}")
            flash(f'Redaction failed: {err}', 'danger')
            return redirect(url_for('main.upload'))
            
        # Update file record with output
        uploaded_file.redacted_filename = output_filename
        
        # Save log record
        log = RedactionLog(
            user_id=current_user.id,
            file_id=uploaded_file.id,
            redacted_count=count,
            categories=json.dumps(counts),
            style_used=style
        )
        db.session.add(log)
        db.session.commit()
        
        logger.info(f"User {current_user.email} successfully redacted {count} items in {filename}.")
        flash(f'Successfully redacted {count} items from {filename}!', 'success')
        return send_file(output_path, as_attachment=True, download_name=f'redacted_{filename}')

    return render_template('upload.html', patterns=list(PATTERNS.keys()))
