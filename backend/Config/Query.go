package Config

import (
	"context"
	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"wails_vue/backend/FileStore"
)

func createQuery(connectionId, query string) Query {
	return Query{
		Id:           uuid.New().String(),
		ConnectionId: connectionId,
		Sql:          query,
	}
}

type QueryType string

const (
	SavedQuery = "saved"
	History    = "history"
)

type Query struct {
	Id           string    `json:"id"`
	ConnectionId string    `json:"connectionId"`
	Title        string    `json:"title"`
	Sql          string    `json:"sql"`
	Type         QueryType `json:"queryType"`
}

type QueriesList struct {
	Ctx context.Context `json:"-"`

	Queries map[string][]Query `json:"queries"`
}

func (list *QueriesList) Setup() {
	list.Queries = make(map[string][]Query)
}

func (list *QueriesList) GetQueries(connectionId string) []Query {
	return list.Queries[connectionId]
}

func (list *QueriesList) Update() *QueriesList {
	err := FileStore.Save[QueriesList](list)
	if err != nil {
		runtime.LogError(list.Ctx, err.Error())
		return nil
	}

	return list
}

type SaveQueryRequest struct {
	ConnectionId string `json:"connectionId"`
	Query        string `json:"query"`
	Title        string `json:"title"`
}

func (list *QueriesList) SaveQuery(data SaveQueryRequest) Query {
	connectionId := data.ConnectionId
	query := data.Query

	if list.Queries == nil {
		list.Queries = make(map[string][]Query)
	}

	if _, ok := list.Queries[connectionId]; !ok {
		list.Queries[connectionId] = []Query{}
	}

	entry := createQuery(connectionId, query)
	entry.Title = data.Title
	entry.Type = SavedQuery

	list.Queries[connectionId] = append(list.Queries[connectionId], entry)

	list.Update()

	return entry
}

func (list *QueriesList) DeleteQuery(id string) []Query {
	deleted := false
	for connectionId, queries := range list.Queries {
		for index, query := range queries {
			if query.Id == id {
				list.Queries[connectionId] = append(queries[:index], queries[index+1:]...)
				deleted = true
				break
			}
		}
		if deleted {
			break
		}
	}

	if deleted {
		list.Update()
	}
	connectionId := FileStore.Get[Connections]().Current
	if connectionId == nil {
		runtime.LogError(list.Ctx, "No connection selected")
		return nil
	}

	return list.GetQueries(*connectionId)
}

func (list *QueriesList) RemoveQueries(connectionId string) {
	if _, ok := list.Queries[connectionId]; ok {
		delete(list.Queries, connectionId)
	}
	list.Update()
}
