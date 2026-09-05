import { and, equals, refineDefinedKey, refineIndex, refineKey } from 'is-kit';
import * as ts from 'typescript';

declare const nodes: readonly ts.Node[];

export type IdentifierCall = ts.CallExpression & {
  readonly expression: ts.Identifier;
};

export type VariableWithCallInitializer = ts.VariableDeclaration & {
  readonly initializer: ts.CallExpression;
};

export type CallWithStringFirstArgument = ts.CallExpression & {
  readonly arguments: ts.NodeArray<ts.Expression> & {
    readonly 0: ts.StringLiteral;
  };
};

export type IdentifierPropertyCall = ts.CallExpression & {
  readonly expression: ts.PropertyAccessExpression & {
    readonly expression: ts.Identifier;
  };
};

export type RequireCall = ts.CallExpression & {
  readonly expression: ts.Identifier & {
    readonly text: 'require';
  };
};

// Case 1: required child
export const inlineRequired = (node: ts.Node) => {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    return node;
  }
};

export const inferredRequired = (node: ts.Node) =>
  ts.isCallExpression(node) && ts.isIdentifier(node.expression);

export const explicitRequired = (node: ts.Node): node is IdentifierCall =>
  ts.isCallExpression(node) && ts.isIdentifier(node.expression);

export const isKitRequired = and(
  ts.isCallExpression,
  refineKey('expression', ts.isIdentifier)
);

export const inferredRequiredIf = (node: ts.Node) =>
  inferredRequired(node) ? node : undefined;
export const inferredRequiredFilter = nodes.filter(inferredRequired);
export const inferredRequiredFind = nodes.find(inferredRequired);
export const explicitRequiredIf = (node: ts.Node) =>
  explicitRequired(node) ? node : undefined;
export const explicitRequiredFilter = nodes.filter(explicitRequired);
export const explicitRequiredFind = nodes.find(explicitRequired);
export const isKitRequiredIf = (node: ts.Node) =>
  isKitRequired(node) ? node : undefined;
export const isKitRequiredFilter = nodes.filter(isKitRequired);
export const isKitRequiredFind = nodes.find(isKitRequired);

// Case 2: optional child
export const inlineOptional = (node: ts.Node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.initializer !== undefined &&
    ts.isCallExpression(node.initializer)
  ) {
    return node;
  }
};

export const inferredOptional = (node: ts.Node) =>
  ts.isVariableDeclaration(node) &&
  node.initializer !== undefined &&
  ts.isCallExpression(node.initializer);

export const explicitOptional = (
  node: ts.Node
): node is VariableWithCallInitializer =>
  ts.isVariableDeclaration(node) &&
  node.initializer !== undefined &&
  ts.isCallExpression(node.initializer);

export const isKitOptional = and(
  ts.isVariableDeclaration,
  refineDefinedKey('initializer', ts.isCallExpression)
);

export const inferredOptionalIf = (node: ts.Node) =>
  inferredOptional(node) ? node : undefined;
export const inferredOptionalFilter = nodes.filter(inferredOptional);
export const inferredOptionalFind = nodes.find(inferredOptional);
export const explicitOptionalIf = (node: ts.Node) =>
  explicitOptional(node) ? node : undefined;
export const explicitOptionalFilter = nodes.filter(explicitOptional);
export const explicitOptionalFind = nodes.find(explicitOptional);
export const isKitOptionalIf = (node: ts.Node) =>
  isKitOptional(node) ? node : undefined;
export const isKitOptionalFilter = nodes.filter(isKitOptional);
export const isKitOptionalFind = nodes.find(isKitOptional);

// Case 3: indexed child
export const inlineIndexed = (node: ts.Node) => {
  if (
    ts.isCallExpression(node) &&
    node.arguments[0] !== undefined &&
    ts.isStringLiteral(node.arguments[0])
  ) {
    return node;
  }
};

export const inferredIndexed = (node: ts.Node) =>
  ts.isCallExpression(node) &&
  node.arguments[0] !== undefined &&
  ts.isStringLiteral(node.arguments[0]);

