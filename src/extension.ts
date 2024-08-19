import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { existsSync } from 'fs';

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
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || !workspaceFolders.length) {
			vscode.window.showErrorMessage(`Open terraform repo first`);
			return null;
		}
		const root = workspaceFolders[0].uri.fsPath;

		const config = vscode.workspace.getConfiguration(EXT_NAME);
		const envs: string[] | undefined = config.get(ENVS_SETTING_NAME);

		if (!envs || envs.length === 0) {
			vscode.window.showErrorMessage(
				'You need to specify environments you want to have parity across',
				'Open Settings'
			).then(selection => {
				if (selection === 'Open Settings') {
					vscode.commands.executeCommand('workbench.action.openSettings', `${EXT_NAME}.${ENVS_SETTING_NAME}`);
				}
			});
			return null;
		}

		function getEnvs(envPaths: string[]): Env[] {
			if(envPaths.length < 2) {
				return envPaths.map(e => {
					return {
						name: e,
						path: e
					}
				});
			}
			const tokenized: string[][] = 
				envPaths
					.map(s => s.replace(/^\/+|\/+$/g, ''))
					.map(s => s.split("/"))
					.filter(s => s.length > 0);

			function names(ss: string[][]): string[] {
				if(ss.length === 0) return []
				else if(ss.find(s => s.length === 0)) return []
				else if(new Set(ss.map(ts => ts[0])).size > 1) return ss.map(e => e.join("/"))
				else return names(ss.map(e => e.slice(1)))
			}
			
			const ns = names(tokenized);

			return ns.map(function(n: string, i: number) {
				return {
					name: n,
					path: tokenized[i].join("/")
				}}
			);
		}
		
		const es = getEnvs(envs);

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Select terraform file first');
			return null;
		}
		const fileUri = editor.document.uri;
		const filePath = fileUri.fsPath;

		// find bros
		const fileEnv = es.find(e => filePath.includes(e.path));
		if (!fileEnv) {
			vscode.window.showErrorMessage(`File is not under any environment`);
			return null;
		}
		const broEnvs = es.filter(e => e !== fileEnv);

		// choose bro
		const fileContent = (await vscode.workspace.fs.readFile(fileUri)).toString();
		const options: QuickPickItemWithAction[] = await Promise.all(broEnvs.map(async env => {
			const broPath = filePath.replace(fileEnv., env);
			const broUri = Uri.file(broPath);
			if (existsSync(broPath)) {
				const broContent = (await vscode.workspace.fs.readFile(broUri)).toString();
				if (broContent === fileContent) {
					return {
						label: `$(check) ${env}`,
						detail: `Match:\t\t\t${shorten(broPath)}`,
						action: compare(fileUri, broUri)
					};
				} else {
					return {
						label: `$(request-changes) ${env}`,
						detail: `Different:\t\t${shorten(broPath)}`,
						action: compare(fileUri, broUri)
					};
				}
			} else {
				return {
					label: `$(circle-slash) ${env}`,
					detail: `Not found:\t\t${shorten(broPath)}`,
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
