"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const Expression_1 = require("./Expression");
const GetVectorElement_1 = require("./GetVectorElement");
const SliceVector_1 = require("./SliceVector");
// CLASS DEFINITION
// ================================================================================================
class MakeVector extends Expression_1.Expression {
    // CONSTRUCTOR
    // --------------------------------------------------------------------------------------------
    constructor(elements) {
        let degree = [];
        for (let element of elements) {
            if (element.isScalar) {
                degree.push(element.degree);
            }
            else if (element.isVector) {
                degree = degree.concat(element.degree);
            }
            else {
                throw new Error('cannot build vector from matrix elements');
            }
        }
        super([degree.length, 0], degree, elements);
    }
    // ACCESSORS
    // --------------------------------------------------------------------------------------------
    get elements() { return this.children; }
    // PUBLIC MEMBERS
    // --------------------------------------------------------------------------------------------
    compress() {
        let groupId = '', group = [];
        for (let element of this.elements) {
            if (element instanceof GetVectorElement_1.GetVectorElement || element instanceof SliceVector_1.SliceVector) {
                let gid = element.source.toString();
                if (gid === groupId && isAdjacent(group, element)) {
                    group.push(element);
                }
                else {
                    compressGroup(this.children, group);
                    groupId = gid;
                    group = [element];
                }
            }
        }
        compressGroup(this.children, group);
        const newChildren = this.children.filter(c => c !== undefined);
        this.children.length = 0;
        newChildren.forEach(c => this.children.push(c));
    }
    toString(options = {}) {
        const list = this.elements.map(e => e.toString({ vectorAsList: true })).join(' ');
        return options.vectorAsList ? list : `(vector ${list})`;
    }
}
exports.MakeVector = MakeVector;
// HELPER FUNCTIONS
// ================================================================================================
function isAdjacent(group, element) {
    if (group.length < 1)
        return false;
    const groupEnd = group[group.length - 1].end;
    return (element.start - 1) === groupEnd;
}
function compressGroup(elements, group) {
    if (group.length < 2)
        return;
    const firstElement = group[0], lastElement = group[group.length - 1];
    let i = elements.indexOf(firstElement);
    elements[i] = new SliceVector_1.SliceVector(firstElement.source, firstElement.start, lastElement.end);
    i++;
    for (let j = 1; j < group.length; j++, i++) {
        elements[i] = undefined;
    }
}
//# sourceMappingURL=MakeVector.js.map