import React from 'react';
import * as remote from 'remote';
import * as shell from 'shell';
import {init, Capture} from './capture';
import {ImageList} from './imageList';
import {Twitter} from './twitterWrapper';

let screen = remote.require('screen');

export class Main extends React.Component{
  constructor () {
    super();
    this.state = {
      enableTweet: false,
      me: null,
      imageList: []
    };
    this.capture = this.capture.bind(this);
    this.toggleTweet = this.toggleTweet.bind(this);
    this.twitter = new Twitter();
    this.twitter.hasToken()
      .then(() => this.twitter.verifyCredentials())
      .then(me => this.setState({me: me}))
    ;
    init(screen.getPrimaryDisplay().size, 0.5).then();
  }
  capture() {
    let capture = new Capture();
    let imageHolder = capture.getImage();
    let url = imageHolder.toDataURL();
    this.setState({
      imageList: this.state.imageList.concat([url])
    });
    if(this.state.enableTweet) {
      this.twitter.mediaUpload({media: imageHolder.toDataString(), isBase64: true})
      .then(res => {
        var d = new Date();
        console.log('Upload media: ', res.media_id_string);
        return this.twitter.statuesUpdate({
          status: 'Captured by https://github.com/Quramy/electron-disclosure at ' + d.toGMTString(),
          media_ids: res.media_id_string
        });
      })
      .then(data => {
        var link = 'https://twitter.com/' + this.state.me.name + '/status/' + data.id_str;
        var n = new Notification('Tweet done. ', {
          body: link,
        });
        n.onclick = function () {
          shell.openExternal(link);
        };
      });
    }
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
            <a className="icon icon-status" ng-click="main.cancel ? main.stop() : main.start()" ng-class="{on: main.cancel, off:!main.cancel}">
              <span className="fa fa-power-off"></span>
            </a>
            <div className="menu-description">
              <p>Start Capture</p>
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
