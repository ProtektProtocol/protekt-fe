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
} from '../../constants'

import { colors } from '../../theme'

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


class ClaimsFields extends Component {

  constructor() {
    super()

  }

  render() {
    const { classes, asset } = this.props;

    return (
      <div>
        <div className={classes.labelValueContainer}>
          <Typography variant={ 'h5' } className={ classes.grey }>COVERAGE FOR</Typography>
          <ReactMarkdown source={asset.coverageDisplay} />
        </div>

        <div className={classes.labelValueContainer}>
          <Typography variant={ 'h5' } className={ classes.grey }>STATUS</Typography>
          <div className={ classes.flexy }>
            <Typography variant={ 'h4' }>{ asset.claimStatus } </Typography>
          </div>
        </div>

        <div className={classes.labelValueContainer}>
          <Typography variant={ 'h5' } className={ classes.grey }>PAYOUT EVENT STATUS</Typography>
          <div className={ classes.flexy }>
            <Typography variant={ 'h4' }>{ asset.activePayoutEvent ? 'Event found' : 'No event found' } </Typography>
          </div>
        </div>

        <div className={classes.labelValueContainer}>
          <Typography variant={ 'h5' } className={ classes.grey }>Investigation Period</Typography>
          <div className={ classes.flexy }>
            <Typography variant={ 'h4' }>{ `${asset.investigationPeriodDisplay} (${asset.investigationPeriod} blocks)` } </Typography>
          </div>
        </div>

        {
        	asset.claimStatus !== 'Active' && (
		        <div className={classes.labelValueContainer}>
		          <Typography variant={ 'h5' } className={ classes.grey }>Investigation End Date</Typography>
		          <div className={ classes.flexy }>
		            <Typography variant={ 'h4' }>{ `${asset.currentInvestigationPeriodEndDisplay} (Block ${asset.currentInvestigationPeriodEnd})` } </Typography>
		          </div>
		        </div>
        	)
        }

      </div>
    )
  };

}

export default withRouter(withStyles(styles, { withTheme: true })(ClaimsFields));