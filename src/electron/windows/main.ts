// Copyright 2017 The genesis-front Authors
// This file is part of the genesis-front library.
// 
// The genesis-front library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// The genesis-front library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public License
// along with the genesis-front library. If not, see <http://www.gnu.org/licenses/>.

import { BrowserWindow } from 'electron';
import config from '../config';
import calcScreenOffset from '../util/calcScreenOffset';

export default () => {
    const options = {
        minWidth: 800,
        minHeight: 600,
        frame: false,
        backgroundColor: '#17437b',
        resizable: true,
        show: false,
        maximized: config.get('maximized') || false,
        ...calcScreenOffset(config.get('dimensions') || { width: 800, height: 600 })
    };

    const window = new BrowserWindow(options);

    window.on('close', () => {
        config.set('dimensions', window.getBounds());
        config.set('maximized', window.isMaximized() || window.isMaximized);
    });

    return window;
};