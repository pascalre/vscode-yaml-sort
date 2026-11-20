import { doesNotThrow, equal, ok, throws } from "assert"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

import { sortFile } from "../../../core/file-sorter"

suite("Test FileSorter - sortFile()", () => {

  test("should throw when file does not contain a valid yaml", () => {
    throws(() => sortFile("./src/test/files/file-finder/subfolder/foo2.yaml"))
  })

  test("should not throw when file contains a valid yaml", () => {
    doesNotThrow(() => sortFile("./src/test/files/file-finder/subfolder/.customyaml"))
  })

  test("should retain a trailing newline when the original file has one", () => {
    const dir = mkdtempSync(join(tmpdir(), "yaml-sort-"))
    const file = join(dir, "trailing-newline.yaml")
    try {
      writeFileSync(file, "zkey: zvalue\nakey: avalue\n")
      sortFile(file)
      const sorted = readFileSync(file, "utf-8")
      ok(sorted.endsWith("\n"))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test("should not add a trailing newline when the original file has none", () => {
    const dir = mkdtempSync(join(tmpdir(), "yaml-sort-"))
    const file = join(dir, "no-trailing-newline.yaml")
    try {
      writeFileSync(file, "zkey: zvalue\nakey: avalue")
      sortFile(file)
      const sorted = readFileSync(file, "utf-8")
      ok(!sorted.endsWith("\n"))
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test("should sort every document of a file with several documents", () => {
    const dir = mkdtempSync(join(tmpdir(), "yaml-sort-"))
    const file = join(dir, "multiple-documents.yaml")
    try {
      writeFileSync(file, "b: 1\n---\nd: 1\nc: 2\n")
      sortFile(file)
      equal(readFileSync(file, "utf-8"), "---\nb: 1\n---\nc: 2\nd: 1\n")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test("should leave a file unchanged when it cannot be sorted", () => {
    const dir = mkdtempSync(join(tmpdir(), "yaml-sort-"))
    const file = join(dir, "invalid.yaml")
    try {
      writeFileSync(file, "a: [")
      throws(() => sortFile(file))
      equal(readFileSync(file, "utf-8"), "a: [")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
