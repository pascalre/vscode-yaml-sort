import { Uri } from "vscode"

import { readSettings } from "./configuration"
import { ErrorReporter } from "./error-reporter"
import { Severity, VsCodeAdapter } from "./vs-code-adapter"
import { sortFile } from "../core/file-sorter"
import { YamlFileFinder } from "../core/yaml-file-finder"
import { YamlSorter } from "../core/yaml-sorter"

/**
 * Command handler: sorts every yaml file in a directory and its subdirectories.
 * A file that cannot be sorted is reported and left unchanged; the other files are still sorted.
 * @param uri The directory selected in the explorer. Undefined when the command is run from the command palette.
 */
export const sortYamlFilesInDirectory = (uri: Uri | undefined): void => {
  const errorReporter = new ErrorReporter()
  if (!uri) {
    new VsCodeAdapter().showMessage(Severity.ERROR, "Please run this command from the context menu of a folder in the explorer.")
    return
  }
  const settingsFor = (resource: Uri) => readSettings({ uri: resource, languageId: "yaml" })
  for (const file of new YamlFileFinder(settingsFor(uri)).getFiles(uri.fsPath)) {
    try {
      sortFile(file, new YamlSorter(settingsFor(Uri.file(file))))
    } catch (error) {
      errorReporter.handleError(error)
    }
  }
}
