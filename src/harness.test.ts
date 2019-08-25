import { buildBook } from './build-book'

import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import childProcess from 'child_process'

const mkdtemp = promisify(fs.mkdtemp)
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

test('review is installed?', () => {
  const version = childProcess.execSync('review version').toString()
  const [major, minor, patch] = version.split('.').map(n => Number.parseInt(n))
  expect(major).toBeGreaterThanOrEqual(3)
})

jest.setTimeout(1000 * 100)

describe('buildBook test harness', () => {
  let tmpDir: string
  let reviewDir: string
  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'easybooks-'))
    reviewDir = path.join(tmpDir, '.review')
    console.log(tmpDir)
  })

  test('', async () => {
    const conf = JSON.stringify({
      aut: ['なまえ'],
      texstyle: ['reviewmacro'],
      catalog: { CHAPS: ['hoge.md'] },
      sty_templates: {
        url:
          'https://github.com/TechBooster/ReVIEW-Template/archive/2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa.zip',
        dir:
          'ReVIEW-Template-2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa/articles/sty/',
      },
      review_version: 3.0,
    })
    const preTasks = [
      writeFile(path.join(tmpDir, 'test.json'), conf, {
        encoding: 'utf-8',
      }),
      writeFile(path.join(tmpDir, 'hoge.md'), '# hoge\nhoge', {
        encoding: 'utf-8',
      }),
    ]
    await Promise.all(preTasks)
    await buildBook(path.join(tmpDir, 'test.json'))
    expect(
      await readFile(path.join(reviewDir, 'catalog.yml'), {
        encoding: 'utf-8',
      }),
    ).toEqual('CHAPS:\n  - hoge.re\n')
    expect(
      await readFile(path.join(reviewDir, 'config.yml'), {
        encoding: 'utf-8',
      }),
    ).toEqual(`aut:
  - なまえ
texstyle:
  - reviewmacro
review_version: 3
`)
    const st = await stat(path.join(reviewDir, 'example.pdf'))
    expect(st.isFile()).toBeTruthy()
    expect(st.size).toBeGreaterThan(1000)
  })
})
