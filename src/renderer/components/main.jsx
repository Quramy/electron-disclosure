import React from 'react';
import remote from 'remote';
import shell from 'shell';
import * as _ from 'lodash';
import cx from 'classnames';
import {ImageList} from './imageList';
import {Capture} from '../services/capture';
import {Twitter} from '../services/twitterWrapper';
import {Timer} from '../services/timer';

let screen = remote.require('screen');

let bindAll = object => {
  Object.getOwnPropertyNames(object.constructor.prototype)
    .filter(key => typeof object[key] === 'function')
    .forEach(methodName => {object[methodName].bind(object);console.log(methodName)});
};

export class Main extends React.Component{
  state = {
    timerStatus: false,
    enableTweet: false,
    me: null,
    imageList: []
  };
  constructor () {
    super();

    // Binding event handlers
    //bindAll(this);
    this.capture = this.capture.bind(this);
    this.toggleTweet = this.toggleTweet.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.initTwitter = this.initTwitter.bind(this);
    this.initCapture = this.initCapture.bind(this);

    this.initCapture();
    //this.initTwitter();
    this.timer = new Timer(()=>{
      this.capture();
    }, 1000 * 60 * 5);
  }
  initCapture() {
    Capture.init(screen.getPrimaryDisplay().size, 0.5).then( () => {
      remote.getCurrentWindow().on('start', () => this.start());
      remote.getCurrentWindow().on('stop', () => this.stop());
    });

  }
  async initTwitter() {
    this.twitter = new Twitter();
    await this.twitter.hasToken();
    let me = await this.twitter.verifyCredentials();
    this.setState({me: me});
  }
  capture() {
    let capture = new Capture();
    let imageHolder = capture.getImage();
    let url = imageHolder.toDataURL();
    this.setState({
      imageList: this.state.imageList.concat([{
        key: new Date() - 0,
        url: url
      }])
    });

    // upload captured image and tweet
    if(this.state.enableTweet) {
      this.twitter.mediaUpload({media: imageHolder.toDataString(), isBase64: true})
      .then(res => {
        let d = new Date();
        // console.log('Upload media: ', res.media_id_string);
        return this.twitter.statuesUpdate({
          status: 'Captured by https://github.com/Quramy/electron-disclosure at ' + d.toGMTString(),
          media_ids: res.media_id_string
        });
      })
      .then(data => {
        // Notify with Notification API
        let link = 'https://twitter.com/' + this.state.me.name + '/status/' + data.id_str;
        let n = new Notification('Tweet done. ', {
          body: link,
        });
        n.onclick = function () {
          shell.openExternal(link);
        };
      });
    }
  }
  start() {
    this.timer.start(2000);
    this.setState({timerStatus: true});
  }
  stop() {
    this.timer.cancel();
    this.setState({timerStatus: false});
  }
  toggleTweet() {
    this.setState({
      enableTweet: !this.state.enableTweet
    });
    this.twitter.requestToken().then(() => {
    });
  }
  render() {
    return (
      <div className="app-container">
        <div className="app-controll">
          <div className="menu-item">
            <a onClick={this.state.timerStatus ? this.stop : this.start} className={cx({icon: true, 'icon-status': true, on: this.state.timerStatus, off: !this.state.timerStatus})}>
              <span className="fa fa-power-off"></span>
            </a>
            <div className="menu-description">
              <p>{this.state.timerStatus ? 'Stop capture' : 'Start to capture by 5 minutes'}</p>
            </div>
          </div>
          <div className="menu-item">
            <a className="icon icon-camera" onClick={this.capture}>
              <span className="fa fa-camera"></span>
            </a>
            <div className="menu-description">
              <p>One-time Capture</p>
            </div>
          </div>
          <div className="menu-item">
            <input type="checkbox" id="toggleTweet" checked={this.state.enableTweet} onChange={this.toggleTweet} />
            <label className="icon icon-twitter" htmlFor="toggleTweet">
              <span className="fa fa-twitter"></span>
            </label>
            <div className="menu-description">
              <p>Tweet when captured</p>
            </div>
            <div className="account">
              <span className="account-screen-name">{this.state.me ? this.state.me.screen_name : 'Sign in'}</span>
            </div>
          </div>
        </div>
        <ImageList list={this.state.imageList} />
      </div>
    );
  }
}
