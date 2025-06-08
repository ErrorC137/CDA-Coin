CDA-Coin/
├── contracts/
│   ├── CDAERC20.sol
│   ├── CDABadgeNFT.sol
│   ├── SwagRedemption.sol
│   ├── CDAResetManager.sol
│   └── utils/
│       ├── AdminControl.sol
│       └── BadgeLevels.sol
│
├── deployments/
│   ├── deploy.ts
│   ├── verify.ts
│   └── config/
│       ├── polygon-cdk.json
│       └── local-dev.json
│
├── scripts/
│   ├── rewardDispenser.ts
│   ├── swagBurnTracker.ts
│   ├── resetScheduler.ts
│   └── nodeUptimeRewarder.ts
│
├── test/
│   ├── CDAERC20.test.ts
│   ├── CDABadgeNFT.test.ts
│   └── SwagRedemption.test.ts
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   ├── redeem.tsx
│   │   │   └── badges.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── tailwind.config.js
│
├── subgraph/
│   ├── schema.graphql
│   ├── mappings.ts
│   └── subgraph.yaml
│
├── .env
├── hardhat.config.ts
├── foundry.toml
├── package.json
└── README.md
