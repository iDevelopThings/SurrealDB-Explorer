package FileStore

import (
	"encoding/json"
	"github.com/vrischmann/userdir"
	"os"
	"path"
	"regexp"
	"strings"
)

type IStore interface {
	GetDirectory() string
	GetFilePath() string
	Init() (any, error)
	SaveAny(data any) error
}

type IStoreValue interface {
	Setup()
}

type Store[T any] struct {
	Name       string `json:"name"`
	AppDirName string `json:"appDirName"`
	FileName   string `json:"dirName"`
}

func NewStore[T any](name string, appDirName string) *Store[T] {
	return &Store[T]{
		Name:       name,
		AppDirName: appDirName,
		FileName:   toSnakeCase(name),
	}
}

func (store *Store[T]) Init() (any, error) {
	value, err := store.Get()

	if err != nil {
		return nil, err
	}

	return value, nil
}

func (store *Store[T]) GetDirectory() string {
	return path.Join(userdir.GetConfigHome(), store.AppDirName)
}

func (store *Store[T]) GetFilePath() string {
	return path.Join(store.GetDirectory(), store.FileName+".json")
}

func (store *Store[T]) Get() (*T, error) {
	err := store.ensureDefaultConfig()
	if err != nil {
		return nil, err
	}

	d, err := os.ReadFile(store.GetFilePath())
	if err != nil {
		return nil, err
	}

	var data T
	err = json.Unmarshal(d, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (store *Store[T]) SaveAny(data any) error {
	return store.Save(*(data.(*T)))
}
func (store *Store[T]) Save(data T) error {
	if err := ensureDirExists(store.GetDirectory()); err != nil {
		return err
	}

	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	if err := os.WriteFile(store.GetFilePath(), jsonData, 0777); err != nil {
		return err
	}
	return nil
}

func (store *Store[T]) ensureDefaultConfig() error {
	needs, err := store.needsDefaultConfig()
	if err != nil {
		return err
	}

	if !needs {
		return nil
	}

	err = store.Save(*new(T))
	if err != nil {
		return err
	}

	return nil
}

func (store *Store[T]) needsDefaultConfig() (bool, error) {
	configDirPath := store.GetDirectory()
	configFilePath := store.GetFilePath()

	_, err := os.Stat(configDirPath)
	if os.IsNotExist(err) {
		return true, nil
	} else {
		if err != nil {
			return false, err
		}
	}

	_, err = os.Stat(configFilePath)
	if os.IsNotExist(err) {
		return true, nil
	} else {
		if err != nil {
			return false, err
		}
	}

	return false, nil
}

func ensureDirExists(path string) error {
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		if err = os.Mkdir(path, 0777); err != nil {
			return err
		}
	}
	return nil
}

var matchFirstCap = regexp.MustCompile("(.)([A-Z][a-z]+)")
var matchAllCap = regexp.MustCompile("([a-z0-9])([A-Z])")

func toSnakeCase(str string) string {
	snake := matchFirstCap.ReplaceAllString(str, "${1}_${2}")
	snake = matchAllCap.ReplaceAllString(snake, "${1}_${2}")
	return strings.ToLower(snake)
}
