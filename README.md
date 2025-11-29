<p align="center">
  <img src="./src/assets/img/win.gif" width="45%" title="Win">
  <img src="./src/assets/img/zamacasino.png" width="45%" title="Logo">
</p>


<img src="./src/assets/img/zamacasino.png" width="20"> Zamacasino

A fully on-chain Roulette game powered by Fully Homomorphic Encryption (FHE). Play privately, verify publicly.


What is this?

(This is a demo application and is not associated with real money.)

This isn't average blockchain casino game. Most DApps expose every move you make. In this Roulette game, we utilize Zama's fhEVM technology.

Here is the magic: The Smart Contract performs calculations on encrypted data without ever decrypting it.

Encrypted Inputs: When you place a bet, the amount is encrypted before it leaves your browser. The blockchain sees the transaction, but not the value.

Encrypted State: Your balance is stored as euint32 (encrypted integer) on-chain. Only you can see it.

Provably Fair: The winning number is generated on-chain using FHE.randEuint8 and then publicly revealed.



Gameplay

Here is the lifecycle of a single game round:

Betting: You select your numbers amount by left clicking on the board and the chip section in right side.

Reducing Bet: Right clicking will reduce the bet on number by selected chip number.

Remove Bet: The button on the left bottom will remove all of the bets on the board.

Double Bet: The blue button at the bottom right doubles your bets on the board.

Replay: The green button at the bottom right places your last bet on the board.

Connecting: You can not play or claim token without connecting your EVM wallet. Click Connect Wallet button and allow and switch to the Ethereum Sepolia network, then you will receive your balance and game will be active. Clicking on the linked account again will disconnect it.

Faucet: Press the "+" button in the balance field, then press the Claim button and grant permission from your wallet. 100 tokens will be transferred to your account.

Play: After you place your bet click plat button and grant permission from your wallet and then it's done. The rest are classic roulette rules.



Features

Privacy First: Inputs and Balances are encrypted using FHE.

Optimistic UI: The interface updates instantly after the wheel spins, without waiting for the slow blockchain confirmation for the balance update.

User Decryption: Uses EIP-712 signatures to securely decrypt and show your private balance.

Public Decryption: The winning number is decrypted publicly so everyone can verify the game result.

Immersive SFX: Sound effects for spinning, winning, losing, and chip placement.

Integrated Faucet: Built-in faucet to claim demo tokens for testing.



Tech Stack

Frontend: React.js

Blockchain Interaction: Ethers.js v6

FHE Library: fhevm (Zama SDK)

Smart Contract: Solidity with Zama's fhevm library

Development Environment: Hardhat



Prerequisites

Before you start, make sure you have:

Node.js (v18 or higher recommended)

MetaMask installed in your browser.

Zama Sepolia Network added to MetaMask.



Installation & Setup

Clone the repository:

```bash
git clone https://github.com/GallagherEth /Zamacasino.git
cd Zamacasino
```

Install Dependencies:

```bash
npm install
```

Configure Headers (Crucial!): FHE uses WebAssembly and multithreading, which requires specific security headers (Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy).

We handle this via coi-serviceworker or server configuration.

If running locally: Ensure your dev server sends these headers.


Run the Application:

```bash
npm start
Open http://localhost:3000 to view it in your browser.
```

Enjoy your game!