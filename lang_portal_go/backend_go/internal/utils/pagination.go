package utils

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	CurrentPage  int `json:"current_page"`
	TotalPages   int `json:"total_pages"`
	TotalItems   int `json:"total_items"`
	ItemsPerPage int `json:"items_per_page"`
}

func GetPaginationFromRequest(c *gin.Context, defaultPerPage int) (page int, perPage int) {
	pageStr := c.DefaultQuery("page", "1")
	perPageStr := c.DefaultQuery("per_page", strconv.Itoa(defaultPerPage))

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	perPage, err = strconv.Atoi(perPageStr)
	if err != nil || perPage < 1 {
		perPage = defaultPerPage
	}

	return page, perPage
}

func NewPagination(currentPage, totalItems, itemsPerPage int) Pagination {
	totalPages := (totalItems + itemsPerPage - 1) / itemsPerPage
	if totalPages < 1 {
		totalPages = 1
	}

	return Pagination{
		CurrentPage:  currentPage,
		TotalPages:   totalPages,
		TotalItems:   totalItems,
		ItemsPerPage: itemsPerPage,
	}
} 