'use strict';

import React from 'react';
import {Timer} from '../services/timer';

export class ImageList extends React.Component {
  constructor () {
    super();
    /*
    this.propTypes = {
      list: React.PropTypes.array
    };*/
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }
  static propTypes = {
    list: React.PropTypes.array
  };
  componentDidUpdate () {
    if(this.props.list && this.props.list.length) {
      // animate scrollLeft to last-item
      let container = React.findDOMNode(this);
      let lastChild = container.querySelector('.image-group>a:last-child');
      if(!lastChild) return;
      let start = container.scrollLeft;
      let end =  lastChild.offsetLeft;
      let delta =  (end - start) / 10.0;
      let pre;
      let timer = new Timer(() => {
        if(container.scrollLeft <=  end && container.scrollLeft !== pre) {
          pre = container.scrollLeft;
          container.scrollLeft += delta;
        }else{
          timer.cancel();
        }
      }, 40);
      timer.start();
    }
  }
  render() {
    let imageList = this.props.list && this.props.list.map((item) => {
      return (
        <a key={item.key} className="image-content">
          <li className="image-item">
          <img src={item.url} />
          </li>
        </a>
      );
    });
    return (
      <div className="slider-container">
        <ul className="image-group">
        {imageList}
        </ul>
      </div>
    );
  }
}
