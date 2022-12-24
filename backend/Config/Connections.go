package Config

import (
	"context"
	container "github.com/Envuso/go-ioc-container"
	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"wails_vue/backend/FileStore"
)

type Connection struct {
	Id   string `json:"id,omitempty"`
	Name string `json:"name,omitempty"`

	Host string `json:"host,omitempty"`

	User string `json:"user,omitempty"`
	Pass string `json:"pass,omitempty"`

	Database  string `json:"database,omitempty"`
	Namespace string `json:"namespace,omitempty"`
}

type Connections struct {
	Ctx context.Context `json:"-"`

	Connections []*Connection `json:"connections"`
	Current     *string       `json:"current"`
}

func (connections *Connections) Setup() {
	connections.Connections = []*Connection{}
	connections.Current = nil
}

func (connections *Connections) Update(data *Connections) *Connections {
	connections.Connections = data.Connections
	connections.Current = data.Current

	err := FileStore.Save[Connections](connections)
	if err != nil {
		runtime.LogError(connections.Ctx, err.Error())
		return nil
	}

	return connections
}

func (connections *Connections) Add(connection Connection) *Connection {
	connection.Id = uuid.New().String()
	connections.Connections = append(connections.Connections, &connection)
	connections.Update(connections)

	return &connection
}

func (connections *Connections) SetCurrent(connectionId *string) {
	connections.Current = connectionId
	connections.Update(connections)
}

func (connections *Connections) Remove(connectionId *string) *Connections {
	if connectionId == nil {
		return nil
	}

	if connections.Current != nil && *connections.Current == *connectionId {
		connections.Current = nil
	}

	for i, connection := range connections.Connections {
		if connection.Id == *connectionId {
			connections.Connections = append(connections.Connections[:i], connections.Connections[i+1:]...)
			break
		}
	}

	var queries *QueriesList
	container.Container.MakeTo(&queries)
	queries.RemoveQueries(*connectionId)

	return connections.Update(connections)
}
