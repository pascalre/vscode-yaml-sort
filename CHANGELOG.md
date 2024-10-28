# Changelog
# 6.6.0 - Oct 28, 2024
✨ Feature
* (refs [#225](https://github.com/pascalre/vscode-yaml-sort/issues/225)) Support sorting in reverse order

# 6.5.18 - Oct 28, 2024
📦 Dependencies
* Update dependencies to latest versions

# 6.5.17 - Apr 28, 2024
📦 Dependencies
* Update dependencies to latest versions

# 6.5.16 - Apr 3, 2024
📦 Dependencies
* Update dependencies to latest versions

# 6.5.15 - Mar 13, 2024
📦 Dependencies
* Update dependencies to latest versions

# 6.5.14 - Jan 21, 2024
📦 Dependencies
* Update dependencies to latest versions

# 6.5.13 - Jan 21, 2024
📦 Dependencies
* Update dependencies to latest versions

## 6.5.12 - Jan 21, 2024
🐛 Bugfixes
* (refs [#154](https://github.com/pascalre/vscode-yaml-sort/issues/154)) ‘{{ TEXT }} TEXT’ turns into {{ TEXT }} TEXT after sorted

📦 Dependencies
* Update dependencies to latest versions

## 6.5.11 - Jan 14, 2024
📦 Dependencies
* Update dependencies to latest versions

## 6.5.10 - Nov 19, 2023
📦 Dependencies
* Update dependencies to latest versions

## 6.5.9 - Oct 25, 2023
🐛 Bugfixes
* (refs [#159](https://github.com/pascalre/vscode-yaml-sort/issues/159)) Sort YAML Converts `00000000-0000-0000-0000-000000000001` to octal

📦 Dependencies
* Update dependencies to latest versions

## 6.5.8 - Oct 22, 2023
🐛 Bugfixes
* (refs [#149](https://github.com/pascalre/vscode-yaml-sort/issues/149)) Recursive sort not adding leading dashes to file
* (refs [#164](https://github.com/pascalre/vscode-yaml-sort/issues/164)) Comment processor duplicates comments inside block scalars

📦 Dependencies
* Update dependencies to latest versions

## 6.5.7 - Oct 21, 2023
📦 Dependencies
* Update dependencies to latest versions

## 6.5.6 - Sep 13, 2023
📦 Dependencies
* Update dependencies to latest versions

## 6.5.5 - Aug 20, 2023
🐛 Bugfixes
* (refs [#134](https://github.com/pascalre/vscode-yaml-sort/issues/134)) Breaks with multiline strings

📦 Dependencies
* Update dependencies to latest versions

## 6.5.4 - Aug 13, 2023
📦 Dependencies
* Update dependencies to latest versions

## 6.5.3 - May 29, 2023
📦 Dependencies
* Update dependencies to latest versions

## 6.5.2 - May 1, 2023
🐛 Bugfixes
* (refs [#129](https://github.com/pascalre/vscode-yaml-sort/issues/129)) False remove trailing quotes by Array Processor

📦 Dependencies
* Update dependencies to latest versions

## 6.5.1 - April 21, 2023
🐛 Bugfixes
* (refs [#126](https://github.com/pascalre/vscode-yaml-sort/issues/126)) YAML with HTML tags breaks in v6.5.0

📦 Dependencies
* Update dependencies to latest versions

## 6.5.0 - February 28, 2023
* (refs [#62](https://github.com/pascalre/vscode-yaml-sort/issues/62)) Add support for block sequences
* Update dependencies to latest versions

## 6.4.1 - February 25, 2023
* (refs [#122](https://github.com/pascalre/vscode-yaml-sort/issues/122)) emptyLinesUntilLevel stopped working
* Update dependencies to latest versions

## 6.4.0 - February 11, 2023
* (refs [#51](https://github.com/pascalre/vscode-yaml-sort/issues/51)) Add support for sorting arrays
* Add setting `sortArrays`
* Update dependencies to latest versions

## 6.3.0 - February 6, 2023
* (refs [#27](https://github.com/pascalre/vscode-yaml-sort/issues/36)) Add support for octal values
* Update dependencies to latest versions

## 6.2.0 - January 26, 2023
* (refs [#27](https://github.com/pascalre/vscode-yaml-sort/issues/36)) Add support for single line arrays
* Update dependencies to latest versions

## 6.1.0 - January 18, 2023
* (refs [#27](https://github.com/pascalre/vscode-yaml-sort/issues/27)) Add support for Helm charts

## 6.0.3 - January 16, 2023
* (refs [#45](https://github.com/pascalre/vscode-yaml-sort/issues/45)) Fix issues with keeping comments while sorting
* Update dependencies to latest versions

## 6.0.2 - January 4, 2023
* (refs [#48](https://github.com/pascalre/vscode-yaml-sort/issues/48)) error in Recursively sort
* New configuration `extensions` enables recursive sorting of files with unusual extension
* Update dependencies to latest versions

## 6.0.1 - December 6, 2022
* (refs [#98](https://github.com/pascalre/vscode-yaml-sort/issues/98)) Refactor project
* Update dependencies to latest versions

## 6.0.0 - October 4, 2022
* (refs [#85](https://github.com/pascalre/vscode-yaml-sort/issues/85)) Is custom sort on save planned?
* New default for `sortOnSave` allows to specify custom sort for auto-saving
* Update dependencies to latest versions

## 5.5.0 - September 29, 2022
* (refs [#65](https://github.com/pascalre/vscode-yaml-sort/issues/65)) No need to send notification when used as a formatter
* New configuration `notifySuccess`
* Update dependencies to latest versions

## 5.4.2 - September 26, 2022
* Minor bugfix for ([#45](https://github.com/pascalre/vscode-yaml-sort/issues/45)): Handle multiline comments

## 5.4.1 - September 26, 2022
* Minor bugfix for ([#45](https://github.com/pascalre/vscode-yaml-sort/issues/45)): Comments caused blank line

## 5.4.0 - September 26, 2022
* (refs [#45](https://github.com/pascalre/vscode-yaml-sort/issues/45)) Keep comments in the yaml file
* Update dependencies to latest versions

## 5.3.3 - September 19, 2022
* Update dependencies to latest versions

## 5.3.2 - July 03, 2022
* Update dependencies to latest versions

## 5.3.1 - April 08, 2022
* Update dependencies to latest versions

## 5.3.0 - April 02, 2022
* (refs [#38](https://github.com/pascalre/vscode-yaml-sort/issues/38)) How to sort on save?
* New configuration `sortOnSave`

## 5.2.2 - March 31, 2022
* Fix [CVE-2021-44906](https://nvd.nist.gov/vuln/detail/CVE-2021-44906)

## 5.2.1 - March 21, 2022
* (refs [#44](https://github.com/pascalre/vscode-yaml-sort/issues/44)) Fix: emptyLinesUntilLevel doesn't work with keys containing spaces
* Update dependencies to latest versions

## 5.2.0 - March 16, 2022
* (refs [#42](https://github.com/pascalre/vscode-yaml-sort/issues/42)) Add support for Home Assistant schema

## 5.1.6 - March 14, 2022
* Refresh extension logo

## 5.1.5 - March 14, 2022
* Slightly increase test coverage
* Update dependencies to latest versions

## 5.1.4 - March 9, 2022
* Fix test coverage report

## 5.1.3 - March 6, 2022
* Update dependencies to latest versions

## 5.1.2 - October 30, 2021
* Minor documentation improvements
* Update dependencies to latest versions

## 5.1.1 - October 14, 2021
* Minor visual improvements
* Update dependencies to latest versions

## 5.1.0 - August 29, 2021
* (refs [#29](https://github.com/pascalre/vscode-yaml-sort/issues/29)) Support multiple yaml documents when formatting

## 5.0.1 - August 29, 2021
* (refs [#35](https://github.com/pascalre/vscode-yaml-sort/issues/35)) Fix: emptyLinesUntilLevel doesn't work with keys containing dashes
* Update dependencies to latest versions

## 5.0.0 - July 10, 2021
* (refs [#34](https://github.com/pascalre/vscode-yaml-sort/issues/34)) Make formatter configurable
* Default YAML formatter is disabled by default. Use `vscode-yaml-sort.useAsFormatter` to activate it.

## 4.2.0 - June 17, 2021
* (refs [#30](https://github.com/pascalre/vscode-yaml-sort/issues/30)) Use as formatter
* Old command `Format YAML` is replaced by built in command `Format document`. Formatting documents is also possible with default formatting shortcut or on document save.

## 4.1.1 - June 16, 2021
* Fix [CVE-2020-28469](https://nvd.nist.gov/vuln/detail/CVE-2020-28469)
* Fix [CVE-2021-33502](https://nvd.nist.gov/vuln/detail/CVE-2021-33502)

## 4.1.0 - April 28, 2021
* (refs [#26](https://github.com/pascalre/vscode-yaml-sort/issues/26)) Un-quoted "on" and "off" strings are quoted after sorting YAML
* New configuration `noCompatMode`

## 4.0.0 - March 13, 2021
* (refs [#25](https://github.com/pascalre/vscode-yaml-sort/issues/25)) Sort using localeCompare
* New configuration `locale` allows to define which language to use when sorting

## 3.3.0 - March 3, 2021
* (refs [#23](https://github.com/pascalre/vscode-yaml-sort/issues/23)) CloudFormation Friendly

## 3.2.0 - March 2, 2021
* (refs [#24](https://github.com/pascalre/vscode-yaml-sort/issues/24)) Unexpected date string format
* New configuration `schema`

## 3.1.1 - February 27, 2021
* The configuration `useQuotesForSpecialKeywords` is no longer supported
* Fix command `sortYamlFilesInDirectory`

## 3.1.0 - February 4, 2021
* (refs [#2](https://github.com/pascalre/vscode-yaml-sort/issues/2)) Sort all files in directory
* New command `sortYamlFilesInDirectory` allows to sort all yaml files in a directory.

## 3.0.0 - Januar 31, 2021
* (refs [#21](https://github.com/pascalre/vscode-yaml-sort/issues/21)) Add new line after 2nd/Nth level key
* The configuration `addNewLineAfterTopLevelKey` is no longer supported
* New configuraion `emptyLinesUntilLevel` with the defaults of `0` replaces `addNewLineAfterTopLevelKey`.

## 2.8.0 - Januar 27, 2021
* (refs [#17](https://github.com/pascalre/vscode-yaml-sort/issues/17)) Force quotes on strings when sorting
* New configuration `forceQuotes` makes it possible to force quotation of keywords.
* New configuration `quotingType` allows the user to choose between `'` or `"` as quoting type.

## 2.7.3 - Januar 27, 2021
* Fix [CVE-2020-7788](https://nvd.nist.gov/vuln/detail/CVE-2020-7788)
* Use dependency `js-yaml` in version 4.0.0

## 2.7.2 - October 31, 2020
* (ref [#16](https://github.com/pascalre/vscode-yaml-sort/issues/16)) Unable to sort a multi document yaml file

## 2.7.1 - October 24, 2020
* (refs [#10](https://github.com/pascalre/vscode-yaml-sort/issues/10)) Use custom sort recursively on the whole file
* Fix wrong name of new configuration

## 2.7.0 - October 14, 2020
* (refs [#10](https://github.com/pascalre/vscode-yaml-sort/issues/10)) Use custom sort recursively on the whole file
* New configuration `useCustomSortRecursively` will use the custom sort keywords recursively on a file, when using custom sort

## 2.6.0 - September 28, 2020
* (refs [#11](https://github.com/pascalre/vscode-yaml-sort/issues/11)) support line breaks
* New configuration `addNewLineAfterTopLevelKey` makes it possible to add a line break between top level keywords.

## 2.5.0 - September 27, 2020
* Update manual
* Fix disappearing characters in custom sort

## 2.4.0 - September 26, 2020
* Fix [CVE-2020-8203](https://nvd.nist.gov/vuln/detail/CVE-2020-8203)
* Fix [CVE-2020-8244](https://nvd.nist.gov/vuln/detail/CVE-2020-8244)

## 2.3.2 - September 26, 2020
* (refs [#9](https://github.com/pascalre/vscode-yaml-sort/issues/9)) Sorting tab indented yaml removes code
* (refs [#12](https://github.com/pascalre/vscode-yaml-sort/issues/12)) Trying to sort a nested dictionary results in removing it completely
* (refs [#13](https://github.com/pascalre/vscode-yaml-sort/issues/13)) Sort drops value from key, when key in custom sort list
* Refactor code and add more test cases

## 2.3.1 - April 4, 2020
* Fix [CVE-2020-7598](https://nvd.nist.gov/vuln/detail/CVE-2020-7598)

## 2.3.0 - December 1, 2019
* (refs [#6](https://github.com/pascalre/vscode-yaml-sort/issues/6)) Support sorting files with delimiters with comment

## 2.2.0 - November 3, 2019
* New command `Format YAML` allows to format yaml without sorting.
* New configuration `noArrayIndent`
* New configuration `useQuotesForSpecialKeywords`
* Refactor code and add more test cases

## 2.1.0 - October 26, 2019
* Add the possibility to sort only a selection.

## 2.0.1 - October 22, 2019
* (refs [#8](https://github.com/pascalre/vscode-yaml-sort/issues/8)) Configurable manual sort order
* Fix the data type of `customSortKeywords`.

## 2.0.0 - October 11, 2019
* (refs [#8](https://github.com/pascalre/vscode-yaml-sort/issues/8)) Configurable manual sort order
* The command `Sort Kubernetes Configmap` is no longer supported
* New command `Custom Sort 1` with the defaults of `customSortKeywords_1` replaces `Sort Kubernetes Configmap`.
* New configuration `customSortKeywords_1`

## 1.3.0 - September 29, 2019
* (refs [#7](https://github.com/pascalre/vscode-yaml-sort/issues/7)) Support multiple yaml documents when sorting

## 1.2.0 - June 25, 2019
* (refs [#3](https://github.com/pascalre/vscode-yaml-sort/issues/3)) kubernetes friendly sort

## 1.1.0 - June 17, 2019
* (refs [#5](https://github.com/pascalre/vscode-yaml-sort/issues/5)) Allow for configuration of line length

## 1.0.1 - June 15, 2019
* (refs [#1](https://github.com/pascalre/vscode-yaml-sort/issues/1)) Sort happens only once in editor life

## 1.0.0 - May 9, 2019
* Initial Release