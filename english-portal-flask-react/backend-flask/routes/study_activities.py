from flask import Blueprint, jsonify, request
from lib.db import db

bp = Blueprint('study_activities', __name__, url_prefix='/api/study-activities')

@bp.route('', methods=['GET'])
def list_activities():
    cursor = db.cursor()
    cursor.execute('''
        SELECT id, name, description, thumbnail_url
        FROM study_activities
        ORDER BY name
    ''')
    
    activities = cursor.fetchall()
    return jsonify([{
        'id': activity['id'],
        'name': activity['name'],
        'description': activity['description'],
        'thumbnail_url': activity['thumbnail_url']
    } for activity in activities])

@bp.route('/<int:id>', methods=['GET'])
def get_activity(id):
    cursor = db.cursor()
    cursor.execute('''
        SELECT id, name, description, thumbnail_url
        FROM study_activities
        WHERE id = ?
    ''', (id,))
    activity = cursor.fetchone()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    return jsonify({
        'id': activity['id'],
        'name': activity['name'],
        'description': activity['description'],
        'thumbnail_url': activity['thumbnail_url']
    })

@bp.route('/<int:id>/study_sessions', methods=['GET'])
def get_activity_sessions(id):
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('''
        SELECT COUNT(*) as count
        FROM study_sessions ss
        WHERE ss.study_activity_id = ?
    ''', (id,))
    total_items = cursor.fetchone()['count']
    
    # Get paginated results
    cursor.execute('''
        SELECT 
            ss.id,
            sa.name as activity_name,
            g.name as group_name,
            ss.created_at as start_time,
            ss.created_at as end_time,
            COUNT(wri.id) as review_items_count
        FROM study_sessions ss
        JOIN study_activities sa ON sa.id = ss.study_activity_id
        JOIN groups g ON g.id = ss.group_id
        LEFT JOIN word_review_items wri ON wri.study_session_id = ss.id
        WHERE ss.study_activity_id = ?
        GROUP BY ss.id
        ORDER BY ss.created_at DESC
        LIMIT ? OFFSET ?
    ''', (id, per_page, offset))
    
    sessions = cursor.fetchall()
    
    total_pages = (total_items + per_page - 1) // per_page
    
    return jsonify({
        'items': [{
            'id': session['id'],
            'activity_name': session['activity_name'],
            'group_name': session['group_name'],
            'start_time': session['start_time'].isoformat(),
            'end_time': session['end_time'].isoformat(),
            'review_items_count': session['review_items_count']
        } for session in sessions],
        'pagination': {
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'items_per_page': per_page
        }
    })

@bp.route('', methods=['POST'])
def create_study_session():
    data = request.get_json()
    
    if not data or 'group_id' not in data or 'study_activity_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO study_sessions (group_id, study_activity_id)
        VALUES (?, ?)
    ''', (data['group_id'], data['study_activity_id']))
    
    db.commit()
    
    return jsonify({
        'id': cursor.lastrowid,
        'group_id': data['group_id']
    }) 