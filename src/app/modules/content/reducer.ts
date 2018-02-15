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

import * as actions from './actions';
import { Action } from 'redux';
import { isType } from 'typescript-fsa';
import { TProtypoElement } from 'genesis/protypo';
import { TSection } from 'genesis/content';
import { IModal } from 'genesis/modal';

export type State = {
    readonly preloading: boolean;
    readonly preloadingError: string;
    readonly stylesheet: string;
    readonly navigationResizing: boolean;
    readonly navigationVisible: boolean;
    readonly section: string;
    readonly sections: {
        readonly [name: string]: TSection;
    };
    readonly notifications: TProtypoElement[];
    readonly alert: { id: string, success: string, error: string };
    readonly modal: IModal;
};

export const initialState: State = {
    preloading: false,
    preloadingError: null,
    stylesheet: null,
    navigationResizing: false,
    navigationVisible: true,
    section: 'home',
    sections: {
        home: {
            name: 'home',
            title: 'Home',
            visible: true,
            pending: false,
            force: false,
            vde: false,
            defaultPage: 'default_page',
            menus: [],
            page: null
        },
        vde: {
            name: 'vde',
            title: 'VDE',
            visible: false,
            pending: false,
            force: false,
            vde: true,
            defaultPage: 'default_page',
            menus: [],
            page: null
        },
        admin: {
            name: 'admin',
            title: 'Admin',
            visible: true,
            defaultPage: 'admin_index',
            pending: false,
            force: false,
            vde: false,
            menus: [],
            page: null
        },
        vdeadmin: {
            name: 'vdeadmin',
            title: 'VDE Admin',
            visible: false,
            defaultPage: 'admin_index',
            pending: false,
            force: false,
            vde: true,
            menus: [],
            page: null
        }
    },
    notifications: null,
    alert: null,
    modal: null
};

