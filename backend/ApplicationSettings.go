package backend

import (
	_ "embed"
	"wails_vue/backend/Config"
	"wails_vue/backend/FileStore"
)

type ApplicationSettings struct {
	// The title cased name used in the window title and such
	// "SurrealDB Explorer"
	Title string `json:"title"`
	// The lower cased name used for directories and such
	// "surrealdb_explorer"
	Name string `json:"name"`

	Icon []byte `json:"icon"`
}

func NewApplicationSettings() *ApplicationSettings {
	settings := &ApplicationSettings{
		Title: "SurrealDB Explorer",
		Name:  "surrealdb_explorer",
	}

	FileStore.NewStores(settings.Name)
	FileStore.DefineStore[Config.Window]("window_settings")
	FileStore.DefineStore[Config.Connections]("connections")
	FileStore.DefineStore[Config.QueriesList]("queries")

	return settings
}

func (a *ApplicationSettings) GetTitle() string {
	return a.Title
}

func (a *ApplicationSettings) GetName() string {
	return a.Name
}
