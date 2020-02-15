/*
 * see. https://github.com/syntax-tree/mdast
 * see. https://github.com/remarkjs/remark
 * EBAST is a Markdown AST with an expanded Re:VIEW features.
 */

import Unist from 'unist'

export type Node = Root | Content | Comment

export interface Parent extends Unist.Parent {
  children: Content[]
}

export interface Literal extends Unist.Literal {
  value: string
}

export interface Root extends Parent {
  type: 'root'
}

export interface Paragraph extends Parent {
  type: 'paragraph'
  children: PhrasingContent[]
}

export interface Heading extends Parent {
  type: 'heading'
  depth: number
  options: string[]
  children: PhrasingContent[]

  reference?: string
}

export interface ThematicBreak extends Unist.Node {
  type: 'thematicBreak'
}

export interface Blockquote extends Parent {
  type: 'blockquote'
  children: BlockContent[]
}

export interface List extends Parent {
  type: 'list'
  ordered?: boolean
  start?: number
  spread?: boolean
  children: ListContent[]
}

export interface ListItem extends Parent {
  type: 'listItem'
  checked?: boolean
  spread?: boolean
  children: BlockContent[]
}

export interface Div extends Parent {
  type: 'div'
  className?: string
  children: BlockContent[]
}

export interface Table extends Parent {
  type: 'table'
  align: Array<'left' | 'right' | 'center' | null>
  children: TableContent[]
  caption?: string
  id?: string
}

export interface TableRow extends Parent {
  type: 'tableRow'
  children: RowContent[]
}

export interface TableCell extends Parent {
  type: 'tableCell'
  children: PhrasingContent[]
}

export interface HTML extends Literal {
  type: 'html'
}

export interface Comment extends Unist.Node {
  type: 'comment'
  value: string
}

export interface Code extends Literal {
  type: 'code'
  lang?: string
  meta?: string
  id?: string
  caption?: string
  filename?: string
  src?: {
    url: string
    startLine?: number
    endLine?: number
  }
  num?: boolean
}

export interface YAML extends Literal {
  type: 'yaml'
}

export interface Definition extends Unist.Node, Association, Resource {
  type: 'definition'
}

export interface FootnoteDefinition extends Parent, Association {
  type: 'footnoteDefinition'
  children: BlockContent[]
}

export interface Text extends Literal {
  type: 'text'
}

export interface Emphasis extends Parent {
  type: 'emphasis'
  children: PhrasingContent[]
}

export interface Strong extends Parent {
  type: 'strong'
  children: PhrasingContent[]
}

export interface Delete extends Parent {
  type: 'delete'
  children: PhrasingContent[]
}

export interface InlineCode extends Literal {
  type: 'inlineCode'
}

export interface Break extends Unist.Node {
  type: 'break'
}

export interface Link extends Parent, Resource {
  type: 'link'
  children: StaticPhrasingContent[]
}

export interface Image extends Unist.Node, Resource, Alternative {
  type: 'image'
}

export interface LinkReference extends Parent, Reference {
  type: 'linkReference'
  children: StaticPhrasingContent[]
}

export interface ImageReference extends Unist.Node, Reference, Alternative {
  type: 'imageReference'
}

export interface Footnote extends Parent {
  type: 'footnote'
  children: PhrasingContent[]
}

export interface FootnoteReference extends Unist.Node, Association {
  type: 'footnoteReference'
}

export interface Resource {
  url: string
  title?: string
}

export interface Association {
  identifier: string
  label?: string
}

export interface Reference extends Association {
  referenceType: string
}

export interface Alternative {
  alt?: string
}

export type Content =
  | TopLevelContent
  | ListContent
  | TableContent
  | RowContent
  | PhrasingContent
export type TopLevelContent =
  | BlockContent
  | FrontmatterContent
  | DefinitionContent
export type BlockContent =
  | Paragraph
  | Heading
  | ThematicBreak
  | Blockquote
  | List
  | Table
  | HTML
  | Code
  | Div

export type FrontmatterContent = YAML
export type DefinitionContent = Definition | FootnoteDefinition
export type ListContent = ListItem

export type TableContent = TableRow

export type RowContent = TableCell

export type PhrasingContent = StaticPhrasingContent | Link | LinkReference
export type StaticPhrasingContent =
  | Text
  | Emphasis
  | Strong
  | Delete
  | HTML
  | InlineCode
  | Break
  | Image
  | ImageReference
  | Footnote
  | FootnoteReference
