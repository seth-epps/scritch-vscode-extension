import * as vscode from 'vscode';

export async function showthing() {
	const { exec, execSync } = require('node:child_process');
	const listCmd = 'scritch list -o json'

	let opts: Array<any> = []
	try {
		let res = execSync(listCmd)
		opts = JSON.parse(res.toString())
	} catch (err) {
		vscode.window.showErrorMessage(`Couldn't get available scratch options\n\n${err}`);
		return
	}

	let nativePicks = opts.filter((scritchOption: any) => scritchOption.source == "NATIVE").map(so => so.name)
	let rest = opts.filter((scritchOption: any) => scritchOption.source != "NATIVE").map(so => so.name)

	let picks: any = []
	if (nativePicks.length > 0) {
		picks = [
			{"label": "Built in", kind: vscode.QuickPickItemKind.Separator},
			...nativePicks
		]
	}
	if (rest.length > 0) {
		picks = [
			...picks,
			{"label": "Custom", kind: vscode.QuickPickItemKind.Separator},
			...rest
		]
	}

	if (picks.length == 0) {
		vscode.window.showErrorMessage(`No scratch options available.`);
		return
	}
	let opt = await vscode.window.showQuickPick(picks, { placeHolder: 'Select a scratch source template' })
 
	//  vscode.window.showInformationMessage(`Got: ${opt}`);
	const createCmd = `scritch scratch ${opt} -o json --editor-command code`

	// it's acceptable to do this asyncronously
	// since there's no more the user can do
	exec(createCmd, (err: Error, stdout: string) => {
		console.log(stdout)
		if (err) {
			vscode.window.showErrorMessage(`Couldn't create scratch file\n\n${err}`);
		}
	})
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "scritch" is now active!');

	let disposable = vscode.commands.registerCommand('scritch.scritch', showthing);
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
