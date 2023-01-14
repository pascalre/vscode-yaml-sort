import { throws } from "assert"
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

  readFile(file: string) {
    return readFileSync(file, this.encoding).toString()
  }

  sortFile(file: string) {
    const text = readFileSync(file, this.encoding).toString()
    const sortedYaml = new YamlUtil().sortYaml(text, 0)

    if (sortedYaml) {
      writeFileSync(file, sortedYaml)
    } else {
      throws
    }
  }
}
