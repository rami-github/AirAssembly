"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const chevrotain_1 = require("chevrotain");
const errors_1 = require("./errors");
// LITERALS AND IDENTIFIERS
// ================================================================================================
exports.HexLiteral = chevrotain_1.createToken({ name: "HexLiteral", pattern: /0x[0-9a-f]+/ });
exports.Literal = chevrotain_1.createToken({ name: "Literal", pattern: /0|[1-9]\d*/, longer_alt: exports.HexLiteral });
exports.Identifier = chevrotain_1.createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ });
exports.Handle = chevrotain_1.createToken({ name: "Handle", pattern: /\$[_a-zA-Z]\w*/ });
// KEYWORDS
// ================================================================================================
exports.Module = chevrotain_1.createToken({ name: "Module", pattern: /module/, longer_alt: exports.Identifier });
exports.Field = chevrotain_1.createToken({ name: "Field", pattern: /field/, longer_alt: exports.Identifier });
exports.Prime = chevrotain_1.createToken({ name: "Prime", pattern: /prime/, longer_alt: exports.Identifier });
exports.Const = chevrotain_1.createToken({ name: "Const", pattern: /const/, longer_alt: exports.Identifier });
exports.Static = chevrotain_1.createToken({ name: "Static", pattern: /static/, longer_alt: exports.Identifier });
exports.Input = chevrotain_1.createToken({ name: "Input", pattern: /input/, longer_alt: exports.Identifier });
exports.Secret = chevrotain_1.createToken({ name: "Secret", pattern: /secret/, longer_alt: exports.Identifier });
exports.Public = chevrotain_1.createToken({ name: "Public", pattern: /public/, longer_alt: exports.Identifier });
exports.Binary = chevrotain_1.createToken({ name: "Binary", pattern: /binary/, longer_alt: exports.Identifier });
exports.ChildOf = chevrotain_1.createToken({ name: "ChildOf", pattern: /childof/, longer_alt: exports.Identifier });
exports.PeerOf = chevrotain_1.createToken({ name: "PeerOf", pattern: /peerof/, longer_alt: exports.Identifier });
exports.Steps = chevrotain_1.createToken({ name: "Steps", pattern: /steps/, longer_alt: exports.Identifier });
exports.Shift = chevrotain_1.createToken({ name: "Shift", pattern: /shift/, longer_alt: exports.Identifier });
exports.Cycle = chevrotain_1.createToken({ name: "Cycle", pattern: /cycle/, longer_alt: exports.Identifier });
exports.Power = chevrotain_1.createToken({ name: "Power", pattern: /power/, longer_alt: exports.Identifier });
exports.Prng = chevrotain_1.createToken({ name: "Prng", pattern: /prng/, longer_alt: exports.Identifier });
exports.Sha256 = chevrotain_1.createToken({ name: "Sha256", pattern: /sha256/, longer_alt: exports.Identifier });
exports.Mask = chevrotain_1.createToken({ name: "Mask", pattern: /mask/, longer_alt: exports.Identifier });
exports.Inverted = chevrotain_1.createToken({ name: "Inverted", pattern: /inverted/, longer_alt: exports.Identifier });
exports.Function = chevrotain_1.createToken({ name: "Function", pattern: /function/, longer_alt: exports.Identifier });
exports.Transition = chevrotain_1.createToken({ name: "Transition", pattern: /transition/, longer_alt: exports.Identifier });
exports.Evaluation = chevrotain_1.createToken({ name: "Evaluation", pattern: /evaluation/, longer_alt: exports.Identifier });
exports.Result = chevrotain_1.createToken({ name: "Result", pattern: /result/, longer_alt: exports.Identifier });
exports.Param = chevrotain_1.createToken({ name: "Param", pattern: /param/, longer_alt: exports.Identifier });
exports.Local = chevrotain_1.createToken({ name: "Local", pattern: /local/, longer_alt: exports.Identifier });
exports.Export = chevrotain_1.createToken({ name: "Export", pattern: /export/, longer_alt: exports.Identifier });
exports.Registers = chevrotain_1.createToken({ name: "Registers", pattern: /registers/, longer_alt: exports.Identifier });
exports.Constraints = chevrotain_1.createToken({ name: "Constraints", pattern: /constraints/, longer_alt: exports.Identifier });
exports.Init = chevrotain_1.createToken({ name: "Init", pattern: /init/, longer_alt: exports.Identifier });
// TYPES
// ================================================================================================
exports.Scalar = chevrotain_1.createToken({ name: "Scalar", pattern: /scalar/, longer_alt: exports.Identifier });
exports.Vector = chevrotain_1.createToken({ name: "Vector", pattern: /vector/, longer_alt: exports.Identifier });
exports.Matrix = chevrotain_1.createToken({ name: "Matrix", pattern: /matrix/, longer_alt: exports.Identifier });
// OPERATORS
// ================================================================================================
exports.Get = chevrotain_1.createToken({ name: "Get", pattern: /get/, longer_alt: exports.Identifier });
exports.Slice = chevrotain_1.createToken({ name: "Slice", pattern: /slice/, longer_alt: exports.Identifier });
exports.BinaryOp = chevrotain_1.createToken({ name: "BinaryOp", pattern: chevrotain_1.Lexer.NA });
exports.Add = chevrotain_1.createToken({ name: "Add", pattern: /add/, longer_alt: exports.Identifier, categories: exports.BinaryOp });
exports.Sub = chevrotain_1.createToken({ name: "Sub", pattern: /sub/, longer_alt: exports.Identifier, categories: exports.BinaryOp });
exports.Mul = chevrotain_1.createToken({ name: "Mul", pattern: /mul/, longer_alt: exports.Identifier, categories: exports.BinaryOp });
exports.Div = chevrotain_1.createToken({ name: "Div", pattern: /div/, longer_alt: exports.Identifier, categories: exports.BinaryOp });
exports.Exp = chevrotain_1.createToken({ name: "Exp", pattern: /exp/, longer_alt: exports.Identifier, categories: exports.BinaryOp });
exports.Prod = chevrotain_1.createToken({ name: "Prod", pattern: /prod/, longer_alt: exports.Identifier, categories: exports.BinaryOp });
exports.UnaryOp = chevrotain_1.createToken({ name: "UnaryOp", pattern: chevrotain_1.Lexer.NA });
exports.Neg = chevrotain_1.createToken({ name: "Neg", pattern: /neg/, longer_alt: exports.Identifier, categories: exports.UnaryOp });
exports.Inv = chevrotain_1.createToken({ name: "Inv", pattern: /inv/, longer_alt: exports.Identifier, categories: exports.UnaryOp });
exports.LoadOp = chevrotain_1.createToken({ name: "LoadOp", pattern: chevrotain_1.Lexer.NA });
exports.LoadConst = chevrotain_1.createToken({ name: "LoadConst", pattern: /load.const/, longer_alt: exports.Identifier, categories: exports.LoadOp });
exports.LoadTrace = chevrotain_1.createToken({ name: "LoadTrace", pattern: /load.trace/, longer_alt: exports.Identifier, categories: exports.LoadOp });
exports.LoadStatic = chevrotain_1.createToken({ name: "LoadStatic", pattern: /load.static/, longer_alt: exports.Identifier, categories: exports.LoadOp });
exports.LoadParam = chevrotain_1.createToken({ name: "LoadParam", pattern: /load.param/, longer_alt: exports.Identifier, categories: exports.LoadOp });
exports.LoadLocal = chevrotain_1.createToken({ name: "LoadLocal", pattern: /load.local/, longer_alt: exports.Identifier, categories: exports.LoadOp });
exports.StoreOp = chevrotain_1.createToken({ name: "StoreLocal", pattern: /store.local/, longer_alt: exports.Identifier });
exports.CallOp = chevrotain_1.createToken({ name: "CallOp", pattern: /call/, longer_alt: exports.Identifier });
// SYMBOLS
// ================================================================================================
exports.LParen = chevrotain_1.createToken({ name: "LParen", pattern: /\(/ });
exports.RParen = chevrotain_1.createToken({ name: "RParen", pattern: /\)/ });
exports.Minus = chevrotain_1.createToken({ name: "Minus", pattern: /-/ });
// WHITESPACE
// ================================================================================================
exports.WhiteSpace = chevrotain_1.createToken({ name: "WhiteSpace", pattern: /[ \t\n\r]+/, group: chevrotain_1.Lexer.SKIPPED });
exports.Comment = chevrotain_1.createToken({ name: "Comment", pattern: /#.+/, group: "comments" });
// ALL TOKENS
// ================================================================================================
exports.allTokens = [
    exports.WhiteSpace, exports.Comment,
    exports.Export, exports.Registers, exports.Constraints, exports.Init,
    exports.Module, exports.Field, exports.Prime, exports.Const, exports.Static, exports.Input, exports.Secret, exports.Public, exports.Binary, exports.ChildOf, exports.PeerOf, exports.Steps, exports.Shift,
    exports.Cycle, exports.Power, exports.Prng, exports.Sha256, exports.Mask, exports.Inverted, exports.Function, exports.Transition, exports.Evaluation, exports.Result, exports.Param, exports.Local,
    exports.Scalar, exports.Vector, exports.Matrix,
    exports.Get, exports.Slice, exports.BinaryOp, exports.Add, exports.Sub, exports.Mul, exports.Div, exports.Exp, exports.Prod, exports.UnaryOp, exports.Neg, exports.Inv,
    exports.LoadOp, exports.LoadConst, exports.LoadTrace, exports.LoadStatic, exports.LoadParam, exports.LoadLocal, exports.StoreOp, exports.CallOp,
    exports.LParen, exports.RParen, exports.Minus,
    exports.HexLiteral, exports.Literal, exports.Identifier, exports.Handle
];
// EXPORT LEXER INSTANCE
// ================================================================================================
exports.lexer = new chevrotain_1.Lexer(exports.allTokens, {
    errorMessageProvider: errors_1.lexerErrorMessageProvider,
    ensureOptimizations: true
});
//# sourceMappingURL=lexer.js.map