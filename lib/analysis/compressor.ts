// IMPORTS
// ================================================================================================
import { Procedure, Subroutine } from "../procedures";
import {
    Expression, ExpressionVisitor, LiteralValue, BinaryOperation, UnaryOperation, MakeVector,
    GetVectorElement, SliceVector, MakeMatrix, LoadExpression, Dimensions
} from "../expressions";

// PROCEDURE COMPRESSOR
// ================================================================================================
export function compressProcedure(procedure: Procedure) {

    let expressions = [...procedure.subroutines.map(s => s.expression), procedure.result];
    const subroutineReferences = new Map<Subroutine, LoadExpression[]>();
    expressions.forEach(e => collectSubroutineReferences(e, subroutineReferences));

    const retainedSubroutines: Subroutine[] = [];
    for (let i = 0; i < procedure.subroutines.length; i++) {
        let subroutine = procedure.subroutines[i];
        let references = subroutineReferences.get(subroutine);
        if (!references) continue;
        if (references.length === 1) {
            let reference = references[0];
            procedure.transformExpressions(e => e === reference ? subroutine.expression : e, i + 1);
        }
        else {
            retainedSubroutines.push(subroutine);
        }
    }

    procedure.replaceSubroutines(retainedSubroutines);

    procedure = compressProcedure2(procedure);

    return procedure;
}

// EXPRESSION REPLACER
// ================================================================================================
function collectSubroutineReferences(e: Expression, result: Map<Subroutine, LoadExpression[]>): void {
    if (e instanceof LoadExpression) {
        if (!(e.binding instanceof Subroutine)) return;
        const loads = result.get(e.binding) || [];
        loads.push(e)
        result.set(e.binding, loads);
    }
    else {
        for (let child of e.children) {
            collectSubroutineReferences(child, result);
        }
    }
}

// EXPRESSION COMPRESSOR
// ================================================================================================
class ExpressionCompressor extends ExpressionVisitor<Expression> {

    // LITERALS
    // --------------------------------------------------------------------------------------------
    literalValue(e: LiteralValue): LiteralValue {
        return e;
    }

    // OPERATIONS
    // --------------------------------------------------------------------------------------------
    binaryOperation(e: BinaryOperation): BinaryOperation {
        const lhs = this.visit(e.lhs);
        const rhs = this.visit(e.rhs);
        return (e.lhs !== lhs || e.rhs !== rhs)
            ? new BinaryOperation(e.operation, lhs, rhs)
            : e;
    }

    unaryOperation(e: UnaryOperation): UnaryOperation {
        const operand = this.visit(e.operand);
        return (e.operand !== operand)
            ? new UnaryOperation(e.operation, operand)
            : e;
    }

    // VECTORS AND MATRIXES
    // --------------------------------------------------------------------------------------------
    makeVector(e: MakeVector): MakeVector {
        let elements = e.elements.map(e => this.visit(e));
        return new MakeVector(elements);
    }

    getVectorElement(e: GetVectorElement): Expression {
        let source = this.visit(e.source);
        if (source instanceof MakeVector) {
            let element = source.getElementFor(e.index);
            if (element instanceof LiteralValue) return element;
        }

        return (e.source !== source)
            ? new GetVectorElement(source, e.index)
            : e;
    }

    sliceVector(e: SliceVector): SliceVector {
        let source = this.visit(e.source);
        return new SliceVector(source, e.start, e.end);
    }

    makeMatrix(e: MakeMatrix): Expression {
        return e;
    }

    // LOAD AND STORE
    // --------------------------------------------------------------------------------------------
    loadExpression(e: LoadExpression): LoadExpression {
        return e;
    }
}

const compressor = new ExpressionCompressor();
export function compressProcedure2(proc: Procedure) {
    const result = new Procedure(proc.name, proc.span, proc.resultLength, proc.constants, proc.locals as any, proc.traceRegisters.dimensions[0], proc.staticRegisters.dimensions[0]);
    proc.subroutines.forEach(s => result.addSubroutine(compressor.visit(s.expression), s.localVarIdx));
    result.setResult(compressor.visit(proc.result));
    return result;
}

// HELPER FUNCTIONS
// ================================================================================================
function isAdjacent(group: (GetVectorElement | SliceVector)[], element: GetVectorElement | SliceVector): boolean {
    if (group.length < 1) return false;
    const groupEnd = group[group.length - 1].end;
    return (element.start - 1) === groupEnd;
}

function compressGroup(elements: Expression[], group: (GetVectorElement | SliceVector)[]) {
    if (group.length < 2) return;
    
    const firstElement = group[0], lastElement = group[group.length - 1];
    let i = elements.indexOf(firstElement);
    elements[i] = new SliceVector(firstElement.source, firstElement.start, lastElement.end);
    i++;

    for (let j = 1; j < group.length; j++, i++) {
        elements[i] = undefined as any;
    }
}