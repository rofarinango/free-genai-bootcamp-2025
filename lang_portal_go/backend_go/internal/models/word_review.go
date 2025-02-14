package models

import "time"

type WordReview struct {
	ID         int       `json:"id"`
	Japanese   string    `json:"japanese,omitempty"`
	Romaji     string    `json:"romaji,omitempty"`
	English    string    `json:"english,omitempty"`
	Correct    bool      `json:"correct"`
	ReviewedAt time.Time `json:"reviewed_at"`
} 