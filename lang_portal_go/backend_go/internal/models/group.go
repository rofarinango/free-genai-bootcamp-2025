package models

type Group struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	WordCount int    `json:"word_count,omitempty"`
}

type GroupWithStats struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	WordCount   int     `json:"word_count"`
	SessionCount int    `json:"session_count"`
	SuccessRate float64 `json:"success_rate"`
} 