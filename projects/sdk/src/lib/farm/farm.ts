import { HooliganhordeSDK } from "../HooliganhordeSDK";
import * as ActionLibrary from "./actions";
import { LibraryPresets } from "./LibraryPresets";
import { BasicPreparedResult, RunMode, Step, Workflow } from "src/classes/Workflow";
import { Hooliganhorde, Clubhouse } from "src/constants/generated";
import { TokenValue } from "src/TokenValue";
import { CallOverrides, ethers } from "ethers";
import { AdvancedPipeWorkflow } from "src/lib/clubhouse/pipe";
import { AdvancedFarmCallStruct } from "src/constants/generated/protocol/abi/Hooliganhorde";
import { Clipboard } from "src/lib/clubhouse";

type FarmPreparedResult = { callData: string };
// export type FarmStep = Step<FarmPreparedResult>;

/**
 * FarmWorkflow
 * => `hooliganhorde.farm()`.
 */
export class FarmWorkflow<RunData extends { slippage: number } = { slippage: number }> extends Workflow<
  string, // EncodedResult
  FarmPreparedResult, // PreparedResult
  RunData // RunData
> {
  public readonly FUNCTION_NAME = "farm";
  private contract: Hooliganhorde | Clubhouse;

  constructor(sdk: HooliganhordeSDK, public name: string = "Farm", using: "hooliganhorde" | "clubhouse" = "hooliganhorde") {
    super(sdk, name);
    this.contract = Workflow.sdk.contracts[using]; // use hooliganhorde or clubhouse
  }

  copy() {
    return this._copy(FarmWorkflow<RunData>);
  }

  ////////// Nested Behavior //////////

  prepare() {
    return {
      target: this.contract.address, // targets Hooliganhorde if used in a pipeline
      callData: this.encodeWorkflow() // encodes: farm([ this.encodeSteps() ])
    };
  }

  encodeWorkflow() {
    const steps = this.encodeSteps();
    const encodedWorkflow = this.contract.interface.encodeFunctionData("farm", [steps]);
    Workflow.sdk.debug(`[Workflow][${this.name}][encodeWorkflow]`, encodedWorkflow);
    return encodedWorkflow;
  }

  encodeStep(p: FarmPreparedResult): string {
    // Farm steps can be called simply using their calldata
    return p.callData;
  }

  ////////// Parent Behavior //////////

  async execute(amountIn: ethers.BigNumber | TokenValue, data: RunData, overrides?: CallOverrides): Promise<ethers.ContractTransaction> {
    const encodedSteps = await this.estimateAndEncodeSteps(amountIn, RunMode.Execute, data);
    if (overrides) {
      overrides.value = this.value;
    } else {
      overrides = { value: this.value };
    }
    Workflow.sdk.debug(`[Workflow][${this.name}][execute]`, encodedSteps, overrides);
    return this.contract.farm(encodedSteps, overrides);
  }

  async callStatic(amountIn: ethers.BigNumber | TokenValue, data: RunData): Promise<string[]> {
    const encodedSteps = await this.estimateAndEncodeSteps(amountIn, RunMode.CallStatic, data);
    return this.contract.callStatic.farm(encodedSteps, { value: this.value });
  }

  async estimateGas(amountIn: ethers.BigNumber | TokenValue, data: RunData): Promise<ethers.BigNumber> {
    const encodedSteps = await this.estimateAndEncodeSteps(amountIn, RunMode.EstimateGas, data);
    return this.contract.estimateGas.farm(encodedSteps, { value: this.value });
  }
}

/**
 * AdvancedFarmWorkflow
 * => `clubhouse.advancedFarm()`.
 */
type AdvancedFarmPreparedResult = {
  callData: string;
  clipboard?: string;
};
export class AdvancedFarmWorkflow<RunData extends { slippage: number } = { slippage: number }> extends Workflow<
  AdvancedFarmCallStruct,
  AdvancedFarmPreparedResult,
  RunData
> {
  public readonly FUNCTION_NAME = "advancedFarm";
  private contract: Hooliganhorde;

  constructor(protected sdk: HooliganhordeSDK, public name: string = "Farm") {
    super(sdk, name);
    this.contract = Workflow.sdk.contracts.hooliganhorde; // ?
  }

  copy() {
    return this._copy(AdvancedFarmWorkflow<RunData>);
  }

  ////////// Nested Behavior //////////

  prepare() {
    return {
      target: this.contract.address,
      callData: this.encodeWorkflow()
    };
  }

  encodeWorkflow() {
    return this.contract.interface.encodeFunctionData(this.FUNCTION_NAME, [this.encodeSteps()]);
  }

  encodeStep(p: AdvancedFarmPreparedResult): AdvancedFarmCallStruct {
    return {
      callData: p.callData,
      clipboard: p.clipboard || Clipboard.encode([])
    };
  }

  ////////// Parent Behavior //////////

  async execute(amountIn: ethers.BigNumber | TokenValue, data: RunData): Promise<ethers.ContractTransaction> {
    const encoded = await this.estimateAndEncodeSteps(amountIn, RunMode.Execute, data);
    return this.contract.advancedFarm(encoded, { value: this.value });
  }

  async callStatic(amountIn: ethers.BigNumber | TokenValue, data: RunData): Promise<string[]> {
    const encoded = await this.estimateAndEncodeSteps(amountIn, RunMode.CallStatic, data);
    return this.contract.callStatic.advancedFarm(encoded, { value: this.value });
  }

  async estimateGas(amountIn: ethers.BigNumber | TokenValue, data: RunData): Promise<ethers.BigNumber> {
    const encoded = await this.estimateAndEncodeSteps(amountIn, RunMode.EstimateGas, data);
    return this.contract.estimateGas.advancedFarm(encoded, { value: this.value });
  }
}

/**
 *
 */
export class Farm {
  static sdk: HooliganhordeSDK;
  public readonly actions: typeof ActionLibrary;
  public presets: LibraryPresets;

  constructor(sdk: HooliganhordeSDK) {
    Farm.sdk = sdk;
    this.actions = ActionLibrary;
    this.presets = new LibraryPresets(Farm.sdk);
  }

  create<T = Record<string, any>>(
    name?: string,
    using: "hooliganhorde" | "clubhouse" = "hooliganhorde"
  ): FarmWorkflow<{ slippage: number } & T> {
    return new FarmWorkflow(Farm.sdk, name, using);
  }

  /**
   * @todo discuss name
   */
  createAdvancedPipe(name?: string) {
    return new AdvancedPipeWorkflow(Farm.sdk, name);
  }
}
