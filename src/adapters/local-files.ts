import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import mkdirp from 'mkdirp'

import { ProjectFilesPortFactory } from '../ports/project-files'

const copyFile = promisify(fs.copyFile)
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * dir で指定したディレクトリ以下にあるファイルを
 * 再帰的に全て取得する
 * @param dir - ディレクトリ名（相対・絶対指定可）
 * @returns ファイル名一覧
 */
export const readProjectDirRecursive = async (
  dir: string,
): Promise<string[]> => {
  const entries = await readDir(dir, { withFileTypes: true })
  return ([] as string[]).concat(
    ...(await Promise.all(
      entries.map(async entry => {
        const filename = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          return readProjectDirRecursive(filename)
        } else {
          return [filename]
        }
      }),
    )),
  )
}

/**
 * srcDir以下の全部ファイルをそのままdestDir以下にコピーする
 * ディレクトリが無い場合は自動で作成される
 * @param srcDir - コピー元ディレクトリ名（相対・絶対指定可）
 * @param destDir - コピー先ディレクトリ名（相対・絶対指定可）
 */
export const copyFileRecursive = async (
  srcDir: string,
  destDir: string,
) => {
  const s = path.resolve(srcDir)
  const d = path.resolve(destDir)
  const entries = await readProjectDirRecursive(s)
  await Promise.all(
    entries.map(name => {
      const destName = path.join(d, name.substring(s.length))
      mkdirp.sync(path.dirname(destName))
      return copyFile(name, destName)
    }),
  )
}

export interface LocalFilesContext {
  projectDir: string
  reviewDir?: string
}

export const createLocalFilesPort: ProjectFilesPortFactory<
  LocalFilesContext
> = context => {
  const projectDir = path.resolve(context!.projectDir)
  const reviewDir =
    context!.reviewDir || path.resolve(projectDir, '.review')

  const toDestination = (relativeName: string) => {
    return path.join(reviewDir, relativeName)
  }

  mkdirp.sync(reviewDir)
  return {
    readProjectDirRecursive,
    readFileFromProject: (filename: string) =>
      readFile(path.join(projectDir, filename), {
        encoding: 'utf-8',
      }),
    writeFileToDisk: (relativeName: string, content: string | Buffer) => {
      const filename = toDestination(relativeName)
      mkdirp.sync(path.dirname(filename))
      return writeFile(filename, content)
    },
    exportFileToDisk: (filename: string) => {
      return copyFile(
        path.join(projectDir, filename),
        toDestination(filename),
      )
    },
    exportFilesToDiskRecursive: (name: string) => {
      return copyFileRecursive(
        path.join(projectDir, name),
        toDestination(name),
      )
    },
    getExportPath: () => reviewDir,
  }
}
