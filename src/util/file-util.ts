import { readFileSync } from "fs"
import { sync } from "glob"
import { Settings } from "../settings"

export class FileUtil {
  settings: Settings
  encoding: BufferEncoding = "utf-8"
  globOptions = {dot: true}

  constructor(settings = new Settings()) {
    this.settings = settings
  }
 
  getFilesWithExtensions(path: string): string[] {
    let files: string[] = []
    for (const extension of this.settings.getExtensions()) {
      files = files.concat(sync(`${path}/**/*.${extension}`, this.globOptions))
    }
    return files
  }

  readFile(file: string) {
    return readFileSync(file, this.encoding).toString()
  }
}
