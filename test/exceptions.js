module.exports.errTypes = {
  revert: "revert",
  outOfGas: "out of gas",
  invalidJump: "invalid JUMP",
  invalidOpcode: "invalid opcode",
  stackOverflow: "stack overflow",
  stackUnderflow: "stack underflow",
  staticStateChange: "static state change",
};
const PREFIX = "VM Exception while processing transaction: ";

module.exports.tryCatch = async function (promise, errType) {
  try {
    await promise;
    console.log("===> Error Test Failed <===");
    throw null;
  } catch (error) {
    console.log("Error Test Passed: ", error.message);
    assert(error, "Expected an error but did not get one");
    assert(
      error.message.startsWith(PREFIX + errType),
      "Expected an error starting with '" +
        PREFIX +
        errType +
        "' but got '" +
        error.message +
        "' instead"
    );
  }
};
