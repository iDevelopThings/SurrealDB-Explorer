package main

import (
	"embed"
	container "github.com/Envuso/go-ioc-container"
	"wails_vue/backend"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {

	backend.Assets = assets

	backend.Container = container.Container
	backend.Container.Singleton(backend.NewApplicationSettings)

	backend.AppInstance = backend.NewApp()

	container.Container.Instance(backend.AppInstance)

	backend.Container.Call(backend.BootApplication)

	/*_, err := backend.CreateApp(assets)
	if err != nil {
		println("Error:", err.Error())
	}*/

}
