package middleware

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	Code    int    `json:"-"`
	Message string `json:"message"`
}

// Add Error method to implement the error interface
func (e AppError) Error() string {
	return e.Message
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			
			switch err.Err {
			case sql.ErrNoRows:
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Resource not found",
				})
			default:
				if appErr, ok := err.Err.(AppError); ok {
					c.JSON(appErr.Code, gin.H{
						"error": appErr.Message,
					})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": err.Error(),
					})
				}
			}
		}
	}
} 