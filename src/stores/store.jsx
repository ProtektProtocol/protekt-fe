import config from "../config";
import assets from "./assets";
import async from 'async';
import BigNumber from 'bignumber.js';
import {
  COVERAGE_HOLDINGS_RETURNED,
  STAKING_HOLDINGS_RETURNED,
  GET_COVERAGE_HOLDINGS,
  GET_STAKING_HOLDINGS,
  ERROR,
  GET_PROTEKT_CONTRACT_BALANCES,

  BALANCES_RETURNED,
  GET_BALANCES,

  GET_USD_PRICE,
  USD_PRICE_RETURNED,
  GET_BEST_PRICE_RETURNED,
  GET_CONTRACT_EVENTS,
  GET_CONTRACT_EVENTS_RETURNED,


  DEPOSIT_VAULT,
  DEPOSIT_VAULT_RETURNED,
  DEPOSIT_ALL_VAULT,
  DEPOSIT_ALL_VAULT_RETURNED,
  WITHDRAW_VAULT,
  WITHDRAW_VAULT_RETURNED,
  WITHDRAW_ALL_VAULT,
  WITHDRAW_ALL_VAULT_RETURNED,

  // GET_VAULT_BALANCES_FULL,
  // VAULT_BALANCES_FULL_RETURNED,
  // GET_AGGREGATED_YIELD,
  // GET_AGGREGATED_YIELD_RETURNED,

  // GET_BEST_PRICE,
  // GET_BEST_PRICE_RETURNED,
  // GET_VAULT_BALANCES,
  // VAULT_BALANCES_RETURNED,


} from '../constants';
import Web3 from 'web3';

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  fortmatic,
  portis,
  squarelink,
  torus,
  authereum
} from "./connectors";

const rp = require('request-promise');
const ethers = require('ethers');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();


