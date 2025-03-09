from flask import Blueprint, jsonify, request
from lib.db import db

bp = Blueprint('groups', __name__, url_prefix='/api/groups')

@bp.route('', methods=['GET'])
def list_groups():
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) as count FROM groups')
    total_items = cursor.fetchone()['count']
    
    # Get paginated results with word count and study statistics
    cursor.execute('''
        SELECT 
            g.id,
            g.name,
            COUNT(DISTINCT wg.word_id) as word_count,
            COUNT(DISTINCT ss.id) as total_sessions,
            MAX(ss.created_at) as last_studied_at,
            ROUND(
                CAST(SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) AS FLOAT) /
                NULLIF(COUNT(wri.id), 0) * 100,
                1
            ) as success_rate
        FROM groups g
        LEFT JOIN word_groups wg ON wg.group_id = g.id
        LEFT JOIN study_sessions ss ON ss.group_id = g.id
        LEFT JOIN word_review_items wri ON wri.study_session_id = ss.id
        GROUP BY g.id
        ORDER BY g.name
        LIMIT ? OFFSET ?
    ''', (per_page, offset))
    
    groups = cursor.fetchall()
    total_pages = (total_items + per_page - 1) // per_page
    
    return jsonify({
        'items': [{
            'id': group['id'],
            'name': group['name'],
            'description': '',  # Default empty string since we don't have this column
            'word_count': group['word_count'] or 0,
            'total_sessions': group['total_sessions'] or 0,
            'last_studied_at': group['last_studied_at'].isoformat() if group['last_studied_at'] else None,
            'success_rate': group['success_rate'] or 0
        } for group in groups],
        'pagination': {
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'items_per_page': per_page
        }
    })

@bp.route('/<int:id>', methods=['GET'])
def get_group(id):
    cursor = db.cursor()
    
    # Get group details with statistics
    cursor.execute('''
        SELECT 
            g.id,
            g.name,
            COUNT(DISTINCT wg.word_id) as word_count,
            COUNT(DISTINCT ss.id) as total_sessions,
            MAX(ss.created_at) as last_studied_at,
            ROUND(
                CAST(SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) AS FLOAT) /
                NULLIF(COUNT(wri.id), 0) * 100,
                1
            ) as success_rate
        FROM groups g
        LEFT JOIN word_groups wg ON wg.group_id = g.id
        LEFT JOIN study_sessions ss ON ss.group_id = g.id
        LEFT JOIN word_review_items wri ON wri.study_session_id = ss.id
        WHERE g.id = ?
        GROUP BY g.id
    ''', (id,))
    
    group = cursor.fetchone()
    
    if not group:
        return jsonify({'error': 'Group not found'}), 404
    
    # Get group words with their stats
    cursor.execute('''
        SELECT 
            w.id,
            w.english,
            w.spanish,
            SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN NOT wri.correct THEN 1 ELSE 0 END) as wrong_count
        FROM words w
        JOIN word_groups wg ON wg.word_id = w.id
        LEFT JOIN word_review_items wri ON wri.word_id = w.id
        WHERE wg.group_id = ?
        GROUP BY w.id
        ORDER BY w.english
    ''', (id,))
    
    words = cursor.fetchall()
    
    # Get recent study sessions
    cursor.execute('''
        SELECT 
            ss.id,
            sa.name as activity_name,
            ss.created_at as start_time,
            ss.created_at as end_time,
            COUNT(wri.id) as review_items_count,
            ROUND(
                CAST(SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) AS FLOAT) /
                NULLIF(COUNT(wri.id), 0) * 100,
                1
            ) as success_rate
        FROM study_sessions ss
        JOIN study_activities sa ON sa.id = ss.study_activity_id
        LEFT JOIN word_review_items wri ON wri.study_session_id = ss.id
        WHERE ss.group_id = ?
        GROUP BY ss.id
        ORDER BY ss.created_at DESC
        LIMIT 10
    ''', (id,))
    
    sessions = cursor.fetchall()
    
    return jsonify({
        'id': group['id'],
        'name': group['name'],
        'description': '',  # Default empty string since we don't have this column
        'word_count': group['word_count'] or 0,
        'total_sessions': group['total_sessions'] or 0,
        'last_studied_at': group['last_studied_at'].isoformat() if group['last_studied_at'] else None,
        'success_rate': group['success_rate'] or 0,
        'words': [{
            'id': word['id'],
            'english': word['english'],
            'spanish': word['spanish'],
            'correct_count': word['correct_count'] or 0,
            'wrong_count': word['wrong_count'] or 0
        } for word in words],
        'recent_sessions': [{
            'id': session['id'],
            'activity_name': session['activity_name'],
            'start_time': session['start_time'].isoformat(),
            'end_time': session['end_time'].isoformat(),
            'review_items_count': session['review_items_count'],
            'success_rate': session['success_rate'] or 0
        } for session in sessions]
    })

@bp.route('/<int:id>/words', methods=['GET'])
def get_group_words(id):
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('''
        SELECT COUNT(*) as count
        FROM word_groups wg
        WHERE wg.group_id = ?
    ''', (id,))
    total_items = cursor.fetchone()['count']
    
    # Get paginated results with review stats
    cursor.execute('''
        SELECT 
            w.english,
            w.spanish,
            SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN NOT wri.correct THEN 1 ELSE 0 END) as wrong_count
        FROM words w
        JOIN word_groups wg ON wg.word_id = w.id
        LEFT JOIN word_review_items wri ON wri.word_id = w.id
        WHERE wg.group_id = ?
        GROUP BY w.id
        ORDER BY w.english
        LIMIT ? OFFSET ?
    ''', (id, per_page, offset))
    
    words = cursor.fetchall()
    total_pages = (total_items + per_page - 1) // per_page
    
    return jsonify({
        'items': [{
            'english': word['english'],
            'spanish': word['spanish'],
            'correct_count': word['correct_count'] or 0,
            'wrong_count': word['wrong_count'] or 0
        } for word in words],
        'pagination': {
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'items_per_page': per_page
        }
    })

@bp.route('/<int:id>/study_sessions', methods=['GET'])
def get_group_sessions(id):
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('''
        SELECT COUNT(*) as count
        FROM study_sessions ss
        WHERE ss.group_id = ?
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
        WHERE ss.group_id = ?
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