'use strict';

import remote from 'remote';

let promisify = (fn) => {
  return new Promise((resolve, reject) => {
    fn((error, data, response) => {
      if(error) {
        reject({error:error, reason: response});
      }else{
        resolve(data);
      }
    });
  });
};

export class Twitter {
  constructor() {
    this.client = remote.require('./twitter');
  }
  hasToken() {
    return promisify(this.client.getToken);
  }
  requestToken() {
    return promisify(this.client.requestToken);
  }
  verifyCredentials() {
    return promisify(cb => this.client.callApi('verifyCredentials', cb));
  }
  statuesUpdate(params) {
    return promisify(cb => this.client.callApi('statuses', 'update', params, cb));
  }
  mediaUpload(params) {
    return promisify(cb => this.client.callApi('uploadMedia', params, cb));
  }
}
