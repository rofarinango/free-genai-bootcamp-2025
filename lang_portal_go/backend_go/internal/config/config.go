package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port           int
	DBPath         string
	AllowedOrigins []string
}

func GetConfig() Config {
	port, err := strconv.Atoi(getEnv("PORT", "8080"))
	if err != nil {
		port = 8080
	}

	return Config{
		Port:   port,
		DBPath: getEnv("DB_PATH", "words.db"),
		AllowedOrigins: []string{
			getEnv("ALLOWED_ORIGIN", "*"),
		},
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
} 