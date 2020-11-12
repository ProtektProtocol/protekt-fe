import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  TextField,
  Button
} from '@material-ui/core';
import ReactMarkdown  from 'react-markdown';

import ClaimsFields from './claimsFields'

import {
  ERROR,
  DEPOSIT_VAULT,
  DEPOSIT_VAULT_RETURNED,
  WITHDRAW_VAULT,
  WITHDRAW_VAULT_RETURNED,
  DEPOSIT_ALL_VAULT,
  DEPOSIT_ALL_VAULT_RETURNED,
  WITHDRAW_ALL_VAULT,
  WITHDRAW_ALL_VAULT_RETURNED
} from '../../constants'

import { colors } from '../../theme'

import Store from "../../stores";
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
  leftSection: {
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
  rightSection: {
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


class CoverageHolding extends Component {

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
    const { classes, asset } = this.props;
    const {
      amount,
      amountError,
      redeemAmount,
      redeemAmountError,
      loading
    } = this.state

    return (
      <div className={ classes.vaultContainer }>
        <div className={classes.leftSection}>
          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h3' }>Rewards</Typography>
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>AMOUNT EARNED</Typography>
            <Typography variant={ 'h4' }>{ '10 COMP' } </Typography>
          </div>

          <div>
            <Button
              className={ classes.actionButton }
              variant="outlined"
              color="primary"
              disabled={ true || loading || asset.balance <= 0 || asset.depositDisabled === true }
              onClick={ this.onDeposit }
              fullWidth
              >
              <div className={ classes.flexy }>
                <Typography className={ classes.buttonText } variant={ 'h5'} color={asset.disabled?'':'secondary'}>Get Rewards</Typography>
              </div>
            </Button>
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h5' } className={ classes.grey }>COST</Typography>
            <ReactMarkdown source={asset.costDisplay} />
          </div>

          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h3' }>Withdrawals</Typography>
          </div>

          <div>
            <div className={ classes.balances }>
                <Typography variant='h4' onClick={ () => { this.setAmount(100) } } className={ classes.value } noWrap>{ 'Your wallet: '+ (asset.balance ? (Math.floor(asset.balance*10000)/10000).toFixed(4) : '0.0000') } { asset.reserveTokenSymbol}</Typography>
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
              disabled={ loading || asset.balance <= 0 || asset.depositDisabled === true }
              onClick={ this.onDeposit }
              fullWidth
              >
              <Typography className={ classes.buttonText } variant={ 'h5'} color={asset.disabled?'':'secondary'}>Withdraw</Typography>
            </Button>
          </div>

        </div>
        <div className={classes.rightSection}>
          
          <div className={classes.labelValueContainer}>
            <Typography variant={ 'h3' }>Claims</Typography>
          </div>

          <ClaimsFields asset={ asset } />

          <div className={ classes.transactionContainer }>
            { !asset.depositDisabled &&
              <div>
                <Button
                  className={ classes.actionButton }
                  variant="outlined"
                  color="primary"
                  disabled={ loading || asset.balance <= 0 || asset.depositDisabled === true }
                  onClick={ this.onDeposit }
                  fullWidth
                  >
                  <Typography className={ classes.buttonText } variant={ 'h5'} color={asset.disabled?'':'secondary'}>Submit Claim</Typography>
                </Button>
              </div>
            }            
            { asset.depositDisabled === true &&
              <div className={classes.disabledContainer}>
                <Typography variant='h4'>Deposits are currently disabled for this contract</Typography>
              </div>
            }
          </div>

        </div>

      </div>
    )
  };

  _getAPY = (asset) => {
    const { basedOn } = this.props

    if(asset && asset.stats) {
      switch (basedOn) {
        case 1:
          return asset.stats.apyThreeDaySample
        case 2:
          return asset.stats.apyOneWeekSample
        case 3:
          return asset.stats.apyOneMonthSample
        case 4:
          return asset.stats.apyInceptionSample
        default:
          return asset.apy
      }
    } else if (asset.apy) {
      return asset.apy
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

  onDeposit = () => {
    this.setState({ amountError: false })

    const { amount } = this.state
    const { asset, startLoading } = this.props

    if(!amount || isNaN(amount) || amount <= 0 || amount > asset.balance) {
      this.setState({ amountError: true })
      return false
    }

    this.setState({ loading: true })
    startLoading()
    dispatcher.dispatch({ type: DEPOSIT_VAULT, content: { amount: amount, asset: asset } })
  }

  onDepositAll = () => {
    const { asset, startLoading } = this.props

    this.setState({ loading: true })
    startLoading()
    dispatcher.dispatch({ type: DEPOSIT_ALL_VAULT, content: { asset: asset } })
  }

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

export default withRouter(withStyles(styles, { withTheme: true })(CoverageHolding));