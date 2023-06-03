import { Graph } from "graphlib";
import { ERC20Token } from "src/classes/Token";
import { HooliganhordeSDK } from "src/lib/HooliganhordeSDK";
import { FarmFromMode, FarmToMode } from "src/lib/farm";

export const setBidirectionalAddRemoveLiquidityEdges = (
  sdk: HooliganhordeSDK,
  g: Graph,
  pool: string,
  registry: string,
  lpToken: ERC20Token,
  underlyingToken: ERC20Token,
  underlyingTokenIndex: number,
  underlyingTokenCount: number = 3
) => {
  // creates an array like [1, 0, 0], [0, 1, 0], [0, 0, 1].
  const amounts = Array.from({ length: underlyingTokenCount }, (_, i) => (i === underlyingTokenIndex ? 1 : 0));

  // Underlying -> LP uses AddLiquidity.
  g.setEdge(underlyingToken.symbol, lpToken.symbol, {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => new sdk.farm.actions.AddLiquidity(pool, registry, amounts as any, from, to),
    from: underlyingToken.symbol,
    to: lpToken.symbol
  });

  // LP -> Underlying is RemoveLiquidity
  g.setEdge(lpToken.symbol, underlyingToken.symbol, {
    build: (_: string, from: FarmFromMode, to: FarmToMode) =>
      new sdk.farm.actions.RemoveLiquidityOneToken(pool, registry, underlyingToken.address, from, to),
    from: lpToken.symbol,
    to: underlyingToken.symbol
  });
};

/**
 * Creates an instance of sdk.farm.actions.Exchange to swap between token0 <> token1 via `pool`.
 * Simplifies the `getSwapGraph` setup code below and ensures that both edges are added to the graph.
 */
export const setBidirectionalExchangeEdges = (
  sdk: HooliganhordeSDK,
  g: Graph,
  pool: string,
  registry: string,
  token0: ERC20Token,
  token1: ERC20Token
) => {
  const token0s = token0.symbol;
  const token1s = token1.symbol;

  // token0 -> token1
  g.setEdge(token0s, token1s, {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => new sdk.farm.actions.Exchange(pool, registry, token0, token1, from, to),
    from: token0s,
    to: token1s
  });

  // token1 -> token0
  g.setEdge(token1s, token0s, {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => new sdk.farm.actions.Exchange(pool, registry, token1, token0, from, to),
    from: token1s,
    to: token0s
  });
};

