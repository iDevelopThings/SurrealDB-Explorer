package Config

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"wails_vue/backend/FileStore"
)

type PaneSize struct {
	Min  float64 `json:"min"`
	Max  float64 `json:"max"`
	Size float64 `json:"size"`
}

type Preferences struct {
	Ctx context.Context `json:"-"`

	EditorFontSize      int `json:"editorFontSize"`
	QueryResultFontSize int `json:"queryResultFontSize"`

	PaneSizes   []PaneSize `json:"paneSizes"`
	PanelLayout string     `json:"panelLayout"`
}

func (p *Preferences) Setup() {
	p.PaneSizes = []PaneSize{
		{Min: 10, Max: 100, Size: 90},
		{Min: 10, Max: 100, Size: 10},
	}
	p.EditorFontSize = 16
	p.QueryResultFontSize = 14
	p.PanelLayout = "horizontal"
}

func (p *Preferences) Update(data *Preferences) {
	p.EditorFontSize = data.EditorFontSize
	p.QueryResultFontSize = data.QueryResultFontSize
	p.PaneSizes = data.PaneSizes
	p.PanelLayout = data.PanelLayout

	err := FileStore.Save[Preferences](p)
	if err != nil {
		runtime.LogError(p.Ctx, err.Error())
	}
}
func (p *Preferences) UpdatePaneSizes(panes []PaneSize) {
	p.PaneSizes = panes
	p.Update(p)
}
