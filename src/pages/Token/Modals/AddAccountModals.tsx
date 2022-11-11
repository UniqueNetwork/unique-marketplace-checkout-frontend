import { CreateAccountModal } from '../../Accounts/Modals/CreateAccount';
import { ImportViaSeedAccountModal } from '../../Accounts/Modals/ImportViaSeed';
import { ImportViaJSONAccountModal } from '../../Accounts/Modals/ImportViaJson';
import { ImportViaQRCodeAccountModal } from '../../Accounts/Modals/ImportViaQRCode';
import React from 'react';

export enum AddAccountModal {
  create,
  importViaSeed,
  importViaJSON,
  importViaQRCode
}

export type TAddAccountModalsProps = {
  currentModal?: AddAccountModal
  onModalClose(): void
  onAddAccountsFinish(): void
};

export const AddAccountModals = ({ currentModal, onModalClose, onAddAccountsFinish }: TAddAccountModalsProps) => {
  return <>
    <CreateAccountModal
      isVisible={currentModal === AddAccountModal.create}
      onFinish={onAddAccountsFinish}
      onClose={onModalClose}
    />
    <ImportViaSeedAccountModal
      isVisible={currentModal === AddAccountModal.importViaSeed}
      onFinish={onAddAccountsFinish}
      onClose={onModalClose}
    />
    <ImportViaJSONAccountModal
      isVisible={currentModal === AddAccountModal.importViaJSON}
      onFinish={onAddAccountsFinish}
      onClose={onModalClose}
    />
    <ImportViaQRCodeAccountModal
      isVisible={currentModal === AddAccountModal.importViaQRCode}
      onFinish={onAddAccountsFinish}
      onClose={onModalClose}
    />
  </>;
};
