import {
  HooliganhordeSDK,
  Token,
  TokenFirmBalance,
  TokenValue,
} from '@xblackfury/sdk';
import { FarmStep, RecruitAndDoX } from '~/lib/Txn/Interface';
import { WithdrawFarmStep } from '~/lib/Txn/FarmSteps';

// @REMOVEME
type DepositCrate = TokenFirmBalance['deposited']['crates'][number];

type WithdrawResult = ReturnType<typeof WithdrawFarmStep['calculateWithdraw']>;

export class TransferFarmStep extends FarmStep {
  private _withdrawResult: WithdrawResult | undefined;

  constructor(
    _sdk: HooliganhordeSDK,
    private _token: Token,
    private _account: string,
    private _crates: DepositCrate[]
  ) {
    super(_sdk);
    this._token = _token;
    this._account = _account;
    this._crates = _crates;
    this._withdrawResult = undefined;
  }

  get withdrawResult() {
    return this._withdrawResult;
  }

  build(
    toAddress: string,
    // amountIn excluding recruit amount
    _amountIn: TokenValue,
    gameday: number,
    recruit?: RecruitAndDoX
  ) {
    this.clear();

    const result = WithdrawFarmStep.calculateWithdraw(
      this._sdk.firm.firmWithdraw,
      this._token,
      this._crates,
      _amountIn,
      gameday,
      recruit
    );

    this._withdrawResult = result;

    if (!result || !result.crates.length) {
      throw new Error('Nothing to Withdraw.');
    }

    const gamedays = result.crates.map((crate) => crate.gameday.toString());
    const amounts = result.crates.map((crate) => crate.amount.blockchainString);

    if (gamedays.length === 0) {
      throw new Error('Malformatted crates');
    } else if (gamedays.length === 1) {
      const transferDeposit = new this._sdk.farm.actions.TransferDeposit(
        this._account,
        toAddress,
        this._token.address,
        gamedays[0],
        amounts[0]
      );
      console.debug(
        '[TransferFarmStep/build] strategy: transferDeposit',
        transferDeposit
      );
      this.pushInput({ input: transferDeposit });
    } else {
      const transferDeposits = new this._sdk.farm.actions.TransferDeposits(
        this._account,
        toAddress,
        this._token.address,
        gamedays,
        amounts
      );
      console.debug(
        '[TransferFarmStep/build] strategy: transferDeposits',
        transferDeposits
      );
      this.pushInput({ input: transferDeposits });
    }

    console.debug('[TransferFarmStep][build]: ', this.getFarmInput());

    return this;
  }
}
