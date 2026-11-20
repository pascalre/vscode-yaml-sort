import { readFileSync, writeFileSync } from "fs"

import { YamlOperations, sortDocuments } from "./document-transformer"
import { YamlSorter } from "./yaml-sorter"

/**
 * Sorts all yaml documents of a file and writes the result back, if it differs.
 * A trailing line break of the original file is retained (see #186).
 * @param file Path of the file.
 * @param yaml Yaml operations, injectable for tests.
 * @throws Error if the file cannot be read, is not valid yaml or cannot be sorted.
 */
export const sortFile = (file: string, yaml: YamlOperations = new YamlSorter()): void => {
  const text = readFileSync(file, "utf-8")
  let sorted = sortDocuments(text, { customSort: 0, isSelection: false }, yaml)
  if (text.endsWith("\n") && !sorted.endsWith("\n")) {
    sorted += "\n"
  }
  // an unchanged file keeps its modification time, so watchers and build tools are not triggered
  if (sorted !== text) {
    writeFileSync(file, sorted)
  }
}
