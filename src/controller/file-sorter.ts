import { readFileSync, writeFileSync } from "fs"

import { Uri } from "vscode"

import { YamlOperations, sortDocuments } from "./document-transformer"
import { Severity, VsCodeAdapter } from "../adapter/vs-code-adapter"
import { Settings } from "../settings"
import { ErrorUtil } from "../util/error-util"
import { FileUtil } from "../util/file-util"
import { YamlUtil } from "../util/yaml-util"

/**
 * Sorts all yaml documents of a file and writes the result back.
 * A trailing line break of the original file is retained (see #186).
 * @param file Path of the file.
 * @param yaml Yaml operations, injectable for tests.
 * @throws Error if the file cannot be read, is not valid yaml or cannot be sorted.
 */
export const sortFile = (file: string, yaml: YamlOperations = new YamlUtil()): void => {
  const text = readFileSync(file, "utf-8")
  let sorted = sortDocuments(text, { customSort: 0, isSelection: false }, yaml)
  if (sorted === null) {
    throw new Error(`File ${file} could not be sorted`)
  }
  if (text.endsWith("\n") && !sorted.endsWith("\n")) {
    sorted += "\n"
  }
  writeFileSync(file, sorted)
}

/**
 * Command handler: sorts every yaml file in a directory and its subdirectories.
 * A file that cannot be sorted is reported and left unchanged; the other files are still sorted.
 * @param uri The directory selected in the explorer. Undefined when the command is run from the command palette.
 */
export const sortYamlFilesInDirectory = (uri: Uri | undefined): void => {
  const errorutil = new ErrorUtil()
  if (!uri) {
    new VsCodeAdapter().showMessage(Severity.ERROR, "Please run this command from the context menu of a folder in the explorer.")
    return
  }
  const settingsFor = (resource: Uri) => Settings.forDocument({ uri: resource, languageId: "yaml" })
  for (const file of new FileUtil(settingsFor(uri)).getFiles(uri.fsPath)) {
    try {
      sortFile(file, new YamlUtil(settingsFor(Uri.file(file))))
    } catch (error) {
      errorutil.handleError(error)
    }
  }
}
