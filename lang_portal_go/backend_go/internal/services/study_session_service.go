package services

import (
	"time"
	"github.com/yourusername/lang_portal_go/backend_go/internal/models"
)

type StudySessionService struct {
	db *DBService
}

func NewStudySessionService(db *DBService) *StudySessionService {
	return &StudySessionService{db: db}
}

func (s *StudySessionService) GetLastStudySession() (*models.StudySession, error) {
	query := `
		SELECT 
			ss.id, ss.group_id, g.name as group_name, 
			ss.created_at, ss.study_activity_id,
			sa.name as activity_name
		FROM study_sessions ss
		JOIN groups g ON ss.group_id = g.id
		JOIN study_activities sa ON ss.study_activity_id = sa.id
		ORDER BY ss.created_at DESC
		LIMIT 1
	`

	var session models.StudySession
	err := s.db.DB.QueryRow(query).Scan(
		&session.ID, &session.GroupID, &session.GroupName,
		&session.CreatedAt, &session.StudyActivityID, &session.ActivityName,
	)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

func (s *StudySessionService) GetStudyProgress() (map[string]int, error) {
	query := `
		SELECT 
			COUNT(DISTINCT word_id) as total_words_studied,
			(SELECT COUNT(*) FROM words) as total_available_words
		FROM word_review_items
	`

	var studied, total int
	err := s.db.DB.QueryRow(query).Scan(&studied, &total)
	if err != nil {
		return nil, err
	}

	return map[string]int{
		"total_words_studied":    studied,
		"total_available_words": total,
	}, nil
}

func (s *StudySessionService) GetQuickStats() (map[string]int, error) {
	query := `
		WITH stats AS (
			SELECT 
				CAST(SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as success_rate,
				COUNT(DISTINCT study_session_id) as total_sessions,
				COUNT(DISTINCT DATE(created_at)) as streak_days
			FROM word_review_items
			WHERE created_at >= datetime('now', '-30 days')
		),
		active_groups AS (
			SELECT COUNT(DISTINCT group_id) as active_groups
			FROM study_sessions
			WHERE created_at >= datetime('now', '-30 days')
		)
		SELECT 
			ROUND(success_rate), 
			total_sessions,
			active_groups,
			streak_days
		FROM stats, active_groups
	`

	var successRate, totalSessions, activeGroups, streakDays int
	err := s.db.DB.QueryRow(query).Scan(&successRate, &totalSessions, &activeGroups, &streakDays)
	if err != nil {
		return nil, err
	}

	return map[string]int{
		"success_rate":        successRate,
		"total_study_sessions": totalSessions,
		"total_active_groups":  activeGroups,
		"study_streak_days":    streakDays,
	}, nil
}

func (s *StudySessionService) CreateStudySession(groupID, activityID int) (*models.StudySession, error) {
	query := `
		INSERT INTO study_sessions (group_id, study_activity_id, created_at)
		VALUES (?, ?, ?)
		RETURNING id
	`

	var sessionID int
	err := s.db.DB.QueryRow(query, groupID, activityID, time.Now()).Scan(&sessionID)
	if err != nil {
		return nil, err
	}

	return &models.StudySession{
		ID:              sessionID,
		GroupID:         groupID,
		StudyActivityID: activityID,
		CreatedAt:       time.Now(),
	}, nil
}

func (s *StudySessionService) GetSessionWords(sessionID int) ([]models.WordReview, error) {
	query := `
		SELECT 
			w.id, w.japanese, w.romaji, w.english,
			wri.correct, wri.created_at
		FROM word_review_items wri
		JOIN words w ON wri.word_id = w.id
		WHERE wri.study_session_id = ?
		ORDER BY wri.created_at DESC
	`

	rows, err := s.db.DB.Query(query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var words []models.WordReview
	for rows.Next() {
		var w models.WordReview
		err := rows.Scan(
			&w.ID, &w.Japanese, &w.Romaji, &w.English,
			&w.Correct, &w.ReviewedAt,
		)
		if err != nil {
			return nil, err
		}
		words = append(words, w)
	}

	return words, nil
}

func (s *StudySessionService) ReviewWord(sessionID, wordID int, correct bool) (*models.WordReview, error) {
	query := `
		INSERT INTO word_review_items (word_id, study_session_id, correct, created_at)
		VALUES (?, ?, ?, ?)
		RETURNING id
	`

	now := time.Now()
	var reviewID int
	err := s.db.DB.QueryRow(query, wordID, sessionID, correct, now).Scan(&reviewID)
	if err != nil {
		return nil, err
	}

	return &models.WordReview{
		ID:         wordID,
		Correct:    correct,
		ReviewedAt: now,
	}, nil
}

func (s *StudySessionService) ResetHistory() error {
	queries := []string{
		"DELETE FROM word_review_items",
		"DELETE FROM study_sessions",
	}

	for _, query := range queries {
		_, err := s.db.DB.Exec(query)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *StudySessionService) FullReset() error {
	queries := []string{
		"DELETE FROM word_review_items",
		"DELETE FROM study_sessions",
		"DELETE FROM word_groups",
		"DELETE FROM words",
		"DELETE FROM groups",
		"DELETE FROM study_activities",
	}

	for _, query := range queries {
		_, err := s.db.DB.Exec(query)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *StudySessionService) GetStudySessions(page, perPage int) ([]models.StudySession, int, error) {
	offset := (page - 1) * perPage

	// Get total count
	var total int
	err := s.db.DB.QueryRow("SELECT COUNT(*) FROM study_sessions").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT 
			ss.id, ss.group_id, g.name as group_name,
			ss.created_at, ss.study_activity_id,
			sa.name as activity_name,
			COUNT(wri.id) as review_items_count
		FROM study_sessions ss
		JOIN groups g ON ss.group_id = g.id
		JOIN study_activities sa ON ss.study_activity_id = sa.id
		LEFT JOIN word_review_items wri ON ss.id = wri.study_session_id
		GROUP BY ss.id
		ORDER BY ss.created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := s.db.DB.Query(query, perPage, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var sessions []models.StudySession
	for rows.Next() {
		var s models.StudySession
		var reviewCount int
		err := rows.Scan(
			&s.ID, &s.GroupID, &s.GroupName,
			&s.CreatedAt, &s.StudyActivityID, &s.ActivityName,
			&reviewCount,
		)
		if err != nil {
			return nil, 0, err
		}
		sessions = append(sessions, s)
	}

	return sessions, total, nil
} 