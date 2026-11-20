/*
 * Recognizes comments in single lines of yaml.
 */

/**
 * @param line A line of yaml.
 * @returns True if the whole line is a comment.
 */
export const isLineComment = (line: string): boolean => /^ *#/.test(line)

/**
 * A quote only starts a quoted value at the beginning of a value, e.g. after `key: `, `- ` or `[`.
 * Elsewhere it is part of a plain value, like the apostrophe in `key: it's`.
 */
const startsValue = (line: string, index: number): boolean => index === 0 || /[\s[{,]/.test(line[index - 1])

/**
 * Finds the comment at the end of a line, ignoring `#` inside quoted values.
 * @param line A line of yaml.
 * @returns The comment starting with `#`, or undefined if the line has none.
 */
export const getInlineComment = (line: string): string | undefined => {
  let quote: string | undefined

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (quote !== undefined) {
      if (quote === "\"" && char === "\\") {
        // skip the escaped character, e.g. \"
        i++
      } else if (quote === "'" && char === "'" && line[i + 1] === "'") {
        // '' is an escaped single quote
        i++
      } else if (char === quote) {
        quote = undefined
      }
    } else if ((char === "\"" || char === "'") && startsValue(line, i)) {
      quote = char
    } else if (char === "#" && i > 0 && (line[i - 1] === " " || line[i - 1] === "\t")) {
      return line.slice(i)
    }
  }

  return undefined
}
