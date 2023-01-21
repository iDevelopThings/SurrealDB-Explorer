package backend

import (
	"context"
	"embed"
	"github.com/Envuso/go-ioc-container"
	"github.com/wailsapp/wails/v2/pkg/application"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"os/exec"
	goRuntime "runtime"
	"wails_vue/backend/Config"
	"wails_vue/backend/FileStore"
	"wails_vue/backend/Util"
)

type AppContext struct {
	Ctx context.Context
}

var Assets embed.FS
var AppInstance *App
var Container *container.ContainerInstance

var Logger *Util.FileLogger

func BootApplication(
	app *App,
	appSettings *ApplicationSettings,
	windowSettings *Config.Window,
	connections *Config.Connections,
	queriesList *Config.QueriesList,
	menuBuilder *ApplicationMenuBuilder,
) {

	app.Config = &AllConfig{
		App:         appSettings,
		Window:      windowSettings,
		Connections: connections,
		Queries:     queriesList,
	}

	Logger = Util.NewFileLogger(FileStore.Stores.GetAppDirFilePath("log.txt"))

	Logger.Debug("Log dir is: " + Logger.GetFilePath())

	wailsApplication := application.NewWithOptions(&options.App{
		Title:  appSettings.Title,
		Width:  1024,
		Height: 768,

		Logger: Logger,

		Menu: menuBuilder.Build(app),

		AssetServer: &assetserver.Options{
			Assets: Assets,
		},

		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},

		OnStartup: func(ctx context.Context) {
			app.ctx = ctx
			menuBuilder.Ctx = ctx

			FileStore.SetContext(ctx)

			Container.Instance(&AppContext{Ctx: ctx})
			Container.Call(app.startup)
		},
		OnBeforeClose: func(ctx context.Context) bool {
			app.ctx = ctx
			Container.Instance(&AppContext{Ctx: ctx})
			Container.Call(app.shutdown)

			return false
		},

		Bind: []interface{}{
			app,
			windowSettings,
			connections,
			queriesList,
		},

		Mac: &mac.Options{
			//TitleBar: mac.TitleBarHiddenInset(),
			About: &mac.AboutInfo{
				Title:   appSettings.Title,
				Icon:    appSettings.Icon,
				Message: "OpenSource SurrealDB Client",
			},
		},
	})

	err := wailsApplication.Run()

	if err != nil {
		panic(err)
	}
}

// App struct
type App struct {
	ctx    context.Context
	Config *AllConfig `json:"config"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(window *Config.Window) {
	if window.CanSetDimensions() {
		runtime.WindowSetSize(a.ctx, window.Width, window.Height)
	}

	if window.CanSetPosition() {
		runtime.WindowSetPosition(a.ctx, window.X, window.Y)
	}
}

func (a *App) shutdown(window *Config.Window) {
	window.Set()
	FileStore.SaveAllStores(a.ctx)
}

func (a *App) GetAllConfig() *AllConfig {
	return a.Config
}

func (a *App) IsMac() bool {
	//goland:noinspection GoBoolExpressions
	return goRuntime.GOOS == "darwin"
}

func (a *App) IsWindows() bool {
	//goland:noinspection GoBoolExpressions
	return goRuntime.GOOS == "windows"
}

func (a *App) IsLinux() bool {
	//goland:noinspection GoBoolExpressions
	return goRuntime.GOOS == "linux"
}

func (a *App) OpenDirectory(path string) {
	var cmd *exec.Cmd
	if a.IsWindows() {
		cmd = exec.Command(`explorer`, `/select,`, path)
	} else if a.IsMac() {
		cmd = exec.Command(`open`, path)
	} else {
		cmd = exec.Command(`xdg-open`, path)
	}

	runtime.LogDebugf(a.ctx, "Opening Directory: %s, CMD: %s", path, cmd.String())

	err := cmd.Run()
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
	}
}

func (a *App) OpenAppDataPath() {
	a.OpenDirectory(FileStore.Stores.GetAppDir())
}

func (a *App) OpenFile(path string) {
	var cmd *exec.Cmd
	if a.IsWindows() {
		cmd = exec.Command(`start`, path)
	} else if a.IsMac() {
		cmd = exec.Command(`open`, "-t", path)
	} else {
		cmd = exec.Command(`xdg-open`, path)
	}

	runtime.LogDebugf(a.ctx, "Opening File: %s, CMD: %s", path, cmd.String())

	err := cmd.Run()
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
	}

}

func (a *App) OpenLogFile() {
	a.OpenFile(Logger.GetFilePath())
}