export default (state: State = initialState, action: Action): State => {
    if (isType(action, actions.setResizing)) {
        return {
            ...state,
            navigationResizing: action.payload
        };
    }

    if (isType(action, actions.navigationToggle)) {
        return {
            ...state,
            navigationVisible: !state.navigationVisible
        };
    }

    if (isType(action, actions.navigatePage.done)) {
        return {
            ...state,
            section: action.payload.result.section,
            sections: {
                ...state.sections,
                [action.payload.result.section]: {
                    ...state.sections[action.payload.result.section],
                    page: state.sections[action.payload.result.section].page,
                    force: action.payload.params.force,
                    pending: false
                },
                vde: {
                    ...state.sections.vde,
                    visible: action.payload.result.leftVDE ?
                        false :
                        action.payload.result.enteredVDE ? true :
                            state.sections.vde.visible
                }
            }
        };
    }

    if (isType(action, actions.renderPage.started)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                [action.payload.section]: {
                    ...state.sections[action.payload.section],
                    force: false,
                    pending: true,
                    visible: true
                }
            }
        };
    }
    else if (isType(action, actions.renderPage.done)) {
        const section = action.payload.params.section;
        const menuIndex = state.sections[section].menus.findIndex(l =>
            l.name === action.payload.result.menu.name && Boolean(l.vde) === Boolean(action.payload.result.menu.vde));

        if (-1 === menuIndex) {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [section]: {
                        ...state.sections[section],
                        menus: [...state.sections[section].menus, action.payload.result.menu],
                        page: {
                            ...action.payload.result.page,
                            params: action.payload.params.params
                        },
                        pending: false
                    }
                }
            };
        }
        else {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [section]: {
                        ...state.sections[section],
                        menus: [
                            ...state.sections[section].menus.slice(0, menuIndex),
                            action.payload.result.menu,
                            ...state.sections[section].menus.slice(menuIndex + 1),
                        ],
                        page: {
                            ...action.payload.result.page,
                            params: action.payload.params.params
                        },
                        pending: false
                    }
                }
            };
        }
    }
    else if (isType(action, actions.renderPage.failed)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                [action.payload.params.section]: {
                    ...state.sections[action.payload.params.section],
                    page: {
                        params: action.payload.params.params,
                        vde: action.payload.params.vde,
                        name: action.payload.params.name,
                        content: null,
                        error: action.payload.error
                    },
                    pending: false
                }
            }
        };
    }

    if (isType(action, actions.renderLegacyPage.started)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                [action.payload.section]: {
                    ...state.sections[action.payload.section],
                    force: false,
                    pending: true
                }
            }
        };
    }
    else if (isType(action, actions.renderLegacyPage.done)) {
        const section = action.payload.params.section;
        const menuIndex = state.sections[section].menus.findIndex(l =>
            l.name === action.payload.result.menu.name && Boolean(l.vde) === Boolean(action.payload.result.menu.vde));

        if (-1 === menuIndex) {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [section]: {
                        ...state.sections[section],
                        menus: action.payload.params.menu ? [
                            ...state.sections[section].menus,
                            action.payload.result.menu
                        ] : state.sections[section].menus,
                        page: {
                            name: action.payload.params.name,
                            content: [],
                            legacy: true,
                            params: action.payload.params.params
                        },
                        pending: false
                    }
                }
            };
        }
        else {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [section]: {
                        ...state.sections[section],
                        menus: [
                            ...state.sections[section].menus.slice(0, menuIndex),
                            action.payload.result.menu,
                            ...state.sections[section].menus.slice(menuIndex + 1),
                        ],
                        page: {
                            name: action.payload.params.name,
                            content: [],
                            legacy: true,
                            params: action.payload.params.params
                        },
                        pending: false
                    }
                }
            };
        }
    }

    if (isType(action, actions.reloadPage.started)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                [state.section]: {
                    ...state.sections[state.section],
                    pending: true
                }
            }
        };
    }
    else if (isType(action, actions.reloadPage.done)) {
        const menuIndex = state.sections[state.section].menus.findIndex(l =>
            l.name === action.payload.result.menu.name && Boolean(l.vde) === Boolean(action.payload.result.menu.vde));

        if (-1 === menuIndex) {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [state.section]: {
                        ...state.sections[state.section],
                        menus: [...state.sections[state.section].menus, action.payload.result.menu],
                        page: {
                            ...action.payload.result.page,
                            params: action.payload.result.params
                        },
                        pending: false
                    }
                }
            };
        }
        else {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [state.section]: {
                        ...state.sections[state.section],
                        menus: [
                            ...state.sections[state.section].menus.slice(0, menuIndex),
                            action.payload.result.menu,
                            ...state.sections[state.section].menus.slice(menuIndex + 1),
                        ],
                        page: {
                            ...action.payload.result.page,
                            params: action.payload.result.params
                        },
                        pending: false
                    }
                }
            };
        }
    }

    if (isType(action, actions.menuPop)) {
        if (1 >= state.sections[state.section].menus.length) {
            return state;
        }
        else {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [state.section]: {
                        ...state.sections[state.section],
                        menus: state.sections[state.section].menus.slice(0, -1)
                    }
                }
            };
        }
    }

    if (isType(action, actions.menuPush)) {
        const menuIndex = state.sections[state.section].menus.findIndex(l =>
            l.name === action.payload.name && Boolean(l.vde) === Boolean(action.payload.vde));

        if (-1 === menuIndex) {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [state.section]: {
                        ...state.sections[state.section],
                        menus: [...state.sections[state.section].menus, action.payload]
                    }
                }
            };
        }
        else {
            return {
                ...state,
                sections: {
                    ...state.sections,
                    [state.section]: {
                        ...state.sections[state.section],
                        menus: [
                            ...state.sections[state.section].menus.slice(0, menuIndex),
                            action.payload,
                            ...state.sections[state.section].menus.slice(menuIndex + 1),
                        ]
                    }
                }
            };
        }
    }

    if (isType(action, actions.ecosystemInit.started)) {
        const sections: { [key: string]: TSection } = {};
        for (let itr in state.sections) {
            if (state.sections.hasOwnProperty(itr)) {
                sections[itr] = {
                    ...state.sections[itr],
                    pending: action.payload.section === itr ? true : false,
                    page: null,
                    menus: []
                };
            }
        }

        return {
            ...state,
            preloading: true,
            preloadingError: null,
            section: action.payload.section,
            sections
        };
    }
    else if (isType(action, actions.ecosystemInit.done)) {
        return {
            ...state,
            stylesheet: action.payload.result.stylesheet,
            sections: {
                ...state.sections,
                [action.payload.params.section]: {
                    ...state.sections[action.payload.params.section],
                    pending: false
                }
            }
        };
    }
    else if (isType(action, actions.ecosystemInit.failed)) {
        return {
            ...state,
            preloading: false,
            preloadingError: action.payload.error
        };
    }

    if (isType(action, actions.alertShow)) {
        return {
            ...state,
            alert: null
        };
    }
    else if (isType(action, actions.alertClose)) {
        return {
            ...state,
            alert: action.payload
        };
    }

    if (isType(action, actions.reset.started)) {
        return {
            ...state,
            ...state,
            sections: {
                ...state.sections,
                [state.section]: {
                    ...state.sections[state.section],
                    pending: true
                }
            }
        };
    }
    else if (isType(action, actions.reset.done)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                [state.section]: {
                    ...state.sections[state.section],
                    menus: [action.payload.result.menu],
                    page: {
                        params: {},
                        ...action.payload.result.page
                    },
                    pending: false
                }
            }
        };
    }
    else if (isType(action, actions.reset.failed)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                [state.section]: {
                    ...state.sections[state.section],
                    page: {
                        params: {},
                        name: null,
                        content: null,
                        error: action.payload.error
                    },
                    pending: false
                }
            }
        };
    }

    if (isType(action, actions.modalShow)) {
        return {
            ...state,
            modal: {
                id: action.payload.id,
                type: action.payload.type,
                params: {
                    ...action.payload.params
                },
                result: null
            }
        };
    }
    else if (isType(action, actions.modalClose)) {
        return {
            ...state,
            modal: {
                ...state.modal,
                result: action.payload
            }
        };
    }

    if (isType(action, actions.fetchNotifications.done)) {
        return {
            ...state,
            notifications: action.payload.result
        };
    }

    if (isType(action, actions.renderSection)) {
        return state.sections[action.payload] ? {
            ...state,
            section: action.payload
        } : state;
    }

    if (isType(action, actions.switchSection)) {
        return state.sections[action.payload] ? {
            ...state,
            section: action.payload
        } : state;
    }

    if (isType(action, actions.setVDEAvailable)) {
        return {
            ...state,
            sections: {
                ...state.sections,
                vdeadmin: {
                    ...state.sections.vdeadmin,
                    visible: action.payload
                }
            }
        };
    }

    return state;
};