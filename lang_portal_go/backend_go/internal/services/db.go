package services

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

type DBService struct {
	DB *sql.DB
}

func NewDBService(dbPath string) (*DBService, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &DBService{DB: db}, nil
}

func (s *DBService) Close() error {
	return s.DB.Close()
} 