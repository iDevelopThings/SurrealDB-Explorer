package Config

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Window struct {
	Ctx context.Context `json:"-"`

	Width  int `json:"width"`
	Height int `json:"height"`

	// The x position of the window
	X int `json:"x"`
	// The y position of the window
	Y int `json:"y"`
}

func (window *Window) Setup() {
	window.Width = 1024
	window.Height = 768
	window.X = -1
	window.Y = -1
}

func (window *Window) CanSetDimensions() bool {
	return window.Width > 0 && window.Height > 0
}

func (window *Window) CanSetPosition() bool {
	return window.X > -1 && window.Y > -1
}

func (window *Window) Set() {
	width, size := runtime.WindowGetSize(window.Ctx)
	x, y := runtime.WindowGetPosition(window.Ctx)

	window.X = x
	window.Y = y
	window.Width = width
	window.Height = size

	runtime.LogInfof(window.Ctx, "Window position: %d, %d", window.X, window.Y)
	runtime.LogInfof(window.Ctx, "Window size: %d, %d", window.Width, window.Height)
}
