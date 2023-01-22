export class TableFilter {

	public constructor(
		public field: string    = "",
		public operator: string = "=",
		public value: any       = "",
	) {

	}

	public isValid(): boolean {
		if (!this.value || !this.field || !this.operator) return false;

		if (this.value.trim() === "") {
			return false;
		}

		if (this.field.trim() === "") {
			return false;
		}

		return this.operator.trim() !== "";
	}
}

export class TableFilters {

	public show: boolean = false;

	public filters: TableFilter[] = [];

	public input: TableFilter = new TableFilter("id");

	private _validSegments: TableFilter[] = [];

	public getValidatedSegments() {
		return this.filters.filter(f => f.isValid());
	}

	public getQuery() {
		const segments = this.filters; // this.getValidatedSegments();
		if (segments.length === 0) return null;

		const where = segments.map(
			f => `${f.field} ${f.operator} ${f.value}`
		).join(" AND ");

		return `WHERE ${where}`;
	}

	public add() {
		this.filters.push(this.input);
		this.input = new TableFilter();

		this.changed();
	}

	public remove(idx) {
		this.filters.splice(idx, 1);

		this.changed();
	}

	public toggle() {
		this.show = !this.show;
	}

	public has(): boolean {
//		return this._validSegments.length > 0;

		return this.filters.length > 0;
	}

	public hasAnyFilters(): boolean {
		return this.filters.length > 0;
	}

	public invalidSegmentCount() {
		return this.filters.length - this._validSegments.length;
	}

	private changed(): void {
		this._validSegments = this.getValidatedSegments();
	}
}
