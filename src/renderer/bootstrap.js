'use strict';
require("babel/polyfill");

import React from 'react';
import {Main} from './components/main';

let container = document.getElementById("container");
React.render(React.createElement(Main), container);
