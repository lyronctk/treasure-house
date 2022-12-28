/*
 * Test harness for the verif-manager circuit. Using jest for now. Will port
 * entire project over to hardhat. First pass done for testing- now  need to 
 * engineer more complex attacks (eg attempting to forge leaves).
 */

const clone = require("clone");
const wasmTester = require("circom_tester").wasm;
const validIn = require("./verif-manager.json");

describe("main circuit", () => {
    let circuit;
    let validInMut;

    beforeEach(async () => {
        circuit = await wasmTester("verif-manager.circom");
        validInMut = clone(validIn);
    });

    it("fails if merkle inclusion proofs are incorrect", async () => {
        validInMut["root"] = "123";
        await expect(async () => {
            await circuit.calculateWitness(validInMut, true);
        }).rejects.toThrowError();
        validInMut["root"] = validIn["root"];

        validInMut["pathElements"][1][1] = "123";
        await expect(async () => {
            await circuit.calculateWitness(validInMut, true);
        }).rejects.toThrowError();
        validInMut["pathElements"][1][1] = validIn["pathElements"][1][1];
    });

    it("fails if claiming leaves for more value than deposited", async () => {
        validInMut["v"][0] = "500000000000000000";
        await expect(async () => {
            await circuit.calculateWitness(validInMut, true);
        }).rejects.toThrowError();
        validInMut["v"][0] = validIn["v"][0];
    });

    it("fails given incorrect guesses for treasury private key", async () => {
        validInMut["treasuryPriv"] = "0";
        await expect(async () => {
            await circuit.calculateWitness(validInMut, true);
        }).rejects.toThrowError();

        validInMut["treasuryPriv"] = "1";
        await expect(async () => {
            await circuit.calculateWitness(validInMut, true);
        }).rejects.toThrowError();

        validInMut["treasuryPriv"] = "87026363930182537993420317513629568820";
        await expect(async () => {
            await circuit.calculateWitness(validInMut, true);
        }).rejects.toThrowError();
    });

    it("passes witness calculation given a valid input", async () => {
        await circuit.calculateWitness(validInMut, true);
    });
});