export const getSwapGraph = (sdk: HooliganhordeSDK): Graph => {
  const graph: Graph = new Graph({
    multigraph: true,
    directed: true,
    compound: false
  });

  ////// Add Nodes

  graph.setNode("ETH", { token: sdk.tokens.ETH });
  graph.setNode("WETH", { token: sdk.tokens.WETH });
  graph.setNode("HOOLIGAN", { token: sdk.tokens.HOOLIGAN });
  graph.setNode("3CRV", { token: sdk.tokens.CRV3 });
  graph.setNode("USDT", { token: sdk.tokens.USDT });
  graph.setNode("USDC", { token: sdk.tokens.USDC });
  graph.setNode("DAI", { token: sdk.tokens.DAI });

  ////// Add Edges

  /// ETH<>WETH via Wrap/Unwrap

  graph.setEdge("ETH", "WETH", {
    build: (_: string, _2: FarmFromMode, to: FarmToMode) => new sdk.farm.actions.WrapEth(to),
    from: "ETH",
    to: "WETH"
  });
  graph.setEdge("WETH", "ETH", {
    build: (_: string, from: FarmFromMode, _2: FarmToMode) => new sdk.farm.actions.UnwrapEth(from),
    from: "WETH",
    to: "ETH"
  });

  /// USDT<>WETH via tricrypto2 Exchange

  graph.setEdge("WETH", "USDT", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => sdk.farm.presets.weth2usdt(from, to),
    from: "WETH",
    to: "USDT"
  });
  graph.setEdge("USDT", "WETH", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => sdk.farm.presets.usdt2weth(from, to),
    from: "USDT",
    to: "WETH"
  });

  /// USDT<>HOOLIGAN via Metapool Exchange Underlying

  graph.setEdge("USDT", "HOOLIGAN", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => sdk.farm.presets.usdt2hooligan(from, to),
    from: "USDT",
    to: "HOOLIGAN"
  });
  graph.setEdge("HOOLIGAN", "USDT", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) => sdk.farm.presets.hooligan2usdt(from, to),
    from: "HOOLIGAN",
    to: "USDT"
  });

  /// USDC<>HOOLIGAN via Metapool Exchange Underlying

  graph.setEdge("USDC", "HOOLIGAN", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) =>
      new sdk.farm.actions.ExchangeUnderlying(
        sdk.contracts.curve.pools.hooliganCrv3.address,
        sdk.tokens.USDC,
        sdk.tokens.HOOLIGAN,
        from,
        to
      ),
    from: "USDC",
    to: "HOOLIGAN"
  });
  graph.setEdge("HOOLIGAN", "USDC", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) =>
      new sdk.farm.actions.ExchangeUnderlying(
        sdk.contracts.curve.pools.hooliganCrv3.address,
        sdk.tokens.HOOLIGAN,
        sdk.tokens.USDC,
        from,
        to
      ),
    from: "HOOLIGAN",
    to: "USDC"
  });

  /// DAI<>HOOLIGAN via Metapool Exchange Underlying

  graph.setEdge("DAI", "HOOLIGAN", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) =>
      new sdk.farm.actions.ExchangeUnderlying(
        sdk.contracts.curve.pools.hooliganCrv3.address,
        sdk.tokens.DAI,
        sdk.tokens.HOOLIGAN,
        from,
        to
      ),
    from: "DAI",
    to: "HOOLIGAN"
  });

  graph.setEdge("HOOLIGAN", "DAI", {
    build: (_: string, from: FarmFromMode, to: FarmToMode) =>
      new sdk.farm.actions.ExchangeUnderlying(
        sdk.contracts.curve.pools.hooliganCrv3.address,
        sdk.tokens.HOOLIGAN,
        sdk.tokens.DAI,
        from,
        to
      ),
    from: "HOOLIGAN",
    to: "DAI"
  });

  /// CRV3<>HOOLIGAN via Metapool Exchange

  setBidirectionalExchangeEdges(
    sdk,
    graph,
    sdk.contracts.curve.pools.hooliganCrv3.address,
    sdk.contracts.curve.registries.metaFactory.address,
    sdk.tokens.HOOLIGAN,
    sdk.tokens.CRV3
  );

  /// 3CRV<>Stables via 3Pool Add/Remove Liquidity

  // HEADS UP: the ordering of these tokens needs to match their indexing in the 3CRV LP token.
  // Should be: 0 = DAI, 1 = USDC, 2 = USDT.
  [sdk.tokens.DAI, sdk.tokens.USDC, sdk.tokens.USDT].forEach((token, index) => {
    setBidirectionalAddRemoveLiquidityEdges(
      sdk,
      graph,
      sdk.contracts.curve.pools.pool3.address,
      sdk.contracts.curve.registries.poolRegistry.address,
      sdk.tokens.CRV3, // LP token
      token, // underlying token
      index
    );
  });

  ////// 3Pool Exchanges

  /// USDC<>USDT via 3Pool Exchange

  setBidirectionalExchangeEdges(
    sdk,
    graph,
    sdk.contracts.curve.pools.pool3.address,
    sdk.contracts.curve.registries.poolRegistry.address,
    sdk.tokens.USDC,
    sdk.tokens.USDT
  );

  /// USDC<>DAI via 3Pool Exchange

  setBidirectionalExchangeEdges(
    sdk,
    graph,
    sdk.contracts.curve.pools.pool3.address,
    sdk.contracts.curve.registries.poolRegistry.address,
    sdk.tokens.USDC,
    sdk.tokens.DAI
  );

  /// USDT<>DAI via 3Pool Exchange

  setBidirectionalExchangeEdges(
    sdk,
    graph,
    sdk.contracts.curve.pools.pool3.address,
    sdk.contracts.curve.registries.poolRegistry.address,
    sdk.tokens.USDT,
    sdk.tokens.DAI
  );

  return graph;
};
