import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [count, setCount] = useState(null);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const [mining, setMining] = useState(false);
  const contractAddress = "0xa9b4f5218a820B35Fd243FE82EB98d4E160ee420";
  const contractABI = abi.abi;

  const candidates = [
    'Joe Biden',
    'Donald Trump',
    'Barack Obama',
    'Jo Jorgensen',
    'Hillary Clinton',
    'Howie Hawkins',
    'Cancelled vote'
    ]

  const handleClose = () => {
    window.location.reload(false);
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      } else {
        console.log("We have the Ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      handleClose();
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
        const wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const displayCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setCount(count.toNumber());
      }
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        
        console.log("message", message);
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 })
        setMining(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        setCount(count.toNumber());
        setMining(false);
        console.log("Retrieved total wave count...", count.toNumber());
        setMessage("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      setShowModal(true)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    displayCount();
  }, []);

  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        <div className="count">
            {!count &&
              <span role="img" aria-label="us">🇺🇸</span>
            }
            {count &&
              <>{count} <span role="img" aria-label="person">👨👩</span>voted so far!</>
            }
          </div>
        </div>

        <div className="bio">
          Hi there! I'm <a href="https://www.linkedin.com/in/juan-manuel-vergara-dev/" target="_blank" rel="noopener noreferrer" >Juan</a>, and I'm a Full Stack Developer.
          This is a prototype I <a href="https://github.com/juanvrgr/backend-dApp" target="_blank" rel="noopener noreferrer" >built</a> based on <a href="https://app.buildspace.so/projects/CO02cf0f1c-f996-4f50-9669-cf945ca3fb0b/lessons/LEe9f04c2e-fe9c-4e87-81b2-efb677a1720c" target="_blank" rel="noopener noreferrer" >this project</a>.
          Connect your Ethereum wallet (make sure you're on the Rinkeby Test Network), select your favourite candidate and vote easy and fast for the next USA's president! You have a chance of getting a small amount of ETH also!

          
        </div>

        <div>
        <p className="contract"><a target="_blank" href="https://rinkeby.etherscan.io/address/0xa9b4f5218a820B35Fd243FE82EB98d4E160ee420">Contract Adress</a></p></div>

        


        {currentAccount && (
      <>
          {/*<input onChange={e => setMessage(e.target.value)} value={message} disabled={mining} className="form-control form-control-lg" type="text" placeholder="Message" name="message" autoComplete="off"></input>
        <button className="waveButton" onClick={wave} disabled={mining}>
           {!mining && `Wave at Me`}
            {mining && `Mining ...`}
        </button>*/}
         <select onChange={e => setMessage(e.target.value)} value={message} disabled={mining}>
            <option value="all">Blank</option>
            {candidates.map((d) => (
              <option value={d} key={d.id}>
                {d}
              </option>
        ))}
          </select>
        <button className="waveButton" onClick={wave} disabled={mining}>
           {!mining && `Vote`}
            {mining && `Mining ...`}
        </button>
        </>
      )}

            {/*{!mining &&
            <span className="smiling">
              <span role="img" aria-label="us">🇺🇸</span>
            </span>
          }*/}
        
        {mining &&
            <span className="mining">
              <span role="img" aria-label="waiting">⏳</span>
            </span>
          }

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect with <a href="https://emoji.gg/emoji/1385-metamask"><img src="https://emoji.gg/assets/emoji/1385-metamask.png" width="26px" height="26px" alt="metamask"/></a>
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "whitesmoke", color: '#BF0A30', marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              {/*<div>Time: {wave.timestamp.toString()}</div>*/}
              <div>Candidate: {wave.message}</div>
            </div>)
        })}
      </div>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Oops!</Modal.Title>
        </Modal.Header>
        <Modal.Body><span role="img" aria-label="warn">⛔️</span> You can only vote once!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App