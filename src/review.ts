import * as MDAST from 'mdast'
import { MDASTNode, parseMeta } from './markdown'

interface Context {
  list: number
}

const root = (tree: MDAST.Root, context: Context) => {
  return tree.children.map(child => compiler(child, context)).join('\n')
}

const heading = (tree: MDAST.Heading, context: Context) => {
  const options: string[] = []
  const s = tree.children
    .map(child => {
      if (child.type === 'linkReference') {
        options.push(child.identifier as string)
      } else {
        return compiler(child, context)
      }
    })
    .join('')
    .trim()
  const option = options.length === 0 ? '' : `[${options.join(',')}]`
  return `${'='.repeat(tree.depth)}${option} ${s}\n`
}

const text = (tree: MDAST.Text) => {
  return tree.value
}

const paragraph = (tree: MDAST.Paragraph, context: Context) => {
  return `\n${tree.children.map(child => compiler(child, context)).join('')}\n`
}

const inlineCode = (tree: MDAST.InlineCode) => {
  return `@<code>{${tree.value}}`
}

const breakNode = () => {
  return `\n`
}

const code = (tree: MDAST.Code) => {
  const lang = tree.lang ? `[${tree.lang}]` : ''
  if (tree.lang === 'sh') {
    return `//cmd{\n${tree.value}\n//}\n`
  }

  const meta = parseMeta(tree.meta || '')

  return `//listnum[${meta.id || meta.filename || ''}][${meta.caption ||
    ''}]${lang}{\n${tree.value}\n//}\n`
}

const link = (tree: MDAST.Link, context: Context) => {
  const s = tree.children.map(child => compiler(child, context)).join('')
  return `@<href>{${tree.url}${s ? `, ${s}` : ''}}`
}

const linkReference = (tree: MDAST.LinkReference, context: Context) => {
  const [tag, id] = (tree.identifier as string).split(':')
  if (tag !== '' && id !== '') {
    return `@<${tag}>{${id}}`
  }
  throw new Error('linkRef: [tag:id] format is only supported.')
}

const list = (tree: MDAST.List, context: Context) => {
  return (
    tree.children
      .map(child => compiler(child, { ...context, list: context.list + 1 }))
      .join('') + '\n'
  )
}

const listItem = (tree: MDAST.ListItem, context: Context) => {
  return ` ${'*'.repeat(context.list)} ${tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()}\n`
}

const ignore = (tree: any, context: Context) => ''

const blockquote = (tree: MDAST.Blockquote, context: Context) => {
  return `//quote{\n${tree.children.map(child => compiler(child, context))}}\n`
}

const footnoteReference = (tree: MDAST.FootnoteReference, context: Context) => {
  return `@<fn>{${tree.identifier}}`
}

const footnoteDefinition = (
  tree: MDAST.FootnoteDefinition,
  context: Context,
) => {
  return `//footnote[${tree.identifier}][${tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()}]\n`
}

const emphasis = (tree: MDAST.Emphasis, context: Context) => {
  return `@<em>{${tree.children.map(child => compiler(child, context))}}`
}

const strong = (tree: MDAST.Strong, context: Context) => {
  return `@<strong>{${tree.children.map(child => compiler(child, context))}}`
}

const html = (tree: MDAST.HTML, context: Context) => {
  if (tree.value.startsWith('<!--')) {
    return tree.value
      .replace(/^<!--/, '')
      .replace(/-->$/, '')
      .trim()
      .split('\n')
      .map(line => `#@# ${line}`)
      .join('\n')
  } else {
    throw new Error(`supported HTML is comment only.\n${tree.value}`)
  }
}

const image = (tree: MDAST.Image, context: Context) => {
  const url = tree.url.replace(/^images\//, '').replace(/\.[a-zA-Z0-9]$/, '')
  return `//image[${url}][${tree.alt}]\n`
}

const compilers = {
  root,
  paragraph,
  heading,
  thematicBreak: ignore,
  blockquote,
  text,
  inlineCode,
  break: breakNode,
  code,
  link,
  linkReference,
  list,
  listItem,
  footnoteReference,
  footnoteDefinition,
  emphasis,
  strong,
  html,
  image,
}

export const compiler = (tree: MDASTNode, context: Context): string => {
  if (tree.type in compilers) {
    const key = tree.type as keyof typeof compilers
    return compilers[key](tree, context)
  } else {
    console.log(tree)
    throw new Error(`Not implemented: ${tree.type}`)
  }
}

export default function mdToReview() {
  // @ts-ignore
  this.Compiler = (tree: MDAST.Root) => {
    return compiler(tree, { list: 0 })
  }
}
