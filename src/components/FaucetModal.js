import { useContext, useEffect, useState, memo } from "react";
import { ethers } from "ethers";
import { MyContext } from "./Context.js";
import { CONTRACT_ADDRESS } from "../config.js";
import * as CONTRACT_ABI from "../abi/Roulette.json";

const Faucet = () => {
  const {
    setBalance,
    faucetModal,
    setFaucetModal,
    account,
    nextClaimTime,
    setNextClaimTime,
    isAccountLoading,
    fhevm
  } = useContext(MyContext);

  const [displayTime, setDisplayTime] = useState(0);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!faucetModal) return;

    if (isAccountLoading) {
      setDisplayTime(0);
      return;
    }


    const tick = () => {
      if (nextClaimTime && nextClaimTime > 0) {
        const now = Date.now();
        const remaining = Math.max(Math.floor((nextClaimTime - now) / 1000), 0);
        setDisplayTime(remaining);
      } else {
        setDisplayTime(0);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);

  }, [faucetModal, nextClaimTime, isAccountLoading]);



  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };


  //  Claim button
const claimToken = async () => {
    try {
      if (!window.ethereum || !account || !fhevm) {
        alert("Wallet is not connected or FHEVM is not initialized.");
        return;
      }
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI.default.abi, signer);


      const remainingBN = await contract.getNextClaimTime(account);
      const remaining = Number(remainingBN);

      if (remaining > 0) {
        alert(`⏳ Countdown hasn't been ended yet: ${formatTime(remaining)}`);
        const newNextClaimTime = Date.now() + (remaining * 1000);
        setNextClaimTime(newNextClaimTime);
        localStorage.setItem("nextClaimTime", String(newNextClaimTime));
        setLoading(false);
        return;
      }

      // Send the faucet transaction with a manual gas limit
      console.log("Sending claim transaction with manual gas limit...");
      const tx = await contract.mintDemoBalance({
        gasLimit: 2000000 
      });
      await tx.wait();
      console.log("Claim transaction successful.");

      // Withdraw the new balance CORRECTLY
      const encryptedBalanceBytes = await contract.getBalance(account);

      // Decrypt the new balance using the CORRECT EIP-712 flow 
      console.log("Decrypting new balance...");
      const keypair = fhevm.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = fhevm.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
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

      const result = await fhevm.userDecrypt(
        [
          {
            handle: encryptedBalanceBytes,
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

      const decryptedBalance = result[encryptedBalanceBytes];
      setBalance(Number(decryptedBalance));
      console.log("New balance decrypted:", decryptedBalance);

      // update timer
      const now = Date.now();
      const newNextTime = now + (24 * 60 * 60 * 1000);
      setNextClaimTime(newNextTime);
      localStorage.setItem("nextClaimTime", String(newNextTime));

      alert("✅ 100 token transferred successfully!");
    } catch (err) {
      console.error("Claim error:", err);

      if (err.reason) {
         alert(`Claim transaction unsuccessful: ${err.reason}`);
      } else if (err.message && (err.message.includes("Wait 24h") || (err.data && err.data.includes("Wait 24h")))) {
         alert("Claim transaction unsuccessful: Wait 24h before next claim");
      } else if (err.code === 'ACTION_REJECTED') {
         alert("Transaction rejected by user.");
      } else {
         alert("Claim transaction unsuccessful! (See console for details)");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {faucetModal && (
        <div className="faucet">
          <div className="faucet-background" onClick={() => setFaucetModal(false)}></div>
          <div className="faucet-content">
            <div className="faucet-content-top">
              <div></div>
              <span>Chip Faucet</span>
              <div></div>
            </div>

            <div className="faucet-content-middle">
              <div className="fcm-part1">
                {displayTime > 0 ? (
                  <div className="countdown">{formatTime(displayTime)}</div>
                ) : (
                  <div>100</div>
                )}
              </div>
            </div>

            <div className="faucet-content-bottom">
              <button
                type="button"
                className="add-balance-button"
                onClick={claimToken}
                disabled={loading || displayTime > 0}
              >
                {displayTime > 0 ? "WAIT" : loading ? "CLAIMING..." : "CLAIM"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Faucet);