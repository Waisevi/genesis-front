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
import * as propTypes from 'prop-types';

import { IValidationResult } from 'components/Validation/ValidatedForm';

export interface IProtypoProps {
    wrapper?: JSX.Element;
    page: string;
    payload: IProtypoElement[];
    menuPush: (params: { name: string, content: IProtypoElement[] }) => void;
    navigatePage: (params: { name: string, params: any }) => void;
    navigate: (url: string) => void;
}

export interface IProtypoElement {
    tag: string;
    text?: string;
    attr?: { [key: string]: string };
    children?: IProtypoElement[];
}

export interface IParamsSpec {
    [key: string]: IParamSpec;
}

export interface IParamSpec {
    type: string;
    text?: string;
    params: string[];
}

export default class Protypo extends React.Component<IProtypoProps> {
    private _lastID: number;
    private _menuPushBind: Function;
    private _navigatePageBind: Function;
    private _navigateBind: Function;
    private _sources: { [key: string]: { columns: string[], types: string[], data: string[][] } };
    private _errors: { name: string, description: string }[];

    constructor(props: IProtypoProps) {
        super(props);
        this._menuPushBind = props.menuPush.bind(this);
        this._navigatePageBind = props.navigatePage.bind(this);
        this._navigateBind = props.navigate.bind(this);
    }

    getChildContext() {
        return {
            protypo: this,
            menuPush: this._menuPushBind,
            navigatePage: this._navigatePageBind,
            navigate: this._navigateBind,
        };
    }

    getCurrentPage() {
        return this.props.page;
    }

    registerSource(name: string, payload: { columns: string[], types: string[], data: string[][] }) {
        this._sources[name] = payload;
    }

    resolveSource(name: string) {
        return this._sources[name];
    }

    resolveParams(values: IParamsSpec, formValues?: { [key: string]: IValidationResult }) {
        const result: { [key: string]: string } = {};
        for (let itr in values) {
            if (values.hasOwnProperty(itr)) {
                const param = values[itr];
                switch (param.type) {
                    case 'text': result[itr] = param.text; break;
                    case 'Val':
                        const inputName = param.params[0];
                        const inputValue = formValues && formValues[inputName] && formValues[inputName].value;
                        result[itr] = inputValue;
                        break;
                    default: break;
                }
            }
        }
        return result;
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
                    this._errors.push({
                        name: 'E_UNREGISTERED_HANDLER',
                        description: `Unknown template handler '${element.tag}'. This error must be reported`
                    });
                    return null;
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
        this._sources = {};
        this._errors = [];
        const body = this.renderElements(this.props.payload);

        return React.cloneElement(this.props.wrapper || <div />, null, [
            this._errors.length ? (
                <div key="errors">
                    {this._errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="alert alert-danger">
                            <strong>[{error.name}]</strong>
                            <span className="mr">:</span>
                            <span>{error.description}</span>
                        </div>
                    ))}
                </div>
            ) : null,
            ...body
        ]);
    }
}

(Protypo as any).childContextTypes = {
    protypo: propTypes.object.isRequired,
    navigatePage: propTypes.func.isRequired,
    navigate: propTypes.func.isRequired,
    menuPush: propTypes.func.isRequired
};