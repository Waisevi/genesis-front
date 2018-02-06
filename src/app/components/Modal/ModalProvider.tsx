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

import * as React from 'react';
import { IModal, TModalResultReason } from 'genesis/modal';

import Wrapper from 'components/Modal/Wrapper';
import PromptModal from 'components/Modal/PromptModal';
import ImageEditorModal from 'components/Modal/ImageEditorModal';

const MODAL_COMPONENTS = {
    'IMAGE_EDITOR': ImageEditorModal,
    'PROMPT': PromptModal
};

export interface IModalProviderProps {
    modal: IModal;
    onResult: (params: { reason: TModalResultReason, data: any }) => void;
}

class ModalProvider extends React.Component<IModalProviderProps> {
    onResult(data: any) {
        this.props.onResult({
            reason: 'RESULT',
            data
        });
    }

    onCancel() {
        this.props.onResult({
            reason: 'CANCEL',
            data: null
        });
    }

    render() {
        const Modal = this.props.modal && !this.props.modal.result && MODAL_COMPONENTS[this.props.modal.type] || null;
        return (
            <Wrapper>
                {Modal && (
                    <Modal
                        key={this.props.modal.id}
                        active
                        onResult={this.onResult.bind(this)}
                        onCancel={this.onCancel.bind(this)}
                        {...this.props.modal}
                    />
                )}
            </Wrapper>
        );
    }
}

export default ModalProvider;