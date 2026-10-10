export interface NavItem {
	slug: string;
	title: string;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const nav: NavGroup[] = [
	{
		label: 'Overview',
		items: [
			{ slug: 'quick-start', title: 'Quick Start' },
			{ slug: 'accessibility', title: 'Accessibility' }
		]
	},
	{
		label: 'Chart',
		items: [
			{ slug: 'chart', title: 'Chart' },
			{ slug: 'scales', title: 'Scales' }
		]
	},
	{
		label: 'Marks',
		items: [
			{ slug: 'line', title: 'Line' },
			{ slug: 'area', title: 'Area' },
			{ slug: 'bar', title: 'Bar' }
		]
	},
	{
		label: 'Guides',
		items: [
			{ slug: 'axis-and-grid', title: 'Axis and Grid' },
			{ slug: 'legend', title: 'Legend' }
		]
	},
	{
		label: 'Access',
		items: [
			{ slug: 'tooltip', title: 'Tooltip' },
			{ slug: 'data-table', title: 'DataTable' }
		]
	}
];
