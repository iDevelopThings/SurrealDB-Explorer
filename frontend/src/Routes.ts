import {createRouter, createWebHashHistory, type RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
	{
		name      : "home",
		path      : "/",
		component : () => import("./Pages/Home.vue"),
	},
	{name : "query", path : "/query", component : () => import("./Pages/Query/Query.vue")},
	{name : "logins", path : "/logins", component : () => import("./Pages/Home.vue")},
	{name : "tokens", path : "/tokens", component : () => import("./Pages/Home.vue")},
	{name : "scopes", path : "/scopes", component : () => import("./Pages/Home.vue")},
	{
		name      : "tables",
		path      : "/tables",
		component : () => import("./Pages/Tables/Tables.vue"),
		props     : true,

		children : [
			{
				name      : "tables.view",
				path      : "/tables/:name/:id?",
				component : () => import("./Pages/Tables/ViewTable.vue"),
				props     : true,
			},

		]
	},
];

const router = createRouter({
	history : createWebHashHistory(),
	routes  : routes,
});

export {router, routes};
