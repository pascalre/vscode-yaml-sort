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
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_1", () => {
    sortYamlWrapper(1);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_2", () => {
    sortYamlWrapper(2);
  }));
  context.subscriptions.push(vscode.commands.registerCommand("vscode-yaml-sort.customSortYaml_3", () => {
    sortYamlWrapper(3);
  }));
}

export function splitYaml(unsplittedYaml: string) {
  return unsplittedYaml.split("---\n").filter((obj) => obj);
}

export function sortYamlWrapper(customSort: number = 0) {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    // Todo: set cursor at first position on this line
    activeEditor.selection.start.line


    let doc = activeEditor.document.getText(activeEditor.selection);
    if (activeEditor.selection.isEmpty) {
      doc = activeEditor.document.getText();
    }

    // sort yaml
    let newText = "";
    splitYaml(doc).forEach(function (unsortedYaml){
      if (sortYaml(unsortedYaml, customSort)) {
        newText += "---\n" + sortYaml(unsortedYaml, customSort)!;
      }
    });

    // remove leading dashes
    if ((!vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes")) || !(activeEditor.selection.isEmpty)) {
      newText = newText.replace("---\n", "");
    }

    // update yaml
    if (newText) {
      if (activeEditor.selection.isEmpty) {
        activeEditor.edit((builder) => builder.replace(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(activeEditor!.document.lineCount  + 1, 0)), newText));
      } else {
        activeEditor.edit((builder) => builder.replace(activeEditor.selection, newText));
      }
    }
  }
}

export function sortYaml(unsortedYaml: string, customSort: number = 0) {
  try {
    const doc = yamlParser.safeLoad(unsortedYaml);
    let sortedYaml = "";

    if (customSort > 0) {
      let keywords = [""];

      switch (customSort) {
        case 1:
          keywords = vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_1") as [string];
          break;
        case 2:
          keywords = vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_2") as [string];
          break;
        case 3:
          keywords = vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_3") as [string];
          break;
        default: keywords = [];
      }

      keywords.forEach((key) => {
        if (doc[key]) {
          let sortedSubYaml = yamlParser.safeDump(doc[key], {
            lineWidth: vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
            sortKeys: true,
          });
          // when key cotains more than one line, we need some transformation:
          // add a new line and indent each line 2 spaces
          let colon = ": ";
          if (sortedSubYaml.includes(":")) {
            sortedSubYaml = "\n  " + sortedSubYaml.split("\n").join("\n  ");
            sortedSubYaml = sortedSubYaml.substring(0, sortedSubYaml.length - 2);
            colon = ":";
          }
          sortedYaml += key + colon + sortedSubYaml;
        }
        // delete key from yaml
        delete doc[key];
      });
    }

    if (Object.getOwnPropertyNames(doc).length === 0) return sortedYaml;

    // either sort whole yaml or sort the rest of the yaml and add it to the sortedYaml
    sortedYaml += yamlParser.safeDump(doc, {
        indent: vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent"),
        lineWidth: vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
        sortKeys: true,
    });
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
