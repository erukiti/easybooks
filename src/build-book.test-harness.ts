import fs from 'fs'
import os from 'os'
import path from 'path'
import { promisify } from 'util'
import childProcess from 'child_process'

import yaml from 'js-yaml'

import { createEasyBooksBuilderLocal } from './services'
import { Config } from './ports/build-book'
import { Presentation } from './ports/presentation'

const mkdtemp = promisify(fs.mkdtemp)
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

test('review is installed?', () => {
  const version = childProcess.execSync('review version').toString()
  const [major, minor, patch] = version
    .split('.')
    .map(n => Number.parseInt(n))
  expect(major).toBeGreaterThanOrEqual(3)
})

jest.setTimeout(1000 * 100)

describe('buildBook test harness', () => {
  let tmpDir: string
  let reviewDir: string
  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'easybooks-'))
    reviewDir = path.join(tmpDir, '.review')
    console.log('test dir:', tmpDir)
  })

  test('', async () => {
    const pres: Presentation = {
      progress: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
    const conf: Config = {
      aut: ['なまえ'],
      texstyle: ['reviewmacro'],
      catalog: { CHAPS: ['hoge.md'] },
      sty_templates: {
        url:
          'https://github.com/TechBooster/ReVIEW-Template/archive/2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa.zip',
        dir:
          'ReVIEW-Template-2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa/articles/sty/',
      },
      review_version: '3.0',
    } as any
    const preTasks = [
      writeFile(
        path.join(tmpDir, 'hoge.md'),
        [
          '# hoge',
          'hoge',
          '```js {src=https://raw.githubusercontent.com/erukiti/easybooks/8b5168316d46504161dfb377fb9f4d3faa80b621/src/build-book.ts#L2-L3}',
          '```',
        ].join('\n'),
        {
          encoding: 'utf-8',
        },
      ),
    ]
    await Promise.all(preTasks)
    const { buildPdf } = await createEasyBooksBuilderLocal(
      conf,
      tmpDir,
      pres,
    )
    await buildPdf()

    expect(
      yaml.safeLoad(
        await readFile(path.join(reviewDir, 'catalog.yml'), {
          encoding: 'utf-8',
        }),
      ),
    ).toEqual({ CHAPS: ['hoge.re'] })

    expect(
      yaml.safeLoad(
        await readFile(path.join(reviewDir, 'config.yml'), {
          encoding: 'utf-8',
        }),
      ),
    ).toEqual({
      aut: ['なまえ'],
      texstyle: ['reviewmacro'],
      review_version: '3.0',
    })

    expect(
      readFile(path.join(reviewDir, 'hoge.re'), { encoding: 'utf-8' }).then(
        text =>
          text
            .split('\n')
            .filter(line => line)
            .join('\n'),
      ),
    ).resolves.toEqual(
      [
        '= hoge',
        'hoge',
        '//listnum[hoge-000][][js]{',
        `import * as fs from 'fs'`,
        `import * as path from 'path'`,
        '//}',
      ].join('\n'),
    )

    const st = await stat(path.join(reviewDir, 'example.pdf'))
    expect(st.isFile()).toBeTruthy()
    expect(st.size).toBeGreaterThan(1000)
  })
})

// describe('debugBook test harness', () => {
//   let tmpDir: string
//   beforeEach(async () => {
//     tmpDir = await mkdtemp(path.join(os.tmpdir(), 'easybooks-'))
//   })

//   test('', async () => {
//     const conf = JSON.stringify({
//       aut: ['なまえ'],
//       texstyle: ['reviewmacro'],
//       catalog: { CHAPS: ['hoge.md'] },
//       sty_templates: {
//         url:
//           'https://github.com/TechBooster/ReVIEW-Template/archive/2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa.zip',
//         dir:
//           'ReVIEW-Template-2cde584d33e8a6f5e6cf647e62fb6b3123ce4dfa/articles/sty/',
//       },
//       review_version: 3.0,
//     })
//     const preTasks = [
//       writeFile(path.join(tmpDir, 'test.json'), conf, {
//         encoding: 'utf-8',
//       }),
//       writeFile(path.join(tmpDir, 'hoge.md'), '# hoge\n\0x11hoge', {
//         encoding: 'utf-8',
//       }),
//     ]
//     await Promise.all(preTasks)
//     process.chdir(tmpDir)
//     const { code, data } = await debugBook(path.join(tmpDir, 'test.json'), )

//     const errorHints = data
//       .split('\n')
//       .find((line: string) => /\.\/.+\.tex:[0-9]+/.test(line))

//     expect(code).toBe(1)
//     expect(data).toMatch(/ERROR: review-pdfmaker: failed to run command: /)
//     // console.log(errorHints)
//   })
// })
