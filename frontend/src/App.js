import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./constants";
import TeacherPanel from "./TeacherPanel";
import StudentPanel from "./StudentPanel";
import "./App.css";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        setError("Please install MetaMask!");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      const web3Signer = web3Provider.getSigner();
      setSigner(web3Signer);

      const userAccount = await web3Signer.getAddress();
      setAccount(userAccount);

      const attendanceContract = new ethers.Contract(
        contractAddress,
        contractABI,
        web3Signer
      );
      setContract(attendanceContract);

      // Listen for network changes
      window.ethereum.on("chainChanged", (chainId) => {
        // Reload the page to reset the app state
        window.location.reload();
      });

      
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          connectWallet(); 
        } else {
          // Handle disconnection
          setAccount(null);
          setSigner(null);
          setProvider(null);
          setContract(null);
        }
      });

    } catch (err) {
      setError(err.message || "An error occurred.");
    }
  };

  const checkNetwork = async () => {
    if (provider) {
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) { 
        setError("Please switch to the Sepolia Testnet in MetaMask.");
        try {
          // Attempt to switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], 
          });
        } catch (switchError) {
          
          if (switchError.code === 4902) {
             setError("Sepolia testnet is not added to your MetaMask. Please add it manually.");
          } else {
             setError("Failed to switch network.");
          }
        }
      } else {
        setError(""); 
      }
    }
  };

  useEffect(() => {
    if (provider) {
      checkNetwork();
    }
  }, [provider, account]);
  
  return (
    <div className="App">
      <h1>Geo-Verified Attendance</h1>
      {error && <p className="error">{error}</p>}
      
      {!account ? (
        <button onClick={connectWallet} className="wallet-button">Connect MetaMask Wallet</button>
      ) : (
        <p>Connected Account: <strong>{account}</strong></p>
      )}

      {contract && (
        <>
          <div className="container">
            <TeacherPanel contract={contract} />
          </div>
          <hr />
          <div className="container">
            <StudentPanel contract={contract} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;