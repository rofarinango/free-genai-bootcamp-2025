from flask import Blueprint, jsonify, request
from lib.db import db

bp = Blueprint('study_sessions', __name__, url_prefix='/api/study-sessions')

@bp.route('', methods=['GET'])
def list_sessions():
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) as count FROM study_sessions')
    total_items = cursor.fetchone()['count']
    
    # Build the query with filters
    query = '''
        SELECT 
            ss.id,
            sa.name as activity_name,
            g.name as group_name,
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
        JOIN groups g ON g.id = ss.group_id
        LEFT JOIN word_review_items wri ON wri.study_session_id = ss.id
    '''
    
    params = []
    where_clauses = []
    
    # Add filters
    group_id = request.args.get('group_id', type=int)
    if group_id:
        where_clauses.append('ss.group_id = ?')
        params.append(group_id)
        
    activity_id = request.args.get('activity_id', type=int)
    if activity_id:
        where_clauses.append('ss.study_activity_id = ?')
        params.append(activity_id)
    
    if where_clauses:
        query += ' WHERE ' + ' AND '.join(where_clauses)
    
    query += ' GROUP BY ss.id'
    
    # Add sorting
    sort_by = request.args.get('sort_by', 'start_time')
    sort_order = request.args.get('sort_order', 'desc')
    
    sort_column = {
        'start_time': 'ss.created_at',
        'review_items_count': 'review_items_count',
        'success_rate': 'success_rate'
    }.get(sort_by, 'ss.created_at')
    
    query += f' ORDER BY {sort_column} {sort_order.upper()}'
    
    # Add pagination
    query += ' LIMIT ? OFFSET ?'
    params.extend([per_page, offset])
    
    cursor.execute(query, params)
    sessions = cursor.fetchall()
    total_pages = (total_items + per_page - 1) // per_page
    
    return jsonify({
        'items': [{
            'id': session['id'],
            'activity_name': session['activity_name'],
            'group_name': session['group_name'],
            'start_time': session['start_time'].isoformat(),
            'end_time': session['end_time'].isoformat(),
            'review_items_count': session['review_items_count'],
            'success_rate': session['success_rate'] or 0
        } for session in sessions],
        'pagination': {
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'items_per_page': per_page
        }
    })

@bp.route('/<int:id>', methods=['GET'])
def get_session(id):
    cursor = db.cursor()
    
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
        WHERE ss.id = ?
        GROUP BY ss.id
    ''', (id,))
    
    session = cursor.fetchone()
    
    if not session:
        return jsonify({'error': 'Study session not found'}), 404
    
    return jsonify({
        'id': session['id'],
        'activity_name': session['activity_name'],
        'group_name': session['group_name'],
        'start_time': session['start_time'].isoformat(),
        'end_time': session['end_time'].isoformat(),
        'review_items_count': session['review_items_count']
    })

@bp.route('/<int:id>/words', methods=['GET'])
def get_session_words(id):
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('''
        SELECT COUNT(*) as count
        FROM word_review_items wri
        WHERE wri.study_session_id = ?
    ''', (id,))
    total_items = cursor.fetchone()['count']
    
    # Get paginated results
    cursor.execute('''
        SELECT 
            w.english,
            w.spanish,
            SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN NOT wri.correct THEN 1 ELSE 0 END) as wrong_count
        FROM words w
        JOIN word_review_items wri ON wri.word_id = w.id
        WHERE wri.study_session_id = ?
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

@bp.route('/<int:id>/words/<int:word_id>/review', methods=['POST'])
def review_word(id, word_id):
    data = request.get_json()
    
    if not data or 'correct' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO word_review_items (word_id, study_session_id, correct)
        VALUES (?, ?, ?)
    ''', (word_id, id, data['correct']))
    
    db.commit()
    
    return jsonify({
        'success': True,
        'word_id': word_id,
        'study_session_id': id,
        'correct': data['correct'],
        'created_at': cursor.execute('SELECT datetime()').fetchone()[0]
    }) 