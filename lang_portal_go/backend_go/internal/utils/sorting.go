package utils

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

type SortOrder string

const (
	ASC  SortOrder = "asc"
	DESC SortOrder = "desc"
)

type SortField struct {
	Field string
	Order SortOrder
}

func GetSortFromRequest(c *gin.Context, defaultField string, allowedFields map[string]bool) SortField {
	field := c.DefaultQuery("sort", defaultField)
	order := c.DefaultQuery("order", string(ASC))

	if !allowedFields[field] {
		field = defaultField
	}

	if order != string(ASC) && order != string(DESC) {
		order = string(ASC)
	}

	return SortField{
		Field: field,
		Order: SortOrder(order),
	}
}

func (s SortField) ToSQL() string {
	return fmt.Sprintf("%s %s", s.Field, s.Order)
} 