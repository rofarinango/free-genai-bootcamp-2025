package services

import (
	"fmt"
	"github.com/yourusername/lang_portal_go/backend_go/internal/models"
	"github.com/yourusername/lang_portal_go/backend_go/internal/utils"
)

type WordService struct {
	db *DBService
}

func NewWordService(db *DBService) *WordService {
	return &WordService{db: db}
}

var allowedWordSortFields = map[string]bool{
	"japanese": true,
	"romaji":   true,
	"english":  true,
}

func (s *WordService) GetWords(page, perPage int, sort utils.SortField) ([]models.WordWithStats, int, error) {
	offset := (page - 1) * perPage

	// Get total count
	var total int
	err := s.db.DB.QueryRow("SELECT COUNT(*) FROM words").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get words with stats
	query := fmt.Sprintf(`
		SELECT 
			w.id, w.japanese, w.romaji, w.english, w.parts,
			COUNT(CASE WHEN wri.correct = 1 THEN 1 END) as correct_count,
			COUNT(CASE WHEN wri.correct = 0 THEN 1 END) as wrong_count
		FROM words w
		LEFT JOIN word_review_items wri ON w.id = wri.word_id
		GROUP BY w.id
		ORDER BY w.%s
		LIMIT ? OFFSET ?
	`, sort.ToSQL())

	rows, err := s.db.DB.Query(query, perPage, offset)
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

func (s *WordService) GetWord(id int) (*models.WordWithStats, error) {
	query := `
		SELECT 
			w.id, w.japanese, w.romaji, w.english, w.parts,
			COUNT(CASE WHEN wri.correct = 1 THEN 1 END) as correct_count,
			COUNT(CASE WHEN wri.correct = 0 THEN 1 END) as wrong_count
		FROM words w
		LEFT JOIN word_review_items wri ON w.id = wri.word_id
		WHERE w.id = ?
		GROUP BY w.id
	`

	var word models.WordWithStats
	err := s.db.DB.QueryRow(query, id).Scan(
		&word.ID, &word.Japanese, &word.Romaji, &word.English, &word.Parts,
		&word.CorrectCount, &word.WrongCount,
	)
	if err != nil {
		return nil, err
	}

	// Get groups for this word
	groupsQuery := `
		SELECT g.id, g.name
		FROM groups g
		JOIN word_groups wg ON g.id = wg.group_id
		WHERE wg.word_id = ?
	`

	rows, err := s.db.DB.Query(groupsQuery, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var g models.Group
		if err := rows.Scan(&g.ID, &g.Name); err != nil {
			return nil, err
		}
		groups = append(groups, g)
	}

	word.Groups = groups
	return &word, nil
}

func (s *WordService) SearchWords(query string, page, perPage int) ([]models.WordWithStats, int, error) {
	offset := (page - 1) * perPage

	// Get total count with search
	countQuery := `
		SELECT COUNT(*) FROM words
		WHERE japanese LIKE ? OR romaji LIKE ? OR english LIKE ?
	`
	searchPattern := "%" + query + "%"
	
	var total int
	err := s.db.DB.QueryRow(countQuery, searchPattern, searchPattern, searchPattern).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get words with stats and search
	query = `
		SELECT 
			w.id, w.japanese, w.romaji, w.english, w.parts,
			COUNT(CASE WHEN wri.correct = 1 THEN 1 END) as correct_count,
			COUNT(CASE WHEN wri.correct = 0 THEN 1 END) as wrong_count
		FROM words w
		LEFT JOIN word_review_items wri ON w.id = wri.word_id
		WHERE w.japanese LIKE ? OR w.romaji LIKE ? OR w.english LIKE ?
		GROUP BY w.id
		LIMIT ? OFFSET ?
	`

	rows, err := s.db.DB.Query(query, searchPattern, searchPattern, searchPattern, perPage, offset)
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