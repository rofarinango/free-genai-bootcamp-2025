package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type SeederService struct {
	db *DBService
}

type WordSeed struct {
	Japanese string          `json:"kanji"`
	Romaji   string          `json:"romaji"`
	English  string          `json:"english"`
	Parts    json.RawMessage `json:"parts"`
}

func NewSeederService(db *DBService) *SeederService {
	return &SeederService{db: db}
}

func (s *SeederService) SeedWords(filePath string, groupName string) error {
	// Read and parse the seed file
	file, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("error reading seed file: %v", err)
	}

	var words []WordSeed
	if err := json.Unmarshal(file, &words); err != nil {
		return fmt.Errorf("error parsing seed file: %v", err)
	}

	// Begin transaction
	tx, err := s.db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Create or get group
	var groupID int
	err = tx.QueryRow(
		"INSERT INTO groups (name) VALUES (?) ON CONFLICT (name) DO UPDATE SET name = name RETURNING id",
		groupName,
	).Scan(&groupID)
	if err != nil {
		return err
	}

	// Insert words and create word-group associations
	stmt, err := tx.Prepare(`
		INSERT INTO words (japanese, romaji, english, parts)
		VALUES (?, ?, ?, ?)
		RETURNING id
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, word := range words {
		var wordID int
		err := stmt.QueryRow(
			word.Japanese,
			word.Romaji,
			word.English,
			word.Parts,
		).Scan(&wordID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(
			"INSERT INTO word_groups (word_id, group_id) VALUES (?, ?)",
			wordID, groupID,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (s *SeederService) SeedFromDirectory(dirPath string) error {
	files, err := filepath.Glob(filepath.Join(dirPath, "*.json"))
	if err != nil {
		return err
	}

	for _, file := range files {
		groupName := filepath.Base(file[:len(file)-5]) // Remove .json extension
		if err := s.SeedWords(file, groupName); err != nil {
			return fmt.Errorf("error seeding %s: %v", file, err)
		}
	}

	// Check for SQL files and execute them
	sqlFiles, err := filepath.Glob(filepath.Join(dirPath, "*.sql"))
	if err != nil {
		return err
	}

	for _, sqlFile := range sqlFiles {
		content, err := os.ReadFile(sqlFile)
		if err != nil {
			return fmt.Errorf("error reading SQL seed file %s: %v", sqlFile, err)
		}

		_, err = s.db.DB.Exec(string(content))
		if err != nil {
			return fmt.Errorf("error executing SQL seed file %s: %v", sqlFile, err)
		}
	}

	return nil
}