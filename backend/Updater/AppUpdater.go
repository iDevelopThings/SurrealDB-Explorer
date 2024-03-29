package Updater

import (
	"context"
	"encoding/json"
	"github.com/Masterminds/semver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"io"
	"net/http"
	"os"
	"time"

	ss "github.com/blang/semver"

	"github.com/rhysd/go-github-selfupdate/selfupdate"
)

type AppUpdater struct {
	Ctx context.Context

	CurrentVersion *semver.Version
	LatestVersion  *UpdateInfo `json:"latest_version"`
}

func NewAppUpdater(ctx context.Context, currentVersion *semver.Version) *AppUpdater {
	return &AppUpdater{
		Ctx:            ctx,
		CurrentVersion: currentVersion,
	}
}

func (a *AppUpdater) RunUpdateChecker() {
	runtime.LogDebugf(a.Ctx, "Running update checker...")
	a.CheckForUpdate()

	go func() {
		ticker := time.NewTicker(1 * time.Hour)

		for {
			select {
			case <-a.Ctx.Done():
				ticker.Stop()
				return
			case <-ticker.C:
				a.CheckForUpdate()
			}
		}

	}()
}

func (a *AppUpdater) GetLatestVersion() bool {
	response, err := http.Get("https://api.github.com/repos/iDevelopThings/SurrealDB-Explorer/releases/latest")
	//response, err := http.Get("http://mock-api.test/github_api_response.json")
	defer response.Body.Close()

	if err != nil {
		runtime.LogErrorf(a.Ctx, "Failed to get latest version: %s", err.Error())
		return false
	}

	data, err := io.ReadAll(response.Body)
	if err != nil {
		runtime.LogErrorf(a.Ctx, "Failed to read response body: %s", err.Error())
		return false
	}

	// parse the JSON data
	var result *RepoApiResponse
	err = json.Unmarshal(data, &result)
	if err != nil {
		runtime.LogErrorf(a.Ctx, "Failed to parse JSON: %s", err.Error())
		return false
	}

	semverVersion, err := semver.NewVersion(result.TagName)
	if err != nil {
		runtime.LogErrorf(a.Ctx, "Failed to parse version(%s): %s", result.TagName, err.Error())
		return false
	}

	if semverVersion.Equal(a.CurrentVersion) {
		return false
	}

	a.LatestVersion = &UpdateInfo{
		Version:     semverVersion,
		Url:         result.HtmlUrl,
		Body:        result.Body,
		PublishedAt: result.PublishedAt,
	}

	return true
}

func (a *AppUpdater) CheckForUpdate() {
	runtime.LogDebugf(a.Ctx, "Checking for update...")

	if !a.GetLatestVersion() {
		return
	}

	if a.IsUpdateAvailable() {
		runtime.LogInfof(a.Ctx, "Update available: %s", a.LatestVersion.Version.String())

		runtime.EventsEmit(a.Ctx, "update_available", a.LatestVersion)
	} else {
		runtime.LogDebugf(a.Ctx, "No update available")
	}
}

func (a *AppUpdater) RunNew() {
	selfupdate.EnableLog()

	up, err := selfupdate.NewUpdater(selfupdate.Config{})
	if err != nil {
		panic(err)
	}

	cv := ss.MustParse("0.0.9")
	r, err := up.UpdateCommand(
		"/Users/sam/Code/Testing/SurrealDbExplorer/build/bin/SurrealDB Explorer.app/Contents/MacOS/SurrealDB Explorer",
		cv,
		"iDevelopThings/SurrealDB-Explorer",
	)

	if err != nil {
		runtime.LogInfof(a.Ctx, "Error occurred while updating binary: %s", err.Error())
		os.Exit(2)
	}
	runtime.LogInfof(a.Ctx, "Successfully updated to version %s", r.Version.String())
	rr, err := runtime.MessageDialog(a.Ctx, runtime.MessageDialogOptions{
		Title:   "Update",
		Message: "Successfully updated to version " + r.Version.String(),
		Type:    runtime.InfoDialog,
	})
	if err != nil {
		runtime.LogInfof(a.Ctx, "Error occurred while updating binary: %s", err.Error())
		os.Exit(2)
	}

	runtime.LogInfof(a.Ctx, rr)
	os.Exit(1)
}

func (a *AppUpdater) IsUpdateAvailable() bool {
	if a.LatestVersion == nil {
		return false
	}

	return a.LatestVersion.Version.GreaterThan(a.CurrentVersion)
}
