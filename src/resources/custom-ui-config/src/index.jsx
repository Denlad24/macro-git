import React from 'react';
import ReactDOM from 'react-dom';
import CustomUIConfig from './custom-config';

import '@atlaskit/css-reset';

ReactDOM.render(
  <React.StrictMode>
    <CustomUIConfig/>
  </React.StrictMode>,
  document.getElementById('root')
);