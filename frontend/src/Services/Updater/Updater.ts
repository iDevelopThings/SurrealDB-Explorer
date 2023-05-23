import {EventsOn} from "../../../wailsjs/runtime";
import {reactive} from "vue";
import {UpdateCheck, GetCurrentVersion} from "../../../wailsjs/go/backend/App";
import {SemVer} from "semver";
import {UpdateInformation, type IUpdateInformation} from "./UpdateInformation";



interface IState {
	current: SemVer | null;
	info: UpdateInformation | null;
	hide: boolean;
}

export class Updater {

	public state = reactive({
		current : null,
		info    : null,
		hide    : false
	}) as IState;

	public static async init() {
		const inst = new Updater();

		if (!window.runtime) return;

		inst.state.current = new SemVer(await GetCurrentVersion());

		const updateResult = await UpdateCheck();
		if (updateResult) {
			await inst.updateAvailable(updateResult as IUpdateInformation);
		}

		EventsOn("update_available", (data: IUpdateInformation) => {
			inst.updateAvailable(data);
		});

		return inst;
	}


	private async updateAvailable(data: IUpdateInformation) {
		if (this.state.info?.version && this.state.info.version.toString() === data.version) {
			console.log("ignoring event, version is same.", this.state.info.version.toString(), data.version);
			return;
		}

		try {
			const info = new UpdateInformation(data);
			await info.process();
			this.state.info = info;
		} catch (e) {
			console.error(e);
		}
	}

	get hide() {
		return this.state.hide;
	}

	set hide(value: boolean) {
		this.state.hide = value;
	}

	get hasUpdateAvailable() {
		if(!this.state.info) {
			return false;
		}

		return this.state.info.version.compare(this.state.current) === 1;
	}

	get currentVersion() {
		return this.state.current;
	}

	get info() {
		return this.state.info;
	}
}
