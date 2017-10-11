// Copyright 2017 The apla-front Authors
// This file is part of the apla-front library.
// 
// The apla-front library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// The apla-front library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public License
// along with the apla-front library. If not, see <http://www.gnu.org/licenses/>.

import * as React from 'react';
import { resolveHandler } from 'components/Protypo';
import { menuPush } from 'modules/content/actions';
import * as propTypes from 'prop-types';

export interface IProtypoProps {
    wrapper?: JSX.Element;
    payload: IProtypoElement[];
    menuPush: typeof menuPush;
}

export interface IProtypoElement {
    tag: string;
    text?: string;
    attr?: { [key: string]: string };
    children?: IProtypoElement[];
}

export default class Protypo extends React.Component<IProtypoProps> {
    private _lastID: number;
    private _menuPushBind: Function;

    constructor(props: IProtypoProps) {
        super(props);
        this._menuPushBind = props.menuPush.bind(this);
    }

    getChildContext() {
        return {
            menuPush: this._menuPushBind
        };
    }

    renderElement(element: IProtypoElement): React.ReactNode {
        switch (element.tag) {
            case 'text':
                return element.text;

            default:
                const Handler = resolveHandler(element.tag);
                if (Handler) {
                    return (
                        <Handler {...element.attr} key={this._lastID++} childrenTree={element.children}>
                            {this.renderElements(element.children)}
                        </Handler>
                    );
                }
                else {
                    throw {
                        error: 'E_UNREGISTERED_HANDLER',
                        data: element.tag,
                        value: element
                    };
                }
        }
    }

    renderElements(elements: IProtypoElement[]): React.ReactNode[] {
        if (!elements) {
            return null;
        }

        return elements.map(element => (
            this.renderElement(element)
        ));
    }

    render() {
        this._lastID = 0;

        return React.cloneElement(this.props.wrapper || <div />, null, this.renderElements(this.props.payload));
    }
}

(Protypo as any).childContextTypes = {
    menuPush: propTypes.func.isRequired
};