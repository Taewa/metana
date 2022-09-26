import {useState} from 'react';
import Head from 'next/head'
import { ethers } from 'ethers';
import PokemonTokenAbi from '../abis/PokemonTokenAbi.json';
import TradingAbi from '../abis/TradingAbi.json';

export default function Home() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [trader, setTrader] = useState(null);
  const [token, setToken] = useState(null);

  const contractAddress = '0x4A1D712Da0de672a0E128c71629e0792Aa4EccDC';
  const traderAddress = '0x72cF17CA078296E677391e7Fb3A81Cb63bdD769c';

  const connectWallet = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
        console.log(1, 'account:', result);
				accountChangedHandler(result[0]);
				// setConnButtonText('Wallet Connected');
			})
			.catch(error => {
				// setErrorMessage(error.message);
        console.error(error.message);
			});

		} else {
			console.log('Need to install MetaMask');
			// setErrorMessage('Please install MetaMask browser extension to interact');
		}
  }

  // update account, will cause component re-render
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();
	}

  const updateEthers = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(provider);

		const signer = provider.getSigner();
		setSigner(signer);

		const contract = new ethers.Contract(contractAddress, PokemonTokenAbi, signer);
		const trader = new ethers.Contract(traderAddress, TradingAbi, signer);
		setContract(contract);	
		setTrader(trader);	
	}

  const getBalance = async () => {
    const bal = await contract.balanceOf(defaultAccount, 3);

    console.log('balanceOf!!', ethers.utils.formatUnits(bal, 0));
    setToken(ethers.utils.formatUnits(bal, 0));
  }

  const mint0 = async() => {
    await trader.mint(0);
  }

  const mint1 = async() => {
    await trader.mint(1);
  }

  const mint3 = async() => {
    await trader.mint(3);
  }


  return (
    <div className="container">
      <Head>
        <title>Solidity Trading App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Solidity Trading App</h1>
        <h2>token {token}</h2>
        <button onClick={connectWallet}>Connect</button>
        <h3>Address: {defaultAccount}</h3>
        <button onClick={getBalance}>Balance</button>
        <button onClick={mint0}>Mint0</button>
        <button onClick={mint1}>Mint1</button>
        <button onClick={mint3}>Mint3</button>
      </main>

     
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          /* display: flex; */
          /* flex-direction: column;
          justify-content: center;
          align-items: center; */
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
