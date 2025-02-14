package services

import (
	"github.com/yourusername/lang_portal_go/backend_go/internal/models"
)

type StudyActivityService struct {
	db *DBService
}

func NewStudyActivityService(db *DBService) *StudyActivityService {
	return &StudyActivityService{db: db}
}

func (s *StudyActivityService) GetStudyActivities() ([]models.StudyActivity, error) {
	query := `
		SELECT id, name, thumbnail_url, description
		FROM study_activities
	`

	rows, err := s.db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []models.StudyActivity
	for rows.Next() {
		var a models.StudyActivity
		err := rows.Scan(&a.ID, &a.Name, &a.ThumbnailURL, &a.Description)
		if err != nil {
			return nil, err
		}
		activities = append(activities, a)
	}

	return activities, nil
}

func (s *StudyActivityService) GetStudyActivity(id int) (*models.StudyActivity, error) {
	query := `
		SELECT id, name, thumbnail_url, description
		FROM study_activities
		WHERE id = ?
	`

	var activity models.StudyActivity
	err := s.db.DB.QueryRow(query, id).Scan(
		&activity.ID, &activity.Name, &activity.ThumbnailURL, &activity.Description,
	)
	if err != nil {
		return nil, err
	}

	return &activity, nil
} 