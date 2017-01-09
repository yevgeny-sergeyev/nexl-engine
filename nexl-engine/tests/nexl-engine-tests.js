// libraries
const nexlEngine = require('../nexl-engine');
const util = require('util');
const j79 = require('j79-utils');
const assert = require('assert');
const expressions = require('./expressions/expressions');

// nexl source file
var nexlSource = {asFile: {fileName: 'nexl-sources/nexl-source1.js'}};

// comparing two javascript variables
function compare(result, expectedResult) {
	var s1 = JSON.stringify(result);
	var s2 = JSON.stringify(expectedResult);
	return s1 === s2;
}

// exprDef -> to string
function exprDefVerbally(exprDef) {
	var str = '';
	if (exprDef.args) {
		str = ', args = ' + JSON.stringify(exprDef.args);
	} else {
		str = ' -- no args --';
	}
	return util.format("expression = [%s]%s", exprDef.expression, str)
}

// prints OK message for expression
function printOkExpression(exprDef) {
	console.log('OK for ', exprDefVerbally(exprDef));
}

function failureMessage(exprDef, err) {
	console.log('------>>>>>> FAILURE !!!! <<<<<<------');
	console.log(exprDefVerbally(exprDef));
	console.log('Reason : ' + err);
	console.log('');
}

// tests the expression
function testExpression(exprDef) {
	try {
		var result = nexlEngine.evalAndSubstNexlExpression(nexlSource, exprDef.expression, exprDef.args);
	} catch (e) {
		if (exprDef.result !== undefined) {
			failureMessage(exprDef, e);
			return false;
		}

		printOkExpression(exprDef);
		return true;
	}

	// if the exprDef.result is not defined, expression must fail. checking
	if (exprDef.result === undefined) {
		failureMessage(exprDef, 'This test MUST FAIL, but hasn\'t');
		return false;
	}

	var compareResult = compare(result, exprDef.result);
	if (!compareResult) {
		var resultType = j79.getType(result);
		var exprDefType = j79.getType(exprDef.result);
		failureMessage(exprDef, util.format('Expected result = (%s)[%s] doesn\'t match to evaluated result = (%s)[%s]', exprDefType, exprDef.result, resultType, result));
		return false;
	}

	printOkExpression(exprDef);
	return true;
}

// entry point
function start() {
	// iterating over expressions definitions
	var okCnt = 0;
	var failCnt = 0;
	for (var index in expressions) {
		console.log('\nTest #', index);

		var exprDef = expressions[index];
		var result = testExpression(exprDef);

		if (result) {
			okCnt++;
		} else {
			failCnt++;
		}
	}

	console.log(util.format('\n\nOK tests : %s', okCnt));
	console.log(util.format('Failed tests : %s', failCnt));

	var msg = failCnt <= 0 ? 'All tests are passed OK' : 'One or more tests ARE FAILED !!!';
	console.log(util.format('\n\n****************************************************************\n%s\n****************************************************************', msg));
}

start();