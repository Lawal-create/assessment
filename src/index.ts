import * as dotenv from "dotenv";
import * as fs from "fs";

import { Command } from "commander";
import axios from "axios";
import readline from "readline";

type Response = Record<string, number>;
type TokenPortfolio = Map<string, number>;
type ExchangeRates = {
  [token: string]: {
    USD: number;
  };
};
dotenv.config();

const commander = new Command();
commander.version("0.0.1");

/**
 * Get current exchange rate for multiple tokens in USD
 * @param tokens an array of tokens [BTC, ETH, XRP]
 * @returns The current exchange rate of tokens in USD
 */
async function getExchangeRate(tokens: string[]): Promise<ExchangeRates> {
  const apiUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tokens.join(
    ","
  )}&tsyms=USD`;

  try {
    const { data } = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.CRYPTO_COMPARE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (error) {
    console.error(`Error getting exchange rates: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Reads a CSV file at the given file path and yields each row as an array of strings
 * @param filePath
 */

export async function* parseCSV(filePath: string) {
  // Create a readline interface to read the file one line at a time
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    // Use the crlfDelay option to recognize all instances of CR LF ('\r\n') in the CSV file
    crlfDelay: Infinity,
  });
  // Iterate over each line in the file
  let lineNumber = 0;
  for await (const line of rl) {
    if (lineNumber === 0) {
      // Skip the first line (header row)
      lineNumber++;
      continue;
    }
    const values = line.split(",");

    yield values;
  }
}

/**
 * This function processes transactions from a CSV file and returns a token portfolio.
 * @param filePath - The file path of the CSV file containing transaction records.
 * @param dateFilter - Optional date filter to limit transactions to those on or before the specified date.
 * @param tokenFilter - Optional token filter to limit transactions to those involving the specified token.
 * @returns A promise that resolves to a map of token symbols to portfolio values.
 */
async function processTransactions(
  filePath: string,
  dateFilter?: Date,
  tokenFilter?: string
): Promise<TokenPortfolio> {
  // Create an empty portfolio to store token values
  const portfolio = new Map<string, number>();

  // Iterate over each line of the CSV file and process the transaction
  for await (const values of parseCSV(filePath)) {
    const [timestampStr, transactionType, token, amountStr] = values;
    const amount = parseFloat(amountStr);

    // Skip transactions that don't match the filters
    if (dateFilter && Number(timestampStr) > dateFilter.getTime()) {
      continue;
    }
    if (tokenFilter && token !== tokenFilter) {
      continue;
    }

    // If the token doesn't exist in the portfolio, initialize its value to 0
    if (!portfolio.has(token)) {
      portfolio.set(token, 0);
    }

    // Add or subtract the transaction amount from the token's portfolio value
    if (transactionType === "DEPOSIT") {
      portfolio.set(token, portfolio.get(token)! + amount);
    } else {
      portfolio.set(token, portfolio.get(token)! - amount);
    }
  }

  // Return the token portfolio
  return portfolio;
}

/**
 * Calculates the USD valuation of a token portfolio using exchange rates.
 * @param {TokenPortfolio} portfolio - A map containing token balances.
 * @returns {Promise<Response>} A map containing token valuations in USD.
 */
async function calculateValuation(
  portfolio: TokenPortfolio
): Promise<Response> {
  const response: Response = {};
  const tokens = [...portfolio.keys()];
  const exchangeRate = await getExchangeRate(tokens);
  tokens.forEach((token) => {
    response[token] =
      Number(exchangeRate[token]["USD"]) * Number(portfolio.get(token));
  });
  return response;
}

/**
 * The main function that runs the command line interface and accepts user input to determine which portfolio valuation to display.
 */
async function main() {
  commander
    .command("latest")
    .description("get latest portfolio value per token in USD")
    .action(async () => {
      const portfolio = await processTransactions("transactions.csv");
      const response = await calculateValuation(portfolio);
      console.log(response);
    });

  commander
    .command("token <tokenSymbol>")
    .description("get latest portfolio value for a given token in USD")
    .action(async (tokenSymbol: string) => {
      const portfolio = await processTransactions(
        "transactions.csv",
        undefined,
        tokenSymbol
      );
      const response = await calculateValuation(portfolio);
      if (portfolio.has(tokenSymbol)) {
        console.log(`${tokenSymbol}: ${response[tokenSymbol]}`);
      } else {
        console.log(`Token ${tokenSymbol} not found in portfolio.`);
      }
    });

  commander
    .command("date <date>")
    .description("get portfolio value per token in USD on a given date")
    .action(async (date: string) => {
      const portfolio = await processTransactions(
        "transactions.csv",
        new Date(date)
      );
      const response = await calculateValuation(portfolio);
      console.log(response);
    });

  commander
    .command("date-token <date> <tokenSymbol>")
    .description("get portfolio value of a given token in USD on a given date")
    .action(async (date: string, tokenSymbol: string) => {
      const portfolio = await processTransactions(
        "transactions.csv",
        new Date(date),
        tokenSymbol
      );
      const response = await calculateValuation(portfolio);
      if (portfolio.has(tokenSymbol)) {
        console.log(`${tokenSymbol}: ${response[tokenSymbol]}`);
      } else {
        console.log(`Token ${tokenSymbol} not found in portfolio.`);
      }
    });

  commander.parse(process.argv);
}

main();
