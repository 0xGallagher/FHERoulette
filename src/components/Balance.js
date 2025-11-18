import { useContext, useEffect, memo } from "react";
import { MyContext } from "./Context.js";

const Balance = () => {
    const { balance, setFaucetModal, account, setAccount, connectWallet, disconnectWallet } = useContext(MyContext);

const shortAddress = (addr) =>
        addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";


    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts) => {
            setAccount(accounts.length > 0 ? accounts[0] : null);
        };

        const handleChainChanged = () => window.location.reload();

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            }
        };
    }, [setAccount]);

    return (
        <div className="top">
            <div className="balance">
                <div className="icon-balance">
                    <i className="fa-sharp fa-solid fa-coins"></i>{" "}
                    <span>{balance}</span>
                </div>
                <div
                    className={`add-balance ${!account ? "disabled" : ""}`}
                    onClick={() => account && setFaucetModal(true)}
                >
                    <i className="fa-solid fa-plus"></i>
                </div>
            </div>

            <button
                className="wallet"
                onClick={account ? disconnectWallet : connectWallet}
            >
                {account ? shortAddress(account) : "Connect Wallet"}
            </button>
        </div>
    );
};

export default memo(Balance);