import { useState, forwardRef, useImperativeHandle } from 'react';
import { clsx } from 'clsx';
import Spinner from './spinner';
// export default function Item({ tokenNumber, mint, burn, totalSupply }) {
const Item = forwardRef(({ tokenNumber, mint, transfer, burn, totalSupply }, ref) => {
  const [isPending, setPending] = useState(false);
  const [transferText, setTransferText] = useState('');
  const characterList = [
    { name: 'SCIZOR' },
    { name: 'LUCARIO' },
    { name: 'MUDKIP' },
    { name: 'PIKACHU' },
    { name: 'SQUIRTLE' },
    { name: 'UMBREON' },
    { name: 'CHARIZARD' },
  ];

  const name = characterList[tokenNumber].name;
  const togglePending = (isPending = true) => {
    setPending(isPending);
  }

  const handleTransferText = event => {
    setTransferText(event.target.value);
  }

  useImperativeHandle(ref, () => ({
    togglePending(isPending = true) {
      setPending(isPending);
    },

    tokenId() {
      return tokenNumber;
    },

  }));

  const renderMintButton = (mint) => {
    return mint ? (
        <>
          <button type="button" 
            className={clsx(
              'mt-2',
              'w-full', 
              'text-white', 
              'font-bold', 
              'py-2', 
              'px-4',
              {'bg-yellow-400': !isPending}, 
              {'hover:bg-yellow-700': !isPending},
              {'bg-gray-400': isPending},
              {'disabled': isPending}
            )}
            
            onClick={() => mint(parseInt(tokenNumber), togglePending())}>
              {isPending ? ( 
                <>
                  <Spinner isShown={isPending}></Spinner>
                </>
                ) : (<></>)
              }
              
              Mint
            </button>
        </>
      ):(<></>)
  }

  const renderTransferUI = (transfer) => {
    return transfer ? (
        <>
          <section className='transfer-wrapper mt-4'>
           <input className='input-to' type="text" onChange={handleTransferText} value={transferText} />
            <button type="button" 
              className={clsx(
                'btn-transfer',
                'w-full', 
                'text-white', 
                'font-bold', 
                'py-2', 
                'px-4', 
                'bg-yellow-400',
                'hover:bg-yellow-700',
                {'bg-gray-400': !transferText},
                {'disabled': !transferText}
              )}
              onClick={() => {transfer(transferText, parseInt(tokenNumber), togglePending()), setTransferText('')}}>
                Transfer
            </button>
          </section>
          <style jsx>{`
            @media only screen and (min-width: 768px) {
              .transfer-wrapper {
                display: flex;
                position: relative;
              }
            }

            .input-to {
              width: 100%;
              padding: 8px;
            }

            @media only screen and (min-width: 768px) {
              .input-to {
                padding: 8px 108px 8px 8px;
              }
            }

            .btn-transfer {
              margin-top: 8px;
            }

            @media only screen and (min-width: 768px) {
              .btn-transfer {
                position: absolute;
                right: 0;
                max-width: 98px;
                margin-top: 0;
              }
            }
          `}</style>
        </>
      ):(<></>)
  }

  const renderBurnButton = (burn) => {
    return burn ? (
      <>
        <button type="button" 
          className={clsx(
              'mt-2',
              'w-full', 
              'text-white', 
              'font-bold', 
              'py-2', 
              'px-4', 
              {'bg-red-400': !isPending}, 
              {'hover:bg-red-700': !isPending},
              {'bg-gray-400': isPending},
              {'disabled': isPending}
            )}
          onClick={() => burn(parseInt(tokenNumber), togglePending())}>
            {isPending ? ( 
              <>
                <Spinner isShown={isPending}></Spinner>
              </>
              ) : (<></>)
            }
            Burn
          </button>
      </>
    ):(<></>)
  }

  return (
    <div className="container-item">
      <div className="wrapper-item">
        <img className="img-character" src={`/${name}.png`}></img>
        <p className="txt-character text-lg">{name}</p>
        {renderMintButton(mint)}
        {renderTransferUI(transfer)}
        {renderBurnButton(burn)}
        
        <p>
          {totalSupply ? (
            <>
              <span className="total-supply">{totalSupply}</span>
            </>
          ): (<></>)
          }
        </p>
      </div>

      <style jsx>{`
        .moka {
          font-size: 30px;
        }
        .container-item {
          position: relative;
          width: 50%;
        }
        
        @media only screen and (min-width: 768px) {
          .container-item {
            width: 33.3%;
          }
        }

        @media only screen and (min-width: 1200px) {
          .container-item {
            width: 25%;
          }
        }

        .wrapper-item {
          padding: 16px;
          margin: 16px;
          background: #eee;
          border-radius: 4px;
          box-shadow: 1px 1px 5px rgb(0 0 0 / 23%);
        }

        .img-character {
          width: 100%;
          max-width: 300px;
        }

        .txt-character {
          text-align: center;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .total-supply {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          min-height: 24px;
          background: #ffd622;
          border-radius: 50px;
          font-size: 14px;
          font-weight: bold;
          color: #444;
        }
      `}</style>
    </div>
  )
}
)

export default Item;