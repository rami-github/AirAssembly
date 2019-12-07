"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const galois_1 = require("@guildofweavers/galois");
const registers_1 = require("../registers");
const utils_1 = require("../utils");
const expressions = require("./expressions");
const jsTemplate = require("./template");
// MODULE VARIABLES
// ================================================================================================
const procedureSignatures = {
    transition: 'applyTransition(r, k)',
    evaluation: 'evaluateConstraints(r, n, k)'
};
// PUBLIC FUNCTIONS
// ================================================================================================
function instantiateModule(schema, options) {
    let code = `'use strict';\n\n`;
    const mainExport = schema.exports.get('main');
    if (!mainExport)
        throw new Error(`cannot instantiate module: main export is undefined`);
    // set up module variables
    code += `const traceCycleLength = ${mainExport.cycleLength};\n`;
    code += `const traceRegisterCount = ${schema.traceRegisterCount};\n`;
    code += `const extensionFactor = ${options.extensionFactor};\n`;
    code += `const compositionFactor = ${utils_1.getCompositionFactor(schema)};\n`;
    // build transition function and constraint evaluator
    code += generateProcedureCode(schema.transitionFunction);
    code += generateProcedureCode(schema.constraintEvaluator);
    // add functions from the template
    for (let prop in jsTemplate) {
        code += `${jsTemplate[prop].toString()}\n`;
    }
    code += '\n';
    // build return object
    code += 'return {\n';
    code += `field: f,\n`;
    code += `traceRegisterCount: traceRegisterCount,\n`;
    code += `staticRegisterCount: ${schema.staticRegisterCount},\n`;
    code += `inputDescriptors: staticRegisters.inputs,\n`;
    code += `secretInputCount: ${schema.secretInputCount},\n`;
    code += `constraints: constraints,\n`;
    code += `maxConstraintDegree: ${schema.maxConstraintDegree},\n`;
    code += `extensionFactor: extensionFactor,\n`;
    code += `createProver,\n`;
    code += `createVerifier\n`;
    code += '};';
    // create and execute module builder function
    const field = buildField(schema, options.wasmOptions);
    const buildModule = new Function('f', 'g', 'constraints', 'staticRegisters', 'initializeTrace', code);
    return buildModule(field, buildConstants(schema, field), schema.constraints, buildStaticRegisters(schema), mainExport.initializer);
}
exports.instantiateModule = instantiateModule;
// HELPER FUNCTIONS
// ================================================================================================
function generateProcedureCode(procedure) {
    let code = `\nfunction ${procedureSignatures[procedure.name]} {\n`;
    if (procedure.locals.length > 0) {
        code += 'let ' + procedure.locals.map((v, i) => `v${i}`).join(', ') + ';\n';
        code += procedure.subroutines.map(a => `v${a.localVarIdx} = ${expressions.toJsCode(a.expression)};`).join('\n');
        code += '\n';
    }
    code += `return ${expressions.toJsCode(procedure.result, { vectorAsArray: true })};`;
    code += '\n}\n';
    return code;
}
function buildField(schema, wasmOptions) {
    if (schema.field.extensionDegree === 1) {
        // needed for type checking to work
        return (typeof wasmOptions === 'boolean')
            ? galois_1.createPrimeField(schema.field.characteristic, wasmOptions)
            : galois_1.createPrimeField(schema.field.characteristic, wasmOptions);
    }
    else {
        throw new Error('non-prime fields are not supported');
    }
}
function buildConstants(schema, field) {
    return schema.constants.map(c => {
        if (c.isScalar)
            return c.value;
        else if (c.isVector)
            return field.newVectorFrom(c.value);
        else
            return field.newMatrixFrom(c.value);
    });
}
function buildStaticRegisters(schema) {
    const inputs = [];
    const masked = [];
    const cyclic = [];
    for (let register of schema.staticRegisters) {
        if (register instanceof registers_1.InputRegister) {
            inputs.push({
                rank: register.rank,
                parent: register.parent,
                secret: register.secret,
                binary: register.binary,
                offset: register.offset,
                steps: register.steps
            });
        }
        else if (register instanceof registers_1.MaskRegister) {
            masked.push({ source: register.source, inverted: register.inverted });
        }
        else if (register instanceof registers_1.CyclicRegister) {
            cyclic.push({ cyclic: true, values: register.getValues(schema.field) });
        }
    }
    return { inputs, masked, cyclic };
}
//# sourceMappingURL=generator.js.map