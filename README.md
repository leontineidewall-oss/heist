# heist

Hold $50 of $HEIST and you're in the crew, with your own raccoon (traits and codename come from your wallet address). 85% of creator fees fill the vault. Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC) the crew tries the job: odds are 20% + 1% per 10 buys in the last 6 hours, capped at 80%. A win splits the vault equally across the crew; a miss rolls it over.

## The site

- Live vault balance and the vault's latest transactions (`getBalance`, `getSignaturesForAddress`).
- The biggest crew members: `getTokenLargestAccounts`, resolved to owner wallets; pools and curves (accounts owned by programs) and the vault are left out; only wallets worth $50+ are shown.
- Check any wallet, or connect one (the address is only read; nothing is signed): your raccoon, holding, value, and how much more you need.
- Before launch every live number shows "—".

## Environment variables (Vercel)

| name | effect |
|---|---|
| `HEIST_MINT` | The $HEIST contract address. Turns on market data, the crew and wallet checks. |
| `VAULT_WALLET` | The public vault wallet that receives 85% of fees. |
| `RPC_URL` | Your own Solana RPC (e.g. Helius). Defaults to the public mainnet endpoint, which rate-limits. |

## Files

- `index.html`: the whole page; the pixel engine is the same code as `api/_pixel.js`.
- `api/rpc.js`: read-only JSON-RPC proxy (only the methods the page uses).
- `api/market.js`: DexScreener price, liquidity and 6h buys for $HEIST.
- `api/config.js`: public settings. `api/og.js`: the share image, drawn by the pixel engine.

The job is run by the vault keeper; every payout leaves the public vault wallet. A game of chance, not financial advice.
