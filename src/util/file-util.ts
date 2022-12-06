import * as fs from "fs"
import * as glob from "glob"

export class FileUtil {
  encoding: BufferEncoding = "utf-8"

  readFile(file: string) {
    return fs.readFileSync(file, this.encoding).toString()
  }
}

/**
 * Returns all files in a directory and its subdirectories with extension .yml or .yaml
 * @param   {string} uri Base URI
 * @returns {string[]}   List of Yaml files
 */
export function getYamlFilesInDirectory(uri: string): string[] {
  return glob.sync(uri + "/**/**.y?(a)ml")
}