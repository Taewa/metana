import { useState, useEffect, useRef } from 'react';
import Head from 'next/head'
import { ethers } from 'ethers';
import ConnectionModal from '../components/modal/connection';
import PokemonTokenAbi from '../abis/PokemonTokenAbi.json';
import TradingAbi from '../abis/TradingAbi.json';
import Item from '../components/item.js';

// TODO: improve pokemonElemRef
// TODO: Error handlings
// TODO: Remove event listeners when app is closed
// TODO: Add aminations


export default function Home() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [providerWs, setProviderWs] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [trader, setTrader] = useState(null);
  const [token, setToken] = useState([]);
  const [coin, setCoin] = useState([]);

  const contractAddress = '0xba88A1397598A23237a4b5895900Ab37C43Ce058';
  const traderAddress = '0x744cA2e88ad9A2fbb1296f67b7637bF4d7c1Eb55';
  const pokemonElemRef = useRef([]);  // TODO: find better way to manage element status

  const connectWallet = () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
        console.log('account:', result);
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

  useEffect(() => {
    if(contract) {
      watchProvider();
    }

    if(trader && token) {
      getBalance();
      getMatics();
    }

    // TODO: return => remove all events
  }, [trader]);

  const getMatics = async() => {
    const balance = await provider.getBalance(defaultAccount);
    setCoin(ethers.utils.formatEther(balance));
  }

  // update account, will cause component re-render
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();
	}

  const updateEthers = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const providerWs = new ethers.providers.WebSocketProvider('wss://cosmopolitan-methodical-sky.matic-testnet.discover.quiknode.pro/fa4cd6bc95fab6c48a014cbe1358af2c32f7d3c4/');
		setProvider(provider);
		setProviderWs(providerWs);

		const signer = provider.getSigner();
		setSigner(signer);

		const contract = new ethers.Contract(contractAddress, PokemonTokenAbi, signer);
		const trader = new ethers.Contract(traderAddress, TradingAbi, signer);
		setContract(contract);	
		setTrader(trader);
	}

  // Q: Why my transaction is not detected by "pending" event?
  const watchProvider = () => {
    // provider.on("block", (blockNumber) => {
    //   // Emitted on every block change
    //   console.log("block", blockNumber);
    // });

    // providerWs.on("pending", async (tx) => {
    //   const txInfo = await providerWs.getTransaction(tx);
    //   console.log("pending", txInfo);
    // });


    ethereum.on("accountsChanged", (args) => {
      if (args[0] !== defaultAccount) {
        accountChangedHandler(args[0]);
      }
    });

    contract.on("TransferSingle", (operator, _, to, id, amount) => {
      console.log("TransferSingle!!", operator, to, id, amount);
      getBalance();
      hidePokemonPending(ethers.utils.formatUnits(id, 0));
    });

    contract.on("TransferBatch", (operator, _, to, ids, amount) => {
      console.log("TransferBatch***", operator, to, ids, amount);
      getBalance();

      ids.forEach((id) => {
        hidePokemonPending(ethers.utils.formatUnits(id, 0));
      });
      
    });
  }

  const getBalance = async () => {
    const accounts = [...Array(7)].map((_, __) => defaultAccount);
    const ids = [...Array(7)].map((_, i) => i);

    const balance = await contract.balanceOfBatch(accounts, ids);
    const formattedBalance = balance.map(bal => ethers.utils.formatUnits(bal, 0))
    console.log('formattedBalance:', formattedBalance);
    setToken(formattedBalance);
  }

  // use trader as proxy of ERC1155 contract
  const mint = async(tokenNumber) => {
    await trader.mint(tokenNumber);
  }

  const transfer = async(to, tokenId) => {
    await contract.transfer(to, tokenId);
  }

  // use directly ERC1155
  // Q: which way is better between using trader contract and ERC1155 contract
  const burn = async(tokenNumber) => {
    await contract.burnBatch(defaultAccount, [tokenNumber], [1]);
  }

  const hasForgedToken = () => {
    const forgeableTokens = token.filter((_, index) => (index > 2 && index < 7))
    return Math.max(...forgeableTokens) > 0;
  }

  const hidePokemonPending = (targetId) => {
    pokemonElemRef.current = pokemonElemRef.current.filter(ref => ref);
    pokemonElemRef.current.forEach((ref) => {
      if (ref.tokenId() === parseInt(targetId)) {
        ref.togglePending(false);
      }
    })
  }

  return (
    <div className="container">
      <Head>
        <title>Pokemon NFT Trading</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold">Pokemon NFT Trading</h1>
        {
          !defaultAccount ? (
            <>
              <ConnectionModal connect={connectWallet}></ConnectionModal>
            </>
          ) : (<></>)
        }

        <section className='user-info text-sm shadow-md'>
          <p>You are: {defaultAccount}</p>
          <p className='text-coin'>You have: {coin} <img className='icon-coin' src="/matic.png"></img></p>
        </section>
        
        <section className='list-free-items-area mb-24'>
          <h3 className='text-3xl font-bold underline text-center'>Mint NFTs</h3>
          <section className="list-free-items">
            {
              [0, 1, 2].map(index => 
                <Item 
                  className='pokemon-item' 
                  key={index}  
                  ref={elem => pokemonElemRef.current[index] = elem} 
                  tokenNumber={index} 
                  mint={mint} 
                  transfer={transfer}
                  totalSupply={token[index]}></Item>
              )
            }
          </section>
        </section>
        <section className='bottom-area'>
          <section className='list-forgeable-area mb-24'>
            <h3 className='text-3xl font-bold underline text-center'>Forgeable NFTs</h3>

            <div className='list-forge-items'>
              {
                [3, 4, 5, 6].map(index => 
                  <Item 
                    key={index}  
                    ref={elem => pokemonElemRef.current[index] = elem} 
                    tokenNumber={index} 
                    mint={mint} 
                  ></Item>
                )
              }

            </div>
          </section>
        
          <section className='list-forged-area mb-32 w-full'>
            <h3 className='text-3xl font-bold underline text-center'>Forged NFTs</h3>

            <div className='list-forged-items'>
              {
                token
                  .map((balance, index) => {
                    if(index > 2 && index < 7 && balance > 0) {
                      return <Item 
                        key={index}
                        ref={elem => pokemonElemRef.current.push(elem)} 
                        tokenNumber={index} 
                        burn={burn} 
                        totalSupply={token[index]}></Item>
                    }
                  })
              }
              {
                !hasForgedToken() ? (
                  <>
                    <h4 className='p-16 text-3xl font-bold text-center w-full'>You have no forged NFT</h4>
                  </>
                ) : (<></>)
              }
            </div>
          </section>
        </section>
      </main>
     
      <style jsx>{`
        .container {
          max-width: 1600px;
          min-height: 100vh;
          padding: 0 0.5rem;
          margin: 0 auto;
        }

        .container::before {    
          content: "";
          pointer-events: none;
          background-image: url('/bg.jpeg');
          background-size: cover;
          position: fixed;
          top: 0px;
          right: 0px;
          bottom: 0px;
          left: 0px;
          opacity: 0.24;
          background-size: cover;
        }

        @media only screen and (min-width: 768px) {
          .container::before {
            background-size: contain;
          }
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .list-free-items,
        .list-forge-items,
        .list-forged-items {
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          align-items: center;
        }

        .list-forgeable-area,
        .list-forged-area {
          flex: 1;
        }

        @media only screen and (min-width: 768px) {
          .list-forgeable-area,
          .list-forged-area {
            padding: 24px;
          }
        }

        .bottom-area {
          display: block;
        }

        @media only screen and (min-width: 768px) {
          .bottom-area {
            display: flex;
          }
        }

        .text-coin {
          display: flex;
        }

        .icon-coin {
          width: 24px;
          height: 24px;
          margin-left: 4px;
        }

        .user-info {
          position: sticky;
          top: 0;
          padding: 12px 16px;
          margin: 16px 0 32px 0;
          background: #ddd;
          border-radius: 4px;
          z-index: 10;
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
