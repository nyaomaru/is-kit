import { and, equals, refineDefinedKey, refineIndex, refineKey } from 'is-kit';
import * as ast from 'typescript/unstable/ast';

declare const nodes: readonly ast.Node[];

export type IdentifierCall = ast.CallExpression & {
  readonly expression: ast.Identifier;
};

export type VariableWithCallInitializer = ast.VariableDeclaration & {
  readonly initializer: ast.CallExpression;
};

export type CallWithStringFirstArgument = ast.CallExpression & {
  readonly arguments: ast.NodeArray<ast.Expression> & {
    readonly 0: ast.StringLiteral;
  };
};

export type IdentifierPropertyCall = ast.CallExpression & {
  readonly expression: ast.PropertyAccessExpression & {
    readonly expression: ast.Identifier;
  };
};

export type RequireCall = ast.CallExpression & {
  readonly expression: ast.Identifier & {
    readonly text: 'require';
  };
};

// Case 1: required child
export const inlineRequired = (node: ast.Node) => {
  if (ast.isCallExpression(node) && ast.isIdentifier(node.expression)) {
    return node;
  }
};

export const inferredRequired = (node: ast.Node) =>
  ast.isCallExpression(node) && ast.isIdentifier(node.expression);

export const explicitRequired = (node: ast.Node): node is IdentifierCall =>
  ast.isCallExpression(node) && ast.isIdentifier(node.expression);

export const isKitRequired = and(
  ast.isCallExpression,
  refineKey('expression', ast.isIdentifier)
);

export const inferredRequiredIf = (node: ast.Node) =>
  inferredRequired(node) ? node : undefined;
export const inferredRequiredFilter = nodes.filter(inferredRequired);
export const inferredRequiredFind = nodes.find(inferredRequired);
export const explicitRequiredIf = (node: ast.Node) =>
  explicitRequired(node) ? node : undefined;
export const explicitRequiredFilter = nodes.filter(explicitRequired);
export const explicitRequiredFind = nodes.find(explicitRequired);
export const isKitRequiredIf = (node: ast.Node) =>
  isKitRequired(node) ? node : undefined;
export const isKitRequiredFilter = nodes.filter(isKitRequired);
export const isKitRequiredFind = nodes.find(isKitRequired);

// Case 2: optional child
export const inlineOptional = (node: ast.Node) => {
  if (
    ast.isVariableDeclaration(node) &&
    node.initializer !== undefined &&
    ast.isCallExpression(node.initializer)
  ) {
    return node;
  }
};

export const inferredOptional = (node: ast.Node) =>
  ast.isVariableDeclaration(node) &&
  node.initializer !== undefined &&
  ast.isCallExpression(node.initializer);

export const explicitOptional = (
  node: ast.Node
): node is VariableWithCallInitializer =>
  ast.isVariableDeclaration(node) &&
  node.initializer !== undefined &&
  ast.isCallExpression(node.initializer);

export const isKitOptional = and(
  ast.isVariableDeclaration,
  refineDefinedKey('initializer', ast.isCallExpression)
);

export const inferredOptionalIf = (node: ast.Node) =>
  inferredOptional(node) ? node : undefined;
export const inferredOptionalFilter = nodes.filter(inferredOptional);
export const inferredOptionalFind = nodes.find(inferredOptional);
export const explicitOptionalIf = (node: ast.Node) =>
  explicitOptional(node) ? node : undefined;
export const explicitOptionalFilter = nodes.filter(explicitOptional);
export const explicitOptionalFind = nodes.find(explicitOptional);
export const isKitOptionalIf = (node: ast.Node) =>
  isKitOptional(node) ? node : undefined;
export const isKitOptionalFilter = nodes.filter(isKitOptional);
export const isKitOptionalFind = nodes.find(isKitOptional);

// Case 3: indexed child
export const inlineIndexed = (node: ast.Node) => {
  if (
    ast.isCallExpression(node) &&
    node.arguments[0] !== undefined &&
    ast.isStringLiteral(node.arguments[0])
  ) {
    return node;
  }
};

export const inferredIndexed = (node: ast.Node) =>
  ast.isCallExpression(node) &&
  node.arguments[0] !== undefined &&
  ast.isStringLiteral(node.arguments[0]);

