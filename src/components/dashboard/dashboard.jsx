import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  TextField,
  MenuItem
} from '@material-ui/core';
import { colors } from '../../theme'
import ReactMarkdown from 'react-markdown'

import Loader from '../loader'
import InfoIcon from '@material-ui/icons/Info';

import {
  ERROR,
  CONNECTION_CONNECTED,
  CONNECTION_DISCONNECTED,
  GET_DASHBOARD_SNAPSHOT,
  DASHBOARD_SNAPSHOT_RETURNED,
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
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  investedContainerLoggedOut: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
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
  investedContainer2: {
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
  disaclaimer: {
    padding: '12px',
    border: '1px solid rgb(174, 174, 174)',
    borderRadius: '0.75rem',
    marginBottom: '24px',
    background: colors.white
  },
  portfolioContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  vaultContainer: {
    padding: '28px 30px',
    borderRadius: '50px',
    border: '1px solid '+colors.borderBlue,
    background: colors.white,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  earnContainer: {
    marginTop: '40px',
    padding: '28px 30px',
    borderRadius: '50px',
    border: '1px solid '+colors.borderBlue,
    background: colors.white,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  gray: {
    color: colors.darkGray
  },
  between: {
    width: '40px',
    height: '40px'
  },
  titleBalance: {
    padding: '28px 30px',
    borderRadius: '50px',
    border: '1px solid '+colors.borderBlue,
    background: colors.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    cursor: 'pointer'
  },
  prettyAlign: {
    display: 'flex',
    alignItems: 'center'
  },
  infoIcon: {
    fontSize: '1em',
    marginRight: '6px'
  },
  assetSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginRight: '12px',
  },
  heading: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: '200px',
      alignItems: 'flex-end'
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
  flexy: {
    display: 'flex',
    alignItems: 'center'
  },
  vault: {
    borderBottom: '1px solid rgba(25, 101, 233, 0.2)',
    padding: '12px',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  sectionHeading: {
    color: colors.darkGray,
    width: '100%',
    marginLeft: '54px'
  },
  inline: {
    display: 'flex',
    alignItems: 'baseline'
  },
  symbol: {
    paddingLeft: '6px'
  },
  symbolAt: {
    paddingLeft: '6px',
    color: colors.darkGray
  },
  basedOnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
});

const markdown = `
Protekt Protocol puts crypto to work insuring users against hacks, bugs, and exploits of any DeFi protocol. Just as [Uniswap](https://uniswap.org/) allows any token to have a spot market, Protekt allows any smart contract to be insured by stakers. The goal is to support and catalyze the growth of the DeFi ecosystem by protecting users from getting rekt.

Along with being a smart contract protocol, an allocation of protocol treasury will be used for grants to continually audit and secure other DeFi money legos, so the ecosystem can all grow safely together!

## DeFi Risk
Building on the work of awesome projects like [DeFi Score](https://defiscore.io/), [Nexus Mutual](https://nexusmutual.io/), [Aave's Safety Modules](https://docs.aave.com/aavenomics/safety-module), and others, we believe that large technical and financial vulnerabilities are the **biggest risk to a thriving DeFi community** over the next few years. Smart contracts that contain large amounts of value face the following risks:
1. Smart Contract Risk - Technical bugs that can expose funds to hackers
2. Financial Risk - Collateral falls below outstanding obligations, likely due to price movement, or low liquidity leads to locked funds
3. Centralization Risk - Centralized admin keys are stolen or used nefariously or oracles are manipulated to allow an exploit

Especially as new money legos are created, snapped together, and remixed weekly, the risks multiply and become a bottleneck to more capital flowing into the space. New entrants need signaling and assurance of the projects they can trust and commit capital as well as recapitalization if a [Shortfall Event](https://docs.aave.com/aavenomics/terminology#shortfall-event-se) occurs.

To fulfill this need, Protekt Protocol introduces a new insurance marketplace with several innovative features:
* 📜 ANYONE can back ANY capital pool with a customizable insurance contract
* 💸 Mint wrapped tokens with built in coverage (never "buy cover")
* 🛡 Staking pools with shield mining incentives
* 🔀 Configurable claims processes via automated rules or a DAO
* 🏦 Payouts trigger a liquidation waterfall to spread risk through various tranches.

The protocol  was inspired and uses money legos from yearn, Aave, Compound, Balancer, Maker, rDAi, and others. The very best in DeFi.
`

class Dashboard extends Component {

  constructor(props) {
    super()

    const dashboard = store.getStore('dashboard')
    const account = store.getStore('account')
    const growth = localStorage.getItem('yearn.finance-dashboard-growth')
    const currency = localStorage.getItem('yearn.finance-dashboard-currency')
    const basedOn = localStorage.getItem('yearn.finance-dashboard-basedon')

    this.state = {
      dashboard: dashboard,
      account: account,
      loading: true,
      growth: growth ? parseInt(growth) : 1, // 0=daily 1=weekly 2=yearly
      currency: currency ? currency : 'USD', // USD / ETH,
      basedOn: basedOn ? parseInt(basedOn) : 1 // 1=apyOneDaySample  2=apyThreeDaySample  3= apyOneWeekSample  4=apyInceptionSample
    }

    if(account && account.address) {
      dispatcher.dispatch({ type: GET_DASHBOARD_SNAPSHOT, content: {} })
    }
  }

  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.on(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.on(DASHBOARD_SNAPSHOT_RETURNED, this.dashboardSnapshotReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(CONNECTION_CONNECTED, this.connectionConnected);
    emitter.removeListener(CONNECTION_DISCONNECTED, this.connectionDisconnected);
    emitter.removeListener(DASHBOARD_SNAPSHOT_RETURNED, this.dashboardSnapshotReturned);
  };

  dashboardSnapshotReturned = () => {
    this.setState({
      loading: false,
      dashboard: store.getStore('dashboard')
    })
  }

  connectionConnected = () => {
    const account = store.getStore('account')
    this.setState({ loading: true, account: account })
    dispatcher.dispatch({ type: GET_DASHBOARD_SNAPSHOT, content: {} })
  };

  connectionDisconnected = () => {
    this.setState({ account: null })
  };

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      dashboard,
      growth,
      currency,
      account,
    } = this.state

    if(!account || !account.address) {
      return (
        <div className={ classes.root }>
          <div className={ classes.investedContainerLoggedOut }>
          <Typography variant={'h5'} className={ classes.disaclaimer }>This project is in beta. Use at your own risk.</Typography>
            <div className={ classes.introCenter }>
              <Typography variant='h3'>Connect your wallet to continue</Typography>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.investedContainer}>
          <div className={ classes.portfolioContainer }>
            <div className={ classes.titleBalance } onClick={ this.balanceClicked }>
              { currency === 'USD' && <Typography variant={ 'h2' }>$ { parseFloat(dashboard.portfolio_balance_usd.toFixed(2)).toLocaleString() }</Typography> }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h2' } noWrap>{ parseFloat(dashboard.portfolio_balance_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h3' }>ETH</Typography>
                </div>
              }
              <Typography variant={ 'h4' } className={ classes.gray }>Portfolio Balance</Typography>
            </div>
            <div className={ classes.between }>
            </div>
            { growth === 0 &&
              <div className={ classes.titleBalance } onClick={ this.growthClicked }>
                { currency === 'USD' && <Typography variant={ 'h2' }>$ { parseFloat(dashboard.portfolio_growth_usd_daily.toFixed(2)).toLocaleString() }</Typography> }
                { currency === 'ETH' &&
                  <div className={ classes.inline }>
                    <Typography variant={ 'h2' } noWrap>{ parseFloat(dashboard.portfolio_growth_eth_daily.toFixed(2)).toLocaleString() }</Typography >
                    <Typography className={ classes.symbol } variant={ 'h3' }>ETH</Typography>
                  </div>
                }
                <Typography variant={ 'h4' } className={ `${classes.gray} ${classes.prettyAlign}` }>
                  Daily Growth
                </Typography>
              </div>
            }

            { growth === 1 &&
              <div className={ classes.titleBalance } onClick={ this.growthClicked }>
                { currency === 'USD' && <Typography variant={ 'h2' }>$ { parseFloat(dashboard.portfolio_growth_usd_weekly.toFixed(2)).toLocaleString() }</Typography> }
                { currency === 'ETH' &&
                  <div className={ classes.inline }>
                    <Typography variant={ 'h2' } noWrap>{ parseFloat(dashboard.portfolio_growth_eth_weekly.toFixed(2)).toLocaleString() }</Typography >
                    <Typography className={ classes.symbol } variant={ 'h3' }>ETH</Typography>
                  </div>
                }
                <Typography variant={ 'h4' } className={ `${classes.gray} ${classes.prettyAlign}` }>
                  Weekly Growth
                </Typography>
              </div>
            }

            { growth === 2 &&
              <div className={ classes.titleBalance } onClick={ this.growthClicked }>
                { currency === 'USD' && <Typography variant={ 'h2' }>$ { parseFloat(dashboard.portfolio_growth_usd_yearly.toFixed(2)).toLocaleString() }</Typography> }
                { currency === 'ETH' &&
                  <div className={ classes.inline }>
                    <Typography variant={ 'h2' } noWrap>{ parseFloat(dashboard.portfolio_growth_eth_yearly.toFixed(2)).toLocaleString() }</Typography >
                    <Typography className={ classes.symbol } variant={ 'h3' }>ETH</Typography>
                  </div>
                }
                <Typography variant={ 'h4' } className={ `${classes.gray} ${classes.prettyAlign}` }>
                  Yearly Growth
                </Typography>
              </div>
            }
          </div>



          { this.renderBasedOn() }
          { (dashboard.vaults && dashboard.vaults.length > 0) &&
            <div className={ classes.vaultContainer }>
              <Typography variant={ 'h3' } className={ classes.sectionHeading }>Vaults Overview</Typography>
              { this.renderVaults() }
            </div>
          }
          { (dashboard.assets && dashboard.assets.length > 0) &&
            <div className={ classes.earnContainer }>
              <Typography variant={ 'h3' } className={ classes.sectionHeading }>Earn Overview</Typography>
              { this.renderEarn() }
            </div>
          }
        </div>
        { loading && <Loader /> }
      </div>
    )
  };

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
        <Typography>Growth is based on the vault's performance { basedOn === 4 ? 'since' : 'for the past' }</Typography>
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
    dispatcher.dispatch({ type: GET_DASHBOARD_SNAPSHOT, content: {} })
  }

  growthClicked = () => {
    const { growth } = this.state
    let newGrowth = 0
    switch (growth) {
      case 0:
        newGrowth = 1
        break;
      case 1:
        newGrowth = 2
        break;
      case 2:
        newGrowth = 0
        break;
      default:
        newGrowth = 0
    }
    this.setState({ growth: newGrowth })
    localStorage.setItem('yearn.finance-dashboard-growth', newGrowth.toString())
  }

  balanceClicked = () => {
    const { currency } = this.state
    this.setState({ currency: (currency === 'USD' ? 'ETH' : 'USD') })

    localStorage.setItem('yearn.finance-dashboard-currency', (currency === 'USD' ? 'ETH' : 'USD'))
  }

  renderVaults = () => {
    const { growth, currency } = this.state
    const { vaults } = this.state.dashboard
    const { classes } = this.props

    if(!vaults || vaults.length === 0) {
      return null
    }

    return vaults.map((asset) => {
      return (<div className={ classes.vault } key={asset.id}>
        <div className={ classes.assetSummary }>
          <div className={classes.headingName}>
            <div className={ classes.assetIcon }>
              <img
                alt=""
                src={ require('../../assets/'+asset.symbol+'-logo.png') }
                height={ '30px'}
              />
            </div>
            <div>
              <Typography variant={ 'h3' } noWrap>{ asset.name }</Typography>
              <Typography variant={ 'h5' } noWrap className={ classes.gray }>{ asset.description }</Typography>
            </div>
          </div>
          { growth === 0 &&
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.gray }>Daily Growth</Typography>
              { currency === 'USD' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.vaultGrowth_daily_usd.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (this._getAPY(asset)/365).toFixed(2) }%</Typography>
                </div>
              }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.vaultGrowth_daily_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (this._getAPY(asset)/365).toFixed(2) }%</Typography>
                </div>
              }
            </div>
          }
          { growth === 1 &&
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.gray }>Weekly Growth</Typography>
              { currency === 'USD' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.vaultGrowth_weekly_usd.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (this._getAPY(asset)/52).toFixed(2) }%</Typography>
                </div>
              }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.vaultGrowth_weekly_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (this._getAPY(asset)/52).toFixed(2) }%</Typography>
                </div>
              }
            </div>
          }
          { growth === 2 &&
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.gray }>Yearly Growth</Typography>
              { currency === 'USD' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.vaultGrowth_yearly_usd.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (this._getAPY(asset)/1).toFixed(2) }%</Typography>
                </div>
              }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.vaultGrowth_yearly_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (this._getAPY(asset)/1).toFixed(2) }%</Typography>
                </div>
              }
            </div>
          }
          <div className={classes.heading}>
            <Typography variant={ 'h5' } className={ classes.gray }>Net worth</Typography>
            { currency === 'USD' && <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.usdBalance ? (asset.usdBalance).toFixed(2) : '0.00').toLocaleString() }</Typography > }
            { currency === 'ETH' &&
              <div className={ classes.inline }>
                <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.ethBalance ? (asset.ethBalance).toFixed(2) : '0.00').toLocaleString() }</Typography >
                <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
              </div>
            }
          </div>
        </div>
      </div>)
    })
  }

  renderEarn = () => {
    const { growth, currency } = this.state
    const { assets } = this.state.dashboard
    const { classes } = this.props

    if(!assets || assets.length === 0) {
      return null
    }

    return assets.map((asset) => {
      return (<div className={ classes.vault } key={asset.id}>
        <div className={ classes.assetSummary }>
          <div className={classes.headingName}>
            <div className={ classes.assetIcon }>
              <img
                alt=""
                src={ require('../../assets/'+asset.symbol+'-logo.png') }
                height={ '30px'}
              />
            </div>
            <div>
              <Typography variant={ 'h3' } noWrap>{ asset.name }</Typography>
              <Typography variant={ 'h5' } noWrap className={ classes.gray }>{ asset.description }</Typography>
            </div>
          </div>
          { growth === 0 &&
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.gray }>Daily Growth</Typography>
              { currency === 'USD' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.earnGrowth_daily_usd.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (asset.maxApr ? (asset.maxApr*100/365).toFixed(2) : '0.00') }%</Typography>
                </div>
              }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.earnGrowth_daily_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (asset.maxApr ? (asset.maxApr*100/365).toFixed(2) : '0.00') }%</Typography>
                </div>
              }
            </div>
          }
          { growth === 1 &&
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.gray }>Weekly Growth</Typography>
              { currency === 'USD' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.earnGrowth_weekly_usd.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (asset.maxApr ? (asset.maxApr*100/52).toFixed(2) : '0.00') }%</Typography>
                </div>
              }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.earnGrowth_weekly_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (asset.maxApr ? (asset.maxApr*100/52).toFixed(2) : '0.00') }%</Typography>
                </div>
              }
            </div>
          }
          { growth === 2 &&
            <div className={classes.heading}>
              <Typography variant={ 'h5' } className={ classes.gray }>Yearly Growth</Typography>
              { currency === 'USD' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.earnGrowth_yearly_usd.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (asset.maxApr ? (asset.maxApr*100).toFixed(2) : '0.00') }%</Typography>
                </div>
              }
              { currency === 'ETH' &&
                <div className={ classes.inline }>
                  <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.earnGrowth_yearly_eth.toFixed(2)).toLocaleString() }</Typography >
                  <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
                  <Typography className={ classes.symbolAt } variant={ 'h4' }> @ </Typography>
                  <Typography className={ classes.symbol } variant={ 'h4' }> { (asset.maxApr ? (asset.maxApr*100).toFixed(2) : '0.00') }%</Typography>
                </div>
              }
            </div>
          }
          <div className={classes.heading}>
            <Typography variant={ 'h5' } className={ classes.gray }>Net worth</Typography>
            { currency === 'USD' && <Typography variant={ 'h3' } noWrap>$ { parseFloat(asset.usdBalance ? (asset.usdBalance).toFixed(2) : '0.00').toLocaleString() }</Typography > }
            { currency === 'ETH' &&
              <div className={ classes.inline }>
                <Typography variant={ 'h3' } noWrap>{ parseFloat(asset.ethBalance ? (asset.ethBalance).toFixed(2) : '0.00').toLocaleString() }</Typography >
                <Typography className={ classes.symbol } variant={ 'h4' }>ETH</Typography>
              </div>
            }
          </div>
        </div>
      </div>)
    })
  }

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

}

  export default withRouter(withStyles(styles)(Dashboard));
