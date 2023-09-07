import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function CryptoBankPage() {
  const [meMessage, setMeMessage] = useState("WELCOME TO Esha's CRYPTO BANK!");
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState("front");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      addToTransactionHistory("Deposit", 1);
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      addToTransactionHistory("Withdraw", -1);
    }
  };

  const transferFunds = async (toAddress, amount) => {
    if (atm) {
      let tx = await atm.transferFunds(toAddress, amount);
      await tx.wait();
      getBalance();
      addToTransactionHistory("Transfer", -amount);
    }
  };

  const addToTransactionHistory = (action, amount) => {
    const newTransaction = {
      action,
      amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory([...transactionHistory, newTransaction]);
  };

  const clearTransactionHistory = () => {
    setTransactionHistory([]);
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
      getATMContract();
    } else {
      console.log("No account found");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p style={{ color: "red" }}>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p style={{ color: "green" }}>Your Balance: {balance} ETH</p>
        <button onClick={deposit} style={{ backgroundColor: "DodgerBlue", color: "white" }}>
          Deposit 1 ETH
        </button>
        <button onClick={withdraw} style={{ backgroundColor: "Orange", color: "white" }}>
          Withdraw 1 ETH
        </button>
        <button
          onClick={() => setCurrentPage("transfer")}
          style={{ backgroundColor: "Purple", color: "white" }}
        >
          Transfer Funds
        </button>
        <button onClick={() => setCurrentPage("records")} style={{ backgroundColor: "SlateGray", color: "white" }}>
          Records
        </button>
      </div>
    );
  };

  const transferFundsForm = () => {
    const [toAddress, setToAddress] = useState("");
    const [transferAmount, setTransferAmount] = useState("");

    const handleTransfer = () => {
      transferFunds(toAddress, parseFloat(transferAmount));
      setToAddress("");
      setTransferAmount("");
    };

    return (
      <div>
        <h3 style={{ color: "Teal" }}>Transfer Funds:</h3>
        <label>
          To Address:
          <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
        </label>
        <label>
          Amount (ETH):
          <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
        </label>
        <button onClick={handleTransfer} style={{ backgroundColor: "Purple", color: "white" }}>
          Transfer
        </button>
        <button onClick={() => setCurrentPage("front")} style={{ backgroundColor: "SlateGray", color: "white" }}>
          Go Back
        </button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="CryptoBank">
      <header>
        <h1 style={{ color: "MediumBlue" }}>Hello User </h1>
      </header>
      <h2>{meMessage}</h2>

      {currentPage === "front" && initUser()}
      {currentPage === "transfer" && transferFundsForm()}

      {currentPage === "records" && (
        <div>
          <h3 style={{ color: "Teal" }}>Records:</h3>
          <ul>
            {transactionHistory.map((transaction, index) => (
              <li key={index}>
                {`${transaction.action}: ${transaction.amount} ETH (${transaction.timestamp})`}
              </li>
            ))}
          </ul>
          <button onClick={() => setCurrentPage("front")} style={{ backgroundColor: "SlateGray", color: "white" }}>
            Go Back
          </button>
          <button onClick={clearTransactionHistory} style={{ backgroundColor: "FireBrick", color: "white" }}>
            Clear Records
          </button>
        </div>
      )}

      <style jsx>{`
        .CryptoBank {
          width: 100%;
          height: 100vh;
          background-color: LightGray;
          text-align: center;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </main>
  );
}
