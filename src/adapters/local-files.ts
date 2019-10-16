import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'

import mkdirp from 'mkdirp'

import { FilesPort, FilesPortFactory } from '../ports/files'

const copyFile = promisify(fs.copyFile)
const readDir = promisify(fs.readdir)

/**
 * dir で指定したディレクトリ以下にあるファイルを
 * 再帰的に全て取得する
 * @param dir - ディレクトリ名（相対・絶対指定可）
 * @returns ファイル名一覧
 */
export const readDirRecursive = async (dir: string): Promise<string[]> => {
  const entries = await readDir(dir, { withFileTypes: true })
  return ([] as string[]).concat(
    ...(await Promise.all(
      entries.map(async entry => {
        const filename = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          return readDirRecursive(filename)
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
  const entries = await readDirRecursive(s)
  await Promise.all(
    entries.map(name => {
      const destName = path.join(d, name.substring(s.length))
      mkdirp.sync(path.dirname(destName))
      return copyFile(name, destName)
    }),
  )
}

export interface LocalFilesContext {
  dir: string
}

export const createLocalFilesPort: FilesPortFactory<LocalFilesContext> = ({
  dir,
}) => {
  const writeFiles: FilesPort['writeFiles'] = async dest => {
    return copyFileRecursive(dir, dest)
  }

  return { readDirRecursive, writeFiles }
}
