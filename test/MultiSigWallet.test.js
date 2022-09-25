const exceptions = require("./exceptions");
const MultiSigWallet = artifacts.require("MultiSigWallet");
const $Demo = artifacts.require("Demo");

let MSW, Demo, curVal;
const requiredConfirmations = 2;

let callData = web3.eth.abi.encodeFunctionCall(
  {
    name: "callMe",
    type: "function",
    inputs: [
      {
        type: "uint256",
        name: "amount",
      },
    ],
  },
  [10]
);

const callDemoFunc = async (addVal, secondAdmin) => {
  curVal = (await Demo.i()).toNumber();
  let res = await MSW.submitTransaction(Demo.address, 0, callData);
  let txId = res.logs[0].args[0].toNumber();
  assert.equal(await MSW.isConfirmed(txId), false);
  assert.equal(await Demo.i(), curVal);
  await MSW.confirmTransaction(txId, { from: secondAdmin });
  assert.equal(await MSW.isConfirmed(txId), true);
  let tx = await MSW.transactions(txId);
  assert.equal(tx.executed, true);
  console.log(curVal + addVal);
  assert.equal(await Demo.i(), curVal + addVal);
};

describe.only("------ MultiSigWallet Tests ------", function () {
  before(async function () {
    [admin1, admin2, admin3, admin4, admin5] = await web3.eth.getAccounts();
    MSW = await MultiSigWallet.new(
      [admin1, admin2, admin3],
      requiredConfirmations
    );
    Demo = await $Demo.new();
  });

  describe("Deployment", function () {
    it("Should deploy the contract", async function () {
      assert.equal(await MSW.required(), 2);
    });
  });

  describe("ownership management", function () {
    it("should add and confirm transaction", async function () {
      await callDemoFunc(10, admin3);

      let addOwnerCallData = web3.eth.abi.encodeFunctionCall(
        {
          name: "addOwner",
          type: "function",
          inputs: [
            {
              type: "address",
              name: "admin",
            },
          ],
        },
        [admin4]
      );
      let res = await MSW.submitTransaction(MSW.address, 0, addOwnerCallData);
      let txId = res.logs[0].args[0].toNumber();
      await MSW.confirmTransaction(txId, { from: admin3 });
      await callDemoFunc(10, admin4);
    });
  });
});
