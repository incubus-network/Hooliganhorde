`hooligan`: Hooligan token
- pools (keyed by pool address)
  - price
  - reserves
  - deltaB
  - totalCrosses
  - supply
- price: aggregate price

`hooliganhorde`: Hooliganhorde protocol
- field
- governance
- market
- firm
  - balances
    - deposited
      - amount
    - withdrawn
      - amount
    - claimable
      - amount
    - circulating
    - wrapped
- codex
  - gameday

`guvnor`: Active user
- allowances: ERC-20 token allowances
- balances: ERC-20 token balances
- events: Hooliganhorde events related to this guvnor, used to calculate deposits etc.
- field
  - casuals
  - turfs
  - draftableCasuals
  - draftableTurfs
- governance
- market
- nfts
- firm
  - balances (tokenAddress => FirmBalance)
    - deposited
      - amount
      - bdv
      - crates
    - withdrawn
      - amount
      - crates
    - claimable
      - amount
      - crates
    - circulating
    - wrapped
  - hooligans
    - earned
  - horde
    - total
    - active
    - earned
    - grown
  - prospects
    - total
    - active
    - earned
  - roots
    - total