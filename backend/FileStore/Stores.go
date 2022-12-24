package FileStore

import (
	"context"
	"fmt"
	container "github.com/Envuso/go-ioc-container"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"reflect"
)

type StoresManager struct {
	appDirName string

	Instances map[reflect.Type]*StoreInstance
}

type StoreInstance struct {
	name string

	Value any
	Store IStore
}

var Stores *StoresManager

func NewStores(appDirName string) *StoresManager {
	Stores = &StoresManager{
		appDirName: appDirName,
		Instances:  make(map[reflect.Type]*StoreInstance),
	}

	return Stores
}

func DefineStore[T any](name string) *T {
	store := &StoreInstance{
		name:  name,
		Store: NewStore[T](name, Stores.appDirName),
	}

	storeValue := new(T)
	refValue := reflect.ValueOf(storeValue)

	if refValue.Type().Implements(reflect.TypeOf((*IStoreValue)(nil)).Elem()) {
		invocable := container.CreateInvocableStruct(refValue)
		invocable.CallMethodByNameWith("Setup", container.Container)
	}

	store.Value = storeValue

	if storeLoadedValue, err := store.Store.Init(); err != nil {
		fmt.Printf("Error initiating store %s: %s", store.name, err.Error())
	} else {
		store.Value = storeLoadedValue
	}

	container.Container.Instance(store.Value)

	Stores.Instances[reflect.TypeOf(*new(T))] = store

	return store.Value.(*T)
}

func Get[T any]() *T {
	var value *T
	container.Container.MakeTo(&value)
	return value
}

func GetStoreInstance[T any]() *StoreInstance {
	storeType := reflect.TypeOf(*new(T))
	if store, ok := Stores.Instances[storeType]; ok {
		return store
	}

	return nil
}

func Save[T any](value *T) error {
	storeInstance := GetStoreInstance[T]()

	if storeInstance == nil {
		return fmt.Errorf("store not found")
	}

	return storeInstance.Store.SaveAny(value)
}

func SetContext(ctx context.Context) {
	for _, store := range Stores.Instances {
		refValue := reflect.ValueOf(store.Value)
		// Set the struct value `ctx` field to the context
		refValue.Elem().FieldByName("Ctx").Set(reflect.ValueOf(ctx))
	}
}

func SaveAllStores(ctx context.Context) {
	for _, store := range Stores.Instances {
		if err := store.Store.SaveAny(store.Value); err != nil {
			runtime.LogError(ctx, fmt.Sprintf("Failed to save config(%s), error: %s", store.name, err.Error()))
		}
	}
}
