package validation

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func ValidateStruct(obj interface{}) []ValidationError {
	var errors []ValidationError
	err := validate.Struct(obj)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, ValidationError{
				Field:   err.Field(),
				Message: getErrorMsg(err),
			})
		}
	}
	return errors
}

func getErrorMsg(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "min":
		return fmt.Sprintf("Value must be greater than %s", err.Param())
	case "max":
		return fmt.Sprintf("Value must be less than %s", err.Param())
	default:
		return "Invalid value"
	}
}

func BindAndValidate(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		c.JSON(400, gin.H{"errors": []string{"Invalid request body"}})
		return false
	}

	if errors := ValidateStruct(obj); len(errors) > 0 {
		c.JSON(400, gin.H{"errors": errors})
		return false
	}

	return true
} 