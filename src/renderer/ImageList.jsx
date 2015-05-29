'use strict';

import React from 'react';

export class ImageList extends React.Component {
  constructor () {
    super();
    this.propTypes = {
      list: React.PropTypes.array
    };
  }
  componentDidUpdate () {
    console.log(this.props.list.length);
  }
  render() {
    let imageList = this.props.list && this.props.list.map((url) => {
      return (
        <a href="" className="image-content">
          <li className="image-item">
          <img src={url} />
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
