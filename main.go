package main

import (
	"embed"
	container "github.com/Envuso/go-ioc-container"
	"wails_vue/backend"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {

	backend.Assets = assets

	backend.Container = container.Container

	backend.Container.Singleton(func() *backend.ApplicationSettings {
		settings := backend.NewApplicationSettings()
		settings.Icon = icon

		return settings
	})

	backend.Container.Singleton(backend.NewApplicationMenuBuilder)

	backend.AppInstance = backend.NewApp()

	container.Container.Instance(backend.AppInstance)

	backend.Container.Call(backend.BootApplication)

	/*_, err := backend.CreateApp(assets)
	if err != nil {
		println("Error:", err.Error())
	}*/

}
