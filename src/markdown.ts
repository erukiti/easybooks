import unified from 'unified'

import parse from 'remark-parse'
import math from 'remark-math'
import hljs from 'remark-highlight.js'
import breaks from 'remark-breaks'
import katex from 'remark-html-katex'
import html from 'remark-html'
import frontmatter from 'remark-frontmatter'
import stringify from 'remark-stringify'

import MDAST from 'mdast'
import Unist from 'unist'

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
  return markdown.parse(vfile) as MDAST.Root
}

export const stringifyHtml = (node: Unist.Node, vfile?: string) =>
  unified()
    .use(html)
    .stringify(node, vfile)

export const stringifyMarkdown = (node: Unist.Node, vfile?: string) =>
  markdown.stringify(node, vfile)
