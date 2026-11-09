import { readFileSync, writeFileSync } from "fs"

import { sync } from "glob"

import { Settings } from "../settings"
import { YamlUtil } from "./yaml-util"

export class FileUtil {
  settings: Settings
  encoding: BufferEncoding = "utf-8"
  globOptions = {dot: true}

  constructor(settings = new Settings()) {
    this.settings = settings
  }
 
  getFiles(path: string): string[] {
    let files: string[] = []
    for (const extension of this.settings.getExtensions()) {
      files = files.concat(sync(`${path}/**/*.${extension}`, this.globOptions))
    }
    return files
  }

  sortFile(file: string) {
    const yamlutil = new YamlUtil()
    const text = readFileSync(file, this.encoding).toString()
    let sortedYaml = yamlutil.sortYaml(text, 0)

    if (sortedYaml) {
      sortedYaml = yamlutil.setLeadingDashes(sortedYaml)
      // retain a trailing newline if the original file had one
      // see https://github.com/pascalre/vscode-yaml-sort/issues/186
      if (text.endsWith("\n") && !sortedYaml.endsWith("\n")) {
        sortedYaml += "\n"
      }
      writeFileSync(file, sortedYaml)
    } else {
      throw new Error(`File ${file} could not be sorted`)
    }
  }
}
