"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTS
// ================================================================================================
const index_1 = require("../index");
// SOURCE CODE
// ================================================================================================
const source = `
(module
    (field prime 340282366920938463463374607393113505793)
    (const $alpha scalar 5)
	(const $mds matrix
            (214709430312099715322788202694750992687  54066244720673262921467176400601950806 122144641489288436529811410313120680228)
            ( 83122512782280758906222839313578703456 163244785834732434882219275190570945140  65865044136286518938950810559808473518)
			( 12333142678723890553278650076570367543 308304933036173868454178201249080175007  76915505462549994902479959396659996669))
	(function $poseidonRound
		(result vector 3)
		(param $state vector 3) (param $roundKeys vector 3) (param $isFullRound scalar)
		(local $fullRound vector 3) (local $partRound vector 3)
		(store.local $fullRound
			(prod
				(load.const $mds)
				(exp
					(add (load.param $state) (load.param $roundKeys))
					(load.const $alpha))))
		(store.local $partRound
			(prod
				(load.const $mds)
				(vector
					(add (slice (load.param $state) 0 1) (slice (load.param $roundKeys) 1 2))
					(exp
						(add (get (load.param $state) 2) (get (load.param $roundKeys) 2))
						(load.const $alpha)))))
		(add
			(mul (load.local $fullRound) (load.param $isFullRound))
			(mul (load.local $partRound) (sub (scalar 1)  (load.param $isFullRound)))))
	(export poseidon
		(registers 3) (constraints 3) (steps 64)
		(static
			(cycle 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 0)
			(cycle (prng sha256 0x486164657331 64))
			(cycle (prng sha256 0x486164657332 64))
			(cycle (prng sha256 0x486164657333 64)))
		(init
			(param $seed vector 2)
			(vector (load.param $seed) (scalar 0)))
		(transition
			(call $poseidonRound (load.trace 0) (slice (load.static 0) 1 3) (get (load.static 0) 0)))
		(evaluation
			(sub
				(load.trace 1)
				(call $poseidonRound (load.trace 0) (slice (load.static 0) 1 3) (get (load.static 0) 0))))))
`;
// EXAMPLE CODE
// ================================================================================================
const inputs = [42n, 43n];
// instantiate AirModule object
const schema = index_1.compile(Buffer.from(source));
const stats = index_1.analyze(schema, 'poseidon');
const air = index_1.instantiate(schema, 'poseidon');
// generate trace table
const pContext = air.initProvingContext([], inputs);
const trace = pContext.generateExecutionTrace();
// generate constraint evaluation table
const pPolys = air.field.interpolateRoots(pContext.executionDomain, trace);
const cEvaluations = pContext.evaluateTransitionConstraints(pPolys);
console.log('done!');
//# sourceMappingURL=poseidon.js.map