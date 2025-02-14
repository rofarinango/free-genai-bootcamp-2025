//go:build mage
package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/mattn/go-sqlite3"
	"github.com/yourusername/lang_portal_go/backend_go/internal/services"
)

var dbPath string

func init() {
	// Set the database path in the backend_go directory
	dbPath = "./words.db"
	// Print the path for debugging
	fmt.Printf("Database path: %s\n", dbPath)
}

// InitDB initializes the SQLite database
func InitDB() error {
	fmt.Printf("Initializing database at: %s\n", dbPath)
	
	if _, err := os.Stat(dbPath); err == nil {
		fmt.Printf("Database already exists at: %s\n", dbPath)
		return nil
	}

	file, err := os.Create(dbPath)
	if err != nil {
		return fmt.Errorf("error creating database file: %v", err)
	}
	file.Close()

	fmt.Printf("Database initialized successfully at: %s\n", dbPath)
	return nil
}

// Migrate runs all migration files
func Migrate() error {
	fmt.Println("Running migrations...")

	// Get the absolute path to the magefiles directory
	dir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("error getting current directory: %v", err)
	}

	// Set the migration path
	migrationPath := filepath.Join(filepath.Dir(dir), "../lang_portal_go/backend_go/db/migrations/*.sql")
	fmt.Printf("Looking for migrations in: %s\n", migrationPath)

	files, err := filepath.Glob(migrationPath)
	if err != nil {
		return fmt.Errorf("error finding migration files: %v", err)
	}

	// Add debug output for found files
	fmt.Printf("Found migration files: %v\n", files)

	if len(files) == 0 {
		return fmt.Errorf("no migration files found in %s", migrationPath)
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}
	defer db.Close()

	sort.Strings(files)

	for _, file := range files {
		fmt.Printf("Running migration: %s\n", filepath.Base(file))
		
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("error reading migration file %s: %v", file, err)
		}

		queries := strings.Split(string(content), ";")
		
		for _, query := range queries {
			query = strings.TrimSpace(query)
			if query == "" {
				continue
			}

			_, err = db.Exec(query)
			if err != nil {
				return fmt.Errorf("error executing migration query from %s: %v", file, err)
			}
		}
	}

	fmt.Println("Migrations completed successfully")
	return nil
}

// Seed imports seed data into the database
func Seed() error {
	fmt.Println("Seeding database...")

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("error opening database: %v", err)
	}
	defer db.Close()

	dbService := &services.DBService{
		DB: db,
	}

	seeder := services.NewSeederService(dbService)
	if err := seeder.SeedFromDirectory("../db/seeds"); err != nil {
		return fmt.Errorf("error seeding database: %v", err)
	}

	fmt.Println("Database seeded successfully")
	return nil
} 