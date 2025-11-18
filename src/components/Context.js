import { Buffer } from "buffer";
import { createContext, useEffect, useState, useRef, useCallback } from "react";
import $ from "jquery";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../config.js";
import * as CONTRACT_ABI from "../abi/Roulette.json";

import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/web";

window.Buffer = Buffer;

export const MyContext = createContext();



const Context = (props) => {

  const [buttons, setButtons] = useState([
    { id: "1", min: "355", max: "360", turn: "1", value: "0", class: "button-green", ga: "1 / 1 / 4 / 2", betAmount: 0, multiple: 36 },
    { id: "2", min: "335.6", max: "345", turn: "36", value: "3", class: "button-red", ga: "1 / 2 / 2 / 3", betAmount: 0, multiple: 36 },
    { id: "3", min: "92.6", max: "102.5", turn: "11", value: "6", class: "button-dark", ga: "1 / 3 / 2 / 4", betAmount: 0, multiple: 36 },
    { id: "4", min: "260.1", max: "269.5", turn: "28", value: "9", class: "button-red", ga: "1 / 4 / 2 / 5", betAmount: 0, multiple: 36 },
    { id: "5", min: "316.6", max: "326", turn: "34", value: "12", class: "button-red", ga: "1 / 5 / 2 / 6", betAmount: 0, multiple: 36 },
    { id: "6", min: "13.6", max: "23.5", turn: "3", value: "15", class: "button-dark", ga: "1 / 6 / 2 / 7", betAmount: 0, multiple: 36 },
    { id: "7", min: "278.6", max: "288", turn: "30", value: "18", class: "button-red", ga: "1 / 7 / 2 / 8", betAmount: 0, multiple: 36 },
    { id: "8", min: "43.3", max: "52.7", turn: "6", value: "21", class: "button-red", ga: "1 / 8 / 2 / 9", betAmount: 0, multiple: 36 },
    { id: "9", min: "191.6", max: "202", turn: "21", value: "24", class: "button-dark", ga: "1 / 9 / 2 / 10", betAmount: 0, multiple: 36 },
    { id: "10", min: "102.6", max: "112", turn: "12", value: "27", class: "button-red", ga: "1 / 10 / 2 / 11", betAmount: 0, multiple: 36 },
    { id: "11", min: "142.6", max: "152", turn: "16", value: "30", class: "button-red", ga: "1 / 11 / 2 / 12", betAmount: 0, multiple: 36 },
    { id: "12", min: "211.1", max: "221.5", turn: "23", value: "33", class: "button-dark", ga: "1 / 12 / 2 / 13", betAmount: 0, multiple: 36 },
    { id: "13", min: "122.6", max: "132", turn: "14", value: "36", class: "button-red", ga: "1 / 13 / 2 / 14", betAmount: 0, multiple: 36 },
    { id: "14", turn: "", value: "3:1", class: "button-cluster", nums: ["3", "6", "9", "12", "15", "18", "21", "24", "27", "30", "33", "36"], ga: "1 / 14 / 2 / 15", betAmount: 0, multiple: 3 },
    { id: "15", min: "52.8", max: "62.5", turn: "7", value: "2", class: "button-dark", ga: "2 / 2 / 3 / 3", betAmount: 0, multiple: 36 },
    { id: "16", min: "182.1", max: "191.5", turn: "20", value: "5", class: "button-red", ga: "2 / 3 / 3 / 4", betAmount: 0, multiple: 36 },
    { id: "17", min: "152.1", max: "162", turn: "17", value: "8", class: "button-dark", ga: "2 / 4 / 3 / 5", betAmount: 0, multiple: 36 },
    { id: "18", min: "132.1", max: "142.5", turn: "15", value: "11", class: "button-dark", ga: "2 / 5 / 3 / 6", betAmount: 0, multiple: 36 },
    { id: "19", min: "240.6", max: "250", turn: "26", value: "14", class: "button-red", ga: "2 / 6 / 3 / 7", betAmount: 0, multiple: 36 },
    { id: "20", min: "72.1", max: "82.5", turn: "9", value: "17", class: "button-dark", ga: "2 / 7 / 3 / 8", betAmount: 0, multiple: 36 },
    { id: "21", min: "230.6", max: "240.5", turn: "25", value: "20", class: "button-dark", ga: "2 / 8 / 3 / 9", betAmount: 0, multiple: 36 },
    { id: "22", min: "162.1", max: "172", turn: "18", value: "23", class: "button-red", ga: "2 / 9 / 3 / 10", betAmount: 0, multiple: 36 },
    { id: "23", min: "345.1", max: "354.9", turn: "37", value: "26", class: "button-dark", ga: "2 / 10 / 3 / 11", betAmount: 0, multiple: 36 },
    { id: "24", min: "288.1", max: "297.5", turn: "31", value: "29", class: "button-dark", ga: "2 / 11 / 3 / 12", betAmount: 0, multiple: 36 },
    { id: "25", min: "4.6", max: "13.5", turn: "2", value: "32", class: "button-red", ga: "2 / 12 / 3 / 13", betAmount: 0, multiple: 36 },
    { id: "26", min: "326.1", max: "335.5", turn: "35", value: "35", class: "button-dark", ga: "2 / 13 / 3 / 14", betAmount: 0, multiple: 36 },
    { id: "27", turn: "", value: "3:1", class: "button-cluster", nums: ["2", "5", "8", "11", "14", "17", "20", "23", "26", "29", "32", "35"], ga: "2 / 14 / 3 / 15", betAmount: 0, multiple: 3 },
    { id: "28", min: "221.6", max: "230.5", turn: "24", value: "1", class: "button-red", ga: "3 / 2 / 4 / 3", betAmount: 0, multiple: 36 },
    { id: "29", min: "33.6", max: "43.2", turn: "5", value: "4", class: "button-dark", ga: "3 / 3 / 4 / 4", betAmount: 0, multiple: 36 },
    { id: "30", min: "297.6", max: "306.5", turn: "32", value: "7", class: "button-red", ga: "3 / 4 / 4 / 5", betAmount: 0, multiple: 36 },
    { id: "31", min: "172.1", max: "182", turn: "19", value: "10", class: "button-dark", ga: "3 / 5 / 4 / 6", betAmount: 0, multiple: 36 },
    { id: "32", min: "112.1", max: "122.5", turn: "13", value: "13", class: "button-dark", ga: "3 / 6 / 4 / 7", betAmount: 0, multiple: 36 },
    { id: "33", min: "202.1", max: "211", turn: "22", value: "16", class: "button-red", ga: "3 / 7 / 4 / 8", betAmount: 0, multiple: 36 },
    { id: "34", min: "23.6", max: "33.5", turn: "4", value: "19", class: "button-red", ga: "3 / 8 / 4 / 9", betAmount: 0, multiple: 36 },
    { id: "35", min: "269.6", max: "278.5", turn: "29", value: "22", class: "button-dark", ga: "3 / 9 / 4 / 10", betAmount: 0, multiple: 36 },
    { id: "36", min: "62.6", max: "72", turn: "8", value: "25", class: "button-red", ga: "3 / 10 / 4 / 11", betAmount: 0, multiple: 36 },
    { id: "37", min: "306.6", max: "316.5", turn: "33", value: "28", class: "button-dark", ga: "3 / 11 / 4 / 12", betAmount: 0, multiple: 36 },
    { id: "38", min: "250.1", max: "260", turn: "27", value: "31", class: "button-dark", ga: "3 / 12 / 4 / 13", betAmount: 0, multiple: 36 },
    { id: "39", min: "82.6", max: "92.5", turn: "10", value: "34", class: "button-red", ga: "3 / 13 / 4 / 14", betAmount: 0, multiple: 36 },
    { id: "40", turn: "", value: "3:1", class: "button-cluster", nums: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "31", "34"], ga: "3 / 14 / 4 / 15", betAmount: 0, multiple: 3 },
    { id: "41", turn: "", value: "1 to 12", class: "button-cluster", nums: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], ga: "4 / 2 / 5 / 6", betAmount: 0, multiple: 3 },
    { id: "42", turn: "", value: "13 to 24", class: "button-cluster", nums: ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"], ga: "4 / 6 / 5 / 10", betAmount: 0, multiple: 3 },
    { id: "43", turn: "", value: "25 to 36", class: "button-cluster", nums: ["25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"], ga: "4 / 10 / 5 / 14", betAmount: 0, multiple: 3 },
    { id: "44", turn: "", value: "1 to 18", class: "button-cluster", nums: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"], ga: "5 / 2 / 6 / 4", betAmount: 0, multiple: 2 },
    { id: "45", turn: "", value: "Even", class: "button-cluster", nums: ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36"], ga: "5 / 4 / 6 / 6", betAmount: 0, multiple: 2 },
    { id: "46", turn: "", value: "", class: "button-red no-border", nums: ["1", "3", "5", "7", "9", "12", "14", "16", "18", "19", "21", "23", "25", "27", "30", "32", "34", "36"], ga: "5 / 6 / 6 / 8", betAmount: 0, multiple: 2 },
    { id: "47", turn: "", value: "", class: "button-dark no-border", nums: ["2", "4", "6", "8", "10", "11", "13", "15", "17", "20", "22", "24", "26", "28", "29", "31", "33", "35"], ga: "5 / 8 / 6 / 10", betAmount: 0, multiple: 2 },
    { id: "48", turn: "", value: "Odd", class: "button-cluster", nums: ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31", "33", "35"], ga: "5 / 10 / 6 / 12", betAmount: 0, multiple: 2 },
    { id: "49", turn: "", value: "19 to 36", class: "button-cluster", nums: ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"], ga: "5 / 12 / 6 / 14", betAmount: 0, multiple: 2 }
  ])

  const [lastNums, setLastNums] = useState([]);                 // stores last winner numbers

  const [lastBet, setLastBet] = useState(buttons);              // stores last winner numbers

  const [chip, setChip] = useState(20);                        // active chip money

  const selectChip = (num) => { setChip(num) };                  // chip amount changing function

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);                    // balance constant
  const [faucetModal, setFaucetModal] = useState(false);        // constant for keeping faucet modal's open/close info
  const [playable, setPlayable] = useState(false);              // play button's disable or active info
  const [bConState, setbConState] = useState(false);            // bet-container disable or active info
  const [rotate, setRotate] = useState(0);                      // ball's total rotation value
  const [rotate2, setRotate2] = useState(0);                    // board's total rotation value
  const [hideBall, setHideBall] = useState(false);              // ball's opacity info
  const [showItemBall, setShowItemBall] = useState(false);      // item's ball's opacity info
  const [winnerNumber, setWinnerNumber] = useState("");         // winner number constant
  const [totalBet, setTotalBet] = useState(0);                  // total bet amount
  const [lastTotalBet, setLastTotalBet] = useState(0);          // total bet amount of previous turn
  const [fadeBtn, setFadeBtn] = useState(true);
  const [fadeBtn2, setFadeBtn2] = useState(true);               // other buttons' controllers
  const [fadeBtn3, setFadeBtn3] = useState(true);
  const [gain, setGain] = useState(0);                          // gained from turn constant
  const [animation, setAnimation] = useState(false);            // confetti animation state
  const [winnerEffect, setWinnerEffect] = useState("none");     // won or lost animation state
  const [turn, setTurn] = useState(0);                          // Turn number
  const [isTxLoading, setIsTxLoading] = useState(false);        // for tx loading animation


  const play = async () => {
    const activeBetsPlain = buttons
      .filter((b) => b.betAmount > 0)
      .map((b) => ({
        id: Number(b.id),
        amount: b.betAmount,
      }));

    if (totalBet <= 0 || activeBetsPlain.length === 0) {
      alert("Please place your bets before the game starts.");
      return;
    }
    if (!fhevm || !account) {
      alert("FHEVM instance not ready. Please reconnect wallet.");
      return;
    }

    setPlayable(false);
    setWinnerEffect("none");
    setbConState(true);
    setLastBet([...buttons]);
    setLastTotalBet(totalBet);
    setButtons((btns) =>
      btns.map((b) => ({ ...b, betAmount: 0, class: b.class.replace("bet-active", "") }))
    );
    setTotalBet(0);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.default.abi, signer);

      const encryptedBets = [];
      for (const bet of activeBetsPlain) {
        const encrypted = await fhevm.encryptInput(bet.amount, { type: "euint64" });
        encryptedBets.push({ id: bet.id, amount: encrypted });
      }

      console.log("🎰 Sending encrypted bets...");
      const tx = await contract.play(encryptedBets, "0x");
      setIsTxLoading(true);
      const receipt = await tx.wait();
      setIsTxLoading(false);

      // Find the GamePlayed event (decode from logs)
      const iface = new ethers.Interface(CONTRACT_ABI.default.abi);
      const gameEvent = receipt.logs
        .map((log) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((ev) => ev && ev.name === "GamePlayed");

      if (!gameEvent) throw new Error("No GamePlayed event found");

      const { winningNumber, winningsHandle, newBalanceHandle } = gameEvent.args;
      console.log("🏁 Decrypting results...");

      const decryptedWinnings = await decryptWithEIP712(fhevm, signer, winningsHandle);
      const decryptedBalance = await decryptWithEIP712(fhevm, signer, newBalanceHandle);

      const didWin = Number(decryptedWinnings) > 0;
      console.log(`🎯 Winning number: ${winningNumber}, gain: ${decryptedWinnings}, balance: ${decryptedBalance}`);

      // Animate result
      const winnerNumObj =
        buttons.find((elm) => elm.value === String(winningNumber)) ||
        buttons.find((elm) => elm.value === "0");

      const targetAngle = (parseFloat(winnerNumObj.min) + parseFloat(winnerNumObj.max)) / 2;
      const baseRotate = rotate;
      const baseRotate2 = rotate2;
      const newRotate2 = baseRotate2 - (Math.random() * 1000 + 1000);
      const totalSpins = Math.floor(Math.random() * 5) + 10;
      const currentAngle = baseRotate % 360;
      let newRotate1 = baseRotate - currentAngle + totalSpins * 360 + (newRotate2 % 360) + targetAngle;

      setHideBall(false);
      setShowItemBall(false);
      setRotate(newRotate1);
      setRotate2(newRotate2);
      setWinnerNumber(winnerNumObj.value);

      setTimeout(() => {
        setHideBall(true);
        setShowItemBall(true);
        setbConState(false);
        setLastNums([winnerNumObj.value, ...lastNums]);
        setBalance(Number(decryptedBalance));
        setGain(Number(decryptedWinnings));
        setWinnerEffect(didWin ? "gained" : "lost");
        setTurn((t) => t + 1);
        setPlayable(true);
      }, 10200);
    } catch (err) {
      console.error("❌ Play error:", err);
      alert("Transaction failed or rejected.");
      setIsTxLoading(false);
      setPlayable(true);
      setbConState(false);
    }
  };


  useEffect(() => {
    if (totalBet > 0) {                                                                                                       // If there ain't any bet, then cannot play
      setPlayable(true)
      setFadeBtn(false)
      setFadeBtn3(true)
      if ((balance + totalBet) >= (totalBet * 2)) {
        setFadeBtn2(false)
      } else {
        setFadeBtn2(true)
      }
    } else {
      setPlayable(false)
      setFadeBtn(true)
      setFadeBtn2(true)
      if (totalBet === 0 && lastTotalBet <= balance && turn > 0) {
        setFadeBtn3(false)
      } else {
        setFadeBtn3(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalBet, balance])


  const bet = (e, num, stat) => {

    const tempAry = buttons.filter(el => el.id === num)[0]                                                                     // pressed button's object

    if (balance >= chip && stat === "add") {
      tempAry.betAmount += chip
      !tempAry.class.includes("bet-active") ? tempAry.class += " bet-active" : tempAry.class += ""                         // if clicked with left, and we have balance do these
      setBalance(balance - chip)
      setTotalBet(totalBet + chip)
    } else if (stat === "del") {                                                                                                // if we clicked with right, delete chip amound by active chip
      e.preventDefault()

      if (tempAry.betAmount - chip <= 0) {                                                                                 // we prevent decreasing under 0
        setBalance(balance + tempAry.betAmount)
        setTotalBet(totalBet - tempAry.betAmount)
        tempAry.betAmount = 0;
        tempAry.class = tempAry.class.replace("bet-active", "")
      } else {
        tempAry.betAmount -= chip;
        setBalance(balance + chip)
        setTotalBet(totalBet - chip)
      }
    }

    tempAry.class = updateBetChipBackground(tempAry.class, tempAry.betAmount)                                                         // color of the chip depends on bet amount
    setButtons(buttons.map(elm => elm.id === num ? tempAry : elm))                                                            // updating main array
  }


  const updateBetChipBackground = (chipElm, betAmnt) => {
    let chipBg;
    if (betAmnt < 5) { chipBg = "chip-1" }
    else if (betAmnt < 20) { chipBg = "chip-5" }
    else if (betAmnt < 50) { chipBg = "chip-20" }                                                                                   // chip color changing function
    else if (betAmnt < 100) { chipBg = "chip-50" }
    else { chipBg = "chip-100" }

    if (betAmnt > 0 && !chipElm.includes("chip-")) {
      return chipElm + " " + chipBg
    } else if (betAmnt > 0 && chipElm.includes("chip-")) {
      return chipElm.split(" ")[0] + " bet-active " + chipBg
    } else if (betAmnt === 0) {
      return chipElm.split(" ")[0]
    }
  }


  const clearBet = () => {
    setButtons(buttons.map(elm => elm ? { ...elm, class: elm.class.replace("bet-active", ""), betAmount: 0 } : null))           // clears every betAmounts and chips on the board
    setBalance(balance + totalBet)
    setTotalBet(0)
  }

  const doubleBet = () => {
    if ((balance + totalBet) >= (totalBet * 2)) {
      setButtons(buttons.map(elm => elm ? { ...elm, class: updateBetChipBackground(elm.class, (elm.betAmount * 2)), betAmount: (elm.betAmount * 2) } : null))                                // doubles every betAmounts and chips on the board
      setBalance(balance - totalBet)
      setTotalBet(totalBet * 2)
    }
  }

  const reBet = () => {
    if (lastTotalBet <= balance) {
      setBalance(balance + totalBet)
      setButtons(lastBet.map(elm => elm.id ? { ...elm, betAmount: lastBet.filter(el => el.id === elm.id)[0].betAmount, class: lastBet.filter(el => el.id === elm.id)[0].class } : null))
      setBalance(balance - lastTotalBet)
      setTotalBet(lastTotalBet)
    }
  }


  useEffect(() => {
    if (winnerEffect === "gained") {
      setAnimation(true)
      setTimeout(() => {
        setAnimation(false)
      }, 3000)
    }
  }, [winnerEffect])




















  /* -------------------------------------------------- */





  const [fhevm, setFhevm] = useState(null);

  const initializeFhevmInstance = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected.");
      return null;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();

      if (Number(chainId) !== 11155111) {
        alert("Please switch to Sepolia testnet.");
        return null;
      }

      await initSDK();
      const fheInstance = await createInstance(SepoliaConfig);
      setFhevm(fheInstance);
      return { fheInstance, provider, signer };
    } catch (e) {
      console.error("FHEVM initialization error:", e);
      return null;
    }
  };






  const [faucetRemaining, setFaucetRemaining] = useState(0);
  const [nextClaimTime, setNextClaimTime] = useState(() => {
    const ts = localStorage.getItem("nextClaimTime");
    return ts ? Number(ts) : 0;
  });

  const [isAccountLoading, setIsAccountLoading] = useState(true);



  const fetchOnchainBalance = useCallback(async (userAccount, fhevmInstance) => {
    try {
      setIsAccountLoading(true);
      if (!window.ethereum || !userAccount || !fhevmInstance) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI.default.abi,
        provider
      );

      // Fetch encrypted balance handle
      const encryptedBalanceHandle = await contract.getBalance(userAccount);

      console.log(`[DEBUG] contract.getBalance(${userAccount}) fonksiyonundan dönen ham handle:`, encryptedBalanceHandle);
      
      const EMPTY_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
      let decryptedBalanceValue = 0;

      //control start

      if (encryptedBalanceHandle && encryptedBalanceHandle !== EMPTY_HANDLE) {
        console.log("Geçerli bakiye handle'ı bulundu, şifre çözülüyor...");

        //  Generate keypair & EIP-712
        const keypair = fhevmInstance.generateKeypair();
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";
        const contractAddresses = [CONTRACT_ADDRESS];

        const eip712 = fhevmInstance.createEIP712(
          keypair.publicKey,
          contractAddresses,
          startTimestamp,
          durationDays
        );

        //  Sign the typed data
        const signature = await signer.signTypedData(
          eip712.domain,
          {
            UserDecryptRequestVerification:
              eip712.types.UserDecryptRequestVerification,
          },
          eip712.message
        );

        // Call userDecrypt()
        const result = await fhevmInstance.userDecrypt(
          [
            {
              handle: encryptedBalanceHandle,
              contractAddress: CONTRACT_ADDRESS,
            },
          ],
          keypair.privateKey,
          keypair.publicKey,
          signature.replace("0x", ""),
          contractAddresses,
          signer.address,
          startTimestamp,
          durationDays
        );

        decryptedBalanceValue = result[encryptedBalanceHandle];
      } else {
        console.log("Kullanıcı için bakiye kaydı bulunamadı (handle boş). Bakiye 0 olarak ayarlandı.");
      }
      // --- control over ---

      setBalance(Number(decryptedBalanceValue));

      // Get next faucet claim time
      const remaining = await contract.getNextClaimTime(userAccount);
      const remainingNum = Number(remaining);

      if (remainingNum > 0) {
        const newNextClaimTime = Date.now() + remainingNum * 1000;
        setNextClaimTime(newNextClaimTime);
        localStorage.setItem("nextClaimTime", String(newNextClaimTime));
      } else {
        setNextClaimTime(0);
        localStorage.removeItem("nextClaimTime");
      }
    } catch (err) {
      console.error("Error while fetching balance:", err);
      setBalance(0);
      setNextClaimTime(0);
    } finally {
      setIsAccountLoading(false);
    }
  }, []); 


 
  useEffect(() => {
    if (account && fhevm) {
      fetchOnchainBalance(account, fhevm);
    }
  }, [account, fhevm, fetchOnchainBalance]);





  const connectWallet = async () => {
    const initData = await initializeFhevmInstance();
    if (initData?.signer) {
      const userAccount = await initData.signer.getAddress();
      setAccount(userAccount);
    } else {
      alert("Failed to initialize FHEVM.");
    }
  };
  

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(0);
    setFhevm(null);
    localStorage.removeItem("nextClaimTime");
  };







  const decryptWithEIP712 = async (instance, signer, ciphertextHandle) => {
    
    const EMPTY_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
    if (!ciphertextHandle || ciphertextHandle === EMPTY_HANDLE) {
      console.log("decryptWithEIP712: Boş handle alındı, şifre çözme atlandı. 0 döndürülüyor.");
      return 0;
    }

    try {
      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();

      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification:
            eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      const result = await instance.userDecrypt(
        [
          {
            handle: ciphertextHandle,
            contractAddress: CONTRACT_ADDRESS,
          },
        ],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        signer.address,
        startTimeStamp,
        durationDays
      );

      return result[ciphertextHandle];
    } catch (err) {
      console.error("Decryption error:", err);
      return 0;
    }
  };












  /* --------------------------------------*/





  const svgContainer = useRef()

  $(function () {
    var $window = svgContainer.current
      , random = Math.random
      , cos = Math.cos
      , sin = Math.sin
      , PI = Math.PI
      , PI2 = PI * 2
      , timer = undefined
      , frame = undefined
      , confetti = [];

    var particles = 115
      , spread = 250
      , sizeMin = 2
      , sizeMax = 7 - sizeMin
      , eccentricity = 10
      , deviation = 100
      , dxThetaMin = -.1
      , dxThetaMax = -dxThetaMin - dxThetaMin
      , dyMin = .13
      , dyMax = .18
      , dThetaMin = .4
      , dThetaMax = .7 - dThetaMin;

    var colorThemes = [
      function () {
        return color(200 * random() | 0, 200 * random() | 0, 200 * random() | 0);
      }, function () {
        var black = 200 * random() | 0; return color(200, black, black);
      }, function () {
        var black = 200 * random() | 0; return color(black, 200, black);
      }, function () {
        var black = 200 * random() | 0; return color(black, black, 200);
      }, function () {
        return color(200, 100, 200 * random() | 0);
      }, function () {
        return color(200 * random() | 0, 200, 200);
      }, function () {
        var black = 256 * random() | 0; return color(black, black, black);
      }, function () {
        return colorThemes[random() < .5 ? 1 : 2]();
      }, function () {
        return colorThemes[random() < .5 ? 3 : 5]();
      }, function () {
        return colorThemes[random() < .5 ? 2 : 4]();
      }
    ];
    function color(r, g, b) {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function interpolation(a, b, t) {
      return (1 - cos(PI * t)) / 2 * (b - a) + a;
    }

    var radius = 1 / eccentricity, radius2 = radius + radius;
    function createPoisson() {

      var domain = [radius, 1 - radius], measure = 1 - radius2, spline = [0, 1];
      while (measure) {
        var dart = measure * random(), i, l, interval, a, b, c, d;

        for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
          a = domain[i]
          b = domain[i + 1]
          interval = b - a;
          if (dart < measure + interval) {
            spline.push(dart += a - measure);
            break;
          }
          measure += interval;
        }
        c = dart - radius
        d = dart + radius;

        for (i = domain.length - 1; i > 0; i -= 2) {
          l = i - 1
          a = domain[l]
          b = domain[i]

          if (a >= c && a < d)
            if (b > d) domain[l] = d
            else domain.splice(l, 2)
          else if (a < c && b > c)
            if (b <= d) domain[i] = c
            else domain.splice(i, 0, c, d)
        }

        for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
          measure += domain[i + 1] - domain[i];
      }

      return spline.sort();
    }

    var container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '0';
    container.style.overflow = 'visible';
    container.style.zIndex = '9999';

    function Confetto(theme) {
      this.frame = 0;
      this.outer = document.createElement('div');
      this.inner = document.createElement('div');
      this.outer.appendChild(this.inner);

      var outerStyle = this.outer.style, innerStyle = this.inner.style;
      outerStyle.position = 'absolute';
      outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
      outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
      innerStyle.width = '100%';
      innerStyle.height = '100%';
      innerStyle.backgroundColor = theme();

      outerStyle.perspective = '50px';
      outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
      this.axis = 'rotate3D(' +
        cos(360 * random()) + ',' +
        cos(360 * random()) + ',0,';
      this.theta = 360 * random();
      this.dTheta = dThetaMin + dThetaMax * random();
      innerStyle.transform = this.axis + this.theta + 'deg)';

      this.x = $window.clientWidth * random();
      this.y = -deviation;
      this.dx = sin(dxThetaMin + dxThetaMax * random());
      this.dy = dyMin + dyMax * random();
      outerStyle.left = this.x + 'px';
      outerStyle.top = this.y + 'px';

      this.splineX = createPoisson();
      this.splineY = [];
      for (var i = 1, l = this.splineX.length - 1; i < l; ++i)
        this.splineY[i] = deviation * random();
      this.splineY[0] = this.splineY[l] = deviation * random();

      this.update = function (height, delta) {
        this.frame += delta;
        this.x += this.dx * delta;
        this.y += this.dy * delta;
        this.theta += this.dTheta * delta;

        var phi = this.frame % 7777 / 7777, i = 0, j = 1;
        while (phi >= this.splineX[j]) i = j++;
        var rho = interpolation(
          this.splineY[i],
          this.splineY[j],
          (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
        );
        phi *= PI2;

        outerStyle.left = this.x + rho * cos(phi) + 'px';
        outerStyle.top = this.y + rho * sin(phi) + 'px';
        innerStyle.transform = this.axis + this.theta + 'deg)';
        return this.y > height + deviation;
      };
    }

    function poof() {
      if (!frame) {

        svgContainer.current.appendChild(container);

        var theme = colorThemes[animation ? colorThemes.length * random() | 0 : 0]
          , count = 0;
        (function addConfetto() {
          if (animation && ++count > particles)
            return timer = undefined;

          var confetto = new Confetto(theme);
          confetti.push(confetto);
          container.appendChild(confetto.outer);
          timer = setTimeout(addConfetto, spread * random());
        })(0);

        var prev = undefined;
        requestAnimationFrame(function loop(timestamp) {
          var delta = prev ? timestamp - prev : 0;
          prev = timestamp;
          var height = $window.clientHeight;

          for (var i = confetti.length - 1; i >= 0; --i) {
            if (confetti[i].update(height, delta)) {
              container.removeChild(confetti[i].outer);
              confetti.splice(i, 1);
            }
          }

          if (timer || confetti.length)
            return frame = requestAnimationFrame(loop);

          svgContainer.current.removeChild(container);
          frame = undefined;
        });
      }
    }

    if (animation) poof();
  });



  /* --------------------------------------*/




  return (
    <MyContext.Provider value={{
      buttons,
      lastNums,
      chip,
      bet,
      selectChip,
      balance,
      setBalance,
      faucetModal,
      setFaucetModal,
      gain,
      winnerEffect,
      svgContainer,
      animation,
      fadeBtn,
      fadeBtn2,
      fadeBtn3,
      play,
      playable,
      setPlayable,
      bConState,
      rotate,
      setRotate,
      rotate2,
      hideBall,
      showItemBall,
      winnerNumber,
      clearBet,
      doubleBet,
      reBet,
      account,
      setAccount,
      faucetRemaining,
      setFaucetRemaining,
      nextClaimTime,
      setNextClaimTime,
      isAccountLoading,
      isTxLoading,
      connectWallet,
      disconnectWallet,
      fhevm,
    }}>
      {props.children}
    </MyContext.Provider>
  )
}
export default Context;