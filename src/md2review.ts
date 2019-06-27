import MDAST from 'mdast'
import Unist from 'unist'

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
  return `${'='.repeat(tree.depth)}${option} ${s}`
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
  return `//listnum[][]${lang}{\n${tree.value}\n//}`
}

const link = (tree: MDAST.Link, context: Context) => {
  const s = tree.children.map(child => compiler(child, context)).join('')
  return `@<href>{${tree.url}${s ? `, ${s}` : ''}}`
}

const list = (tree: MDAST.List, context: Context) => {
  return tree.children
    .map(child => compiler(child, { ...context, list: context.list + 1 }))
    .join('')
}

const listItem = (tree: MDAST.ListItem, context: Context) => {
  return ` ${'*'.repeat(context.list)} ${tree.children
    .map(child => compiler(child, context))
    .join('')
    .trim()}\n`
}

const ignore = () => ''

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
  return tree.value
}

const compilers: {
  [props: string]: (tree: any, context: Context) => string
} = {
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
  list,
  listItem,
  footnoteReference,
  footnoteDefinition,
  emphasis,
  strong,
  html,
}

export const compiler = (tree: Unist.Node, context: Context): string => {
  if (!(tree.type in compilers)) {
    console.log(tree)
    throw new Error(`not implemented: ${tree.type}`)
  }
  return compilers[tree.type](tree, context)
}

export default function mdToReview() {
  this.Compiler = (tree: MDAST.Root) => {
    return compiler(tree, { list: 0 })
  }
}
