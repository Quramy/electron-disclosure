'use strict';

export class Timer {
  constructor(fn, interval) {
    if(!interval) interval = 0;
    this.interval = interval;
    this.fn = fn;
  }
  start(delay) {
    this.status = true;
    if(delay) {
      setTimeout(()=> this.run(), delay);
    }else{
      this.run();
    }
    return this;
  }
  run () {
    if(this.status) {
      this.fn();
      setTimeout(() => {
        this.run()
      }, this.interval);
    }
  }
  cancel() {
    this.status = false;
    return this;
  }
}
