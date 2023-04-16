# Portfolio Valuation

### This is a Node.js command line application that calculates the USD valuation of a token portfolio using exchange rates.

## Getting Started

### Prerequisites

You need to have Node.js installed on your machine.

## Installation

1. Clone the repository:

   ```
   git clone assessment
   ```

2. Install the dependencies:

   ```
   cd assessment
   yarn
   ```

3. Create a .env file and add your CRYPTO_COMPARE_SECRET_KEY:
   ```
   CRYPTO_COMPARE_SECRET_KEY=<your-secret-key>
   ```

## Usage

The tool provides several commands for getting portfolio valuations:
To run the application, use the following command:

Where [command] is one of the following:

- `latest`: get the latest portfolio value per token in USD
- `token [tokenSymbol]`: get the latest portfolio value for a given token in USD

- `date [date]`: get portfolio value per token in USD on a given date

  ```
  $ yarn start [command]
  ```

# Test

To run unit test, do the following:

- Comment the last line of code `main()`
- Run the following command

```
$ yarn test
```

## Latest

To get the latest portfolio value for each token in USD, run:

    $ yarn start latest

This will read transaction records from transactions.csv and display the portfolio valuation in USD for each token.

## Token

To get the latest portfolio value for a specific token in USD, run:

    $ yarn start token= <tokenSymbol>

Replace `<tokenSymbol>` with the symbol of the token you want to get the valuation for. For example:xs

    $ yarn start token= BTC

This will read transaction records from transactions.csv and display the portfolio valuation in USD for the specified token.

## Date

To get the portfolio value for each token in USD on a specific date, run:

    $ yarn start date= <date>

Replace <date> with the date in the format YYYY-MM-DD. For example:

    $ yarn start date= 2022-01-01

This will read transaction records from transactions.csv and display the portfolio valuation in USD for each token on the specified date.

# Design Decisions

The tool is implemented using TypeScript and makes use of several external libraries. The CryptoCompare API is used to obtain exchange rates for the tokens in the portfolio. The commander library is used to implement the command-line interface. The readline library is used to read transaction records from the CSV file one line at a time, which allows the tool to handle large files without running out of memory.

The tool is designed to be extensible and maintainable. The code is organized into functions that have a single responsibility, which makes it easy to modify or add functionality. The use of types and interfaces throughout the codebase helps to catch errors early and makes the code more self-documenting.

The tool also includes error handling to ensure that it handles unexpected input or errors from external services gracefully. If an error occurs when obtaining exchange rates from the CryptoCompare API, the tool will log an error message and exit with a non-zero exit code. If a transaction record contains invalid data, the tool will skip the record and continue processing the remaining records. If a command is called with invalid arguments, the tool will display an error message and exit with a non-zero exit code.

# Future Work

There are several ways in which the tool could be improved or extended:

- Add support for additional exchanges or data sources.
- Implement additional filters for transaction records, such as filtering by transaction type or amount.
- Add support for different output formats, such as CSV or JSON.
- Implement a web-based user interface for the tool.
