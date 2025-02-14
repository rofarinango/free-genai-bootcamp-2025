package models

import (
	"encoding/json"
)

type Word struct {
	ID       int             `json:"id"`
	Japanese string          `json:"japanese"`
	Romaji   string          `json:"romaji"`
	English  string          `json:"english"`
	Parts    json.RawMessage `json:"parts"`
}

type WordWithStats struct {
	Word
	CorrectCount int          `json:"correct_count"`
	WrongCount   int          `json:"wrong_count"`
	Groups       []Group      `json:"groups,omitempty"`
} 