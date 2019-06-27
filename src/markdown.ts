import unified from 'unified'

import parse from 'remark-parse'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'
import frontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'

import * as MDAST from 'mdast'

export type MDASTNode = MDAST.Root | MDAST.Content

const markdown = unified()
  .data('settings', { footnotes: true, gfm: true })
  .use(parse)
  .use(breaks)
  .use(math)
  .use(katex)
  .use(hljs)
  .use(frontmatter, ['yaml'])
  .use(stringify)

export const parseMarkdown = (vfile: string) => {
  return markdown.parse(vfile) as MDASTNode
}

export const stringifyHtml = (node: MDASTNode, vfile?: string) =>
  unified()
    .use(html)
    .stringify(node, vfile)

export const stringifyMarkdown = (node: MDASTNode, vfile?: string) => markdown.stringify(node, vfile)
