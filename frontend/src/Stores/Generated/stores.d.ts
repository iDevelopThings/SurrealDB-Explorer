declare module "@vue/runtime-core" {
    import { schemaStore } from "./../SchemaStore";
    import { connectionStore } from "./../ConnectionStore";
    import { app } from "./../AppStore";
    import { queryPanel } from "./../QueriesPanelStore";
    import { queryPage } from "./../QueryPageStore";
    import { tableStore } from "./../TableStore";
    interface ComponentCustomProperties {
        $schema: typeof schemaStore;
        $connection: typeof connectionStore;
        $app: typeof app;
        $queriesPanel: typeof queryPanel;
        $queryPage: typeof queryPage;
        $table: typeof tableStore;
    }
}
export {};
