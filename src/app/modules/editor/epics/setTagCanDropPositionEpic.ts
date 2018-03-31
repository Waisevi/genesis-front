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

import { Action } from 'redux';
import { Epic } from 'redux-observable';
import * as actions from '../actions';
import { IRootState } from 'modules';
import { Observable } from 'rxjs';

const setTagCanDropPositionEpic: Epic<Action, IRootState> =
    (action$, store, { findTagById, convertToTreeData, copyObject }) => action$.ofAction(actions.setTagCanDropPosition.started)
        .flatMap(action => {
            const state = store.getState().editor;
            const tab = state.tabs[state.tabIndex].designer;
            const tabData = tab && tab.data || null;
            let jsonData = tabData.jsonData && copyObject(tabData.jsonData) || null;

            let tag = findTagById(jsonData, action.payload.tagID).el;
            if (tag) {
                if (!tag.attr) {
                    tag.attr = {};
                }
                if ('string' === typeof action.payload.position) {
                    tag.attr.canDropPosition = action.payload.position;
                }
            }

            return Observable.of(actions.setTagCanDropPosition.done({
                params: action.payload,
                result: {
                    jsonData,
                    treeData: convertToTreeData(jsonData)
                }
            }));
        });

export default setTagCanDropPositionEpic;