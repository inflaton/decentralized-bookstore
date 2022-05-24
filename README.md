# Decentralized Bookstore

This sample dApp is the companion project of my blog [Tech deep-dive on web3 dApp development](https://mirror.xyz/dashboard/edit/tJf6H6wsOfOGJIdWqopK7iopcuD0NRxdmn1_de2m_Lo). It uses [Vue.js](https://vuejs.org/) for developing SPA as front-end and Truffle & Solidity for developing Smart Contract as backend.

Please refer to the following steps to deploy this dApp on EVM-compliant testnets and IPFS.

### 1. NodeJS version 14 or above
```
~/decentralized-bookstore> node -v
v16.8.0
```

### 2. Deploy smart contracts

Install dependencies
```
~/decentralized-bookstore> cd smart-contracts
~/decentralized-bookstore/smart-contracts> yarn install
```

Set up environment variables in .env
```
~/decentralized-bookstore/smart-contracts> cp .env.example .env
~/decentralized-bookstore/smart-contracts> cat .env
INFURA_API_KEY=
BESU_PRIVATE_KEY=
METER_PRIVATE_KEY=
ROPSTEN_PRIVATE_KEY=
RINKEBY_PRIVATE_KEY=
RINKARBY_PRIVATE_KEY=
POLYGON_PRIVATE_KEY=
KOVAN_PRIVATE_KEY=
OPTIMISM_KOVAN_PRIVATE_KEY=
GOERLI_PRIVATE_KEY=
```

* INFURA_API_KEY can be obtained from any registered Infura developer account - just to make sure to enable L2 networks Optimism Kovan and Arbitrum Rinkeby (RinkArby), which requires a credit card to be added.

* *_PRIVATE_KEY would be the private keys used by Truffle to deploy smart contracts to different testnets - make sure the accounts have enough balances to cover the transaction fees required for deployment.

* 8 public testnets are configured in package.json and truffle-config.json
  * Layer 1 (L1)
    * Ropsten
    * Rinkeby
    * Kovan
    * Goerli
  * Layer 2 (L2)
    * Arbitrum Rinkeby
    * Optimism Kovan
  * Sidechain
    * Poloygon Mumbai
    * Meter

E.g., to deploy to Rinkeby, run
```
yarn deploy:rinkeby
```

To deploy to all 8 testnets, run
```
yarn deploy:all
```

### 3. Set up front-end

Install dependencies
```
~/decentralized-bookstore/smart-contracts> cd ..
~/decentralized-bookstore> yarn install
```

Set up environment variables in .env
```
~/decentralized-bookstore> cp .env.example .env
~/decentralized-bookstore> cat .env
VITE_BOOK_NFT_ENDPOINT="ipfs://QmXCE3puPvYEVchXugNBp6u8wi1o2muVbVzZHookyBqZ2S"

VITE_PINATA_API_KEY=
VITE_PINATA_SECRET_API_KEY=

IPFS_DEPLOY_PINATA__API_KEY=
IPFS_DEPLOY_PINATA__SECRET_API_KEY=
```

* PINATA_API_KEY and PINATA_SECRET_API_KEY can be obtained from any registered Pinata developer account - VITE* variables are used by SPA while IPFS* are used for deployment to IPFS.

Run dApp UI
```
~/decentralized-bookstore> yarn install
~/decentralized-bookstore> yarn dev
```

Navigate to http://localhost:3000/ to see the app running. 

To run at a different port, create a file .env.local and define the port there: 
```
~/decentralized-bookstore> cat .env.local
PORT=3001
```

For production build, run
```
~/decentralized-bookstore> yarn build
```

The generated folder dist/ can be deployed to any hosting environment as a static website. E.g, GitHub Pages, Netlify.

For IFPS deployment, run:
```
~/decentralized-bookstore> yarn deploy
```

The latest dApp front-end has been deployed at [https://dweb.link/ipfs/QmTgoPpWnGMnPhNSBKmsoWdSLEFzmhwZcep6JHQ935TZw2](https://dweb.link/ipfs/QmTgoPpWnGMnPhNSBKmsoWdSLEFzmhwZcep6JHQ935TZw2).
