/**
 * Wraps every table in a horizontal scroll container:
 *
 *   <div class="table-scroll"><table>…</table></div>
 *
 * On a narrow screen, a table with code values is wider than the column. The
 * cells keep their words and their code values whole, and the container scrolls,
 * thus "data-focus-visible" does not break into three lines.
 *
 * A table is an element in the tree (not a `raw` string as the code blocks are),
 * thus the transformer replaces the node with a wrapper that holds it.
 *
 * @returns {(tree: any) => void} a rehype transformer
 */
export function rehypeTableScroll() {
	return (/** @type {any} */ tree) => {
		/** @param {any} node */
		const walk = (node) => {
			if (!Array.isArray(node.children)) return;
			node.children = node.children.map((/** @type {any} */ child) => {
				if (child.type === 'element' && child.tagName === 'table') {
					return {
						type: 'element',
						tagName: 'div',
						properties: { className: ['table-scroll'] },
						children: [child]
					};
				}
				walk(child);
				return child;
			});
		};
		walk(tree);
	};
}
