import { strictEqual, throws, deepStrictEqual, doesNotThrow } from "assert"
import { Settings } from "../../../settings"
import { FileUtil } from "../../../util/file-util"

suite("Test FileUtil - getFiles()", () => {
  const settings = new Settings()
  settings.getExtensions = function () {
    return ["yaml", "yml", "customyaml"]
  }
  const fileutil = new FileUtil(settings)

  test("should return all files", () => {
    const expected = [
      "./src/test/suite/util/resources/foo.yaml",
      "./src/test/suite/util/resources/subfolder/foo2.yaml",
      "./src/test/suite/util/resources/bar.yml",
      "./src/test/suite/util/resources/subfolder/.customyaml",
    ]
    deepStrictEqual(fileutil.getFiles("./src/test/suite/util/resources"), expected)
  })

  test("should list all files with extension *.yaml or *.yml in a directory and all its subdirectories", () => {
    const expected = [
      './src/test/files/getYamlFilesInDirectory/file.yaml',
      './src/test/files/getYamlFilesInDirectory/file2.yaml',
      './src/test/files/getYamlFilesInDirectory/folder1/file.yaml',
      './src/test/files/getYamlFilesInDirectory/folder1/file2.yaml',
      './src/test/files/getYamlFilesInDirectory/folder2/file.yaml',
      './src/test/files/getYamlFilesInDirectory/file.yml'
    ]
    deepStrictEqual(fileutil.getFiles("./src/test/files/getYamlFilesInDirectory"), expected)
  })
})

suite("Test FileUtil - readFile()", () => {
  const fileutil = new FileUtil()

  test("when `file` is a path to an existing file should return the files content", () => {
    strictEqual(fileutil.readFile("./src/test/suite/util/resources/readFile.txt"), "lorem impsum")
  })

  test("when `file` is a path to a non existing file should throw", () => {
    throws(() => fileutil.readFile("nonexistent-path"), Error)
  })
})

suite("Test FileUtil - sortFile()", () => {
  const fileutil = new FileUtil()

  test("should throw when file does not contain a valid yaml", () => {
    throws(() => fileutil.sortFile("./src/test/suite/util/resources/subfolder/foo2.yaml"))
  })

  test("should not throw when file contains a valid yaml", () => {
    doesNotThrow(() => fileutil.sortFile("./src/test/suite/util/resources/subfolder/.customyaml"))
  })
})