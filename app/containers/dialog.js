import { Link, Confirm, Alert } from '../components/dialog'
import {
  copyLink,
  closeShareDat,
  confirmDeleteDat,
  cancelDeleteDat,
  closeAlert
} from '../actions'
import { connect } from 'react-redux'

export const LinkContainer = connect(
  state => ({
    link: state.dialogs.link.link,
    copied: state.dialogs.link.copied
  }),
  dispatch => ({
    onCopy: link => dispatch(copyLink(link)),
    onExit: () => dispatch(closeShareDat())
  })
)(Link)

export const ConfirmContainer = connect(
  state => ({
    dat: state.dialogs.delete.dat
  }),
  dispatch => ({
    onConfirm: dat => dispatch(confirmDeleteDat(dat)),
    onExit: () => dispatch(cancelDeleteDat())
  })
)(Confirm)

export const AlertContainer = connect(
  state => ({
    alert: state.dialogs.alert
  }),
  dispatch => ({
    onExit: () => dispatch(closeAlert())
  })
)(Alert)
