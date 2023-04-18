package backend

import (
	"wails_vue/backend/Config"
)

// AllConfig - This struct is only required for wails to export it to ts...
type AllConfig struct {
	App         *ApplicationSettings `json:"app,omitempty"`
	Window      *Config.Window       `json:"window,omitempty"`
	Connections *Config.Connections  `json:"connections,omitempty"`
	Queries     *Config.QueriesList  `json:"queries,omitempty"`
	Preferences *Config.Preferences  `json:"preferences,omitempty"`
}