export const explicitIndexed = (
  node: ts.Node
): node is CallWithStringFirstArgument =>
  ts.isCallExpression(node) &&
  node.arguments[0] !== undefined &&
  ts.isStringLiteral(node.arguments[0]);

export const isKitIndexed = and(
  ts.isCallExpression,
  refineKey('arguments', refineIndex(0, ts.isStringLiteral))
);

export const inferredIndexedIf = (node: ts.Node) =>
  inferredIndexed(node) ? node : undefined;
export const inferredIndexedFilter = nodes.filter(inferredIndexed);
export const inferredIndexedFind = nodes.find(inferredIndexed);
export const explicitIndexedIf = (node: ts.Node) =>
  explicitIndexed(node) ? node : undefined;
export const explicitIndexedFilter = nodes.filter(explicitIndexed);
export const explicitIndexedFind = nodes.find(explicitIndexed);
export const isKitIndexedIf = (node: ts.Node) =>
  isKitIndexed(node) ? node : undefined;
export const isKitIndexedFilter = nodes.filter(isKitIndexed);
export const isKitIndexedFind = nodes.find(isKitIndexed);

// Case 4: nested child
export const inlineNested = (node: ts.Node) => {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression)
  ) {
    return node;
  }
};

export const inferredNested = (node: ts.Node) =>
  ts.isCallExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  ts.isIdentifier(node.expression.expression);

export const explicitNested = (node: ts.Node): node is IdentifierPropertyCall =>
  ts.isCallExpression(node) &&
  ts.isPropertyAccessExpression(node.expression) &&
  ts.isIdentifier(node.expression.expression);

export const isKitNested = and(
  ts.isCallExpression,
  refineKey(
    'expression',
    and(ts.isPropertyAccessExpression, refineKey('expression', ts.isIdentifier))
  )
);

export const inferredNestedIf = (node: ts.Node) =>
  inferredNested(node) ? node : undefined;
export const inferredNestedFilter = nodes.filter(inferredNested);
export const inferredNestedFind = nodes.find(inferredNested);
export const explicitNestedIf = (node: ts.Node) =>
  explicitNested(node) ? node : undefined;
export const explicitNestedFilter = nodes.filter(explicitNested);
export const explicitNestedFind = nodes.find(explicitNested);
export const isKitNestedIf = (node: ts.Node) =>
  isKitNested(node) ? node : undefined;
export const isKitNestedFilter = nodes.filter(isKitNested);
export const isKitNestedFind = nodes.find(isKitNested);

// Case 5: structure plus literal value
export const inlineLiteral = (node: ts.Node) => {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'require'
  ) {
    return node;
  }
};

export const inferredLiteral = (node: ts.Node) =>
  ts.isCallExpression(node) &&
  ts.isIdentifier(node.expression) &&
  node.expression.text === 'require';

export const explicitLiteral = (node: ts.Node): node is RequireCall =>
  ts.isCallExpression(node) &&
  ts.isIdentifier(node.expression) &&
  node.expression.text === 'require';

export const isKitLiteral = and(
  ts.isCallExpression,
  refineKey(
    'expression',
    and(ts.isIdentifier, refineKey('text', equals('require')))
  )
);

export const inferredLiteralIf = (node: ts.Node) =>
  inferredLiteral(node) ? node : undefined;
export const inferredLiteralFilter = nodes.filter(inferredLiteral);
export const inferredLiteralFind = nodes.find(inferredLiteral);
export const explicitLiteralIf = (node: ts.Node) =>
  explicitLiteral(node) ? node : undefined;
export const explicitLiteralFilter = nodes.filter(explicitLiteral);
export const explicitLiteralFind = nodes.find(explicitLiteral);
export const isKitLiteralIf = (node: ts.Node) =>
  isKitLiteral(node) ? node : undefined;
export const isKitLiteralFilter = nodes.filter(isKitLiteral);
export const isKitLiteralFind = nodes.find(isKitLiteral);
