import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { existsSync } from 'fs';
import { join } from 'path';

interface QuickPickItemWithAction extends vscode.QuickPickItem {
	action?: () => Thenable<void>;
}

interface Env {
	name: string;
	path: string;
}

const EXT_NAME = "terra-parity";
const ENVS_SETTING_NAME = "Environment paths";

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(`${EXT_NAME}.run`, async () => {
		// check repo is opened
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || !workspaceFolders.length) {
			vscode.window.showErrorMessage(`Open terraform repo first`);
			return null;
		}
		const root = workspaceFolders[0].uri.fsPath;

		// read env paths config
		const config = vscode.workspace.getConfiguration(EXT_NAME);
		const envPaths: string[] | undefined = config.get(ENVS_SETTING_NAME);

		// check env paths specified
		if (!envPaths || envPaths.length === 0) {
			vscode.window.showErrorMessage(
				'You need to specify environments you want to have parity across',
				'Open Settings'
			).then(selection => {
				if (selection === 'Open Settings') {
					vscode.commands.executeCommand('workbench.action.openSettings', `${EXT_NAME}.${ENVS_SETTING_NAME}`);
				}
			});
			return;
		}

		// check env paths exist
		const notFound = envPaths.find(p => !existsSync(join(root, p)));
		if(notFound) {
			vscode.window.showErrorMessage(
				`Configured environment path "${notFound}" should be a valid path to folder with environment code.`,
				'Open Settings'
			).then(selection => {
				if (selection === 'Open Settings') {
					vscode.commands.executeCommand('workbench.action.openSettings', `${EXT_NAME}.${ENVS_SETTING_NAME}`);
				}
			});
			return;
		}

		// calculate env names
		const envs = (function getEnvs(eps: string[]): Env[] {
			if(eps.length < 2) {
				return eps.map(path => {
					return {
						name: path,
						path: path
					}
				});
			}

			function names(pathName: [path: string, nameSegments: string[]][]): [string, string[]][] {
				if(pathName.length === 0) return [];
				else if(pathName.find(s => s[1].length === 0)) throw new Error("Environment paths can't be sub-directories of each other.");
				else if(new Set(pathName.map(pn => pn[1][0])).size > 1) return pathName;
				else return names(pathName.map(pn => [pn[0], pn[1].slice(1)]))
			}
			
			const envs: Env[] = names(eps.map(s => [s, s.split("/")])).map(pn => {
				return {
					name: pn[1].join("/"),
					path: pn[0]
				}
			});

			return envs;
		})(envPaths);

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Select terraform file first');
			return null;
		}
		const fileUri = editor.document.uri;
		const filePath = fileUri.fsPath;

		// find bro envs
		const fileEnv = envs.find(e => filePath.includes(e.path));
		if (!fileEnv) {
			vscode.window.showErrorMessage(`File ${filePath} is not under any environment. Choose the one from under the environments paths.`);
			return;
		}
		const broEnvs = envs.filter(e => e !== fileEnv);

		// show bro envs menu
		const fileContent = (await vscode.workspace.fs.readFile(fileUri)).toString();
		const options: QuickPickItemWithAction[] = await Promise.all(broEnvs.map(async env => {
			const broPath = filePath.replace(fileEnv.path, env.path);
			const broUri = Uri.file(broPath);
			if (existsSync(broPath)) {
				const broContent = (await vscode.workspace.fs.readFile(broUri)).toString();
				if (broContent === fileContent) {
					return {
						label: `$(check) ${env.name}`,
						detail: `Match:\t\t${shorten(broPath)}`,
						action: compare(fileUri, broUri)
					};
				} else {
					return {
						label: `$(request-changes) ${env.name}`,
						detail: `Different:\t${shorten(broPath)}`,
						action: compare(fileUri, broUri)
					};
				}
			} else {
				return {
					label: `$(circle-slash) ${env.name}`,
					detail: `Not found:\t${shorten(broPath)}`,
					action: 
					() => {
						return vscode.workspace.fs.copy(fileUri, broUri).then(compare(fileUri, broUri));
					}
				};
			}}));

		const quickPick = vscode.window.createQuickPick<QuickPickItemWithAction>();
		quickPick.items = options;
		quickPick.onDidChangeSelection(selection => {
			if (selection[0] && selection[0].action) {
				selection[0].action();
			}
			quickPick.hide();
		});
		quickPick.show();

		function shorten(p: string): string {
			const r = p.replace(root, "");
			return `...${r.slice(r.length - 70)}`;
		}

		function compare(a: Uri, b: Uri): () => Thenable<void> {
			return () => vscode.commands.executeCommand(
				'vscode.diff',
				a,
				b,
				`${shorten(a.path)} ↔ ${shorten(b.path)}`
			);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
