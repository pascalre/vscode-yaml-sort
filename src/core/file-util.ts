import { join } from "path"

import { sync } from "glob"

import { Settings } from "./settings"

export class FileUtil {
  settings: Settings

  constructor(settings = new Settings()) {
    this.settings = settings
  }

  /**
   * Finds all files with one of the configured extensions in a directory and its subdirectories.
   * @param path Directory to search.
   * @returns Paths of the files, starting with the given directory.
   */
  getFiles(path: string): string[] {
    // the directory is passed as cwd instead of being part of the pattern: glob treats a backslash
    // in a pattern as an escape character, so a windows path like C:\project would match nothing
    return this.settings.getExtensions().flatMap((extension) =>
      sync(`**/*.${extension}`, { cwd: path, dot: true }).map((file) => join(path, file))
    )
  }
}