export const explicitIndexed = (
  node: ast.Node
): node is CallWithStringFirstArgument =>
  ast.isCallExpression(node) &&
  node.arguments[0] !== undefined &&
  ast.isStringLiteral(node.arguments[0]);

export const isKitIndexed = and(
  ast.isCallExpression,
  refineKey('arguments', refineIndex(0, ast.isStringLiteral))
);

export const inferredIndexedIf = (node: ast.Node) =>
  inferredIndexed(node) ? node : undefined;
export const inferredIndexedFilter = nodes.filter(inferredIndexed);
export const inferredIndexedFind = nodes.find(inferredIndexed);
export const explicitIndexedIf = (node: ast.Node) =>
  explicitIndexed(node) ? node : undefined;
export const explicitIndexedFilter = nodes.filter(explicitIndexed);
export const explicitIndexedFind = nodes.find(explicitIndexed);
export const isKitIndexedIf = (node: ast.Node) =>
  isKitIndexed(node) ? node : undefined;
export const isKitIndexedFilter = nodes.filter(isKitIndexed);
export const isKitIndexedFind = nodes.find(isKitIndexed);

// Case 4: nested child
export const inlineNested = (node: ast.Node) => {
  if (
    ast.isCallExpression(node) &&
    ast.isPropertyAccessExpression(node.expression) &&
    ast.isIdentifier(node.expression.expression)
  ) {
    return node;
  }
};

export const inferredNested = (node: ast.Node) =>
  ast.isCallExpression(node) &&
  ast.isPropertyAccessExpression(node.expression) &&
  ast.isIdentifier(node.expression.expression);

export const explicitNested = (
  node: ast.Node
): node is IdentifierPropertyCall =>
  ast.isCallExpression(node) &&
  ast.isPropertyAccessExpression(node.expression) &&
  ast.isIdentifier(node.expression.expression);

export const isKitNested = and(
  ast.isCallExpression,
  refineKey(
    'expression',
    and(
      ast.isPropertyAccessExpression,
      refineKey('expression', ast.isIdentifier)
    )
  )
);

export const inferredNestedIf = (node: ast.Node) =>
  inferredNested(node) ? node : undefined;
export const inferredNestedFilter = nodes.filter(inferredNested);
export const inferredNestedFind = nodes.find(inferredNested);
export const explicitNestedIf = (node: ast.Node) =>
  explicitNested(node) ? node : undefined;
export const explicitNestedFilter = nodes.filter(explicitNested);
export const explicitNestedFind = nodes.find(explicitNested);
export const isKitNestedIf = (node: ast.Node) =>
  isKitNested(node) ? node : undefined;
export const isKitNestedFilter = nodes.filter(isKitNested);
export const isKitNestedFind = nodes.find(isKitNested);

// Case 5: structure plus literal value
export const inlineLiteral = (node: ast.Node) => {
  if (
    ast.isCallExpression(node) &&
    ast.isIdentifier(node.expression) &&
    node.expression.text === 'require'
  ) {
    return node;
  }
};

export const inferredLiteral = (node: ast.Node) =>
  ast.isCallExpression(node) &&
  ast.isIdentifier(node.expression) &&
  node.expression.text === 'require';

export const explicitLiteral = (node: ast.Node): node is RequireCall =>
  ast.isCallExpression(node) &&
  ast.isIdentifier(node.expression) &&
  node.expression.text === 'require';

export const isKitLiteral = and(
  ast.isCallExpression,
  refineKey(
    'expression',
    and(ast.isIdentifier, refineKey('text', equals('require')))
  )
);

export const inferredLiteralIf = (node: ast.Node) =>
  inferredLiteral(node) ? node : undefined;
export const inferredLiteralFilter = nodes.filter(inferredLiteral);
export const inferredLiteralFind = nodes.find(inferredLiteral);
export const explicitLiteralIf = (node: ast.Node) =>
  explicitLiteral(node) ? node : undefined;
export const explicitLiteralFilter = nodes.filter(explicitLiteral);
export const explicitLiteralFind = nodes.find(explicitLiteral);
export const isKitLiteralIf = (node: ast.Node) =>
  isKitLiteral(node) ? node : undefined;
export const isKitLiteralFilter = nodes.filter(isKitLiteral);
export const isKitLiteralFind = nodes.find(isKitLiteral);
