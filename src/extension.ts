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
  // This function splits a string containing multiple yamls (seperated by ---\n).
  return unsplittedYaml.split("---\n").filter((obj) => obj);
}

export function removeTrailingCharacters(text: string, count: number = 1) {
  if (count < 0 || count > text.length)
    throw new Error("The count parameter is not in a valid range");

  return text.substr(0, text.length - count);
}

export function prependWhitespacesOnEachLine(text: string, count: number) {
  if (count < 0)
    throw new Error("The count parameter is not a positive number");

  let spaces = " ".repeat(count);
  return text.replace(/^/mg, spaces);
}

export function isSelectionInvalid(text: string) {
  // remove trailing whitespaces, to check for things like 'text:  '
  text = text.trim();
  const notValidEndingCharacters = [':', '|', '>'];
  if (notValidEndingCharacters.includes(text.charAt(text.length-1)))
    return true;
  return false;
}

export function dumpYaml(text: string) {
  return yamlParser.safeDump(text, {
    indent:    vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent"),
    lineWidth: vscode.workspace.getConfiguration().get("vscode-yaml-sort.lineWidth"),
    sortKeys:  true,
  }) as string;
}

export function getCustomSortKeywords(number: number) {
  // Maybe more beautiful:
  // if ([1, 2, 3].includes(number)) return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_" + number) as [string];
  // throw new Error("The count parameter is not in a valid range");

  switch (number) {
    case 1:
      return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_1") as [string];
    case 2:
      return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_2") as [string];
    case 3:
      return vscode.workspace.getConfiguration().get("vscode-yaml-sort.customSortKeywords_3") as [string];
    default: throw new Error("The count parameter is not in a valid range");
  }
}

export function sortYamlWrapper(customSort: number = 0) {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    let rangeToBeReplaced = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(activeEditor!.document.lineCount + 1, 0));
    let doc = activeEditor.document.getText();
    let numberOfLeadingSpaces = 0;

    if (!activeEditor.selection.isEmpty) {
      // ensure that selection covers whole start and end line
      rangeToBeReplaced = new vscode.Selection(activeEditor.selection.start.line, 0, activeEditor.selection.end.line, activeEditor.document.lineAt(activeEditor.selection.end.line).range.end.character);
      doc = activeEditor.document.getText(rangeToBeReplaced);

      // check if selection to sort is valid, maybe the user missed a trailing line
      if (isSelectionInvalid(doc)) {
        vscode.window.showErrorMessage("YAML selection is invalid. Please check the ending of your selection.");
        return false;
      }
      // get number of leading whitespaces, these whitespaces will be prepend to the document after sorting
      numberOfLeadingSpaces = doc.search(/\S/);
    }

    // sort yaml
    let newText = "";
    splitYaml(doc).forEach(function (unsortedYaml){
      if (sortYaml(unsortedYaml, customSort)) {
        newText += "---\n" + sortYaml(unsortedYaml, customSort)!;
      }
    });

    // remove leading dashes
    if (!activeEditor.selection.isEmpty || !vscode.workspace.getConfiguration().get("vscode-yaml-sort.useLeadingDashes")) {
      newText = newText.replace("---\n", "");
    }

    if (!activeEditor.selection.isEmpty) {
      newText = prependWhitespacesOnEachLine(newText, numberOfLeadingSpaces);
    }

    // update yaml
    activeEditor.edit((builder) => builder.replace(rangeToBeReplaced, newText));
  }
}

export function sortYaml(unsortedYaml: string, customSort: number = 0) {
  try {
    const doc = yamlParser.safeLoad(unsortedYaml);
    let sortedYaml = "";

    if (customSort > 0) {
      let keywords = getCustomSortKeywords(customSort);

      keywords.forEach((key) => {
        if (doc[key]) {
          let sortedSubYaml = dumpYaml(doc[key]);
          if (sortedSubYaml.includes(":") && !sortedSubYaml.startsWith("|")) {
              // when key cotains more than one line, we need some transformation:
              // add a new line and indent each line some spaces
              sortedSubYaml = prependWhitespacesOnEachLine(sortedSubYaml, vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent") as number);
              sortedSubYaml = removeTrailingCharacters(sortedSubYaml, vscode.workspace.getConfiguration().get("vscode-yaml-sort.indent") as number);
              sortedYaml += key + ":\n" + sortedSubYaml;
          } else {
            sortedYaml += key + ": " + sortedSubYaml;
          }
        }
        // delete key from yaml
        delete doc[key];
      });
    }

    // return, if no keywords are left and remove trailing line break
    if (Object.getOwnPropertyNames(doc).length === 0) return removeTrailingCharacters(sortedYaml);

    // either sort whole yaml or sort the rest of the yaml and add it to the sortedYaml
    sortedYaml += dumpYaml(doc);

    vscode.window.showInformationMessage("Keys resorted successfully");
    return removeTrailingCharacters(sortedYaml);
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
    yamlParser.safeLoad(yaml);
    vscode.window.showInformationMessage("YAML is valid.");
    return true;
  } catch (e) {
    vscode.window.showErrorMessage("YAML is invalid: " + e.message);
    return false;
  }
}
