export namespace Config {
	
	export class Connection {
	    id?: string;
	    name?: string;
	    host?: string;
	    user?: string;
	    pass?: string;
	    database?: string;
	    namespace?: string;
	
	    static createFrom(source: any = {}) {
	        return new Connection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.host = source["host"];
	        this.user = source["user"];
	        this.pass = source["pass"];
	        this.database = source["database"];
	        this.namespace = source["namespace"];
	    }
	}
	export class Connections {
	    connections: Connection[];
	    current?: string;
	
	    static createFrom(source: any = {}) {
	        return new Connections(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.connections = this.convertValues(source["connections"], Connection);
	        this.current = source["current"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaneSize {
	    min: number;
	    max: number;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new PaneSize(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.min = source["min"];
	        this.max = source["max"];
	        this.size = source["size"];
	    }
	}
	export class Preferences {
	    editorFontSize: number;
	    queryResultFontSize: number;
	    paneSizes: PaneSize[];
	    panelLayout: string;
	
	    static createFrom(source: any = {}) {
	        return new Preferences(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.editorFontSize = source["editorFontSize"];
	        this.queryResultFontSize = source["queryResultFontSize"];
	        this.paneSizes = this.convertValues(source["paneSizes"], PaneSize);
	        this.panelLayout = source["panelLayout"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QueriesList {
	    queries: {[key: string]: Query[]};
	
	    static createFrom(source: any = {}) {
	        return new QueriesList(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.queries = source["queries"];
	    }
	}
	export class Query {
	    id: string;
	    connectionId: string;
	    title: string;
	    sql: string;
	    queryType: string;
	
	    static createFrom(source: any = {}) {
	        return new Query(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.connectionId = source["connectionId"];
	        this.title = source["title"];
	        this.sql = source["sql"];
	        this.queryType = source["queryType"];
	    }
	}
	export class SaveQueryRequest {
	    connectionId: string;
	    query: string;
	    title: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveQueryRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.connectionId = source["connectionId"];
	        this.query = source["query"];
	        this.title = source["title"];
	    }
	}
	export class Window {
	    width: number;
	    height: number;
	    x: number;
	    y: number;
	
	    static createFrom(source: any = {}) {
	        return new Window(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.width = source["width"];
	        this.height = source["height"];
	        this.x = source["x"];
	        this.y = source["y"];
	    }
	}

}

export namespace Updater {
	
	export class UpdateInfo {
	    // Go type: semver
	    version?: any;
	    url: string;
	    body: string;
	    // Go type: time
	    publishedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = this.convertValues(source["version"], null);
	        this.url = source["url"];
	        this.body = source["body"];
	        this.publishedAt = this.convertValues(source["publishedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace backend {
	
	export class ApplicationSettings {
	    title: string;
	    name: string;
	    // Go type: semver
	    version?: any;
	
	    static createFrom(source: any = {}) {
	        return new ApplicationSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.name = source["name"];
	        this.version = this.convertValues(source["version"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AllConfig {
	    app?: ApplicationSettings;
	    window?: Config.Window;
	    connections?: Config.Connections;
	    queries?: Config.QueriesList;
	    preferences?: Config.Preferences;
	
	    static createFrom(source: any = {}) {
	        return new AllConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.app = this.convertValues(source["app"], ApplicationSettings);
	        this.window = this.convertValues(source["window"], Config.Window);
	        this.connections = this.convertValues(source["connections"], Config.Connections);
	        this.queries = this.convertValues(source["queries"], Config.QueriesList);
	        this.preferences = this.convertValues(source["preferences"], Config.Preferences);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

