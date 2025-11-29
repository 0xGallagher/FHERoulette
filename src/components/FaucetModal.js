import { useContext, useEffect, useState, memo } from "react";
import { ethers } from "ethers";
import { MyContext } from "./Context.js";
import { CONTRACT_ADDRESS } from "../config.js";
import * as CONTRACT_ABI from "../abi/FHERoulette.json";

const Faucet = () => {
  const {
    fetchOnchainBalance,
    faucetModal,
    setFaucetModal,
    account,
    nextClaimTime,
    setNextClaimTime,
    isAccountLoading,
    playSound
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
      if (!window.ethereum || !account) {
        alert("Wallet is not connected");
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

      // Token Mint
      const tx = await contract.mintDemoBalance();

      await tx.wait();

      await fetchOnchainBalance(account);

      // set countdown for 24 hours
      const now = Date.now();
      const newNextTime = now + (24 * 60 * 60 * 1000);
      setNextClaimTime(newNextTime);
      localStorage.setItem("nextClaimTime", String(newNextTime));

      playSound("claim");
      alert("✅ 100 token transferred successfully!");
      setFaucetModal(false); // Close the modal

    } catch (err) {
      console.error("Claim error:", err);
      alert("Claim failed: " + (err.reason || err.message));
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