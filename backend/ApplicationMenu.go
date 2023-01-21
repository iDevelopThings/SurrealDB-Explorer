package backend

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	goRuntime "runtime"
)

type ApplicationMenuBuilder struct {
	Ctx context.Context

	Menu        *menu.Menu
	AppSettings *ApplicationSettings
}

func NewApplicationMenuBuilder(
	appSettings *ApplicationSettings,
) *ApplicationMenuBuilder {
	return &ApplicationMenuBuilder{
		AppSettings: appSettings,
		Menu:        menu.NewMenu(),
	}
}

func (builder *ApplicationMenuBuilder) Build(app *App) *menu.Menu {
	switch goRuntime.GOOS {
	case "darwin":
		builder.Menu.Append(menu.AppMenu())
		builder.Menu.Append(menu.EditMenu())
		break
	}

	//builder.Menu.AddSubmenu(builder.AppSettings.Title)

	viewMenu := builder.Menu.AddSubmenu("View")

	viewMenu.AddText("Zoom In", keys.Combo("+", keys.CmdOrCtrlKey, keys.ShiftKey), func(cb *menu.CallbackData) {
		runtime.WindowExecJS(builder.Ctx, "window.zoomIn()")
	})

	viewMenu.AddText("Zoom Out", keys.CmdOrCtrl("-"), func(cb *menu.CallbackData) {
		runtime.WindowExecJS(builder.Ctx, "window.zoomOut()")
	})

	viewMenu.AddText("Reset Zoom", keys.Combo("-", keys.CmdOrCtrlKey, keys.OptionOrAltKey), func(cb *menu.CallbackData) {
		runtime.WindowExecJS(builder.Ctx, "window.resetZoom()")
	})

	viewMenu.AddSeparator()

	viewMenu.AddText("Refresh", keys.CmdOrCtrl("r"), func(cb *menu.CallbackData) {
		runtime.WindowExecJS(builder.Ctx, "window.location.reload()")
	})

	helpMenu := builder.Menu.AddSubmenu("Help")

	helpMenu.AddText("Open App Data Directory", &keys.Accelerator{}, func(cb *menu.CallbackData) {
		app.OpenAppDataPath()
	})
	helpMenu.AddText("Open Log File", &keys.Accelerator{}, func(cb *menu.CallbackData) {
		app.OpenLogFile()
	})

	return builder.Menu
}
