import * as ast from 'typescript/unstable/ast';

// These probes isolate direct `kind` narrowing from the `ast.isX` predicates.
// The broad TS7 Node and Expression declarations are the behavior under test.

export const requiredParent = (node: ast.Node) => {
  if (node.kind === ast.SyntaxKind.CallExpression) {
    // @ts-expect-error: A broad Node is not currently a discriminated union.
    return node.expression;
  }
};

export const requiredChild = (node: ast.CallExpression) => {
  if (node.expression.kind === ast.SyntaxKind.Identifier) {
    return node.expression;
  }
};

export const optionalChild = (node: ast.VariableDeclaration) => {
  if (node.initializer?.kind === ast.SyntaxKind.CallExpression) {
    return node.initializer;
  }
};

export const indexedChild = (node: ast.CallExpression) => {
  const first = node.arguments[0];
  if (first?.kind === ast.SyntaxKind.StringLiteral) {
    return first;
  }
};

export const nestedChild = (node: ast.PropertyAccessExpression) => {
  if (node.expression.kind === ast.SyntaxKind.Identifier) {
    return node.expression;
  }
};

export const literalChild = (node: ast.CallExpression) => {
  if (node.expression.kind === ast.SyntaxKind.Identifier) {
    // @ts-expect-error: The kind check does not currently expose Identifier.text.
    return node.expression.text === 'require' ? node.expression : undefined;
  }
};

// A generated discriminated-union control isolates the benefit of narrower
// entry types from TypeScript 7's runtime and API architecture.
export type UnionIdentifier = {
  readonly kind: ast.SyntaxKind.Identifier;
  readonly text: string;
};

export type UnionStringLiteral = {
  readonly kind: ast.SyntaxKind.StringLiteral;
  readonly text: string;
};

export type UnionCallExpression = {
  readonly kind: ast.SyntaxKind.CallExpression;
  readonly expression: UnionExpression;
};

export type UnionExpression =
  | UnionIdentifier
  | UnionStringLiteral
  | UnionCallExpression;

export const unionParent = (node: UnionExpression) => {
  if (node.kind === ast.SyntaxKind.CallExpression) {
    return node.expression;
  }
};

export const unionChild = (node: UnionCallExpression) => {
  if (node.expression.kind === ast.SyntaxKind.Identifier) {
    return node.expression;
  }
};
