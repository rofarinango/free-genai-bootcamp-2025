import sqlite3
import json
from flask import g
from datetime import datetime

class Db:
    def __init__(self, database='words.db'):
        self.database = database
        self.connection = None

    def get(self):
        if 'db' not in g:
            g.db = sqlite3.connect(
                self.database,
                detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
            )
            g.db.row_factory = sqlite3.Row
        return g.db

    def commit(self):
        self.get().commit()

    def cursor(self):
        return self.get().cursor()

    def close(self):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    def sql(self, filepath):
        with open('sql/' + filepath, 'r') as file:
            return file.read()

    def load_json(self, filepath):
        with open(filepath, 'r') as file:
            return json.load(file)

    def setup_tables(self, cursor):
        # Create tables in the correct order (considering foreign key constraints)
        cursor.execute(self.sql('setup/create_table_words.sql'))
        cursor.execute(self.sql('setup/create_table_groups.sql'))
        cursor.execute(self.sql('setup/create_table_word_groups.sql'))
        cursor.execute(self.sql('setup/create_table_study_activities.sql'))
        cursor.execute(self.sql('setup/create_table_study_sessions.sql'))
        cursor.execute(self.sql('setup/create_table_word_review_items.sql'))
        self.commit()

    def import_study_activities_json(self, cursor, data_json_path):
        activities = self.load_json(data_json_path)
        for activity in activities:
            cursor.execute('''
            INSERT INTO study_activities (name, description, thumbnail_url)
            VALUES (?, ?, ?)
            ''', (activity['name'], activity['description'], activity['thumbnail_url']))
        self.commit()

    def import_word_json(self, cursor, group_name, data_json_path):
        # Insert group
        cursor.execute('INSERT INTO groups (name) VALUES (?)', (group_name,))
        self.commit()

        # Get group ID
        cursor.execute('SELECT id FROM groups WHERE name = ?', (group_name,))
        group_id = cursor.fetchone()[0]

        # Import words
        words = self.load_json(data_json_path)
        for word in words:
            cursor.execute('''
                INSERT INTO words (english, spanish, parts)
                VALUES (?, ?, ?)
            ''', (word['english'], word['spanish'], json.dumps(word.get('parts', {}))))
            
            word_id = cursor.lastrowid
            cursor.execute('''
                INSERT INTO word_groups (word_id, group_id)
                VALUES (?, ?)
            ''', (word_id, group_id))
        self.commit()

    def init(self, app):
        with app.app_context():
            cursor = self.cursor()
            self.setup_tables(cursor)
            
            # Import seed data
            self.import_word_json(
                cursor=cursor,
                group_name='Basic Vocabulary',
                data_json_path='seed/data_adjectives.json'
            )
            self.import_word_json(
                cursor=cursor,
                group_name='Common Verbs',
                data_json_path='seed/data_verbs.json'
            )
            self.import_study_activities_json(
                cursor=cursor,
                data_json_path='seed/study_activities.json'
            )

# Create a single instance
db = Db() 