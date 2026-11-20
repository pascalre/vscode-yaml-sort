import { join } from "path"

import { sync } from "glob"

import { Settings } from "./settings"

/** Folders whose files belong to other projects or tools and must never be rewritten. */
const IGNORED_FOLDERS = ["**/node_modules/**", "**/.git/**"]

export class YamlFileFinder {
  settings: Settings

  constructor(settings = new Settings()) {
    this.settings = settings
  }

  /**
   * Finds all files with one of the configured extensions in a directory and its subdirectories,
   * except for installed dependencies (node_modules) and git internals.
   * @param path Directory to search.
   * @returns Paths of the files, starting with the given directory. Each file is listed once.
   */
  getFiles(path: string): string[] {
    const extensions = [...new Set(this.settings.getExtensions())]
    // the directory is passed as cwd instead of being part of the pattern: glob treats a backslash
    // in a pattern as an escape character, so a windows path like C:\project would match nothing
    return extensions.flatMap((extension) =>
      sync(`**/*.${extension}`, { cwd: path, dot: true, ignore: IGNORED_FOLDERS }).map((file) => join(path, file))
    )
  }
}
