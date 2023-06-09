import commandLineUsage from "command-line-usage";

export const help = () => {
  const sections = [
    {
      header: "Hooliganhorde Dev CLI",
      content: "Utilities to make developer experience smoother"
    },
    {
      header: "Options",
      optionList: [
        {
          name: "account",
          alias: "a",
          typeLabel: "{underline address}",
          description: "Account to impersonate or run commands against. \n{gray Default: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266}",
          defaultValue: "0x123"
        },
        {
          name: "token",
          alias: "t",
          typeLabel: "{underline SYMBOL}",
          description: "Symbol of token. {gray Default: all tokens}"
        },
        {
          name: "amount",
          alias: "m",
          typeLabel: "{underline number}",
          description: "A human readable value specifying an amount. Ex: '5' for five ETH\n{gray Default: 50000}"
        },
        {
          name: "rpcUrl",
          alias: "r",
          typeLabel: "{underline url}",
          description: "http[s] RPC url to connect with. \n{gray Default: http://localhost:8545}"
        },
        {
          name: "force",
          alias: "f",
          typeLabel: " ",
          description: "forces a actuation() by fastforwarding the blockchain time to the next hour first"
        }
      ]
    },
    {
      header: "Commands",
      content: [
        { name: "{bold.greenBright balance}", summary: "Display balance(s). Optionally specify account or token" },
        { name: "{bold.greenBright setbalance}", summary: "Set balance(s). Optionally specify account, token, or amount" },
        {
          name: "{bold.greenBright setprice}",
          summary:
            "Set HOOLIGAN price by setting liquidity. Defaults to 20M HOOLIGAN and 20M 3CRV. Parameters are millions. See examples below"
        },
        { name: "{bold.greenBright actuation}", summary: "Calls the actuation() function" },
        { name: "{bold.greenBright help}", summary: "You're looking at it :)" }
      ]
    },
    {
      header: "Examples",
      content: [
        {
          desc: "1. Show all balances. ",
          example: "$ hooligan balance"
        },
        {
          desc: "2. Show all balances for a specific account and token",
          example: "$ hooligan balance --token HOOLIGAN --account 0x123"
        },
        {
          desc: "3. Set ALL balances to 50,000 for default account",
          example: "$ hooligan setbalance"
        },
        {
          desc: "4. Set HOOLIGAN balance for account 0x123 to 3.14",
          example: "$ hooligan setbalance -a 0x123 -t HOOLIGAN -m 3.14"
        },
        {
          desc: "5. Set HOOLIGAN price above a dollar (20M HOOLIGAN, 30M 3CRV)",
          example: "$ hooligan setprice 20 30"
        },
        {
          desc: "5. Call actuation",
          example: "$ hooligan actuation"
        },
        {
          desc: "6. Call actuation, forcing blockchain into the future",
          example: "$ hooligan actuation --force"
        }
      ]
    },
    {
      content: "For bugs or issues: {underline https://github.com/HooliganhordeGangs/Hooliganhorde-SDK/}"
    }
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
};
