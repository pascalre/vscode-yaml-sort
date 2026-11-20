import { deepEqual } from "assert"

import { Settings } from "../../../core/settings"
import { YamlFileFinder } from "../../../core/yaml-file-finder"

suite("Test YamlFileFinder - getFiles()", () => {
  const settings = new Settings()
  settings.getExtensions = function () {
    return ["yaml", "yml", "customyaml"]
  }
  const fileFinder = new YamlFileFinder(settings)

  test("should return all files", () => {
    const expected = [
      "src/test/files/file-finder/foo.yaml",
      "src/test/files/file-finder/subfolder/foo2.yaml",
      "src/test/files/file-finder/bar.yml",
      "src/test/files/file-finder/subfolder/.customyaml"
    ]
    deepEqual(fileFinder.getFiles("./src/test/files/file-finder"), expected)
  })

  test("should list all files with extension *.yaml or *.yml in a directory and all its subdirectories", () => {
    const expected = [
      "src/test/files/getYamlFilesInDirectory/file2.yaml",
      "src/test/files/getYamlFilesInDirectory/file.yaml",
      "src/test/files/getYamlFilesInDirectory/folder2/file.yaml",
      "src/test/files/getYamlFilesInDirectory/folder1/file2.yaml",
      "src/test/files/getYamlFilesInDirectory/folder1/file.yaml",
      "src/test/files/getYamlFilesInDirectory/file.yml"
    ]
    deepEqual(fileFinder.getFiles("./src/test/files/getYamlFilesInDirectory"), expected)
  })
})
