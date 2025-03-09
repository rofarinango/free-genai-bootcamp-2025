from flask import Blueprint, jsonify
from lib.db import db

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/last_study_session', methods=['GET'])
def last_study_session():
    cursor = db.cursor()
    cursor.execute('''
        SELECT 
            ss.id,
            ss.group_id,
            ss.created_at,
            ss.study_activity_id,
            g.name as group_name
        FROM study_sessions ss
        JOIN groups g ON g.id = ss.group_id
        ORDER BY ss.created_at DESC
        LIMIT 1
    ''')
    session = cursor.fetchone()
    
    if not session:
        return jsonify(None)
    
    return jsonify({
        'id': session['id'],
        'group_id': session['group_id'],
        'created_at': session['created_at'].isoformat(),
        'study_activity_id': session['study_activity_id'],
        'group_name': session['group_name']
    })

@bp.route('/study_progress', methods=['GET'])
def study_progress():
    cursor = db.cursor()
    
    # Get total available words
    cursor.execute('SELECT COUNT(*) as count FROM words')
    total_words = cursor.fetchone()['count']
    
    # Get total studied words (unique words that have been reviewed)
    cursor.execute('''
        SELECT COUNT(DISTINCT word_id) as count 
        FROM word_review_items
    ''')
    studied_words = cursor.fetchone()['count']
    
    return jsonify({
        'total_words_studied': studied_words,
        'total_available_words': total_words
    })

@bp.route('/quick-stats', methods=['GET'])
def quick_stats():
    cursor = db.cursor()
    
    # Calculate success rate
    cursor.execute('''
        SELECT 
            ROUND(AVG(CASE WHEN correct THEN 100.0 ELSE 0.0 END), 1) as success_rate
        FROM word_review_items
    ''')
    success_rate = cursor.fetchone()['success_rate'] or 0.0
    
    # Get total study sessions
    cursor.execute('SELECT COUNT(*) as count FROM study_sessions')
    total_sessions = cursor.fetchone()['count']
    
    # Get total active groups (groups with at least one study session)
    cursor.execute('''
        SELECT COUNT(DISTINCT group_id) as count 
        FROM study_sessions
    ''')
    active_groups = cursor.fetchone()['count']
    
    # Calculate study streak (consecutive days with study sessions)
    cursor.execute('''
        WITH RECURSIVE dates AS (
            SELECT date(created_at) as study_date
            FROM study_sessions
            GROUP BY date(created_at)
            ORDER BY study_date DESC
        ),
        streak AS (
            SELECT study_date, 1 as streak, study_date as last_date
            FROM dates
            WHERE study_date = date('now')
            UNION ALL
            SELECT d.study_date, s.streak + 1, s.last_date
            FROM dates d
            JOIN streak s ON date(d.study_date, '+1 day') = date(s.study_date)
        )
        SELECT MAX(streak) as streak_days FROM streak
    ''')
    streak_result = cursor.fetchone()
    study_streak = streak_result['streak_days'] if streak_result else 0
    
    return jsonify({
        'success_rate': success_rate,
        'total_study_sessions': total_sessions,
        'total_active_groups': active_groups,
        'study_streak_days': study_streak
    }) 