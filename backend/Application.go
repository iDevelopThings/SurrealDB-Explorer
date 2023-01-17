package backend

import (
	"context"
	"embed"
	"github.com/Envuso/go-ioc-container"
	"github.com/wailsapp/wails/v2/pkg/application"
	menu2 "github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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
) {

	app.Config = &AllConfig{
		App:         appSettings,
		Window:      windowSettings,
		Connections: connections,
		Queries:     queriesList,
	}

	Logger = Util.NewFileLogger(FileStore.Stores.GetAppDirFilePath("log.txt"))

	menu := menu2.NewMenu()

	menu.AddSubmenu(appSettings.Title)

	viewMenu := menu.AddSubmenu("View")

	viewMenu.AddText("Zoom In", keys.Combo("+", keys.CmdOrCtrlKey, keys.ShiftKey), func(cb *menu2.CallbackData) {
		runtime.WindowExecJS(app.ctx, "window.zoomIn()")
	})

	viewMenu.AddText("Zoom Out", keys.CmdOrCtrl("-"), func(cb *menu2.CallbackData) {
		runtime.WindowExecJS(app.ctx, "window.zoomOut()")
	})

	viewMenu.AddText("Reset Zoom", keys.Combo("-", keys.CmdOrCtrlKey, keys.OptionOrAltKey), func(cb *menu2.CallbackData) {
		runtime.WindowExecJS(app.ctx, "window.resetZoom()")
	})

	/*environment := runtime.Environment(app.ctx)
	if environment.BuildType == "production" {
		Logger = logger.NewFileLogger(FileStore.Stores.GetAppDirFilePath("log.txt"))
	} else {
		Logger = logger.NewDefaultLogger()
	}*/

	Logger.Debug("Log dir is: " + Logger.GetFilePath())

	wailsApplication := application.NewWithOptions(&options.App{
		Title:  appSettings.Title,
		Width:  1024,
		Height: 768,

		Logger: Logger,

		Menu: menu,

		AssetServer: &assetserver.Options{
			Assets: Assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},

		OnStartup: func(ctx context.Context) {
			app.ctx = ctx

			FileStore.SetContext(ctx)

			Container.Instance(&AppContext{Ctx: ctx})
			Container.Call(app.startup)
		},
		OnShutdown: func(ctx context.Context) {
			app.ctx = ctx
			Container.Instance(&AppContext{Ctx: ctx})
			Container.Call(app.shutdown)
		},

		Bind: []interface{}{
			app,
			windowSettings,
			connections,
			queriesList,
		},
	})

	err := wailsApplication.Run()

	if err != nil {
		panic(err)
	}
}

// App struct
type App struct {
	ctx context.Context

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
