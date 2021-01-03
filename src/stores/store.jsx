import config from "../config";
import async from 'async';
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

    this.store = {
      protektContracts: [
        {
          // TEST Contract Info
          id: 'TEST-market',
          name: 'Compound DAI',
          insuredTokenSymbol: 'DAI',
          insuredPool: 'Compound',
          logo: 'cDAI-logo',
          description: 'A test insurance market on top of the TEST market on TEST.',

          // Display fields
          costSummaryDisplay: ' 20% COMP',
          coverageSummaryDisplay: '100% Coverage',
          strategySummaryDisplay: 'ETH (Not invested)',
          claimManagerSummaryDisplay: 'DAO vote',
          costDisplay: `**10-20% COMP** rewards of your deposited DAI will be redirected to Shield Miners. The exact fee depends on the amount of coverage.`,
          coverageDisplay: `Protection against 1) **smart contract bugs** that allow hackers to steal or lock DAI and 2) risk that **admin keys are stolen** or used to withdraw DAI. Not covered: 1) Risk of a Maker hack or DAI lossing its peg. 2) Risk of flash loan or other financial exploit.`,
          strategyDisplay: 'Hodling (0% APY)',
          claimManagerDisplay: `Claims are investigated for a period of **1 week**, and the payout decision is made by a DAO vote.`,

          // pToken
          underlyingTokenSymbol: 'cDAI',
          underlyingTokenAddress: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
          underlyingTokenContractABI: config.vaultContractV4ABI,
          pTokenSymbol: 'pTESTU',
          pTokenAddress: '0xA3322933f585A3bB55F9c5B55de6bdf495cE6F16',
          pTokenContractABI: config.vaultContractV4ABI,
          feeModelAddress: '0xA3322933f585A3bB55F9c5B55de6bdf495cE6F16',

          // Shield Token
          reserveTokenSymbol: 'WETH',
          reserveTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          reserveTokenContractABI: config.vaultContractV4ABI,
          shieldTokenSymbol: 'shTESTR',
          shieldTokenAddress: '0x72Dd0481BB794dd44F6ae9afCe08250e253Eb5D4',
          shieldTokenContractABI: config.vaultContractV4ABI,
          controllerAddress: '0x7f73Ae1162E167FBD3A7B117ED7F15344a604578',
          strategyAddress: '0x22c4d7646b2ef0BFEf07c5483e2Bd851303F491f',
          claimsManagerAddress: '0x067c6d278d0F544ACe67a1CEdf9e99c0024A5677',

          // Calculated Fields
          underlyingTokenBalance: 0,
          pTokenBalance: 0,
          reserveTokenBalance: 0,
          shieldTokenBalance: 0,
          shieldRewardApy: `1.40%`,
          shieldStrategyApy: `0%`,
          shieldNetApy: `1.40%`,
          shieldTotalAmountStakedReserve: `1000`,
          shieldTotalAmountStakedUsd: `$200k`,
          depositsDisabled: false,
          withdrawalsDisabled: false,
          claimableRewardsDisabled: false,
          lastBlockMeasurement: 10774489,

          // Claims Fields
          claimStatus: 'Active',
          activePayoutEvent: false,
          investigationPeriod: 43200,
          investigationPeriodDisplay: '1 week',
          currentInvestigationPeriodEnd: 0,

          // To be Deprecated?
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          measurement: 1e18,
          price_id: 'ethereum',
          vaultContractABI: config.vaultContractV4ABI, // To be deprecated
          vaultSymbol: 'pcDAI', // To be deprecated
          erc20address: '0x88d11b9e69C3b0B1C32948333BDFd84fd5e4c9ae', // To be deprecated
          vaultContractAddress: '0x11206fa4DA04A45A7F123f5d24bA5b0F4D39326a',
          symbol: 'cDAI-logo', // To be deprecated
        },
      ],
      coverageHoldings: [
      
      ],
      stakingHoldings: [
    
      ],
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
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
        Fortmatic: fortmatic,
        Portis: portis,
        Squarelink: squarelink,
        Torus: torus,
        Authereum: authereum
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
      // assets: defaultvalues.assets,
      // vaultAssets: defaultvalues.vaultAssets
    })
  }

  _getDefaultValues = () => {
    console.log('getDefault')
    return {
      assets: [
        {
          id: 'DAIv3',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          investSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0xC2cB1040220768554cf699b0d863A3cd4324ce32',
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          decimals: 18,
          price: 0,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'dai'
        },
        {
          id: 'USDCv3',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD//C',
          investSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          iEarnContract: '0x26EA744E5B887E5205727f55dFBE8685e3b21951',
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'usd-coin'
        },
        {
          id: 'USDTv3',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          investSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          iEarnContract: '0xE6354ed5bC4b393a5Aad09f21c46E101e692d447',
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'tether'
        },
        {
          id: 'BUSDv3',
          name: 'BUSD',
          symbol: 'BUSD',
          description: 'Binance USD',
          investSymbol: 'yBUSD',
          erc20address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
          iEarnContract: '0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE',
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'binance-usd'
        },
        {
          id: 'DAIv2',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          investSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01',
          lastMeasurement: 9465912,
          measurement: 1000037230456849197,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          decimals: 18,
          price: 0,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'dai'
        },
        {
          id: 'USDCv2',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD//C',
          investSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          iEarnContract: '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e',
          lastMeasurement: 9465880,
          measurement: 1139534904703193728,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'usd-coin'
        },
        {
          id: 'USDTv2',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          investSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          iEarnContract: '0x83f798e925BcD4017Eb265844FDDAbb448f1707D',
          lastMeasurement: 9465880,
          measurement: 1000030025124779312,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'tether',
        },
        {
          id: 'TUSDv2',
          name: 'TUSD',
          symbol: 'TUSD',
          description: 'TrueUSD',
          investSymbol: 'yTUSD',
          erc20address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          iEarnContract: '0x73a052500105205d34Daf004eAb301916DA8190f',
          lastMeasurement: 9479531,
          measurement: 1000197346651007837 ,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'true-usd',
        },
        {
          id: 'SUSDv2',
          name: 'SUSD',
          symbol: 'SUSD',
          description: 'Synth sUSD',
          investSymbol: 'ySUSD',
          erc20address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
          iEarnContract: '0xF61718057901F84C4eEC4339EF8f0D86D2B45600',
          lastMeasurement: 9465880,
          measurement: 1000021451644065970,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'nusd',
        },
        {
          id: 'wBTCv2',
          name: 'wBTC',
          symbol: 'wBTC',
          description: 'Wrapped BTC',
          investSymbol: 'yWBTC',
          erc20address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          iEarnContract: '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9',
          lastMeasurement: 9465880,
          measurement: 999998358212140782,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 8,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'wrapped-bitcoin',
        },
        {
          id: 'DAIv1',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          investSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0x9D25057e62939D3408406975aD75Ffe834DA4cDd',
          lastMeasurement: 9400732,
          measurement: 1000848185112260412,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          decimals: 18,
          price: 0,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'dai',
        },
        {
          id: 'USDCv1',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD//C',
          investSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          iEarnContract: '0xa2609B2b43AC0F5EbE27deB944d2a399C201E3dA',
          lastMeasurement: 9400732,
          measurement: 1001761741440856097,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'usd-coin',
        },
        {
          id: 'USDTv1',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          investSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          iEarnContract: '0xa1787206d5b1bE0f432C4c4f96Dc4D1257A1Dd14',
          lastMeasurement: 9400732,
          measurement: 1085531657202472310,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'tether',
        },
        {
          id: 'SUSDv1',
          name: 'SUSD',
          symbol: 'SUSD',
          description: 'Synth sUSD',
          investSymbol: 'ySUSD',
          erc20address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
          iEarnContract: '0x36324b8168f960A12a8fD01406C9C78143d41380',
          lastMeasurement: 9400732,
          measurement: 1029186724259834543,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'nusd',
        },
        {
          id: 'wBTCv1',
          name: 'wBTC',
          symbol: 'wBTC',
          tokenSymbol: 'wBTC',
          description: 'Wrapped BTC',
          investSymbol: 'yBTC',
          erc20address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          iEarnContract: '0x04EF8121aD039ff41d10029c91EA1694432514e9',
          lastMeasurement: 9427488,
          measurement: 2000175540087812685,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 8,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'wrapped-bitcoin',
        },
        {
          id: 'CRVv1',
          name: 'cDAI/cUSDC',
          symbol: 'CRV',
          tokenSymbol: 'DAI',
          description: 'Curve.fi cDAI/cUSDC',
          investSymbol: 'yCRV',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0x9Ce551A9D2B1A4Ec0cc6eB0E0CC12977F6ED306C',
          lastMeasurement: 9414437,
          measurement: 1008192205495361668,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'dai',
        },
        {
          id: 'ETHv1',
          name: 'ETH',
          symbol: 'ETH',
          description: 'Ethereum',
          investSymbol: 'iETH',
          erc20address: 'Ethereum',
          iEarnContract: '0x9Dde7cdd09dbed542fC422d18d89A589fA9fD4C0',
          apr: 0,
          maxApr: 0,
          balance: 0,
          decimals: 18,
          investedBalance: 0,
          price: 0,
          poolValue: 0,
          abi: config.IEarnABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          price_id: 'ethereum',
        },
        {
          id: 'iDAIv1',
          name: 'Fulcrum DAI iToken',
          symbol: 'iDAI',
          description: 'Fulcrum DAI iToken',
          erc20address: '0x493c57c4763932315a328269e1adad09653b9081',
          iEarnContract: null,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          version: 2,
          disabled: true,
          idai: true,
          price_id: 'dai',
        },
        {
          id: 'TESTR',
          name: 'TESTR',
          symbol: 'TESTR', 
          description: 'Test Reserve',
          vaultSymbol: 'TESTR',
          erc20address: '0x7baCdF93AC5f58fEB8283Dd96E26710F4c7E1F40',
          vaultContractAddress: '0x3b5419c9581d2cc565F029aE0c84C4C807EB8171', // shToken
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: false,
          lastMeasurement: 10604016,
          measurement: 1e18,
          price_id: 'testr',
        },
        {
          id: 'TESTU',
          name: 'TESTU',
          symbol: 'TESTU', 
          description: 'Test Underlying',
          vaultSymbol: 'TESTU',
          erc20address: '0x4162F62BAf5cEd4C6cbECe7e547d2aAa89949D4f',
          vaultContractAddress: '0x35fDF71b4Ec48500FC3c9E617c8960154f6014EB', // pToken
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: false,
          lastMeasurement: 10604016,
          measurement: 1e18,
          price_id: 'testu',
        }
      ],
      vaultAssets: [
        {
          id: 'ETH',
          name: 'ETH',
          symbol: 'ETH',
          description: 'Ether',
          vaultSymbol: 'yETH',
          erc20address: 'Ethereum',
          vaultContractAddress: '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
          vaultContractABI: config.vaultContractV4ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: false,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10774489,
          measurement: 1e18,
          depositDisabled: true,
          price_id: 'ethereum',
        },
        {
          id: 'WETH',
          name: 'WETH',
          symbol: 'WETH',
          description: 'Wrapped Ether',
          vaultSymbol: 'yWETH',
          erc20address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          vaultContractAddress: '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
          vaultContractABI: config.vaultContractV4ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10774489,
          measurement: 1e18,
          depositDisabled: true,
          price_id: 'ethereum',
        },
        {
          id: 'YFI',
          name: 'yearn.finance',
          symbol: 'YFI',
          description: 'yearn.finance',
          vaultSymbol: 'yYFI',
          erc20address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
          vaultContractAddress: '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10695309,
          measurement: 1e18,
          price_id: 'yearn-finance',
        },
        {
          id: 'CRV',
          name: 'curve.fi/y LP',
          symbol: 'yCRV',
          description: 'yDAI/yUSDC/yUSDT/yTUSD',
          vaultSymbol: 'yUSD',
          erc20address: '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8',
          vaultContractAddress: '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c',
          vaultContractABI: config.vaultContractABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: false,
          withdraw: true,
          withdrawAll: false,
          lastMeasurement: 10559448,
          measurement: 1e18,
          price_id: 'curve-fi-ydai-yusdc-yusdt-ytusd',
        },
        {
          id: 'crvBUSD',
          name: 'curve.fi/busd LP',
          symbol: 'crvBUSD',
          description: 'yDAI/yUSDC/yUSDT/yBUSD',
          vaultSymbol: 'ycrvBUSD',
          erc20address: '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B',
          vaultContractAddress: '0x2994529c0652d127b7842094103715ec5299bbed',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: false,
          lastMeasurement: 10709740,
          measurement: 1e18,
          price_id: 'lp-bcurve',
          yVaultCheckAddress: '0xe309978497dfc15bb4f04755005f6410cadb4103'
        },
        {
          id: 'crvBTC',
          name: 'curve.fi/sbtc LP',
          symbol: 'crvBTC',
          description: 'renBTC/wBTC/sBTC',
          vaultSymbol: 'ycrvBTC',
          erc20address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
          vaultContractAddress: '0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10734341,
          measurement: 1e18,
          price_id: 'lp-sbtc-curve'
        },
        {
          id: 'DAI',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          vaultSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          vaultContractAddress: '0xACd43E627e64355f1861cEC6d3a6688B31a6F952',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10650116,
          measurement: 1e18,
          price_id: 'dai',
          yVaultCheckAddress: '0x1bbe0f9af0cf852f9ff14637da2f0bc477a6d1ad'
        },
        {
          id: 'TUSD',
          name: 'TUSD',
          symbol: 'TUSD',
          description: 'TrueUSD',
          vaultSymbol: 'yTUSD',
          erc20address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          vaultContractAddress: '0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10603368,
          measurement: 1e18,
          price_id: 'true-usd',
        },
        {
          id: 'USDC',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD//C',
          vaultSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          vaultContractAddress: '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e',
          vaultContractABI: config.vaultContractABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 6,
          deposit: true,
          depositAll: false,
          withdraw: true,
          withdrawAll: false,
          lastMeasurement: 10532708,
          measurement: 1e18,
          price_id: 'usd-coin',
        },
        {
          id: 'USDT',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          vaultSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          vaultContractAddress: '0x2f08119C6f07c006695E079AAFc638b8789FAf18',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 6,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10651402,
          measurement: 1e18,
          price_id: 'tether',
        },
        {
          id: 'aLINK',
          name: 'aLINK',
          symbol: 'aLINK',
          description: 'Aave Interest bearing LINK',
          vaultSymbol: 'yaLINK',
          erc20address: '0xA64BD6C70Cb9051F6A9ba1F163Fdc07E0DfB5F84',
          vaultContractAddress: '0x29E240CFD7946BA20895a7a02eDb25C210f9f324',
          vaultContractABI: config.vaultContractV2ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10599617,
          measurement: 1e18,
          price_id: 'aave-link',
        },
        {
          id: 'LINK',
          name: 'ChainLink',
          symbol: 'LINK',
          description: 'ChainLink',
          vaultSymbol: 'yLINK',
          erc20address: '0x514910771af9ca656af840dff83e8264ecf986ca',
          vaultContractAddress: '0x881b06da56BB5675c54E4Ed311c21E54C5025298',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: true,
          lastMeasurement: 10604016,
          measurement: 1e18,
          price_id: 'chainlink',
        },
        {
          id: 'TESTR',
          name: 'TESTR',
          symbol: 'TESTR', 
          description: 'Test Reserve',
          vaultSymbol: 'TESTR',
          erc20address: '0x7baCdF93AC5f58fEB8283Dd96E26710F4c7E1F40',
          vaultContractAddress: '0x3b5419c9581d2cc565F029aE0c84C4C807EB8171', // shToken
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: true,
          lastMeasurement: 10604016,
          measurement: 1e18,
          price_id: 'testr',
        },
        {
          id: 'TESTU',
          name: 'TESTU',
          symbol: 'TESTU', 
          description: 'Test Underlying',
          vaultSymbol: 'TESTU',
          erc20address: '0x4162F62BAf5cEd4C6cbECe7e547d2aAa89949D4f',
          vaultContractAddress: '0x35fDF71b4Ec48500FC3c9E617c8960154f6014EB', // pToken
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: true,
          lastMeasurement: 10604016,
          measurement: 1e18,
          price_id: 'testu',
        }
      ],
      aprs: [{
          token: 'DAI',
          address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          earnAddress: '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01',
          lastMeasurement: 9465912,
          measurement: 1000037230456849197,
          mod: 1,
          decimals: 18
        },{
          token: 'TUSD',
          address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          earnAddress: '0x73a052500105205d34daf004eab301916da8190f',
          lastMeasurement: 9479531,
          measurement: 1000197346651007837 ,
          created: 0,
          mod: 1,
          decimals: 18
        },{
          token: 'USDC',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          earnAddress: '0xa2609B2b43AC0F5EbE27deB944d2a399C201E3dA',
          lastMeasurement: 9400732,
          measurement: 1001761741440856097,
          mod: 1,
          decimals: 6
        },{
          token: 'USDT',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          earnAddress: '0x83f798e925BcD4017Eb265844FDDAbb448f1707D',
          lastMeasurement: 9465880,
          measurement: 1000030025124779312,
          mod: 1,
          decimals: 6
        },{
          token: 'SUSD',
          address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
          earnAddress: '0x36324b8168f960A12a8fD01406C9C78143d41380',
          lastMeasurement: 9400732,
          measurement: 1029186724259834543,
          mod: 1,
          decimals: 18
        },{
          token: 'BAT',
          address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'ETH',
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'LINK',
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'KNC',
          address: '0xdd974D5C2e2928deA5F71b9825b8b646686BD200',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'REP',
          address: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'MKR',
          address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'ZRX',
          address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'SNX',
          address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
          created: 0,
          mod: 1,
          earnAddress: '',
          decimals: 18
        },{
          token: 'wBTC',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          earnAddress: '0x04EF8121aD039ff41d10029c91EA1694432514e9',
          lastMeasurement: 9427488,
          measurement: 2000175540087812685,
          mod: 1,
          decimals: 18
        },
      ],
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
        (callbackInner) => { this._getERC20Balance(web3, protektContract.underlyingTokenAddress, account, callbackInner) },
        (callbackInner) => { this._getERC20Balance(web3, protektContract.pTokenAddress, account, callbackInner) },
        (callbackInner) => { this._getERC20Balance(web3, protektContract.reserveTokenAddress, account, callbackInner) },
        (callbackInner) => { this._getERC20Balance(web3, protektContract.shieldTokenAddress, account, callbackInner) },
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
        (callbackInner) => { this._getERC20Balance(web3, protektContracts[index].pTokenAddress, account, callbackInner) },
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
        (callbackInner) => { this._getERC20Balance(web3, protektContracts[index].shieldTokenAddress, account, callbackInner) },
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

  _getERC20Balance = async (web3, erc20address, account, callback) => {
    if(erc20address === 'Ethereum') {
      try {
        const eth_balance = web3.utils.fromWei(await web3.eth.getBalance(account.address), "ether");
        callback(null, parseFloat(eth_balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    } else {
      let erc20Contract = new web3.eth.Contract(config.erc20ABI, erc20address)

      try {
        var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
        balance = parseFloat(balance)/10**18 // changed to 18 constant as .decimals was deprecated - maybe run this by corbin
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
    const { asset, amount, erc20address, vaultContractAddress } = payload.content

    // pass in erc20 address and vault address to deposit and pass in to below
    this._checkApproval(erc20address, account, amount, vaultContractAddress, (err) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      this._callDepositVault(erc20address,vaultContractAddress, account, amount, (err, depositResult) => {
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
  _callDepositVault = async (erc20address,vaultContractAddress, account, amount, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let vaultContract = new web3.eth.Contract(config.vaultContractV4ABI, vaultContractAddress)

    var amountToSend = web3.utils.toWei(amount, "ether")

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
    const { asset, amount, vaultContractAddress } = payload.content

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
      this._callWithdrawVault(account, amount, vaultContractAddress, (err, withdrawResult) => {
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

    // below uses deprecated feild from assets

    // if (asset.decimals !== 18) {
    //   amountSend = Math.round(amount*10**asset.decimals);
    // }

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

  _callWithdrawVault = async (account, amount, vaultContractAddress, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let vaultContract = new web3.eth.Contract(config.vaultContractV4ABI, vaultContractAddress)

    var amountSend = web3.utils.toWei(amount, "ether")
    
    // below deprecated

    // if (asset.decimals !== 18) {
    //   amountSend = Math.round(amount*10**asset.decimals);
    // }

    

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
