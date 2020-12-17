import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import numeral from "numeral";
import locales from "numeral"
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Tooltip,
  MenuItem,
  Button,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import InfoIcon from '@material-ui/icons/Info';
import { withNamespaces } from 'react-i18next';
import { colors } from '../../theme'

import Snackbar from '../snackbar'
import CoverageHolding from './coverageHolding'
import StakingHolding from './stakingHolding'
import Loader from '../loader'

import {
  ERROR,
  GET_VAULT_BALANCES_FULL,
  GET_COVERAGE_HOLDINGS,
  DEPOSIT_VAULT_RETURNED,
  WITHDRAW_VAULT_RETURNED,
  DEPOSIT_ALL_VAULT_RETURNED,
  WITHDRAW_ALL_VAULT_RETURNED,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_PROTEKT_CONTRACT_BALANCES,
  COVERAGE_HOLDINGS_RETURNED,
  BALANCES_RETURNED,
  GET_STAKING_HOLDINGS,
  STAKING_HOLDINGS_RETURNED
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store


const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1200px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  investedContainerLoggedOut: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'start',
    justifyContent: 'center',
    minWidth: '100%',
    marginTop: '40px',
    [theme.breakpoints.up('md')]: {
      minWidth: '900px',
    }
  },
  investedContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '100%',
    marginTop: '40px',
    [theme.breakpoints.up('md')]: {
      minWidth: '900px',
    }
  },
  balancesContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    padding: '12px 12px',
    position: 'relative',
  },
  connectContainer: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '450px',
    [theme.breakpoints.up('md')]: {
      width: '450',
    }
  },
  intro: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: '32px',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      maxWidth: 'calc(100vw - 24px)',
      flexWrap: 'wrap'
    }
  },
  introCenter: {
    maxWidth: '500px',
    textAlign: 'center',
    display: 'flex',
    padding: '24px 0px'
  },
  introText: {
    paddingLeft: '20px'
  },
  actionButton: {
    '&:hover': {
      backgroundColor: "#19E7C2",
    },
    padding: '12px',
    backgroundColor: "white",
    border: '1px solid rgba(25, 231, 194, 1)',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      padding: '15px',
    }
  },
  heading: {
    display: 'none',
    flex: 1,
    [theme.breakpoints.up('md')]: {
      display: 'block'
    }
  },
  headingName: {
    display: 'flex',
    alignItems: 'center',
    width: '325px',
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      flex: 1
    }
  },
  headingEarning: {
    display: 'none',
    width: '300px',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  buttonText: {
    fontWeight: '700',
    color: 'black',
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap'
    }
  },
  assetIcon: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    borderRadius: '20px',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    marginRight: '20px',
    [theme.breakpoints.up('sm')]: {
      height: '40px',
      width: '40px',
      marginRight: '24px',
    }
  },
  addressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    overflow: 'hidden',
    flex: 1,
    whiteSpace: 'nowrap',
    fontSize: '0.83rem',
    textOverflow:'ellipsis',
    cursor: 'pointer',
    padding: '28px 30px',
    borderRadius: '50px',
    border: '1px solid '+colors.borderBlue,
    alignItems: 'center',
    maxWidth: '450px',
    [theme.breakpoints.up('md')]: {
      width: '100%'
    }
  },
  between: {
    width: '40px'
  },
  expansionPanel: {
    maxWidth: 'calc(100vw - 24px)',
    width: '100%'
  },
  versionToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tableHeadContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  investAllContainer: {
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%'
  },
  disclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '0.75rem',
    marginBottom: '24px',
    lineHeight: '1.2',
    background: colors.white
  },
  fees: {
    paddingRight: '75px',
    padding: '12px',
    lineHeight: '1.2',
  },
  walletAddress: {
    padding: '0px 12px'
  },
  walletTitle: {
    flex: 1,
    color: colors.darkGray
  },
  grey: {
    color: colors.darkGray
  },
  filters: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: '0px 12px'
    },
  },
  searchField: {
    flex: 1,
    background: colors.white,
    borderRadius: '50px'
  },
  checkbox: {
    display: 'flex',
    flexDirection: 'row-reverse',
    flex: 1,
    margin: '0px !important'
  },
  newMarket: {
    alignSelf: 'flex-end',
    flex: 1,
    margin: '0px !important'
  },
  flexy: {
    display: 'flex',
    alignItems: 'center'
  },
  on: {
    color: colors.darkGray,
    padding: '0px 6px'
  },
  positive: {
    color: colors.compoundGreen
  },
  basedOnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  infoIcon: {
    fontSize: '1em',
    marginRight: '6px'
  },
  removePadding: {
    padding: '0px',
    maxWidth: '900px'
  }
});

