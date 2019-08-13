// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
export const yamlParser = require("js-yaml");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.sortYaml", () => {
    sortYamlWrapper();
  }));
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.validateYaml", () => {
    validateYamlWrapper();
  }));
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.sortConfigmap", () => {
    sortYamlWrapper(true);
  }));
}

export function sortYamlWrapper(isConfigMap: boolean = false) {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const newText = sortYaml(activeEditor.document.getText(), isConfigMap)!;
    if (newText) {
      activeEditor.edit((builder) => builder.replace(new vscode.Range(
        new vscode.Position(0, 0), new vscode.Position(activeEditor!.document.lineCount  + 1, 0)), newText));
    }
  }
}

export function sortYaml(unsortedYaml: string, isConfigMap: boolean = false) {
  try {
    const doc = yamlParser.safeLoad(unsortedYaml);
    let sortedYaml = "";

    if (isConfigMap) {
      ["apiVersion", "kind", "metadata", "spec", "data"].forEach((key) => {
        if (doc[key]) {
          let sortedSubYaml = yamlParser.safeDump(doc[key], {
            lineWidth: vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
            sortKeys: true,
          });
          // when key cotains more than one line, we need some transformation:
          // add a new line and indent each line 2 spaces
          if (sortedSubYaml.includes(":")) {
            sortedSubYaml = "\n  " + sortedSubYaml.split("\n").join("\n  ");
            sortedSubYaml = sortedSubYaml.substring(0, sortedSubYaml.length - 2);
          }
          sortedYaml += key + ": " + sortedSubYaml;
        }
      });
    } else {
      sortedYaml = yamlParser.safeDump(doc, {
        indent: vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent"),
        lineWidth: vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
        sortKeys: true,
      });
    }
    vscode.window.showInformationMessage("Keys resorted successfully");
    return sortedYaml;
  } catch (e) {
    vscode.window.showErrorMessage("Keys could not be resorted: " + e.message);
    return null;
  }
}

export function validateYamlWrapper() {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    validateYaml(activeEditor.document.getText())!;
  }
}

export function validateYaml(yaml: string) {
  try {
    const doc = yamlParser.safeLoad(yaml);
    vscode.window.showInformationMessage("YAML is valid.");
    return true;
  } catch (e) {
    vscode.window.showErrorMessage("YAML is invalid: " + e.message);
    return false;
  }
}
