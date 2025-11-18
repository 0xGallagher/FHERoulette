// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";

contract Roulette {
    mapping(address => euint64) private balances;
    mapping(address => uint256) private lastClaimTime;
    mapping(address => bool) private isBalanceInitialized;
    address public owner;

    event FaucetClaimed(address indexed user, uint256 amountPlain);
    event BalanceUpdated(address indexed user, bytes32 balanceHandle);
    event GamePlayed(address indexed user, uint256 winningNumber, bytes32 winningsHandle, bytes32 newBalanceHandle);

    struct BetInput {
        uint256 id;
        externalEuint64 amount;
    }

    constructor() {
        owner = msg.sender;
    }

    function mintDemoBalance() external {
        require(block.timestamp - lastClaimTime[msg.sender] >= 1 days, "Wait 24h before next claim");
        lastClaimTime[msg.sender] = block.timestamp;

        euint64 mintAmt = FHE.asEuint64(100);
        
        if (isBalanceInitialized[msg.sender]) {
            balances[msg.sender] = FHE.add(balances[msg.sender], mintAmt);
        } 
        else {
            balances[msg.sender] = mintAmt;
            isBalanceInitialized[msg.sender] = true; // Kullanıcıyı "başlatıldı" olarak işaretle
        }

        FHE.allow(balances[msg.sender], msg.sender);
        FHE.allow(balances[msg.sender], address(this));

        emit FaucetClaimed(msg.sender, 100);
        emit BalanceUpdated(msg.sender, FHE.toBytes32(balances[msg.sender]));
    }

    function getBalance(address user) external view returns (bytes32) {
        return FHE.toBytes32(balances[user]);
    }

    function getNextClaimTime(address user) external view returns (uint256) {
        if (block.timestamp > lastClaimTime[user] + 1 days) return 0;
        return (lastClaimTime[user] + 1 days) - block.timestamp;
    }

    // Core gameplay
    function play(BetInput[] calldata _activeBets, bytes calldata attestation) external {
        require(_activeBets.length > 0, "No bets");

        euint64 totalBetAmount = FHE.asEuint64(0);
        for (uint i = 0; i < _activeBets.length; i++) {
            euint64 betAmt = FHE.fromExternal(_activeBets[i].amount, attestation);
            totalBetAmount = FHE.add(totalBetAmount, betAmt);
        }

        require(FHE.isSenderAllowed(balances[msg.sender]), "Access denied");

        // Deduct encrypted total bet
        balances[msg.sender] = FHE.sub(balances[msg.sender], totalBetAmount);

        // PUBLIC pseudo-random number for demo (not encrypted)
        uint256 winningNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % 37;

        // Total winnings in encrypted domain
        euint64 totalWinnings = FHE.asEuint64(0);

        for (uint i = 0; i < _activeBets.length; i++) {
            euint64 betAmt = FHE.fromExternal(_activeBets[i].amount, attestation);
            euint64 payout = _calculateWinningsInternal(_activeBets[i].id, betAmt, winningNumber);
            totalWinnings = FHE.add(totalWinnings, payout);
        }

        balances[msg.sender] = FHE.add(balances[msg.sender], totalWinnings);
        FHE.allow(balances[msg.sender], msg.sender);
        FHE.allow(balances[msg.sender], address(this));

        emit GamePlayed(msg.sender, winningNumber, FHE.toBytes32(totalWinnings), FHE.toBytes32(balances[msg.sender]));
    }

    // Simplified payout calculation — only a few demo rules for brevity
    function _calculateWinningsInternal(uint256 id, euint64 amount, uint256 winningNumber) internal returns (euint64) {
        euint64 result = FHE.asEuint64(0);

        if (id == 1 && winningNumber == 0) {
            result = FHE.mul(amount, FHE.asEuint64(36));
        } else if (id == 2 && winningNumber == 7) {
            result = FHE.mul(amount, FHE.asEuint64(36));
        } else if (id == 3 && winningNumber % 2 == 0 && winningNumber != 0) {
            result = FHE.mul(amount, FHE.asEuint64(2));
        } else if (id == 4 && winningNumber % 2 == 1) {
            result = FHE.mul(amount, FHE.asEuint64(2));
        } else if (id == 5 && winningNumber >= 1 && winningNumber <= 18) {
            result = FHE.mul(amount, FHE.asEuint64(2));
        } else if (id == 6 && winningNumber >= 19 && winningNumber <= 36) {
            result = FHE.mul(amount, FHE.asEuint64(2));
        }

        return result;
    }
}
