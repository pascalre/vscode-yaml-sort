// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { print } from 'util';
export const yaml_parser = require('js-yaml');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-yaml-sort" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let activeEditor = vscode.window.activeTextEditor;
  context.subscriptions.push(vscode.commands.registerCommand('vscode-yaml-sort.sortyaml', () => {
    if (activeEditor) {
      let newText = sort_yaml(activeEditor.document.getText())!;
      if (newText) {
        activeEditor.edit(builder => builder.replace(new vscode.Range(new vscode.Position(0,0), new vscode.Position(activeEditor!.document.lineCount+1,0)), newText));
      }
    }
  }));
  context.subscriptions.push(vscode.commands.registerCommand('vscode-yaml-sort.validateyaml', () => {
    if (activeEditor) {
      validate_yaml(activeEditor.document.getText())!;
    }
  }));
}

// this method is called when your extension is deactivated
export function deactivate() {}

export function sort_yaml(unsorted_yaml: string) {
  try {
    var doc = yaml_parser.safeLoad(unsorted_yaml);
    let sorted_yaml = yaml_parser.safeDump(doc, {
      sortKeys: true,
    });
    vscode.window.showInformationMessage("Keys resorted successfully");
    return sorted_yaml;
  } catch (e) {
    vscode.window.showErrorMessage("Keys could not be resorted: " + e.message);
    return null;
  }
}

export function validate_yaml(yaml: string) {
  try {
    var doc = yaml_parser.safeLoad(yaml);
    vscode.window.showInformationMessage("YAML is valid.");
    return true;
  } catch (e) {
    vscode.window.showErrorMessage("YAML is invalid: " + e.message);
    return false;
  }
}