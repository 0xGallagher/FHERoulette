// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Hata ayıklama için konsol loglarını kullanmamızı sağlar (sadece testnet'te)
// import "hardhat/console.sol";

contract Roulette {
    mapping(address => uint256) private balances;
    mapping(address => uint256) private lastClaimTime;
    address public owner;

    event FaucetClaimed(address indexed user, uint256 amount);
    event BalanceUpdated(address indexed user, uint256 newBalance);
    // GamePlayed event'ini güncelledik: 'didWin' yerine 'winnings' (kazanç miktarı) döndüreceğiz
    event GamePlayed(address indexed user, uint256 winningNumber, uint256 winnings, uint256 newBalance);

    // Frontend'den gelen her bir bahsi tanımlamak için bir struct
    struct BetInput {
        uint256 id;     // Button ID'si (1-49)
        uint256 amount; // O ID'ye yatırılan miktar
    }

    constructor() {
        owner = msg.sender;
    }

    // --- Faucet ve Bakiye Fonksiyonları (Değişiklik yok) ---

    function mintDemoBalance() external {
        require(block.timestamp - lastClaimTime[msg.sender] >= 1 days, "Wait 24h before next claim");
        balances[msg.sender] += 100;
        lastClaimTime[msg.sender] = block.timestamp;
        emit FaucetClaimed(msg.sender, 100);
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function getNextClaimTime(address user) external view returns (uint256) {
        if (block.timestamp > lastClaimTime[user] + 1 days) return 0;
        return (lastClaimTime[user] + 1 days) - block.timestamp;
    }


    // --- YENİ PLAY FONKSİYONU ---
    /**
     * @notice Kullanıcının birden fazla türde bahis oynamasını sağlar.
     * @param _activeBets Kullanıcının para yatırdığı aktif bahislerin bir dizisi.
     */
    function play(BetInput[] calldata _activeBets) external {
        
        // 1. Toplam bahis miktarını hesapla
        uint256 totalBetAmount = 0;
        for (uint i = 0; i < _activeBets.length; i++) {
            require(_activeBets[i].amount > 0, "Bet amount must be positive");
            totalBetAmount += _activeBets[i].amount;
        }

        // 2. Kontroller
        require(totalBetAmount > 0, "No bets placed");
        require(balances[msg.sender] >= totalBetAmount, "Insufficient balance");

        // 3. Bahsi bakiyeden düş
        balances[msg.sender] -= totalBetAmount;

        // 4. Şanslı sayıyı üret (Pseudo-Random)
        uint256 winningNumber = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % 37); // 0-36

        // 5. Kazançları Hesapla
        uint256 totalWinnings = 0;
        for (uint i = 0; i < _activeBets.length; i++) {
            totalWinnings += calculateWinnings(
                _activeBets[i].id, 
                _activeBets[i].amount, 
                winningNumber
            );
        }

        // 6. Kazançları bakiyeye ekle
        if (totalWinnings > 0) {
            balances[msg.sender] += totalWinnings;
        }

        // 7. Event yayınla
        emit GamePlayed(msg.sender, winningNumber, totalWinnings, balances[msg.sender]);
        emit BalanceUpdated(msg.sender, balances[msg.sender]);
    }


    // --- YENİ YARDIMCI FONKSİYONLAR ---

    /**
     * @notice Gelen ID'ye ve kazanan sayıya göre kazancı hesaplar.
     * React'teki 'calculateResult' fonksiyonunun Solidity versiyonudur.
     */
    function calculateWinnings(uint256 id, uint256 amount, uint256 winningNumber) internal pure returns (uint256) {
        uint256 multiplier = 0;
        bool won = false;

        // ----- Bireysel Sayılar (ID 1-13, 15-26, 28-39) -----
        if (id == 1 && winningNumber == 0) { multiplier = 36; } // 0
        else if (id == 2 && winningNumber == 3) { multiplier = 36; }
        else if (id == 3 && winningNumber == 6) { multiplier = 36; }
        else if (id == 4 && winningNumber == 9) { multiplier = 36; }
        else if (id == 5 && winningNumber == 12) { multiplier = 36; }
        else if (id == 6 && winningNumber == 15) { multiplier = 36; }
        else if (id == 7 && winningNumber == 18) { multiplier = 36; }
        else if (id == 8 && winningNumber == 21) { multiplier = 36; }
        else if (id == 9 && winningNumber == 24) { multiplier = 36; }
        else if (id == 10 && winningNumber == 27) { multiplier = 36; }
        else if (id == 11 && winningNumber == 30) { multiplier = 36; }
        else if (id == 12 && winningNumber == 33) { multiplier = 36; }
        else if (id == 13 && winningNumber == 36) { multiplier = 36; }
        else if (id == 15 && winningNumber == 2) { multiplier = 36; }
        else if (id == 16 && winningNumber == 5) { multiplier = 36; }
        else if (id == 17 && winningNumber == 8) { multiplier = 36; }
        else if (id == 18 && winningNumber == 11) { multiplier = 36; }
        else if (id == 19 && winningNumber == 14) { multiplier = 36; }
        else if (id == 20 && winningNumber == 17) { multiplier = 36; }
        else if (id == 21 && winningNumber == 20) { multiplier = 36; }
        else if (id == 22 && winningNumber == 23) { multiplier = 36; }
        else if (id == 23 && winningNumber == 26) { multiplier = 36; }
        else if (id == 24 && winningNumber == 29) { multiplier = 36; }
        else if (id == 25 && winningNumber == 32) { multiplier = 36; }
        else if (id == 26 && winningNumber == 35) { multiplier = 36; }
        else if (id == 28 && winningNumber == 1) { multiplier = 36; }
        else if (id == 29 && winningNumber == 4) { multiplier = 36; }
        else if (id == 30 && winningNumber == 7) { multiplier = 36; }
        else if (id == 31 && winningNumber == 10) { multiplier = 36; }
        else if (id == 32 && winningNumber == 13) { multiplier = 36; }
        else if (id == 33 && winningNumber == 16) { multiplier = 36; }
        else if (id == 34 && winningNumber == 19) { multiplier = 36; }
        else if (id == 35 && winningNumber == 22) { multiplier = 36; }
        else if (id == 36 && winningNumber == 25) { multiplier = 36; }
        else if (id == 37 && winningNumber == 28) { multiplier = 36; }
        else if (id == 38 && winningNumber == 31) { multiplier = 36; }
        else if (id == 39 && winningNumber == 34) { multiplier = 36; }
        
        // ----- Sütunlar (ID 14, 27, 40) -----
        else if (id == 14 && isColumn(3, winningNumber)) { multiplier = 3; } // 3:1 (3,6,9...)
        else if (id == 27 && isColumn(2, winningNumber)) { multiplier = 3; } // 3:1 (2,5,8...)
        else if (id == 40 && isColumn(1, winningNumber)) { multiplier = 3; } // 3:1 (1,4,7...)

        // ----- Düzineler (ID 41, 42, 43) -----
        else if (id == 41 && (winningNumber >= 1 && winningNumber <= 12)) { multiplier = 3; } // 1 to 12
        else if (id == 42 && (winningNumber >= 13 && winningNumber <= 24)) { multiplier = 3; } // 13 to 24
        else if (id == 43 && (winningNumber >= 25 && winningNumber <= 36)) { multiplier = 3; } // 25 to 36

        // ----- Diğer Gruplar (ID 44-49) -----
        else if (id == 44 && (winningNumber >= 1 && winningNumber <= 18)) { multiplier = 2; } // 1 to 18
        else if (id == 45 && isEven(winningNumber)) { multiplier = 2; } // Even
        else if (id == 46 && isRed(winningNumber)) { multiplier = 2; } // Red
        else if (id == 47 && !isRed(winningNumber) && winningNumber != 0) { multiplier = 2; } // Black
        else if (id == 48 && !isEven(winningNumber) && winningNumber != 0) { multiplier = 2; } // Odd
        else if (id == 49 && (winningNumber >= 19 && winningNumber <= 36)) { multiplier = 2; } // 19 to 36

        if (multiplier > 0) {
            won = true;
        }

        if (won) {
            return amount * multiplier;
        } else {
            return 0;
        }
    }

    // --- ID'lere göre yardımcı kontrol fonksiyonları ---
    function isColumn(uint col, uint num) internal pure returns (bool) {
        if (num == 0) return false;
        if (col == 1) return num % 3 == 1; // 1, 4, 7...
        if (col == 2) return num % 3 == 2; // 2, 5, 8...
        if (col == 3) return num % 3 == 0; // 3, 6, 9...
        return false;
    }

    function isEven(uint num) internal pure returns (bool) {
        return num != 0 && num % 2 == 0;
    }

    function isRed(uint num) internal pure returns (bool) {
        // Red numbers: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
        if (num == 1 || num == 3 || num == 5 || num == 7 || num == 9 || num == 12 || num == 14 || num == 16 || num == 18 || num == 19 || num == 21 || num == 23 || num == 25 || num == 27 || num == 30 || num == 32 || num == 34 || num == 36) {
            return true;
        }
        return false;
    }
}