class Vault extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const basedOn = localStorage.getItem('yearn.finance-dashboard-basedon')

    this.state = {
      assets: store.getStore('vaultAssets'),
      protektContracts: store.getStore('protektContracts'),
      coverageHoldings: store.getStore('coverageHoldings'),
      stakingHoldings: store.getStore('stakingHoldings'),
      usdPrices: store.getStore('usdPrices'),
      account: account,
      address: account.address ? account.address.substring(0,6)+'...'+account.address.substring(account.address.length-4,account.address.length) : null,
      snackbarType: null,
      snackbarMessage: null,
      search: '',
      searchError: false,
      hideZero: localStorage.getItem('yearn.finance-hideZero') === '1' ? true : false,
      basedOn: basedOn ? parseInt(basedOn) : 1,
      loading: true,
      coverageLoading: true,
      stakingLoading: true,
      coverageExpanded: null,
      stakingExpanded: null,
    }

    if(account && account.address) {
      dispatcher.dispatch({ type: GET_COVERAGE_HOLDINGS, content: {} })
      dispatcher.dispatch({ type: GET_PROTEKT_CONTRACT_BALANCES, content: {} })
      dispatcher.dispatch({ type: GET_STAKING_HOLDINGS, content: {} })
    }
  }
  componentWillMount() {
    emitter.on(DEPOSIT_VAULT_RETURNED, this.showHash);
    emitter.on(WITHDRAW_VAULT_RETURNED, this.showHash);
    emitter.on(DEPOSIT_ALL_VAULT_RETURNED, this.showHash);
    emitter.on(WITHDRAW_ALL_VAULT_RETURNED, this.showHash);
    emitter.on(ERROR, this.errorReturned);
    emitter.on(COVERAGE_HOLDINGS_RETURNED, this.coverageHoldingsReturned);
    emitter.on(STAKING_HOLDINGS_RETURNED, this.stakingHoldingsReturned);
    emitter.on(BALANCES_RETURNED, this.balancesReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
  }

  componentWillUnmount() {
    emitter.removeListener(DEPOSIT_VAULT_RETURNED, this.showHash);
    emitter.removeListener(WITHDRAW_VAULT_RETURNED, this.showHash);
    emitter.removeListener(DEPOSIT_ALL_VAULT_RETURNED, this.showHash);
    emitter.removeListener(WITHDRAW_ALL_VAULT_RETURNED, this.showHash);
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(COVERAGE_HOLDINGS_RETURNED, this.coverageHoldingsReturned);
    emitter.on(STAKING_HOLDINGS_RETURNED, this.stakingHoldingsReturned);
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned);
  };

  balancesReturned = (balances) => {
    this.setState({
      loading: false
    })
  };

  coverageHoldingsReturned = (coverageHoldings) => {
    this.setState({
      coverageLoading: false,
      coverageHoldings: coverageHoldings
    })
  }

  stakingHoldingsReturned = (stakingHoldings) => {
    this.setState({
      stakingLoading: false,
      stakingHoldings: stakingHoldings
    })
  }

  connectionConnected = () => {
    const { t } = this.props
    const account = store.getStore('account')
    this.setState({
      loading: true,
      stakingLoading: true,
      coverageLoading: true,
      account: account,
      address: account.address ? account.address.substring(0,6)+'...'+account.address.substring(account.address.length-4,account.address.length) : null
    })

    //dispatcher.dispatch({ type: GET_VAULT_BALANCES_FULL, content: {} })
    dispatcher.dispatch({ type: GET_PROTEKT_CONTRACT_BALANCES, content: {} })
    dispatcher.dispatch({ type: GET_COVERAGE_HOLDINGS, content: {} })
    dispatcher.dispatch({ type: GET_STAKING_HOLDINGS, content: {} })

    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: t("Unlock.WalletConnected"), snackbarType: 'Info' }
      that.setState(snackbarObj)
    })
  };

  connectionDisconnected = () => {
    this.setState({
      account: null,
      address: null
    })
  }

  errorReturned = (error) => {
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: error.toString(), snackbarType: 'Error' }
      that.setState(snackbarObj)
    })
  };

  showHash = (txHash) => {
    dispatcher.dispatch({ type: GET_PROTEKT_CONTRACT_BALANCES, content: {} })
    dispatcher.dispatch({ type: GET_COVERAGE_HOLDINGS, content: {} })
    dispatcher.dispatch({ type: GET_STAKING_HOLDINGS, content: {} })
    const snackbarObj = { snackbarMessage: null, snackbarType: null }
    this.setState(snackbarObj)
    this.setState({ loading: false })
    const that = this
    setTimeout(() => {
      const snackbarObj = { snackbarMessage: txHash, snackbarType: 'Hash' }
      that.setState(snackbarObj)
    })
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      account,
      snackbarMessage,
      coverageLoading,
      stakingLoading
    } = this.state

    if(!account || !account.address) {
      return (
        <div className={ classes.root }>
          <div className={ classes.investedContainerLoggedOut }>
          <Typography variant={'h5'} className={ classes.disclaimer }>This project is in beta. Use at your own risk.</Typography>
            <div className={ classes.introCenter }>
              <Typography variant='h3'>Connect your wallet to continue</Typography>
            </div>
          </div>
          { snackbarMessage && this.renderSnackbar() }
        </div>
      )
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.investedContainer }>
          <Typography variant={'h5'} className={ classes.disclaimer }>This project is in beta. Use at your own risk.</Typography>
          <div>
            <Typography variant={ 'h3' }>Your Coverage</Typography>
            { coverageLoading && <Loader /> }
            { !coverageLoading && this.renderCoverageHoldings() }
            <br />
            { stakingLoading && <Loader /> }
            <Typography variant={ 'h3' }>Your Stake</Typography>
            {!stakingLoading && this.renderStakingHoldings() }
          </div>
        </div>
        { loading && <Loader /> }
        { snackbarMessage && this.renderSnackbar() }
      </div>
    )
  };

  onSearchChanged = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.checked
    this.setState(val)
  };

  renderCoverageHoldings = () => {
    const { coverageHoldings, protektContracts, assets, coverageExpanded, search, hideZero, basedOn } = this.state
    const { classes } = this.props
    const width = window.innerWidth

    if (!coverageHoldings || !coverageHoldings.length || coverageHoldings[0] === undefined) {
      return (
        <Typography variant={'h5'} className={ classes.grey }>No coverage yet.</Typography>
      )
    }


    return coverageHoldings.map((temp) => {
      let asset = { ...temp,  ...protektContracts[temp.protektIndex] } 
      return (
        <Accordion className={ classes.expansionPanel } square key={ asset.id+"_cover_"+"_expand" } expanded={ coverageExpanded === asset.holdingId} onChange={ () => { this.handleCoverageChange(asset.holdingId) } }>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className={ classes.assetSummary }>
              <div className={classes.headingName}>
                <div className={ classes.assetIcon }>
                  <img
                    alt=""
                    src={ require('../../assets/'+asset.logo+'.png') }
                    height={ width > 600 ? '40px' : '30px'}
                    style={asset.disabled?{filter:'grayscale(100%)'}:{}}
                  />
                </div>
                <div>
                  <Typography variant={ 'h5' } className={ classes.grey }>{ 'PROTECTS' }</Typography>
                  <Typography variant={ 'h3' } noWrap>{ asset.insuredTokenSymbol }</Typography>
                  <Typography variant={ 'h5' } className={ classes.grey }>{ 'IN' }</Typography>
                  <Typography variant={ 'h3' } noWrap>{ asset.insuredPool }</Typography>
                </div>
              </div>
              <div className={classes.headingEarning}>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'AMOUNT COVERED' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ '$' + numeral(asset.amountCoveredUsd.toFixed(2)).format('0,0[.]00') }</Typography>
                <br/>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'COVERAGE' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ asset.coverageSummaryDisplay }</Typography>
              </div>
              <div className={classes.heading}>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'FEES' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ asset.costSummaryDisplay }</Typography>
                <br/>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'BACKED BY' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ asset.strategySummaryDisplay }</Typography>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className={ classes.removePadding }>
            <CoverageHolding asset={ asset } startLoading={ this.startLoading } basedOn={ basedOn } />
          </AccordionDetails>
        </Accordion>
      )
    })
  }

  renderStakingHoldings = () => {
    const { stakingHoldings, protektContracts, assets, stakingExpanded, search, hideZero, basedOn } = this.state
    const { classes } = this.props
    const width = window.innerWidth

    if (!stakingHoldings || !stakingHoldings.length || stakingHoldings[0] === undefined) {
      return (
        <Typography variant={'h5'} className={ classes.grey }>Not staking yet.</Typography>
      )
    }

    return stakingHoldings.map((temp) => {
      let asset = { ...temp,  ...protektContracts[temp.protektIndex] }

      return (
        <Accordion className={ classes.expansionPanel } square key={ asset.id+"_stake_"+"_expand" } expanded={ stakingExpanded === asset.holdingId} onChange={ () => { this.handleStakingChange(asset.holdingId) } }>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <div className={ classes.assetSummary }>
              <div className={classes.headingName}>
                <div className={ classes.assetIcon }>
                  <img
                    alt=""
                    src={ require('../../assets/'+asset.logo+'.png') }
                    height={ width > 600 ? '40px' : '30px'}
                    style={asset.disabled?{filter:'grayscale(100%)'}:{}}
                  />
                </div>
                <div>
                  <Typography variant={ 'h5' } className={ classes.grey }>{ 'PROTECTS' }</Typography>
                  <Typography variant={ 'h3' } noWrap>{ asset.insuredTokenSymbol }</Typography>
                  <Typography variant={ 'h5' } className={ classes.grey }>{ 'IN' }</Typography>
                  <Typography variant={ 'h3' } noWrap>{ asset.insuredPool }</Typography>                </div>
              </div>
              <div className={classes.headingEarning}>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'YOUR STAKED AMOUNT' }</Typography>
                <Typography variant={ 'h3' } noWrap>{'$' + numeral(asset.amountStakedUsd.toFixed(2)).format('0,0[.]00') }</Typography>
                <br/>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'TOTAL APY' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ asset.shieldNetApy }</Typography>
              </div>
              <div className={classes.heading}>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'TOTAL STAKED AMOUNT' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ asset.shieldTotalAmountStakedUsd }</Typography>
                <br/>
                <Typography variant={ 'h5' } className={ classes.grey }>{ 'INVESTMENT STRATEGY' }</Typography>
                <Typography variant={ 'h3' } noWrap>{ asset.strategyDisplay }</Typography>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className={ classes.removePadding }>
            <StakingHolding asset={ asset } startLoading={ this.startLoading } basedOn={ basedOn } />
          </AccordionDetails>
        </Accordion>
      )
    })
  }

  handleChecked = (event) => {
    this.setState({ hideZero: event.target.checked })
    localStorage.setItem('yearn.finance-hideZero', (event.target.checked ? '1' : '0' ))
  }

  handleCoverageChange = (id) => {
    this.setState({ coverageExpanded: this.state.coverageExpanded === id ? null : id })
  }

  handleStakingChange = (id) => {
    this.setState({ stakingExpanded: this.state.stakingExpanded === id ? null : id })
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  renderSnackbar = () => {
    var {
      snackbarType,
      snackbarMessage
    } = this.state
    return <Snackbar type={ snackbarType } message={ snackbarMessage } open={true}/>
  };

  _getAPY = (asset) => {
    const { basedOn } = this.state

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

  renderBasedOn = () => {

    const { classes } = this.props
    const { basedOn, loading } = this.state

    const options = [
      {
        value: 1,
        description: '3 days'
      },
      {
        value: 2,
        description: '1 week'
      },
      {
        value: 3,
        description: '1 month'
      },
      {
        value: 4,
        description: 'inception'
      }
    ]

    return (
      <div className={ classes.basedOnContainer }>
        <InfoIcon className={ classes.infoIcon } />
        <TextField
          id={ 'basedOn' }
          name={ 'basedOn' }
          select
          value={ basedOn }
          onChange={ this.onSelectChange }
          SelectProps={{
            native: false
          }}
          disabled={ loading }
          className={ classes.assetSelectRoot }
        >
        { options &&
          options.map((option) => {
            return (
              <MenuItem key={ option.value } value={ option.value }>
                <Typography variant='h4'>{ option.description }</Typography>
              </MenuItem>
            )
          })
        }
      </TextField>
      </div>
    )
  }

  onSelectChange = (event) => {
    let val = []
    val[event.target.name] = event.target.value
    this.setState(val)

    localStorage.setItem('yearn.finance-dashboard-basedon', event.target.value)

    this.setState({ loading: true })
    dispatcher.dispatch({ type: GET_VAULT_BALANCES_FULL, content: {} })
  }
}

export default withNamespaces()(withRouter(withStyles(styles)(Vault)));
