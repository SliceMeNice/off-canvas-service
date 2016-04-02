import typescript from 'rollup-plugin-typescript';
import * as ts from 'typescript';

export default {
	entry: './sources/index.ts',
	dest: 'dist/offCanvasService.js',
	format: 'iife',
	moduleName: 'OffCanvas',
	plugins: [
		typescript( {
			target: ts.ScriptTarget.ES5,
			typescript: ts
		} )
	]
}