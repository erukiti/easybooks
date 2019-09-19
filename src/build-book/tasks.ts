import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import unified from 'unified'
import mkdirp from 'mkdirp'
import vFile from 'vfile'
import yaml from 'js-yaml'

import { Catalog } from './config'
import { copyFileRecursive } from '../files'
import mdastToReviewPlugin from '../easybooks-ast/review-stringify'
import { parseMarkdown, importSource } from '../easybooks-ast/markdown'

export const toDesination = (filename: string) => path.join('.review', filename)

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const copyFile = promisify(fs.copyFile)

const review = unified().use(mdastToReviewPlugin)

export const convert = async (src: string, dest: string) => {
  const markdownText = await readFile(src, { encoding: 'utf-8' })
  const root = await parseMarkdown(markdownText)
  await importSource(root)
  console.log('wrote:', dest)
  mkdirp.sync(path.dirname(dest))
  await writeFile(
    dest,
    review.stringify(
      root,
      vFile({ data: path.basename(dest).replace(/\.[a-zA-Z0-9]+$/, '') }),
    ),
    {
      encoding: 'utf-8',
    },
  )
}

export const writeYaml = async (filename: string, data: any) => {
  console.log('wrote:', filename)
  mkdirp.sync(path.dirname(filename))
  await writeFile(filename, yaml.dump(data))
}

export const createCatalog = (catalog: Catalog) => {
  const tasks: Promise<any>[] = []
  Object.keys(catalog).map(key => {
    catalog[key] = catalog[key].map(filename => {
      if (filename.endsWith('.md')) {
        const reviewFilename = filename.replace(/\.md$/, '.re')
        tasks.push(convert(filename, toDesination(reviewFilename)))
        return reviewFilename
      } else {
        const copy = async () => {
          console.log('copyed:', toDesination(filename))
          await copyFile(filename, toDesination(filename))
        }
        tasks.push(copy())
        return filename
      }
    })
  })

  return { catalog, tasks }
}

export const copyTemplates = async (templates: string[]) => {
  if (templates.length === 0) {
    return
  }
  await Promise.all(
    templates.map(dir => copyFileRecursive(dir, toDesination(dir))),
  )
}
