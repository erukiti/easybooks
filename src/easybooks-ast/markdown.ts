import unified from 'unified'

import parse from 'remark-parse'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'
import frontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'
import ruby from 'remark-ruby'

import * as EBAST from './ebast'
import mdToEb from './md-to-eb'
import importPlugin from './import-source'
import { ImporterPort } from '../ports/importer'

export const markdown = unified()
  .data('settings', { footnotes: true, gfm: true })
  .use(parse)
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(frontmatter, ['yaml'])
  .use(stringify)
  .use(ruby)

const toEb = unified().use(mdToEb)

export const createImporter = (ports: { importer: ImporterPort }) => {
  const is = unified().use(importPlugin, { importerPort: ports.importer })

  const importSource = async (node: EBAST.Node) => {
    await is.run(node)
  }

  return { importSource }
}

export const parseMarkdown = async (vfile: string) => {
  const md = markdown.parse(vfile)
  await toEb.run(md)
  return md as EBAST.Node
}
