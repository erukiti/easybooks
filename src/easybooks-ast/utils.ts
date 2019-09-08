export interface UnistVisitor {
  enter?: (node: any, root: any) => Promise<void> | void
  leave?: (node: any, root: any) => Promise<void> | void
}

export type UnistVisitors = { [nodeName: string]: UnistVisitor }

export const traverse = async (
  node: any,
  visitors: UnistVisitors,
  root: any = node,
) => {
  const visitor = node.type in visitors ? visitors[node.type] : {}
  if (visitor.enter) {
    await visitor.enter(node, root)
  }

  if (node.children && Array.isArray(node.children)) {
    await Promise.all(
      node.children.map((child: any) => traverse(child, visitors, root)),
    )
  }

  if (visitor.leave) {
    await visitor.leave(node, root)
  }
}
