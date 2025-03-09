from flask import Blueprint, jsonify, request
from lib.db import db

bp = Blueprint('words', __name__, url_prefix='/api/words')

@bp.route('', methods=['GET'])
def list_words():
    page = request.args.get('page', 1, type=int)
    per_page = 100
    offset = (page - 1) * per_page
    
    cursor = db.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) as count FROM words')
    total_items = cursor.fetchone()['count']
    
    # Get paginated results with review stats
    cursor.execute('''
        SELECT 
            w.id,
            w.english,
            w.spanish,
            SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN NOT wri.correct THEN 1 ELSE 0 END) as wrong_count
        FROM words w
        LEFT JOIN word_review_items wri ON wri.word_id = w.id
        GROUP BY w.id
        ORDER BY w.english
        LIMIT ? OFFSET ?
    ''', (per_page, offset))
    
    words = cursor.fetchall()
    total_pages = (total_items + per_page - 1) // per_page
    
    return jsonify({
        'items': [{
            'id': word['id'],
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

@bp.route('/<int:id>', methods=['GET'])
def get_word(id):
    cursor = db.cursor()
    
    # Get word details with review stats
    cursor.execute('''
        SELECT 
            w.id,
            w.english,
            w.spanish,
            w.parts,
            SUM(CASE WHEN wri.correct THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN NOT wri.correct THEN 1 ELSE 0 END) as wrong_count
        FROM words w
        LEFT JOIN word_review_items wri ON wri.word_id = w.id
        WHERE w.id = ?
        GROUP BY w.id
    ''', (id,))
    
    word = cursor.fetchone()
    
    if not word:
        return jsonify({'error': 'Word not found'}), 404
    
    # Get groups this word belongs to
    cursor.execute('''
        SELECT g.id, g.name
        FROM groups g
        JOIN word_groups wg ON wg.group_id = g.id
        WHERE wg.word_id = ?
    ''', (id,))
    
    groups = cursor.fetchall()
    
    return jsonify({
        'id': word['id'],
        'english': word['english'],
        'spanish': word['spanish'],
        'stats': {
            'correct_count': word['correct_count'] or 0,
            'wrong_count': word['wrong_count'] or 0
        },
        'groups': [{
            'id': group['id'],
            'name': group['name']
        } for group in groups]
    }) 