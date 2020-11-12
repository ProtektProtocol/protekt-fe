import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  TextField,
  Button
} from '@material-ui/core';
import ReactMarkdown  from 'react-markdown';

import {
  ERROR,
  DEPOSIT_VAULT,
  DEPOSIT_VAULT_RETURNED,
  WITHDRAW_VAULT,
  WITHDRAW_VAULT_RETURNED,
  DEPOSIT_ALL_VAULT,
  DEPOSIT_ALL_VAULT_RETURNED,
  WITHDRAW_ALL_VAULT,
  WITHDRAW_ALL_VAULT_RETURNED,
  START_PROTECTION
} from '../../constants'

import { colors } from '../../theme'

import Store from "../../stores";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  value: {
    cursor: 'pointer'
  },
  actionInput: {
    padding: '0px 0px 12px 0px',
    fontSize: '0.5rem'
  },
  balances: {
    width: '100%',
    textAlign: 'right',
    paddingRight: '20px',
    cursor: 'pointer'
  },
  vaultContainer: {
    display: 'flex',
    flexFlow: 'row wrap',
    width: '100%'
  },
  protectionSection: {
    width: '50%',
    overflow: 'auto',
    paddingBottom: '12px',
    display: 'flex',
    flexFlow: 'column wrap',
    flexGrow: 1,
    padding: '24px',
    borderRight: 'solid lightgrey 1px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  shieldSection: {
    width: '50%',
    overflow: 'auto',
    paddingBottom: '12px',
    display: 'flex',
    flexFlow: 'column wrap',
    flexGrow: 1,
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  labelValueContainer: {
    padding: '12px',
    width: '100%'
  },
  transactionContainer: {
    padding: '12px',
    width: '100%',
    alignSelf: 'flex-end'
  },
  actionsContainer: {
    paddingBottom: '12px',
    display: 'flex',
    padding: '24px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  title: {
    paddingRight: '24px'
  },
  actionButton: {
    height: '47px'
  },
  tradeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  sepperator: {
    borderBottom: '1px solid #E1E1E1',
    margin: '24px',
    [theme.breakpoints.up('sm')]: {
      width: '40px',
      borderBottom: 'none',
      margin: '0px'
    }
  },
  scaleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0px 0px 12px 0px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  scale: {
    minWidth: '10px'
  },
  buttonText: {
    fontWeight: '700',
  },
  headingContainer: {
    width: '100%',
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    }
  },
  heading: {
    paddingBottom: '12px',
    flex: 1,
    flexShrink: 0,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    }
  },
  right: {
    textAlign: 'right'
  },
  buttons: {
    display: 'flex',
    width: '100%'
  },
  disabledContainer: {
    width: '100%',
    paddingTop: '12px',
    textAlign: 'center'
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: '12px 24px',
    background: '#dedede',
    width: '100%',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  headingEarning: {
    flex: 1,
    padding: '12px',
    width: '100%'
  },
  headingStrategy: {
    padding: '12px',
    width: '256px'
  },
  grey: {
    color: colors.darkGray
  },
  flexy: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  fullWidth: {
    minWidth: '100%',
    margin: '18px 0px',
    borderBottom: '1px solid '+colors.borderBlue
  },
  assetSummarySectionheader: {
    width: '83px'
  }
});
/*

    Asset here represents a ProtektContract not an asset

*/

class Asset extends Component {

  constructor() {
    super()

    this.state = {
      amount: '',
      amountError: false,
      redeemAmount: '',
      redeemAmountError: false,
      account: store.getStore('account'), 
    }
  }