class Store {
  constructor() {

    // on creation - fetch below from store and calculated calculated values

    this.store = {
      protektContracts: config.protektContracts,
      coverageHoldings: [],
      stakingHoldings: [],
      statistics: [],
      universalGasPrice: '70',
      ethPrice: 0,
      dashboard: this._getDefaultValues().dashboard,
      aprs: this._getDefaultValues().aprs,
      assets: this._getDefaultValues().assets,
      vaultAssets: this._getDefaultValues().vaultAssets,
      usdPrices: null,
      account: {},
      web3: null,
      pricePerFullShare: 0,
      yields: [],
      aggregatedYields: [],
      aggregatedHeaders: [],
      uniswapYields: [],
      uniswapLiquidity: [],
      events: [],
      connectorsByName: {
        MetaMask: injected,
        // TrustWallet: injected,
        // WalletConnect: walletconnect,
        // WalletLink: walletlink,
        // Ledger: ledger,
        // Trezor: trezor,
        // Frame: frame,
        // Fortmatic: fortmatic,
        // Portis: portis,
        // Squarelink: squarelink,
        // Torus: torus,
        // Authereum: authereum
      },
      web3context: null,
      languages: [
        {
          language: 'English',
          code: 'en'
        }
      ],
      ethBalance: 0,
    }

    dispatcher.register(
      function (payload) {
        console.log('Dispatcher payload:', payload)

        switch (payload.type) {
          case GET_COVERAGE_HOLDINGS:
            this.getCoverageHoldings(payload);
            break;
          case GET_STAKING_HOLDINGS:
            this.getStakingHoldings(payload);
            break;
          case GET_PROTEKT_CONTRACT_BALANCES:
            this.getProtektContractBalances(payload);
            break;
          case GET_BALANCES:
            this.getBalances(payload);
            break;
          case GET_CONTRACT_EVENTS:
            this.getContractEvents(payload)
            break;
          case DEPOSIT_VAULT:
            this.depositVault(payload)
            break;
          case DEPOSIT_ALL_VAULT:
            this.depositAllVault(payload)
            break;
          case WITHDRAW_VAULT:
            this.withdrawVault(payload)
            break;
          case WITHDRAW_ALL_VAULT:
            this.withdrawAllVault(payload)
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    return emitter.emit('StoreUpdated');
  };

  resetProfile = () => {
    const defaultvalues = this._getDefaultValues()

    store.setStore({
      assets: defaultvalues.assets,
    })
  }

  _getDefaultValues = () => {
    return {
      assets: assets,
      dashboard: {
          vault_balance_usd: 0,
          vault_growth_usd_daily: 0,
          vault_growth_usd_weekly: 0,
          vault_growth_usd_yearly: 0,
          vault_growth_usd_daily_perc: 0,
          vault_growth_usd_weekly_perc: 0,
          vault_growth_usd_yearly_perc: 0,

          vault_balance_eth: 0,
          vault_growth_eth_daily: 0,
          vault_growth_eth_weekly: 0,
          vault_growth_eth_yearly: 0,
          vault_growth_eth_daily_perc: 0,
          vault_growth_eth_weekly_perc: 0,
          vault_growth_eth_yearly_perc: 0,


          earn_balance_usd: 0,
          earn_growth_usd_daily: 0,
          earn_growth_usd_weekly: 0,
          earn_growth_usd_yearly: 0,
          earn_growth_usd_daily_perc: 0,
          earn_growth_usd_weekly_perc: 0,
          earn_growth_usd_yearly_perc: 0,

          earn_balance_eth: 0,
          earn_growth_eth_daily: 0,
          earn_growth_eth_weekly: 0,
          earn_growth_eth_yearly: 0,
          earn_growth_eth_daily_perc: 0,
          earn_growth_eth_weekly_perc: 0,
          earn_growth_eth_yearly_perc: 0,

          portfolio_balance_usd: 0,
          portfolio_growth_usd_daily: 0,
          portfolio_growth_usd_weekly: 0,
          portfolio_growth_usd_yearly: 0,
          portfolio_growth_usd_daily_perc: 0,
          portfolio_growth_usd_weekly_perc: 0,
          portfolio_growth_usd_yearly_perc: 0,

          portfolio_balance_eth: 0,
          portfolio_growth_eth_daily: 0,
          portfolio_growth_eth_weekly: 0,
          portfolio_growth_eth_yearly: 0,
          portfolio_growth_eth_daily_perc: 0,
          portfolio_growth_eth_weekly_perc: 0,
          portfolio_growth_eth_yearly_perc: 0,
      }
    }
  }

  _checkApprovalForProxy = async (asset, account, amount, contract, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    const vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)
    try {
      const allowance = await vaultContract.methods.allowance(account.address, contract).call({ from: account.address })

      const ethAllowance = web3.utils.fromWei(allowance, "ether")

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        await vaultContract.methods.approve(contract, web3.utils.toWei('999999999999', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }
    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  _checkApproval = async (erc20address, account, amount, contract, callback) => {
    if(erc20address === 'Ethereum') {
      return callback()
    }
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, erc20address)
    try {
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })
      const ethAllowance = web3.utils.fromWei(allowance, "ether")

      if(parseFloat(ethAllowance) < parseFloat(amount)) {

        await erc20Contract.methods.approve(contract, web3.utils.toWei('999999999999', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }
    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  _checkApprovalWaitForConfirmation = async (asset, account, amount, contract, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

    const ethAllowance = web3.utils.fromWei(allowance, "ether")

    if(parseFloat(ethAllowance) < parseFloat(amount)) {
      if(['crvV1', 'crvV2', 'crvV3', 'crvV4', 'USDTv1', 'USDTv2', 'USDTv3', 'sCRV'].includes(asset.id) && ethAllowance > 0) {
        erc20Contract.methods.approve(contract, web3.utils.toWei('0', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', async function(hash){
            erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
              .on('transactionHash', function(hash){
                callback()
              })
              .on('error', function(error) {
                if (!error.toString().includes("-32601")) {
                  if(error.message) {
                    return callback(error.message)
                  }
                  callback(error)
                }
              })
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      } else {
        erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', function(hash){
            callback()
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      }
    } else {
      callback()
    }
  }

  getProtektContractBalances = async () => {
    const account = store.getStore('account')
    const protektContracts = store.getStore('protektContracts')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();
    if(!web3) {
      return null
    }

    async.map(protektContracts, (protektContract, callback) => {
      async.parallel([
        (callbackInner) => { this._getERC20Balance(web3, protektContract.underlyingTokenAddress,protektContract.underlyingTokenDecimals ,account, callbackInner) },
        (callbackInner) => { this._getERC20Balance(web3, protektContract.pTokenAddress, protektContract.pTokenDecimals,account, callbackInner) },
        (callbackInner) => { this._getERC20Balance(web3, protektContract.reserveTokenAddress, protektContract.reserveTokenDecimals,account, callbackInner) },
        (callbackInner) => { this._getERC20Balance(web3, protektContract.shieldTokenAddress, protektContract.shieldTokenDecimals,account, callbackInner) },
        (callbackInner) => { this._getWithdrawalsDisabled(web3, protektContract.shieldTokenAddress, config.shieldTokenABI, callbackInner) },
        (callbackInner) => { this._getClaimStatus(web3, protektContract.claimsManagerAddress, account, callbackInner) },
        (callbackInner) => { this._getActivePayoutEvent(web3, protektContract.claimsManagerAddress, account, callbackInner) },
        (callbackInner) => { this._getCurrentInvestigationEndPeriod(web3, protektContract.claimsManagerAddress, account, callbackInner) },
        (callbackInner) => { this._getLatestBlockNumber(web3, callbackInner) }
      ], (err, data) => {
        protektContract.underlyingTokenBalance = data[0]
        protektContract.pTokenBalance = data[1]
        protektContract.reserveTokenBalance = data[2]
        protektContract.shieldTokenBalance = data[3]
        protektContract.withdrawalsDisabled = data[4]
        protektContract.claimStatus = data[5]
        protektContract.activePayoutEvent = data[6]
        protektContract.currentInvestigationPeriodEnd = data[7]
        protektContract.lastBlockMeasurement = data[8]
        
        callback(null, protektContract)
      })
    }, (err, protektContracts) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      store.setStore({ protektContracts: protektContracts })
      return emitter.emit(BALANCES_RETURNED, protektContracts)
    })
  }

  getCoverageHoldings = async () => {
    const account = store.getStore('account')
    const protektContracts = store.getStore('protektContracts')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();
    if(!web3) {
      return null
    }

    async.times(protektContracts.length, (index, callback) => {
      async.parallel([
        (callbackInner) => { this._getERC20Balance(web3, protektContracts[index].pTokenAddress,protektContracts[index].pTokenDecimals, account, callbackInner) },
        (callBackInner) => { this._getPricePerFullShare(web3, protektContracts[index].pTokenAddress, protektContracts[index].pTokenContractABI, account, callBackInner)},
        (callbackInner) => { this._getTokenUSDPrice(protektContracts[index].underlyingTokenSymbol ,callbackInner)},
      ], (err, data) => {
        // not sure if need to check for errors for non-values if have more pcontracts here
        if(data[0] && data[0] > 0){
          let usersShareOfUnderlyingToken = data[0] * data[1]
          let amountCoveredUsd = usersShareOfUnderlyingToken * data[2]
          let coverageHolding= {
            protektId: protektContracts[index].id,
            protektIndex: index,
            amountCoveredToken: data[0],
            amountCoveredUsd: amountCoveredUsd,
            claimableRewardAmountToken: `10`, 
            claimableRewardAmountUsd: `$40`,
          }
          callback(null, coverageHolding)
        }else{
          callback()
        }
        
      })
    }, (err, coverageHoldings) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }
      store.setStore({ coverageHoldings: coverageHoldings })
      return emitter.emit(COVERAGE_HOLDINGS_RETURNED, coverageHoldings)
    })
  }

  getStakingHoldings = async () => {
    const account = store.getStore('account')
    const protektContracts = store.getStore('protektContracts')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();
    if(!web3) {
      return null
    }

    async.times(protektContracts.length, (index, callback) => {
      async.parallel([
        (callbackInner) => { this._getERC20Balance(web3, protektContracts[index].shieldTokenAddress, protektContracts[index].shieldTokenDecimals, account, callbackInner) },
        (callBackInner) => { this._getPricePerFullShare(web3, protektContracts[index].shieldTokenAddress, protektContracts[index].shieldTokenContractABI, account, callBackInner)},
        (callbackInner) => { this._getTokenUSDPrice(protektContracts[index].reserveTokenSymbol, callbackInner) },
      ], async (err, data) => {
         // not sure if need to check for errors for non-values if have more pcontracts here
        if(data[0] && data[0] > 0){
          let usersShareOfReserveToken = data[0] * data[1]
          let amountStakedUsd = usersShareOfReserveToken * data[2]
          let stakingHolding= {
            protektId: protektContracts[index].id,
            protektIndex: index,
            amountStakedToken: data[0],
            amountStakedUsd: amountStakedUsd,
            claimableRewardAmountToken: `10`, 
            claimableRewardAmountUsd: `$40`,
          }
          callback(null, stakingHolding)
        }else{
          callback()
        }
        
      })
    }, (err, stakingHoldings) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }
      store.setStore({ stakingHoldings: stakingHoldings })
      return emitter.emit(STAKING_HOLDINGS_RETURNED, stakingHoldings)
    })
  }

  /*
      Need to pass in token ID here and add that to coin gecko search instead of dai
      - will this always be the tokens passed in ID? eg reserve/underlying from protekt?
  */
  _getTokenUSDPrice = async ( tokenSymbol,callback) => {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol}&vs_currencies=usd,eth`
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      const priceInUsd = priceJSON[tokenSymbol.toLowerCase()]['usd']

      callback(null, priceInUsd)

    } catch (ex) {
      console.log(ex)
      callback(null, ex)
    }
  }

  _getClaimStatus = async (web3, tokenAddress, account, callback) => {
    let claimsManagerContract = new web3.eth.Contract(config.claimsManagerCoreABI, tokenAddress)
    try {
      var claimsStatus= await claimsManagerContract.methods.status().call();
      return callback(null, claimsStatus)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getActivePayoutEvent = async (web3, tokenAddress, account, callback) => {
    let claimsManagerContract = new web3.eth.Contract(config.claimsManagerCoreABI, tokenAddress)
    try {
      var activePayoutEvent = await claimsManagerContract.methods.activePayoutEvent().call();
      return callback(null, activePayoutEvent)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getCurrentInvestigationEndPeriod = async (web3, tokenAddress, account, callback) => {
    let claimsManagerContract = new web3.eth.Contract(config.claimsManagerCoreABI, tokenAddress)
    try {
      var currentInvestigationPeriodEnd = await claimsManagerContract.methods.currentInvestigationPeriodEnd().call();
      return callback(null, currentInvestigationPeriodEnd)
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  _getLatestBlockNumber = async (web3, callback) => {
    try{
      let block = await web3.eth.getBlockNumber();
      return callback(null,block)
    }catch(ex){
      console.log(ex)
      return callback(ex)
    }
    
  }

  _getERC20Balance = async (web3, erc20address, decimals, account, callback) => {
    if(erc20address === 'Ethereum' ) {
      try {
        const eth_balance = web3.utils.fromWei(await web3.eth.getBalance(account.address), "ether");
        callback(null, parseFloat(eth_balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    }
    // } else if(erc20address === "0xf0d0eb522cfa50b716b3b1604c4f0fa6f04376ad" || erc20address === "0x395004f214954eC324F517f3EF1b0eC137c0acD2" ){
    //     // kovan cDAI & pcDA
    //   let contract = new web3.eth.Contract(config.erc20ABI, erc20address)

    //   try {
    //     var balance = await contract.methods.balanceOf(account.address).call({ from: account.address });
    //     balance = parseFloat(balance)/10**8 // changed to 10 for cDAI
    //     return callback(null, parseFloat(balance))
    //   } catch(ex) {
    //     console.log(ex)
    //     return callback(ex)
    //   }
    // }
    else {
      let erc20Contract = new web3.eth.Contract(config.erc20ABI, erc20address)

      try {
        var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
        balance = parseFloat(balance)/10**decimals
        return callback(null, parseFloat(balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    }
  }

  _getWithdrawalsDisabled = async (web3, tokenAddress, tokenABI, callback) => {
      let shieldContract = new web3.eth.Contract(tokenABI, tokenAddress)
      try {
        var paused = await shieldContract.methods.paused().call(); // hitting exception here
        return callback(null, paused)
      } catch(ex) {
        return callback(ex)
      }
  }

  getContractEvents = (payload) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let iEarnContract = new web3.eth.Contract(config.IEarnABI, config.iEarnContract)

    iEarnContract.getPastEvents('allEvents', { fromBlock: 1, toBlock: 'latest' })
      .then((res) => {

        const sorted = res.sort((a, b) => {
          return parseFloat(a.blockNumber) - parseFloat(b.blockNumber)
        }).filter((tx) => {
          if(tx.event !== 'Transfer') {
            return false
          }

          if(!tx.returnValues.value || tx.returnValues.value === 0) {
            return false
          }

          if(tx.returnValues.from !== '0x0000000000000000000000000000000000000000') {
            return false
          }

          return true
        }).map(async (tx) => {
          const rawTx = await this._getTransaction(web3, tx.transactionHash)

          return {
            blockNumber: tx.blockNumber,
            transactionHash: tx.transactionHash,
            eth: web3.utils.fromWei(rawTx.value, 'ether'),
            iEth: web3.utils.fromWei(tx.returnValues.value, 'ether'),
            ethRatio: tx.returnValues.value*100/rawTx.value,
            address: rawTx.from
          }
        })

        Promise.all(sorted).then(async (transactions) => {
          const pricePerFullShare = await this._getPricePerFullShare(web3, iEarnContract)

          const trxs = transactions.map(async (tx) => {
            //console.log(tx.address)
            const balance = await this._getIEthBalance(web3, iEarnContract, tx.address)

            tx.ethRedeem = (parseFloat(pricePerFullShare)*parseFloat(balance))
            tx.growth = (parseFloat(tx.ethRedeem)*100/parseFloat(tx.eth))
            return tx
          })

          Promise.all(trxs).then(async (txs) => {
            store.setStore({ events: txs })
            return emitter.emit(GET_CONTRACT_EVENTS_RETURNED, txs)
          })
        })
      })
  }

  _getTransaction = async (web3, hash) => {
    const rawTx = await web3.eth.getTransaction(hash)
    return rawTx
  }

  _getPricePerFullShare = async (web3, tokenAddress, tokenABI, account , callback) => {
    try {
      const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress)
      const pricePerFullShare = await tokenContract.methods.getPricePerFullShare().call({ from: account.address })
      callback(null, (pricePerFullShare/1e18))

    } catch (ex) {
      console.log(ex)
      callback(null, ex)
    }
  }

  getBestPrice = (payload) => {
    const account = store.getStore('account')
    const { sendAsset, receiveAsset, amount } = payload.content

    this._getBestPrice(sendAsset, receiveAsset, account, amount, (err, price) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(GET_BEST_PRICE_RETURNED, price)
    })
  }

  _getBestPrice = async (sendAsset, receiveAsset, account, amount, callback) => {
    try {
      const url = 'https://api-v2.dex.ag/price?from='+sendAsset.symbol.toLowerCase()+'&to='+receiveAsset.symbol.toLowerCase()+'&fromAmount='+amount+'&dex=ag&tradable=true'
      let price = await rp(url);
      callback(null, JSON.parse(price));
    } catch(e) {
      callback(null, {})
    }
  }

  _approveToken = async (token, spender, amount, account, web3) => {
    // First 4 bytes of the hash of "fee()" for the sighash selector
    let funcHash = ethers.utils.hexDataSlice(ethers.utils.id('approve(address,uint256)'), 0, 4);

    let abi = new ethers.utils.AbiCoder();
    let inputs = [{
      name: 'spender',
      type: 'address'
    }, {
      name: 'amount',
      type: 'uint256'
    }];

    let params = [spender, amount];
    let bytes = abi.encode(inputs, params).substr(2);

    // construct approval data from function hash and parameters
    let inputData = `${funcHash}${bytes}`;

    // let nonce = await infuraProvider.getTransactionCount(ethersWallet.address);
    let nonce = await web3.eth.getTransactionCount(account.address)

    // You will want to get the real gas price from https://ethgasstation.info/json/ethgasAPI.json
    let gasPrice = web3.utils.toWei(await this._getGasPrice(), 'gwei');

    let transaction = {
      to: token,
      nonce: nonce,
      gasLimit: 500000, // You will want to use estimateGas instead for real apps
      gasPrice: gasPrice,
      data: inputData,
      from: account.address
    }

    // let tx = await ethersWallet.sendTransaction(transaction);
    let tx = await web3.eth.sendTransaction(transaction)
    console.log(tx);
  }

  _getAssetUSDPrices = async (web3, asset, account, usdPrices, callback) => {
    try {
      const vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)
      const pricePerFullShare = await vaultContract.methods.getPricePerFullShare().call({ from: account.address })

      const usdPrice = usdPrices[asset.price_id]

      const returnObj = {
        pricePerFullShare: pricePerFullShare/1e18,
        usdPrice: usdPrice.usd
      }

      callback(null, returnObj)

    } catch (ex) {
      callback(null, {})
    }
  }

  _getAddressStats = (addressStatistics, asset, callback) => {
    try {
      if(asset.erc20address === 'Ethereum') {
        asset.erc20address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      }

      const vault = addressStatistics.filter((stats) => {
        return stats.vaultAddress.toLowerCase() === asset.vaultContractAddress.toLowerCase()
      })

      if(vault.length === 0) {
        return callback(null, null)
      }

      callback(null, vault[0])
    } catch(ex) {
      callback(null, {})
    }
  }

  _getAddressTransactions = (addressTXHitory, asset, callback) => {
    try {

      if(asset.erc20address === 'Ethereum') {
        asset.erc20address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      }

      const vault = addressTXHitory.filter((stats) => {
        return stats.vaultAddress.toLowerCase() === asset.vaultContractAddress.toLowerCase()
      })

      if(vault.length === 0) {
        return callback(null, {})
      }

      callback(null, vault[0])
    } catch(ex) {
      callback(null, {})
    }
  }

  _getVaultHoldings = async (web3, asset, account, callback) => {
    let vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)
    var balance = await vaultContract.methods.balance().call({ from: account.address });
    balance = parseFloat(balance)/10**asset.decimals
    callback(null, parseFloat(balance))
  }

  _getVaultBalance = async (web3, asset, account, callback) => {
    if(asset.vaultContractAddress === null) {
      return callback(null, 0)
    }

    let vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)
    var  balance = await vaultContract.methods.balanceOf(account.address).call({ from: account.address });
    balance = parseFloat(balance)/10**asset.decimals
    callback(null, parseFloat(balance))
  }

  _getVaultPricePerShare = async (web3, asset, account, callback) => {
    if(asset.vaultContractAddress === null) {
      return callback(null, 0)
    }

    try {
      let vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)
      var price = await vaultContract.methods.getPricePerFullShare().call({ from: account.address });
      price = parseFloat(price)/10**18
      callback(null, parseFloat(price))
    } catch(ex) {
      console.log(ex)
      callback(null, 0)
    }
  }

  depositVault = (payload) => {
    const account = store.getStore('account')
    const { asset, amount, erc20address, vaultContractAddress, decimals } = payload.content

    // pass in erc20 address and vault address to deposit and pass in to below
    this._checkApproval(erc20address, account, amount, vaultContractAddress, (err) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      this._callDepositVault(erc20address,vaultContractAddress, account, amount, decimals, (err, depositResult) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }
      })
    })
  }

  _checkIfApprovalIsNeeded = async (asset, account, amount, contract, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

    const ethAllowance = web3.utils.fromWei(allowance, "ether")
    if(parseFloat(ethAllowance) < parseFloat(amount)) {
      asset.amount = amount
      callback(null, asset)
    } else {
      callback(null, false)
    }
  }

  _callApproval = async (asset, account, amount, contract, last, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    try {
      if(['crvV1', 'crvV2', 'crvV3', 'crvV4', 'USDTv1', 'USDTv2', 'USDTv3', 'USDT'].includes(asset.id)) {
        const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })
        const ethAllowance = web3.utils.fromWei(allowance, "ether")
        if(ethAllowance > 0) {
          erc20Contract.methods.approve(contract, web3.utils.toWei('0', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
            .on('transactionHash', function(hash){
              //success...
            })
            .on('error', function(error) {
              if (!error.toString().includes("-32601")) {
                if(error.message) {
                  return callback(error.message)
                }
                callback(error)
              }
            })
        }
      }

      if(last) {
        await erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', function(hash){
            callback()
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      }
    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  /**
   *  Need to pass in contract ABI / add it AS DOES NOT EXIST ANYMORE - add from config?
   */
  _callDepositVault = async (erc20address,vaultContractAddress, account, amount, decimals,callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let vaultContract = new web3.eth.Contract(config.pTokenABI, vaultContractAddress)

    var amountToSend = web3.utils.toWei(amount, "ether")

    if(decimals != 18){
      amountToSend = amount*10**decimals
    }

    if(erc20address === 'Ethereum') {
      vaultContract.methods.depositETH().send({ from: account.address, value: amountToSend, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log(confirmationNumber, receipt);
        })
        .on('receipt', function(receipt){
          console.log(receipt);
        
          emitter.emit(DEPOSIT_VAULT_RETURNED, receipt)
        })
        .on('error', function(error) {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    } else {
      vaultContract.methods.deposit(amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          // console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          // console.log(confirmationNumber, receipt);
        })
        .on('receipt', function(receipt){
          console.log(receipt);

          emitter.emit(DEPOSIT_VAULT_RETURNED, receipt.transactionHash)
        })
        .on('error', function(error) {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    }
  }

  depositAllVault = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content

    this._checkApproval(asset, account, asset.balance, asset.vaultContractAddress, (err) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      this._callDepositAllVault(asset, account, (err, depositResult) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        return emitter.emit(DEPOSIT_ALL_VAULT_RETURNED, depositResult)
      })
    })
  }

  _callDepositAllVault = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)

    vaultContract.methods.depositAll().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  withdrawVault = (payload) => {
    const account = store.getStore('account')
    const { asset, amount, vaultContractAddress, decimals } = payload.content

    console.log('\n \n debugging withdraw')
    console.log(vaultContractAddress)

    /*
        Removed below as doesn't seem to be needed?
        Possibly may be for approval but unsure what the proxy is - ask corbin
    */

    // if(asset.yVaultCheckAddress) {
    //   this._checkApprovalForProxy(asset, account, amount, asset.yVaultCheckAddress, (err) => {
    //     if(err) {
    //       return emitter.emit(ERROR, err);
    //     }

    //     this._callWithdrawVaultProxy(asset, account, amount, (err, withdrawResult) => {
    //       if(err) {
    //         return emitter.emit(ERROR, err);
    //       }

    //       return emitter.emit(WITHDRAW_VAULT_RETURNED, withdrawResult)
    //     })
    //   })
    // } else {
      this._callWithdrawVault(account, amount, vaultContractAddress, decimals, (err, withdrawResult) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }
        //return emitter.emit(WITHDRAW_VAULT_RETURNED, withdrawResult) - moved inside _callWidthdrawVault
      })
    // }
  }

  _callWithdrawVaultProxy = async (asset, account, amount, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let yVaultCheckContract = new web3.eth.Contract(config.vaultContractV4ABI, asset.pTokenAddress)

    var amountSend = web3.utils.toWei(amount, "ether")


    if (asset.decimals !== 18) {
      amountSend = Math.round(amount*10**asset.decimals);
    }

    console.log(amountSend)

    yVaultCheckContract.methods.withdraw(amountSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      console.log(hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber, receipt);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
      emitter.emit(WITHDRAW_VAULT_RETURNED, receipt.transactionHash)
    })
    .on('error', function(error) {
      console.log(error);
      if (!error.toString().includes("-32601")) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      }
    })
  }

  _callWithdrawVault = async (account, amount, vaultContractAddress, decimals, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let vaultContract = new web3.eth.Contract(config.vaultContractV4ABI, vaultContractAddress)

    var amountSend = web3.utils.toWei(amount, "ether")

    
    if(decimals!=18){
      // amountSend = amount*10**decimals
      const bigNumberValue = new BigNumber(amount.toString())
      const value = bigNumberValue.shiftedBy(1 * decimals).decimalPlaces(2).toNumber()
      amountSend = value.toString()
    }
    
    let functionCall = vaultContract.methods.withdraw(amountSend)
    if(vaultContractAddress === 'Ethereum') {
      functionCall = vaultContract.methods.withdrawETH(amountSend)
    }

    
    functionCall.send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      console.log(hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber, receipt);
    })
    .on('receipt', function(receipt){
      console.log(receipt);

      emitter.emit(WITHDRAW_VAULT_RETURNED, receipt.transactionHash)
    })
    .on('error', function(error) {
      console.log(error);
      if (!error.toString().includes("-32601")) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      }
    })
  }

  withdrawAllVault = (payload) => {
    const account = store.getStore('account')
    const { asset } = payload.content

    if(asset.yVaultCheckAddress) {
      this._checkApprovalForProxy(asset, account, asset.vaultBalance, asset.yVaultCheckAddress, (err) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        this._callWithdrawAllVaultProxy(asset, account, (err, withdrawResult) => {
          if(err) {
            return emitter.emit(ERROR, err);
          }

          return emitter.emit(WITHDRAW_ALL_VAULT_RETURNED, withdrawResult)
        })
      })
    } else {
      this._callWithdrawAllVault(asset, account, (err, withdrawResult) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }
        return emitter.emit(WITHDRAW_ALL_VAULT_RETURNED, withdrawResult)
      })
    }
  }

  _callWithdrawAllVaultProxy = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let vaultContract = new web3.eth.Contract(config.yVaultCheckABI, asset.yVaultCheckAddress)

    vaultContract.methods.withdrawAll().send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      console.log(hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber, receipt);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
    })
    .on('error', function(error) {
      console.log(error);
      if (!error.toString().includes("-32601")) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      }
    })
  }

  _callWithdrawAllVault = async (asset, account, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let vaultContract = new web3.eth.Contract(asset.vaultContractABI, asset.vaultContractAddress)

    let functionCall = vaultContract.methods.withdrawAll()
    if(asset.erc20address === 'Ethereum') {
      functionCall = vaultContract.methods.withdrawAllETH()
    }

    functionCall.send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
    .on('transactionHash', function(hash){
      console.log(hash)
      callback(null, hash)
    })
    .on('confirmation', function(confirmationNumber, receipt){
      console.log(confirmationNumber, receipt);
    })
    .on('receipt', function(receipt){
      console.log(receipt);
    })
    .on('error', function(error) {
      console.log(error);
      if (!error.toString().includes("-32601")) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      }
    })
  }

  getUSDPrices = async () => {
    try {
      const priceJSON = await this._getUSDPrices()

      store.setStore({ usdPrices: priceJSON })
      return emitter.emit(USD_PRICE_RETURNED, priceJSON)

    } catch(e) {
      console.log(e)
    }
  }

  _getUSDPrices = async () => {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,dai,true-usd,tether,usd-coin,chainlink,yearn-finance,binance-usd,wrapped-bitcoin,ethereum,nusd,chainlink,aave-link,lp-sbtc-curve,lp-bcurve,curve-fi-ydai-yusdc-yusdt-ytusd&vs_currencies=usd,eth'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)

      return priceJSON
    } catch(e) {
      console.log(e)
      return null
    }
  }

  _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch(e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }

  _getWeb3Provider = async () => {
    const web3context = store.getStore('web3context')
    if(!web3context) {
      return null
    }
    const provider = web3context.library.provider
    if(!provider) {
      return null
    }

    const web3 = new Web3(provider);

    // const web3 = createAlchemyWeb3(config.infuraProvider, { writeProvider: provider });

    return web3
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};
