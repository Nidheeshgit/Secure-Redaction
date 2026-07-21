from flask import Blueprint, jsonify
from flask_login import login_required, current_user
import json
from datetime import datetime, timedelta
from models import db, UploadedFile, RedactionLog

api_bp = Blueprint('api', __name__)

@api_bp.route('/analytics', methods=['GET'])
@login_required
def get_analytics():
    """Returns analytics data for Chart.js dashboards."""
    logs = RedactionLog.query.filter_by(user_id=current_user.id).all()
    
    # 1. PII Categories distribution (Doughnut Chart)
    category_totals = {}
    
    # 2. Uploads over last 7 days (Bar/Line Chart)
    today = datetime.utcnow().date()
    days = [(today - timedelta(days=i)).strftime('%m-%d') for i in range(6, -1, -1)]
    daily_uploads = {day: 0 for day in days}
    daily_redactions = {day: 0 for day in days}
    
    for log in logs:
        # Aggregate categories
        try:
            cats = json.loads(log.categories)
            for k, v in cats.items():
                if v > 0:
                    category_totals[k] = category_totals.get(k, 0) + v
        except Exception:
            pass
            
        # Aggregate dates
        log_date = log.timestamp.date().strftime('%m-%d')
        if log_date in daily_redactions:
            daily_redactions[log_date] += log.redacted_count
            daily_uploads[log_date] += 1
            
    return jsonify({
        'categories': {
            'labels': list(category_totals.keys()),
            'data': list(category_totals.values())
        },
        'trends': {
            'labels': days,
            'uploads': [daily_uploads[d] for d in days],
            'redactions': [daily_redactions[d] for d in days]
        }
    })