  componentWillMount() {
    emitter.on(DEPOSIT_VAULT_RETURNED, this.depositReturned);
    emitter.on(WITHDRAW_VAULT_RETURNED, this.withdrawReturned);
    emitter.on(DEPOSIT_ALL_VAULT_RETURNED, this.depositReturned);
    emitter.on(WITHDRAW_ALL_VAULT_RETURNED, this.withdrawReturned);
    emitter.on(ERROR, this.errorReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(DEPOSIT_VAULT_RETURNED, this.depositReturned);
    emitter.removeListener(WITHDRAW_VAULT_RETURNED, this.withdrawReturned);
    emitter.removeListener(DEPOSIT_ALL_VAULT_RETURNED, this.depositReturned);
    emitter.removeListener(WITHDRAW_ALL_VAULT_RETURNED, this.withdrawReturned);
    emitter.removeListener(ERROR, this.errorReturned);
  };

  depositReturned = () => {
    this.setState({ loading: false, amount: '' })
  };

  withdrawReturned = (txHash) => {
    this.setState({ loading: false, redeemAmount: '' })
  };

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  render() {
    const { classes, pContract} = this.props;
    const {
      amount,
      amountError,
      redeemAmount,
      redeemAmountError,
      loading
    } = this.state

    return (
      <div className={ classes.vaultContainer }>
        <div className={classes.protectionSection}>
          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h3' }>For Insurance Seekers</Typography>
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>COST</Typography>
            <ReactMarkdown source={pContract.costDisplay} />
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>COVERAGE FOR</Typography>
            <ReactMarkdown source={pContract.coverageDisplay} />
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>CLAIMS</Typography>
            <div className={ classes.flexy }>
              <ReactMarkdown source={pContract.claimManagerDisplay} />
            </div>
          </div>

          <div className={ classes.transactionContainer }>
            { !pContract.depositsDisabled &&
              <div>
                <div className={ classes.balances }>
                    <Typography variant='h4' /*onClick={ () => { this.setAmount(100) } }*/ className={ classes.value } noWrap>{ 'Your wallet: '+ (pContract.underlyingTokenBalance ? (Math.floor(pContract.underlyingTokenBalance*100000)/100000).toFixed(4) : '0.0000') } { pContract.underlyingTokenSymbol }</Typography>
                </div>
                <TextField
                  fullWidth
                  className={ classes.actionInput }
                  id='amount'
                  value={ amount }
                  error={ amountError }
                  onChange={ this.onChange }
                  disabled={ loading }
                  placeholder="0.00"
                  variant="outlined"
                  onKeyDown={ this.inputKeyDown }
                />
                <Button
                  className={ classes.actionButton }
                  variant="outlined"
                  color="primary"
                  disabled={ loading || pContract.underlyingTokenBalance <= 0 || pContract.depositsDisabled === true }
                  onClick={ () => this.onDeposit('SEEKER') }
                  fullWidth
                  >
                  <Typography className={ classes.buttonText } variant={ 'h5'} color={pContract.disabled?'':'secondary'}>Start protection</Typography>
                </Button>
              </div>
            }            
            { pContract.depositsDisabled === true &&
              <div className={classes.disabledContainer}>
                <Typography variant='h4'>Deposits are currently disabled for this contract</Typography>
              </div>
            }
          </div>

        </div>
        <div className={classes.shieldSection}>
          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h3' }>For Shield Miners</Typography>
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>APY FROM FEES</Typography>
            <div className={ classes.flexy }>
              <Typography variant={ 'h4' }>{ pContract.shieldRewardApy } </Typography>
            </div>
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>AMOUNT STAKED</Typography>
            <div className={ classes.flexy }>
              <Typography variant={ 'h4' }>{ pContract.shieldStrategyApy } </Typography>
            </div>
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>INVESTMENT STRATEGY</Typography>
            <div className={ classes.flexy }>
              <ReactMarkdown source={pContract.strategyDisplay} />
            </div>
          </div>

          <div className={ classes.transactionContainer }>
            { !pContract.depositDisabled &&
              <div>
                <div className={ classes.balances }>
                    <Typography variant='h4' /*onClick={ () => { this.setAmount(100) } } */ className={ classes.value } noWrap>{ 'Your wallet: '+ (pContract.reserveTokenBalance ? (Math.floor(pContract.reserveTokenBalance*100000)/100000).toFixed(4) : '0.0000') } { pContract.reserveTokenSymbol}</Typography>
                </div>
                <TextField
                  fullWidth
                  className={ classes.actionInput }
                  id='amount'
                  value={ amount }
                  error={ amountError }
                  onChange={ this.onChange }
                  disabled={ loading }
                  placeholder="0.00"
                  variant="outlined"
                  onKeyDown={ this.inputKeyDown }
                />
                <Button
                  className={ classes.actionButton }
                  variant="outlined"
                  color="primary"
                  disabled={ loading || pContract.reserveTokenBalance <= 0 || pContract.depositsDisabled === true }
                  onClick={ () => this.onDeposit('INSURER') }
                  fullWidth
                  >
                  <Typography className={ classes.buttonText } variant={ 'h5'} color={pContract.disabled?'':'secondary'}>Deposit to shield mine</Typography>
                </Button>
              </div>
            }            
            { pContract.depositDisabled === true &&
              <div className={classes.disabledContainer}>
                <Typography variant='h4'>Deposits are currently disabled for this contract</Typography>
              </div>
            }
          </div>

        </div>

      </div>
    )
  };

  _getAPY = (pContract) => {
    const { basedOn } = this.props

    if(pContract && pContract.stats) {
      switch (basedOn) {
        case 1:
          return pContract.stats.apyThreeDaySample
        case 2:
          return pContract.stats.apyOneWeekSample
        case 3:
          return pContract.stats.apyOneMonthSample
        case 4:
          return pContract.stats.apyInceptionSample
        default:
          return pContract.apy
      }
    } else if (pContract.apy) {
      return pContract.apy
    } else {
      return '0.00'
    }
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  inputKeyDown = (event) => {
    if (event.which === 13) {
      this.onInvest();
    }
  }

  /*
    Users should only be able to deposit positive amounts less than their current balance.
    Users will likely need to approve the smart contract to send the amount before depositing.
  // */

  onDeposit = (user) => {
    // console.log(`\n \n \n \n  DEPOSIT PRESSED FOR ${user}  \n \n \n`)
    this.setState({ amountError: false })
    const { amount } = this.state
    const { pContract, startLoading } = this.props

    // console.log('amount to deposit :' + amount)
    let transactionTokenBalance = null
    let erc20address = null
    let vaultContractAddress = null

    if(user === "INSURER"){
      transactionTokenBalance = pContract.reserveTokenBalance
      erc20address = pContract.reserveTokenAddress
      vaultContractAddress = pContract.shieldTokenAddress
    }
    if(user === "SEEKER"){
      transactionTokenBalance = pContract.underlyingTokenBalance
      erc20address = pContract.underlyingTokenAddress
      vaultContractAddress = pContract.pTokenAddress
    }
    
    if(!amount || isNaN(amount) || amount <= 0 || amount > transactionTokenBalance) {
      this.setState({ amountError: true })
      return false
    }

    // console.log('passed amount test')
    this.setState({ loading: true })
    startLoading()
    dispatcher.dispatch({ type: DEPOSIT_VAULT, content: { amount: amount, asset: pContract, erc20address: erc20address, vaultContractAddress: vaultContractAddress } })
  }

  // onStartProtection = () => {
  //   console.log('\n \n \n \n  START PROTECTION PRESSED  \n \n \n')
  //   this.setState({ amountError: false })

  //   const { amount } = this.state
  //   const { pContract, startLoading } = this.props

  //   console.log('amount to deposit :' + amount)

  //   // need to change this based on which deposit type it is
  //   if(!amount || isNaN(amount) || amount <= 0 || amount > this.underlyingTokenBalance) {
  //     this.setState({ amountError: true })
  //     console.log(`hit err as ${amount} > ${this.underlyingTokenBalance}`)
  //     return false
  //   }

  //   console.log('passed error check on protection')

  //   this.setState({ loading: true })
  //   startLoading()
  //   dispatcher.dispatch({ type: DEPOSIT_VAULT, content: { amount: amount, asset: pContract } })
  // }


  // onDepositToShieldMine = () => {
  //   console.log('\n \n \n \n  DEPOSIT PRESSED  \n \n \n')
  //   this.setState({ amountError: false })

  //   const { amount } = this.state
  //   const { asset, startLoading } = this.props

  //   console.log('amount to deposit :' + amount)

  //          // need to change this based on which deposit type it is
  //   if(!amount || isNaN(amount) || amount <= 0 || amount > this.reserveTokenBalance) {
  //     this.setState({ amountError: true })
  //     return false
  //   }

  //   this.setState({ loading: true })
  //   startLoading()
  //   dispatcher.dispatch({ type: DEPOSIT_VAULT, content: { amount: amount, asset: pContract } })
  // }

  // onDepositAll = () => {
  //   const { asset, startLoading } = this.props

  //   this.setState({ loading: true })
  //   startLoading()
  //   dispatcher.dispatch({ type: DEPOSIT_ALL_VAULT, content: { asset: asset } })
  // }

  onWithdraw = () => {
    this.setState({ redeemAmountError: false })

    const { asset, startLoading  } = this.props
    let redeemAmount = this.state.redeemAmount/asset.pricePerFullShare
    redeemAmount = (Math.floor(redeemAmount*10000)/10000).toFixed(4);

    if(!redeemAmount || isNaN(redeemAmount) || redeemAmount <= 0 || redeemAmount > asset.vaultBalance) {
      this.setState({ redeemAmountError: true })
      return false
    }

    this.setState({ loading: true })
    startLoading()

    dispatcher.dispatch({ type: WITHDRAW_VAULT, content: { amount: redeemAmount, asset: asset } })
  }

  onWithdrawAll = () => {
    const { asset, startLoading } = this.props

    this.setState({ loading: true })
    startLoading()
    dispatcher.dispatch({ type: WITHDRAW_ALL_VAULT, content: { asset: asset } })
  }

  setAmount = (percent) => {
    if(this.state.loading) {
      return
    }

    const { asset } = this.props

    const balance = asset.balance
    let amount = balance*percent/100
    amount = Math.floor(amount*10000)/10000;

    this.setState({ amount: amount.toFixed(4) })
  }

  setRedeemAmount = (percent) => {
    if(this.state.loading) {
      return
    }

    const balance = this.props.asset.vaultBalance*this.props.asset.pricePerFullShare
    let amount = balance*percent/100
    amount = Math.floor(amount*10000)/10000;

    this.setState({ redeemAmount: amount.toFixed(4) })
  }
}

export default withRouter(withStyles(styles, { withTheme: true })(Asset));