export interface UnistVisitor {
  enter?: (node: any, root: any) => void
  leave?: (node: any, root: any) => void
}

export type UnistVisitors = { [nodeName: string]: UnistVisitor }

export const traverse = (
  node: any,
  visitors: UnistVisitors,
  root: any = node,
) => {
  const visitor = node.type in visitors ? visitors[node.type] : {}
  if (visitor.enter) {
    visitor.enter(node, root)
  }

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => traverse(child, visitors, root))
  }

  if (visitor.leave) {
    visitor.leave(node, root)
  }
}
