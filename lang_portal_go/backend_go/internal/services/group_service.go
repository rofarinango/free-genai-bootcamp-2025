package services

import (
	"github.com/yourusername/lang_portal_go/backend_go/internal/models"
)

type GroupService struct {
	db *DBService
}

func NewGroupService(db *DBService) *GroupService {
	return &GroupService{db: db}
}

func (s *GroupService) GetGroups(page, perPage int) ([]models.Group, int, error) {
	offset := (page - 1) * perPage

	// Get total count
	var total int
	err := s.db.DB.QueryRow("SELECT COUNT(*) FROM groups").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get groups with word count
	query := `
		SELECT 
			g.id, g.name,
			COUNT(wg.word_id) as word_count
		FROM groups g
		LEFT JOIN word_groups wg ON g.id = wg.group_id
		GROUP BY g.id
		LIMIT ? OFFSET ?
	`

	rows, err := s.db.DB.Query(query, perPage, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var g models.Group
		err := rows.Scan(&g.ID, &g.Name, &g.WordCount)
		if err != nil {
			return nil, 0, err
		}
		groups = append(groups, g)
	}

	return groups, total, nil
}

func (s *GroupService) GetGroup(id int) (*models.GroupWithStats, error) {
	query := `
		SELECT 
			g.id, g.name,
			COUNT(DISTINCT wg.word_id) as word_count,
			COUNT(DISTINCT ss.id) as session_count,
			AVG(CASE WHEN wri.correct = 1 THEN 100 ELSE 0 END) as success_rate
		FROM groups g
		LEFT JOIN word_groups wg ON g.id = wg.group_id
		LEFT JOIN study_sessions ss ON g.id = ss.group_id
		LEFT JOIN word_review_items wri ON ss.id = wri.study_session_id
		WHERE g.id = ?
		GROUP BY g.id
	`

	var group models.GroupWithStats
	err := s.db.DB.QueryRow(query, id).Scan(
		&group.ID, &group.Name, &group.WordCount,
		&group.SessionCount, &group.SuccessRate,
	)
	if err != nil {
		return nil, err
	}

	return &group, nil
}

func (s *GroupService) GetGroupWords(groupID, page, perPage int) ([]models.WordWithStats, int, error) {
	offset := (page - 1) * perPage

	// Get total count
	var total int
	err := s.db.DB.QueryRow(`
		SELECT COUNT(DISTINCT w.id)
		FROM words w
		JOIN word_groups wg ON w.id = wg.word_id
		WHERE wg.group_id = ?
	`, groupID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get words with stats
	query := `
		SELECT 
			w.id, w.japanese, w.romaji, w.english, w.parts,
			COUNT(CASE WHEN wri.correct = 1 THEN 1 END) as correct_count,
			COUNT(CASE WHEN wri.correct = 0 THEN 1 END) as wrong_count
		FROM words w
		JOIN word_groups wg ON w.id = wg.word_id
		LEFT JOIN word_review_items wri ON w.id = wri.word_id
		WHERE wg.group_id = ?
		GROUP BY w.id
		LIMIT ? OFFSET ?
	`

	rows, err := s.db.DB.Query(query, groupID, perPage, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var words []models.WordWithStats
	for rows.Next() {
		var w models.WordWithStats
		err := rows.Scan(
			&w.ID, &w.Japanese, &w.Romaji, &w.English, &w.Parts,
			&w.CorrectCount, &w.WrongCount,
		)
		if err != nil {
			return nil, 0, err
		}
		words = append(words, w)
	}

	return words, total, nil
} 