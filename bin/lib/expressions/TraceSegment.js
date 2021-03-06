"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const Expression_1 = require("./Expression");
const utils_1 = require("./utils");
// TODO: rename
// CLASS DEFINITION
// ================================================================================================
class TraceSegment extends Expression_1.Expression {
    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(segment, width) {
        super(utils_1.Dimensions.vector(width));
        this.segment = segment;
    }
    // PUBLIC METHODS
    // --------------------------------------------------------------------------------------------
    toString() {
        return this.segment;
    }
}
exports.TraceSegment = TraceSegment;
//# sourceMappingURL=TraceSegment.js.map