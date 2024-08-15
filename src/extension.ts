import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { existsSync } from 'fs';

interface QuickPickItemWithAction extends vscode.QuickPickItem {
    action?: () => Thenable<void>;
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('terra-parity.run', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || !workspaceFolders.length) {
			vscode.window.showErrorMessage(`Open terraform repo first`);
			return null;
		}
		const root = workspaceFolders[0].uri.fsPath;

		const config = vscode.workspace.getConfiguration('terra-parity');
		const envs: string[] | undefined = config.get('envs');

		if (!envs || envs.length === 0) {
			vscode.window.showErrorMessage(
				'You need to specify environments you want to have parity across',
				'Open Settings'
			).then(selection => {
				if (selection === 'Open Settings') {
					vscode.commands.executeCommand('workbench.action.openSettings', 'terra-parity.envs');
				}
			});
			return null;
		}

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Select terraform file first');
			return null;
		}
		const fileUri = editor.document.uri;
		const filePath = fileUri.fsPath;

		// find bros
		const fileEnv = envs.find(e => filePath.includes(e));
		if (!fileEnv) {
			vscode.window.showErrorMessage(`File is not under any environment`);
			return null;
		}
		const broEnvs = envs.filter(e => e !== fileEnv);

		// choose bro
		const fileContent = (await vscode.workspace.fs.readFile(fileUri)).toString();
		const options: QuickPickItemWithAction[] = await Promise.all(broEnvs.map(async env => {
			const broPath = filePath.replace(fileEnv, env);
			const broUri = Uri.file(broPath);
			if (existsSync(broPath)) {
				const broContent = (await vscode.workspace.fs.readFile(broUri)).toString();
				if (broContent === fileContent) {
					return {
						label: `$(check) ${env}`,
						// detail: `Equal with ${shorten(broPath)}`,
						action: compare(fileUri, broUri)
					};
				} else {
					return {
						label: `$(warning) ${env}`,
						// detail: `Different with ${shorten(broPath)}`,
						action: compare(fileUri, broUri)
					};
				}
			} else {
				return {
					label: `$(diff-review-insert) ${env}`,
					// detail: `Add ${shorten(broPath)}`,
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
			return p.replace(root, "");
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
