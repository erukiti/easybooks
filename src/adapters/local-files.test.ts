import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

import { copyFileRecursive } from './local-files'

const mkdtemp = promisify(fs.mkdtemp)
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

test('copyFileRecursive', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'easybooks-'))
  await mkdir(path.join(tmpDir, 'a'))
  await writeFile(path.join(tmpDir, 'a', 'hoge.txt'), 'hoge\n')
  await mkdir(path.join(tmpDir, 'a', 'fuga'))
  await writeFile(
    path.join(tmpDir, 'a', 'fuga', 'piyo.bin'),
    Buffer.from([0, 1, 2, 3, 4, 5]),
  )

  await copyFileRecursive(path.join(tmpDir, 'a'), path.join(tmpDir, 'b'))

  expect(
    await readFile(path.join(tmpDir, 'b', 'hoge.txt'), {
      encoding: 'utf-8',
    }),
  ).toBe('hoge\n')
  expect(
    await readFile(path.join(tmpDir, 'b', 'fuga', 'piyo.bin')),
  ).toEqual(Buffer.from([0, 1, 2, 3, 4, 5]))
})
