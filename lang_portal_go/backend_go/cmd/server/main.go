package main

import (
	"fmt"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/lang_portal_go/backend_go/internal/services"
	"github.com/yourusername/lang_portal_go/backend_go/internal/middleware"
	"github.com/yourusername/lang_portal_go/backend_go/internal/utils"
	"github.com/yourusername/lang_portal_go/backend_go/internal/validation"
	"github.com/yourusername/lang_portal_go/backend_go/internal/config"
)

// Add these structs for request validation
type CreateStudySessionRequest struct {
	GroupID         int `json:"group_id" validate:"required,min=1"`
	StudyActivityID int `json:"study_activity_id" validate:"required,min=1"`
}

type WordReviewRequest struct {
	Correct bool `json:"correct" validate:"required"`
}

var allowedWordSortFields = map[string]bool{
	"japanese": true,
	"romaji":   true,
	"english":  true,
}

func main() {
	config := config.GetConfig()

	// Initialize database service
	dbService, err := services.NewDBService(config.DBPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer dbService.Close()

	// Initialize services
	wordService := services.NewWordService(dbService)
	groupService := services.NewGroupService(dbService)
	studySessionService := services.NewStudySessionService(dbService)
	studyActivityService := services.NewStudyActivityService(dbService)

	r := gin.Default()

	// Add middlewares
	r.Use(middleware.ErrorHandler())
	r.Use(middleware.Logger())

	// Add CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// API routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status": "ok",
			})
		})

		// Words endpoints
		api.GET("/words", func(c *gin.Context) {
			page, perPage := utils.GetPaginationFromRequest(c, 100)
			sort := utils.GetSortFromRequest(c, "japanese", allowedWordSortFields)
			
			words, total, err := wordService.GetWords(page, perPage, sort)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, gin.H{
				"items":      words,
				"pagination": utils.NewPagination(page, total, perPage),
			})
		})

		// Groups endpoints
		api.GET("/groups", func(c *gin.Context) {
			page, perPage := utils.GetPaginationFromRequest(c, 20)
			groups, total, err := groupService.GetGroups(page, perPage)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, gin.H{
				"items":      groups,
				"pagination": utils.NewPagination(page, total, perPage),
			})
		})

		// Dashboard endpoints
		api.GET("/dashboard/last_study_session", func(c *gin.Context) {
			session, err := studySessionService.GetLastStudySession()
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, session)
		})

		api.GET("/dashboard/study_progress", func(c *gin.Context) {
			progress, err := studySessionService.GetStudyProgress()
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, progress)
		})

		api.GET("/dashboard/quick_stats", func(c *gin.Context) {
			stats, err := studySessionService.GetQuickStats()
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, stats)
		})

		// Study activities endpoints
		api.GET("/study_activities", func(c *gin.Context) {
			activities, err := studyActivityService.GetStudyActivities()
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, gin.H{"items": activities})
		})

		api.GET("/study_activities/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(400, gin.H{"error": "invalid activity id"})
				return
			}

			activity, err := studyActivityService.GetStudyActivity(id)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			c.JSON(200, activity)
		})

		// Create study session endpoint
		api.POST("/study_activities", func(c *gin.Context) {
			var req CreateStudySessionRequest
			if !validation.BindAndValidate(c, &req) {
				return
			}

			session, err := studySessionService.CreateStudySession(req.GroupID, req.StudyActivityID)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, session)
		})

		// Study session words endpoints
		api.GET("/study_sessions", func(c *gin.Context) {
			page, perPage := utils.GetPaginationFromRequest(c, 20)
			sessions, total, err := studySessionService.GetStudySessions(page, perPage)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, gin.H{
				"items":      sessions,
				"pagination": utils.NewPagination(page, total, perPage),
			})
		})

		// Word review endpoint
		api.POST("/study_sessions/:id/words/:word_id/review", func(c *gin.Context) {
			sessionID, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(400, gin.H{"error": "invalid session id"})
				return
			}

			wordID, err := strconv.Atoi(c.Param("word_id"))
			if err != nil {
				c.JSON(400, gin.H{"error": "invalid word id"})
				return
			}

			var req WordReviewRequest
			if !validation.BindAndValidate(c, &req) {
				return
			}

			review, err := studySessionService.ReviewWord(sessionID, wordID, req.Correct)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, review)
		})

		// Reset endpoints
		api.POST("/reset_history", func(c *gin.Context) {
			if err := studySessionService.ResetHistory(); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{
				"success": true,
				"message": "Study history has been reset successfully",
			})
		})

		api.POST("/full_reset", func(c *gin.Context) {
			if err := studySessionService.FullReset(); err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			c.JSON(200, gin.H{
				"success": true,
				"message": "System has been fully reset",
			})
		})

		// Individual word endpoint
		api.GET("/words/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(400, gin.H{"error": "invalid word id"})
				return
			}

			word, err := wordService.GetWord(id)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, word)
		})

		// Individual group endpoint
		api.GET("/groups/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(400, gin.H{"error": "invalid group id"})
				return
			}

			group, err := groupService.GetGroup(id)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, group)
		})

		// Group words endpoint
		api.GET("/groups/:id/words", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err != nil {
				c.JSON(400, gin.H{"error": "invalid group id"})
				return
			}

			page, perPage := utils.GetPaginationFromRequest(c, 100)
			words, total, err := groupService.GetGroupWords(id, page, perPage)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, gin.H{
				"items":      words,
				"pagination": utils.NewPagination(page, total, perPage),
			})
		})

		// Add search endpoint for words
		api.GET("/words/search", func(c *gin.Context) {
			query := c.Query("q")
			if query == "" {
				c.JSON(400, gin.H{"error": "Search query is required"})
				return
			}

			page, perPage := utils.GetPaginationFromRequest(c, 100)
			words, total, err := wordService.SearchWords(query, page, perPage)
			if err != nil {
				c.Error(err)
				return
			}

			c.JSON(200, gin.H{
				"items":      words,
				"pagination": utils.NewPagination(page, total, perPage),
			})
		})
	}

	log.Fatal(r.Run(fmt.Sprintf(":%d", config.Port)))
} 