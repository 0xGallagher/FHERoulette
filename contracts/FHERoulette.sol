// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHERoulette is ZamaEthereumConfig {

    mapping(address => euint32) private balances;
    mapping(address => uint256) private lastClaimTime;
    mapping(address => euint8) private lastWinningNumber;
    mapping(address => bool) private hasPendingGame;

    address public owner;

    event GamePlayed(euint8 winningNumber, euint32 winnings, euint32 newBalance);

    constructor() {
        owner = msg.sender;
    }

    function mintDemoBalance() external {
        require(block.timestamp - lastClaimTime[msg.sender] >= 1 days, "Wait 24h");

        euint32 amount = FHE.asEuint32(100);
        balances[msg.sender] = FHE.add(balances[msg.sender], amount);

        lastClaimTime[msg.sender] = block.timestamp;

        FHE.allowThis(balances[msg.sender]);
        FHE.allow(balances[msg.sender], msg.sender);
    }

    function getBalance(address user) external view returns (euint32) {
        return balances[user];
    }

    function getNextClaimTime(address user) external view returns (uint256) {
        uint256 next = lastClaimTime[user] + 1 days;
        if (block.timestamp >= next) return 0;
        return next - block.timestamp;
    }

    function getLastWinningNumber(address user) external view returns (euint8) {
        require(hasPendingGame[user], "No game pending");
        return lastWinningNumber[user];
    }

    function finalizeGame() external {
        require(hasPendingGame[msg.sender], "No game pending");
        hasPendingGame[msg.sender] = false;
    }



    function play(
        uint256[] calldata betIds, 
        externalEuint32[] calldata encryptedAmounts, 
        bytes calldata inputProof
    ) external {
        require(betIds.length == encryptedAmounts.length, "Input mismatch");

        // 1. Generate random number (0-36)
        euint8 winningNumber = FHE.rem(FHE.randEuint8(), 37);

        euint32 totalWinnings = FHE.asEuint32(0);
        euint32 totalBetAmount = FHE.asEuint32(0);

        // 2. calculate bets
        for (uint256 i = 0; i < betIds.length; i++) {
            euint32 amount = FHE.fromExternal(encryptedAmounts[i], inputProof);
            totalBetAmount = FHE.add(totalBetAmount, amount);
            euint32 win = calculateWinnings(betIds[i], amount, winningNumber);
            totalWinnings = FHE.add(totalWinnings, win);
        }

        // 3. Update the balance
        euint32 currentBalance = balances[msg.sender];
        currentBalance = FHE.sub(currentBalance, totalBetAmount);
        currentBalance = FHE.add(currentBalance, totalWinnings);

        // 4. setting permissions
        FHE.allow(currentBalance, msg.sender);
        FHE.allowThis(currentBalance);
        
        // 5. for showing winner number
        FHE.makePubliclyDecryptable(winningNumber);
        
        balances[msg.sender] = currentBalance;
        emit GamePlayed(winningNumber, totalWinnings, currentBalance);
    }





    function calculateWinnings(
        uint256 id,
        euint32 amount,
        euint8 winningNumber
    ) internal returns (euint32) {
        euint32 multiplier = FHE.asEuint32(0);

        if (id == 1) {
            ebool isZero = FHE.eq(winningNumber, FHE.asEuint8(0));
            multiplier = FHE.select(isZero, FHE.asEuint32(36), FHE.asEuint32(0));
        } else if (id >= 2 && id <= 13) {
            uint8 targetNumber = uint8((id - 1) * 3);
            ebool matches = FHE.eq(winningNumber, FHE.asEuint8(targetNumber));
            multiplier = FHE.select(matches, FHE.asEuint32(36), FHE.asEuint32(0));
        } else if (id >= 15 && id <= 26) {
            uint8 targetNumber = uint8((id - 14) * 3 - 1);
            ebool matches = FHE.eq(winningNumber, FHE.asEuint8(targetNumber));
            multiplier = FHE.select(matches, FHE.asEuint32(36), FHE.asEuint32(0));
        } else if (id >= 28 && id <= 39) {
            uint8 targetNumber = uint8((id - 27) * 3 - 2);
            ebool matches = FHE.eq(winningNumber, FHE.asEuint8(targetNumber));
            multiplier = FHE.select(matches, FHE.asEuint32(36), FHE.asEuint32(0));
        } else if (id == 14) {
            multiplier = calculateColumnMultiplier(winningNumber, 3, 3);
        } else if (id == 27) {
            multiplier = calculateColumnMultiplier(winningNumber, 2, 3);
        } else if (id == 40) {
            multiplier = calculateColumnMultiplier(winningNumber, 1, 3);
        } else if (id == 41) {
            multiplier = calculateRangeMultiplier(winningNumber, 1, 12, 3);
        } else if (id == 42) {
            multiplier = calculateRangeMultiplier(winningNumber, 13, 24, 3);
        } else if (id == 43) {
            multiplier = calculateRangeMultiplier(winningNumber, 25, 36, 3);
        } else if (id == 44) {
            multiplier = calculateRangeMultiplier(winningNumber, 1, 18, 2);
        } else if (id == 45) {
            multiplier = calculateEvenMultiplier(winningNumber, 2);
        } else if (id == 46) {
            multiplier = calculateRedMultiplier(winningNumber, 2);
        } else if (id == 47) {
            multiplier = calculateBlackMultiplier(winningNumber, 2);
        } else if (id == 48) {
            multiplier = calculateOddMultiplier(winningNumber, 2);
        } else if (id == 49) {
            multiplier = calculateRangeMultiplier(winningNumber, 19, 36, 2);
        }

        return FHE.mul(amount, multiplier);
    }

    function calculateColumnMultiplier(euint8 winningNumber, uint8 column, uint8 mult) internal returns (euint32) {
        ebool isZero = FHE.eq(winningNumber, FHE.asEuint8(0));
        ebool isNotZero = FHE.not(isZero);
        ebool matches;
        if (column == 3) {
            matches = FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(3)), FHE.eq(winningNumber, FHE.asEuint8(6))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(9)), FHE.eq(winningNumber, FHE.asEuint8(12)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(15)), FHE.eq(winningNumber, FHE.asEuint8(18))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(21)), FHE.eq(winningNumber, FHE.asEuint8(24)))
                )
            );
            matches = FHE.or(matches, FHE.or(FHE.or(FHE.eq(winningNumber, FHE.asEuint8(27)), FHE.eq(winningNumber, FHE.asEuint8(30))), FHE.or(FHE.eq(winningNumber, FHE.asEuint8(33)), FHE.eq(winningNumber, FHE.asEuint8(36)))));
        } else if (column == 2) {
            matches = FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(2)), FHE.eq(winningNumber, FHE.asEuint8(5))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(8)), FHE.eq(winningNumber, FHE.asEuint8(11)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(14)), FHE.eq(winningNumber, FHE.asEuint8(17))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(20)), FHE.eq(winningNumber, FHE.asEuint8(23)))
                )
            );
            matches = FHE.or(matches, FHE.or(FHE.or(FHE.eq(winningNumber, FHE.asEuint8(26)), FHE.eq(winningNumber, FHE.asEuint8(29))), FHE.or(FHE.eq(winningNumber, FHE.asEuint8(32)), FHE.eq(winningNumber, FHE.asEuint8(35)))));
        } else {
            matches = FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(1)), FHE.eq(winningNumber, FHE.asEuint8(4))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(7)), FHE.eq(winningNumber, FHE.asEuint8(10)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(13)), FHE.eq(winningNumber, FHE.asEuint8(16))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(19)), FHE.eq(winningNumber, FHE.asEuint8(22)))
                )
            );
            matches = FHE.or(matches, FHE.or(FHE.or(FHE.eq(winningNumber, FHE.asEuint8(25)), FHE.eq(winningNumber, FHE.asEuint8(28))), FHE.or(FHE.eq(winningNumber, FHE.asEuint8(31)), FHE.eq(winningNumber, FHE.asEuint8(34)))));
        }
        ebool won = FHE.and(isNotZero, matches);
        return FHE.select(won, FHE.asEuint32(mult), FHE.asEuint32(0));
    }

    function calculateRangeMultiplier(euint8 winningNumber, uint8 min, uint8 max, uint8 mult) internal returns (euint32) {
        ebool geMin = FHE.ge(winningNumber, FHE.asEuint8(min));
        ebool leMax = FHE.le(winningNumber, FHE.asEuint8(max));
        ebool inRange = FHE.and(geMin, leMax);
        return FHE.select(inRange, FHE.asEuint32(mult), FHE.asEuint32(0));
    }

    function calculateEvenMultiplier(euint8 winningNumber, uint8 mult) internal returns (euint32) {
        ebool isZero = FHE.eq(winningNumber, FHE.asEuint8(0));
        ebool isNotZero = FHE.not(isZero);

        ebool isEven =
            FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(2)), FHE.eq(winningNumber, FHE.asEuint8(4))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(6)), FHE.eq(winningNumber, FHE.asEuint8(8)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(10)), FHE.eq(winningNumber, FHE.asEuint8(12))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(14)), FHE.eq(winningNumber, FHE.asEuint8(16)))
                )
            );

        isEven = FHE.or(isEven,
            FHE.or(
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(18)), FHE.eq(winningNumber, FHE.asEuint8(20))),
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(22)), FHE.eq(winningNumber, FHE.asEuint8(24)))
            )
        );

        isEven = FHE.or(isEven,
            FHE.or(
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(26)), FHE.eq(winningNumber, FHE.asEuint8(28))),
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(30)), FHE.eq(winningNumber, FHE.asEuint8(32)))
            )
        );

        isEven = FHE.or(isEven,
            FHE.or(FHE.eq(winningNumber, FHE.asEuint8(34)), FHE.eq(winningNumber, FHE.asEuint8(36)))
        );

        ebool won = FHE.and(isNotZero, isEven);
        return FHE.select(won, FHE.asEuint32(mult), FHE.asEuint32(0));
    }

    function calculateOddMultiplier(euint8 winningNumber, uint8 mult) internal returns (euint32) {
        ebool isZero = FHE.eq(winningNumber, FHE.asEuint8(0));
        ebool isNotZero = FHE.not(isZero);

        ebool isOdd =
            FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(1)), FHE.eq(winningNumber, FHE.asEuint8(3))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(5)), FHE.eq(winningNumber, FHE.asEuint8(7)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(9)), FHE.eq(winningNumber, FHE.asEuint8(11))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(13)), FHE.eq(winningNumber, FHE.asEuint8(15)))
                )
            );

        isOdd = FHE.or(isOdd,
            FHE.or(
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(17)), FHE.eq(winningNumber, FHE.asEuint8(19))),
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(21)), FHE.eq(winningNumber, FHE.asEuint8(23)))
            )
        );

        isOdd = FHE.or(isOdd,
            FHE.or(
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(25)), FHE.eq(winningNumber, FHE.asEuint8(27))),
                FHE.or(FHE.eq(winningNumber, FHE.asEuint8(29)), FHE.eq(winningNumber, FHE.asEuint8(31)))
            )
        );

        isOdd = FHE.or(isOdd,
            FHE.or(FHE.eq(winningNumber, FHE.asEuint8(33)), FHE.eq(winningNumber, FHE.asEuint8(35)))
        );

        ebool won = FHE.and(isNotZero, isOdd);
        return FHE.select(won, FHE.asEuint32(mult), FHE.asEuint32(0));
    }

    function calculateRedMultiplier(euint8 winningNumber, uint8 mult) internal returns (euint32) {
        ebool isRed =
            FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(1)), FHE.eq(winningNumber, FHE.asEuint8(3))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(5)), FHE.eq(winningNumber, FHE.asEuint8(7)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(9)), FHE.eq(winningNumber, FHE.asEuint8(12))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(14)), FHE.eq(winningNumber, FHE.asEuint8(16)))
                )
            );

        ebool isRed2 =
            FHE.or(
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(18)), FHE.eq(winningNumber, FHE.asEuint8(19))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(21)), FHE.eq(winningNumber, FHE.asEuint8(23)))
                ),
                FHE.or(
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(25)), FHE.eq(winningNumber, FHE.asEuint8(27))),
                    FHE.or(FHE.eq(winningNumber, FHE.asEuint8(30)), FHE.eq(winningNumber, FHE.asEuint8(32)))
                )
            );

        ebool isRed3 =
            FHE.or(FHE.eq(winningNumber, FHE.asEuint8(34)), FHE.eq(winningNumber, FHE.asEuint8(36)));

        ebool isRedFinal = FHE.or(FHE.or(isRed, isRed2), isRed3);
        return FHE.select(isRedFinal, FHE.asEuint32(mult), FHE.asEuint32(0));
    }

    function calculateBlackMultiplier(euint8 winningNumber, uint8 mult) internal returns (euint32) {
        ebool isZero = FHE.eq(winningNumber, FHE.asEuint8(0));
        ebool isNotZero = FHE.not(isZero);

        ebool isBlack =
            FHE.or(
                FHE.or(
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(2)),
                        FHE.eq(winningNumber, FHE.asEuint8(4))
                    ),
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(6)),
                        FHE.eq(winningNumber, FHE.asEuint8(8))
                    )
                ),
                FHE.or(
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(10)),
                        FHE.eq(winningNumber, FHE.asEuint8(11))
                    ),
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(13)),
                        FHE.eq(winningNumber, FHE.asEuint8(15))
                    )
                )
            );

        ebool isBlack2 =
            FHE.or(
                FHE.or(
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(17)),
                        FHE.eq(winningNumber, FHE.asEuint8(20))
                    ),
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(22)),
                        FHE.eq(winningNumber, FHE.asEuint8(24))
                    )
                ),
                FHE.or(
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(26)),
                        FHE.eq(winningNumber, FHE.asEuint8(28))
                    ),
                    FHE.or(
                        FHE.eq(winningNumber, FHE.asEuint8(29)),
                        FHE.eq(winningNumber, FHE.asEuint8(31))
                    )
                )
            );

        ebool isBlack3 =
            FHE.or(
                FHE.eq(winningNumber, FHE.asEuint8(33)),
                FHE.eq(winningNumber, FHE.asEuint8(35))
            );

        ebool isBlackFinal = FHE.or(
            FHE.or(isBlack, isBlack2),
            isBlack3
        );

        ebool won = FHE.and(isNotZero, isBlackFinal);

        return FHE.select(won, FHE.asEuint32(mult), FHE.asEuint32(0));
    }
    }
