package models

import "time"

type StudySession struct {
	ID              int       `json:"id"`
	GroupID         int       `json:"group_id"`
	GroupName       string    `json:"group_name,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	StudyActivityID int       `json:"study_activity_id"`
	ActivityName    string    `json:"activity_name,omitempty"`
}

type StudyActivity struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	ThumbnailURL string `json:"thumbnail_url"`
	Description  string `json:"description"`
} 