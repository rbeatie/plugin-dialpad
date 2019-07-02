import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';

import Buttons from './components/Buttons';
import Directory from './components/Directory';
import FunctionButtons from './components/FunctionButtons';
import PlusButton from './components/PlusButton';
import Screen from './components/Screen';

import { buttonPressAction, backspaceAction, setScreenMainLine } from './actions/DialpadActions';
import { dial } from './helpers';

const dialerContainer = css`
  display: flex;
  flex-direction: column;
  height: 500px;
  width: 300px;
  background-color: #FFFFFF;
`

const dtmf = css`
  display: flex;
  flex-direction: column;
  height: 250px;
  width: 100%;
`

const conference = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 500px;
  width: 100%;
`

const numpadContainer = css`
  align-self: center;
`

export class Dialpad extends React.Component {

  constructor(props) {
    super(props);
    this.state = { workerList: '' };
  };

  componentDidMount() {
    if (typeof this.props.content === 'undefined') { //Only listen on the Dialer page
      document.addEventListener('keyup', this.eventListener, false);
      document.addEventListener('paste', this.pasteListener, false);

      //Populate a list of workers in TaskRouter to be used in the Search Box
      const query = '';
      this.props.insightsClient.instantQuery('tr-worker')
        .then((q) => {
          this.workersSearch = q;
          q.on('searchResult', (items) => {
            this.setState({ workerList: items });
          });
          q.search(query);
        });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.eventListener, false);
    document.removeEventListener('paste', this.pasteListener, false);
    console.log('Removing event listener');
  }

  eventListener = (e) => this.keyPressListener(e);

  pasteListener = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,''); //strip all non numeric characters from paste
    this.props.setScreenMainLine((typeof this.props.screenMainLine === 'undefined' ? paste : this.props.screenMainLine + paste))
  }

  keyPressListener(e) {
    if ((e.keyCode > 47 && e.keyCode < 58) || e.keyCode === 187) { //listen to 0-9 & +
      if (this.props.mode === 'dtmf') {
        this.props.activeCall[0].source.sendDigits(e.key);
      } else {
        this.props.buttonPress(e.key);
      }
    } else if (e.keyCode === 8) { //listen for backspace
      this.props.backspace();
    } else if (e.keyCode === 13) { //listen for enter
      const number = (typeof this.props.plus === 'undefined') ? this.props.screenMainLine : `+${this.props.screenMainLine}`;
      this.props.setScreenMainLine('');
      if (number !== '') {
        dial(number, this.props);
      };
    }
  }

  render() {

    if (this.props.mode === 'none') {
      return (
        <div/>
      )
    } else if (this.props.mode === 'dtmf') {
      return (
        <div>
          <div className={dtmf}>
            <div className={numpadContainer}>
              <Buttons mode={this.props.mode}/>
            </div>
          </div>
        </div>
      )
    } else if (this.props.mode === 'conference') {
      return (
        <div>
          <div className={conference}>
            <Screen/>
            <Directory workerList={this.state.workerList}/>
            <div className={numpadContainer}>
              <Buttons mode={this.props.mode}/>
              <PlusButton/>
            </div>
            <FunctionButtons runtimeDomain={this.props.runtimeDomain} jweToken={this.props.jweToken} mode={this.props.mode}/>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className={dialerContainer}>
            <Screen/>
            <Directory workerList={this.state.workerList}/>
            <div className={numpadContainer}>
              <Buttons mode={this.props.mode}/>
              <PlusButton/>
            </div>
            <FunctionButtons runtimeDomain={this.props.runtimeDomain} jweToken={this.props.jweToken} mode={this.props.mode}/>
          </div>
        </div>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    activeCall: state.flex.phone.connections,
    activeView: state.flex.view.activeView,
    directoryWorker: state.dialpad.directoryWorker,
    from: state.flex.worker.attributes.phone,
    plus: state.dialpad.plus,
    screenMainLine: state.dialpad.screenMainLine,
    workerContactUri: state.flex.worker.attributes.contact_uri,
    workerName: state.flex.worker.attributes.full_name,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  buttonPress: (key) => dispatch(buttonPressAction(key)),
  backspace: () => dispatch(backspaceAction()),
  setScreenMainLine: (value) => dispatch(setScreenMainLine(value))
})

export default connect(mapStateToProps, mapDispatchToProps)(Dialpad);
