// IMPORTS
// ================================================================================================
import { Expression } from "./Expression";
import { Dimensions } from "./utils";

// CLASS DEFINITION
// ================================================================================================
export class TraceSegment extends Expression {

    readonly isStatic: boolean;

    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(width: number, isStatic: boolean) {
        super(Dimensions.vector(width), new Array(width).fill(1n));
        this.isStatic = isStatic;
    }

    // ACCESSORS
    // --------------------------------------------------------------------------------------------
    get segment(): 'trace' | 'static' {
        return this.isStatic ? 'static' : 'trace';
    }

    // PUBLIC METHODS
    // --------------------------------------------------------------------------------------------
    toString(): string {
        return this.segment;
    }
}