package Updater

import (
	"github.com/Masterminds/semver"
	"github.com/octoper/go-ray"
	"time"
)

type UpdateInfo struct {
	Version     *semver.Version `json:"version"`
	Url         string          `json:"url"`
	Body        string          `json:"body"`
	PublishedAt time.Time       `json:"publishedAt"`
}

func pls() {
	ray.Ray("")
}
