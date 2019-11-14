"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const chevrotain_1 = require("chevrotain");
const AirSchema_1 = require("./AirSchema");
const lexer_1 = require("./lexer");
const declarations_1 = require("./declarations");
const expressions_1 = require("./expressions");
const errors_1 = require("./errors");
// PARSER DEFINITION
// ================================================================================================
class AirParser extends chevrotain_1.EmbeddedActionsParser {
    constructor() {
        super(lexer_1.allTokens, { errorMessageProvider: errors_1.parserErrorMessageProvider });
        // MODULE
        // --------------------------------------------------------------------------------------------
        this.module = this.RULE('module', () => {
            const schema = new AirSchema_1.AirSchema();
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Module);
            this.SUBRULE(this.fieldDeclaration, { ARGS: [schema] });
            this.MANY(() => this.SUBRULE(this.constantDeclarations, { ARGS: [schema] }));
            this.OPTION(() => this.SUBRULE(this.staticRegisters, { ARGS: [schema] }));
            this.SUBRULE(this.transitionFunction, { ARGS: [schema] });
            this.SUBRULE(this.transitionConstraints, { ARGS: [schema] });
            // TODO: exports
            this.CONSUME(lexer_1.RParen);
            return schema;
        });
        // FINITE FIELD
        // --------------------------------------------------------------------------------------------
        this.fieldDeclaration = this.RULE('fieldDeclaration', (schema) => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Field);
            this.CONSUME(lexer_1.Prime);
            const modulus = this.CONSUME(lexer_1.Literal).image;
            this.CONSUME(lexer_1.RParen);
            this.ACTION(() => schema.setField(new declarations_1.FieldDeclaration('prime', BigInt(modulus))));
        });
        // GLOBAL CONSTANTS
        // --------------------------------------------------------------------------------------------
        this.constantDeclarations = this.RULE('constantDeclarations', (schema) => {
            const values = [];
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Const);
            this.MANY(() => {
                const value = this.OR([
                    { ALT: () => this.SUBRULE(this.literalScalar) },
                    { ALT: () => this.SUBRULE(this.literalVector) },
                    { ALT: () => this.SUBRULE(this.literalMatrix) }
                ]);
                values.push(value);
            });
            this.CONSUME(lexer_1.RParen);
            this.ACTION(() => schema.setConstants(values));
        });
        this.literalVector = this.RULE('literalVector', () => {
            const values = [];
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Vector);
            this.AT_LEAST_ONE(() => values.push(this.CONSUME(lexer_1.Literal).image));
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.LiteralValue(values.map(v => BigInt(v))));
        });
        this.literalMatrix = this.RULE('literalMatrix', () => {
            const rows = [];
            this.CONSUME1(lexer_1.LParen);
            this.CONSUME(lexer_1.Matrix);
            this.AT_LEAST_ONE1(() => {
                const row = [];
                this.CONSUME2(lexer_1.LParen);
                this.AT_LEAST_ONE2(() => row.push(this.CONSUME(lexer_1.Literal).image));
                this.CONSUME2(lexer_1.RParen);
                rows.push(row);
            });
            this.CONSUME1(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.LiteralValue(rows.map(r => r.map(v => BigInt(v)))));
        });
        this.literalScalar = this.RULE('literalScalar', () => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Scalar);
            const value = this.CONSUME(lexer_1.Literal).image;
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.LiteralValue(BigInt(value)));
        });
        // STATIC REGISTERS
        // --------------------------------------------------------------------------------------------
        this.staticRegisters = this.RULE('staticRegisters', (schema) => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Static);
            this.MANY(() => this.OR([
                { ALT: () => this.SUBRULE(this.inputRegister, { ARGS: [schema] }) },
                { ALT: () => this.SUBRULE(this.cyclicRegister, { ARGS: [schema] }) }
                // TODO: computed registers
            ]));
            this.CONSUME(lexer_1.RParen);
        });
        this.inputRegister = this.RULE('inputRegister', (schema) => {
            this.CONSUME1(lexer_1.LParen);
            this.CONSUME(lexer_1.Input);
            const scope = this.OR1([
                { ALT: () => this.CONSUME(lexer_1.Secret).image },
                { ALT: () => this.CONSUME(lexer_1.Public).image }
            ]);
            const binary = this.OPTION1(() => this.CONSUME(lexer_1.Binary)) ? true : false;
            const typeOrParent = this.OR2([
                { ALT: () => this.CONSUME(lexer_1.Scalar).image },
                { ALT: () => this.CONSUME(lexer_1.Vector).image },
                { ALT: () => {
                        this.CONSUME2(lexer_1.LParen);
                        this.CONSUME(lexer_1.Parent);
                        const index = this.CONSUME1(lexer_1.Literal).image;
                        this.CONSUME2(lexer_1.RParen);
                        return this.ACTION(() => Number.parseInt(index, 10));
                    } }
            ]);
            const steps = this.OPTION2(() => {
                this.CONSUME3(lexer_1.LParen);
                this.CONSUME(lexer_1.Steps);
                const steps = this.CONSUME2(lexer_1.Literal).image;
                this.CONSUME3(lexer_1.RParen);
                return this.ACTION(() => Number.parseInt(steps, 10));
            });
            this.CONSUME1(lexer_1.RParen);
            this.ACTION(() => schema.addInputRegister(scope, binary, typeOrParent, steps));
        });
        this.cyclicRegister = this.RULE('cyclicRegister', (schema) => {
            const values = [];
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Cycle);
            this.AT_LEAST_ONE(() => values.push(this.CONSUME(lexer_1.Literal).image));
            this.CONSUME(lexer_1.RParen);
            this.ACTION(() => schema.addCyclicRegister(values.map(v => BigInt(v))));
        });
        // PROCEDURES
        // --------------------------------------------------------------------------------------------
        this.transitionFunction = this.RULE('transitionFunction', (schema) => {
            this.CONSUME1(lexer_1.LParen);
            this.CONSUME(lexer_1.Transition);
            // signature
            this.CONSUME2(lexer_1.LParen);
            this.CONSUME(lexer_1.Span);
            const span = this.SUBRULE1(this.integerLiteral);
            this.CONSUME2(lexer_1.RParen);
            this.CONSUME3(lexer_1.LParen);
            this.CONSUME(lexer_1.Result);
            this.CONSUME(lexer_1.Vector);
            const width = this.SUBRULE2(this.integerLiteral);
            this.CONSUME3(lexer_1.RParen);
            // locals
            const locals = [];
            this.MANY1(() => locals.push(this.SUBRULE(this.localDeclaration)));
            // body
            let procedure;
            this.ACTION(() => procedure = schema.setTransitionFunction(span, width, locals));
            this.MANY2(() => this.SUBRULE(this.procedureSubroutine, { ARGS: [procedure] }));
            const resultExpression = this.SUBRULE(this.expression, { ARGS: [procedure] });
            this.ACTION(() => schema.transitionFunction.result = resultExpression);
            this.CONSUME1(lexer_1.RParen);
        });
        this.transitionConstraints = this.RULE('transitionConstraints', (schema) => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Evaluation);
            // signature
            this.CONSUME2(lexer_1.LParen);
            this.CONSUME(lexer_1.Span);
            const span = this.SUBRULE1(this.integerLiteral);
            this.CONSUME2(lexer_1.RParen);
            this.CONSUME3(lexer_1.LParen);
            this.CONSUME(lexer_1.Result);
            this.CONSUME(lexer_1.Vector);
            const width = this.SUBRULE2(this.integerLiteral);
            this.CONSUME3(lexer_1.RParen);
            // locals
            const locals = [];
            this.MANY1(() => locals.push(this.SUBRULE(this.localDeclaration)));
            // body
            let procedure;
            this.ACTION(() => procedure = schema.setConstraintEvaluator(span, width, locals));
            this.MANY2(() => this.SUBRULE(this.procedureSubroutine, { ARGS: [procedure] }));
            const resultExpression = this.SUBRULE(this.expression, { ARGS: [procedure] });
            this.ACTION(() => schema.constraintEvaluator.result = resultExpression);
            this.CONSUME(lexer_1.RParen);
        });
        this.localDeclaration = this.RULE('localDeclaration', () => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Local);
            const result = this.OR([
                { ALT: () => {
                        this.CONSUME(lexer_1.Scalar);
                        return this.ACTION(() => expressions_1.Dimensions.scalar());
                    } },
                { ALT: () => {
                        this.CONSUME(lexer_1.Vector);
                        const length = this.SUBRULE1(this.integerLiteral);
                        return this.ACTION(() => expressions_1.Dimensions.vector(length));
                    } },
                { ALT: () => {
                        this.CONSUME(lexer_1.Matrix);
                        const rowCount = this.SUBRULE2(this.integerLiteral);
                        const colCount = this.SUBRULE3(this.integerLiteral);
                        return this.ACTION(() => expressions_1.Dimensions.matrix(rowCount, colCount));
                    } }
            ]);
            this.CONSUME(lexer_1.RParen);
            return result;
        });
        this.procedureSubroutine = this.RULE('procedureSubroutine', (ctx) => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.StoreOp);
            const index = this.SUBRULE(this.integerLiteral);
            const value = this.SUBRULE(this.expression, { ARGS: [ctx] });
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => ctx.addSubroutine(value, index));
        });
        // EXPRESSIONS
        // --------------------------------------------------------------------------------------------
        this.expression = this.RULE('expression', (ctx) => {
            const result = this.OR([
                { ALT: () => this.SUBRULE(this.binaryOperation, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.unaryOperation, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.makeVector, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.getVectorElement, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.sliceVector, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.makeMatrix, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.loadExpression, { ARGS: [ctx] }) },
                { ALT: () => this.SUBRULE(this.literalScalar, { ARGS: [ctx] }) }
            ]);
            return result;
        });
        this.binaryOperation = this.RULE('binaryOperation', (ctx) => {
            this.CONSUME(lexer_1.LParen);
            const op = this.CONSUME(lexer_1.BinaryOp).image;
            const lhs = this.SUBRULE1(this.expression, { ARGS: [ctx] });
            const rhs = this.SUBRULE2(this.expression, { ARGS: [ctx] });
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.BinaryOperation(op, lhs, rhs));
        });
        this.unaryOperation = this.RULE('unaryOperation', (ctx) => {
            this.CONSUME(lexer_1.LParen);
            const op = this.CONSUME(lexer_1.UnaryOp).image;
            const value = this.SUBRULE(this.expression, { ARGS: [ctx] });
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.UnaryOperation(op, value));
        });
        // VECTORS AND MATRIXES
        // --------------------------------------------------------------------------------------------
        this.makeVector = this.RULE('makeVector', (ctx) => {
            const elements = [];
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Vector);
            this.AT_LEAST_ONE(() => elements.push(this.SUBRULE(this.expression, { ARGS: [ctx] })));
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.MakeVector(elements));
        });
        this.getVectorElement = this.RULE('getVectorElement', (ctx) => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Get);
            const source = this.SUBRULE(this.expression, { ARGS: [ctx] });
            const index = this.SUBRULE(this.integerLiteral);
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.GetVectorElement(source, index));
        });
        this.sliceVector = this.RULE('sliceVector', (ctx) => {
            this.CONSUME(lexer_1.LParen);
            this.CONSUME(lexer_1.Slice);
            const source = this.SUBRULE(this.expression, { ARGS: [ctx] });
            const startIdx = this.SUBRULE1(this.integerLiteral);
            const endIdx = this.SUBRULE2(this.integerLiteral);
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.SliceVector(source, startIdx, endIdx));
        });
        this.makeMatrix = this.RULE('makeMatrix', (ctx) => {
            const rows = [];
            this.CONSUME1(lexer_1.LParen);
            this.CONSUME(lexer_1.Matrix);
            this.AT_LEAST_ONE1(() => {
                const row = [];
                this.CONSUME2(lexer_1.LParen);
                this.AT_LEAST_ONE2(() => row.push(this.SUBRULE(this.expression, { ARGS: [ctx] })));
                this.CONSUME2(lexer_1.RParen);
                rows.push(row);
            });
            this.CONSUME1(lexer_1.RParen);
            return this.ACTION(() => new expressions_1.MakeMatrix(rows));
        });
        // LOAD AND STORE OPERATIONS
        // --------------------------------------------------------------------------------------------
        this.loadExpression = this.RULE('loadExpression', (ctx) => {
            this.CONSUME(lexer_1.LParen);
            const op = this.CONSUME(lexer_1.LoadOp).image;
            const index = this.SUBRULE(this.integerLiteral);
            this.CONSUME(lexer_1.RParen);
            return this.ACTION(() => ctx.buildLoadExpression(op, index));
        });
        // LITERALS
        // --------------------------------------------------------------------------------------------
        this.integerLiteral = this.RULE('integerLiteral', () => {
            const value = this.CONSUME(lexer_1.Literal).image;
            return this.ACTION(() => Number.parseInt(value, 10));
        });
        this.performSelfAnalysis();
    }
}
// EXPORT PARSER INSTANCE
// ================================================================================================
exports.parser = new AirParser();
//# sourceMappingURL=parser.js.map