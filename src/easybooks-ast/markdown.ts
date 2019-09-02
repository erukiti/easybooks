import unified from 'unified'

import parse from 'remark-parse'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'
import frontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'

import * as EBAST from './ebast'
import mdToEb from './md-to-eb'

export const markdown = unified()
  .data('settings', { footnotes: true, gfm: true })
  .use(parse)
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(frontmatter, ['yaml'])
  .use(stringify)

const toEb = unified().use(mdToEb)

export const parseMarkdown = (vfile: string) => {
  const md = markdown.parse(vfile)
  toEb.runSync(md)
  return md as EBAST.Node
}

export const stringifyHtml = (node: EBAST.Node, vfile?: string) =>
  unified()
    .use(html)
    .stringify(node, vfile)

export const stringifyMarkdown = (node: EBAST.Node, vfile?: string) =>
  markdown.stringify(node, vfile)
