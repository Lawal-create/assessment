import axios from "axios";
import { expect } from "chai";
import fs from "fs";
import { getExchangeRate } from "../src/index";
import { parseCSV } from "../src/index";
import path from "path";
import sinon from "sinon";

describe("getExchangeRate", function () {
  it("should return exchange rates for valid tokens", async function () {
    // Stub the axios.get function to return mock data
    const axiosStub = sinon.stub(axios, "get");
    axiosStub.resolves({
      data: {
        BTC: { USD: 50000 },
        ETH: { USD: 2000 },
        XRP: { USD: 1.5 },
      },
    });

    // Call the getExchangeRate function with valid tokens
    const tokens = ["BTC", "ETH", "XRP"];
    const exchangeRates = await getExchangeRate(tokens);

    // Assert that the exchange rates are returned correctly
    expect(exchangeRates).to.eql({
      BTC: { USD: 50000 },
      ETH: { USD: 2000 },
      XRP: { USD: 1.5 },
    });

    // Restore the axios.get function to its original implementation
    axiosStub.restore();
  });
});

describe("parseCSV", function () {
  it("should parse a CSV file and yield each row as an array", async function () {
    // Create a temporary CSV file with some test data
    const csvFilePath = path.join(__dirname, "test.csv");
    const testData = [
      ["Timestamp", "Transaction Type", "Token", "Amount"],
      ["1649184000000", "DEPOSIT", "BTC", "0.1"],
      ["1649270400000", "WITHDRAW", "ETH", "1.23"],
      ["1649356800000", "DEPOSIT", "BTC", "0.05"],
    ];
    fs.writeFileSync(
      csvFilePath,
      testData.map((row) => row.join(",")).join("\r\n")
    );

    // Call the parseCSV function with the test CSV file path
    const rows: string[][] = [];
    for await (const row of parseCSV(csvFilePath)) {
      rows.push(row);
    }

    // Assert that the rows are parsed correctly
    expect(rows).to.deep.equal([
      ["1649184000000", "DEPOSIT", "BTC", "0.1"],
      ["1649270400000", "WITHDRAW", "ETH", "1.23"],
      ["1649356800000", "DEPOSIT", "BTC", "0.05"],
    ]);

    // Remove the temporary CSV file
    fs.unlinkSync(csvFilePath);
  });
});
