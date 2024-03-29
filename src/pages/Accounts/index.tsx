import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Text } from 'components/UI';
import { TableColumnProps } from '@unique-nft/ui-kit';
import styled from 'styled-components';
import { BN } from '@polkadot/util';
import { Icon } from 'components/Icon/Icon';
import { toChainFormatAddress } from 'api/uniqueSdk/utils/addressUtils';
import { TWithdrawBid } from 'api/restApi/auction/types';
import { Account } from 'account/AccountContext';
import { useApi } from 'hooks/useApi';
import { useAccounts } from 'hooks/useAccounts';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import AccountCard from 'components/Account/Account';
import { Table } from 'components/Table';
import { PagePaper } from 'components/PagePaper/PagePaper';
import { TextInput } from 'components/TextInput/TextInput';
import IconWithHint from 'components/IconWithHint/IconWithHint';
import ConfirmModal from 'components/ConfirmModal';
import GetKSMModal from 'components/GetKSMModal/GetKSMModal';
import { formatKusamaBalance } from 'utils/textUtils';
import { CreateAccountModal } from './Modals/CreateAccount';
import { ImportViaSeedAccountModal } from './Modals/ImportViaSeed';
import { ImportViaJSONAccountModal } from './Modals/ImportViaJson';
import { ImportViaQRCodeAccountModal } from './Modals/ImportViaQRCode';
import { WithdrawDepositModal } from './Modals/WithdrawDeposit';
import { TransferFundsModal } from './Modals/SendFunds';
import { RecoveryMnemonicPhraseModal } from './Modals/RecoveryMnemonicPhrase';
import BalanceCell from './BalanceCell';
import { SecurityCell } from './SecurityCell';
import { AdditionalLight, BlueGrey300, Grey500, Primary100, Primary500 } from 'styles/colors';
import config from '../../config';
import { AccountInfo } from './types';
import NoAccountsIcon from 'static/icons/no-accounts.svg';

const tokenSymbol = 'KSM';

const testid = 'accounts-page';

type AccountsColumnsProps = {
  isSmallDevice: boolean
  formatAddress(address: string): string
  onShowSendFundsModal(address: string): () => void
  onShowWithdrawDepositModal(address: string): () => void
  onShowDeleteLocalAccountModal(address: string): () => void
  onShowGetKsmModal(): void
  onShowRecoveryMnemonic(address: string): () => void
};

const getAccountsColumns = ({
    formatAddress,
    onShowSendFundsModal,
    onShowWithdrawDepositModal,
    isSmallDevice,
    onShowDeleteLocalAccountModal,
    onShowGetKsmModal,
    onShowRecoveryMnemonic
  }: AccountsColumnsProps): TableColumnProps[] => [
  {
    title: (
      <>
        <Title>Account</Title>
        {!isSmallDevice &&
          <IconWithHint align={{ appearance: 'horizontal', vertical: 'top', horizontal: 'right' }}>
            <span>Substrate account addresses (Kusama, Quartz, Polkadot, Unique, etc.) may be represented by a different address
              character sequence, but they can be converted between each other because they share the same public key. You
              can see all transformations for any given address on <StyledLink href='https://quartz.subscan.io/' target='_blank' rel='noreferrer'>Subscan</StyledLink>.</span>
          </IconWithHint>
        }
      </>
    ),
    width: '20%',
    field: 'accountInfo',
    render(accountInfo: AccountInfo) {
      if (accountInfo.deposit && !isSmallDevice) return <></>;
      return (
        <AccountCellWrapper>
          <AccountCard accountName={accountInfo.name}
            accountAddress={accountInfo.address}
            canCopy
            isShort={isSmallDevice}
          />
        </AccountCellWrapper>
      );
    }
  },
  {
    title: (<Title>Balance</Title>),
    width: '20%',
    field: 'balance',
    render(data, { accountInfo }: (Account & { accountInfo: AccountInfo })) {
      return (<BalanceCell accountInfo={accountInfo} isSmallDevice={isSmallDevice} tokenSymbol={tokenSymbol} />);
    }
  },
  {
    title: (<Title>Recovery Phrase</Title>),
    width: '20%',
    field: 'accountInfo',
    render(accountInfo: AccountInfo) {
      if (!accountInfo.hasEncryptedMnemonic || accountInfo.deposit) return <></>;
      return (<SecurityCell onClick={onShowRecoveryMnemonic(accountInfo.address)}/>);
    }
  },
  {
    title: (<Title>Block explorer</Title>),
    width: '20%',
    field: 'blockExplorer',
    render(data, { accountInfo }: (Account & { accountInfo: AccountInfo })) {
      if (accountInfo.deposit && !isSmallDevice) return <></>;
      return (
        <LinksWrapper>
          <LinkStyled
            target={'_blank'}
            rel={'noreferrer'}
            href={`${config.scanUrl}account/${formatAddress(accountInfo.address)}`}
          >
            <TextStyled>UniqueScan</TextStyled>
            <IconWrapper>
              <Icon name={'arrow-up-right'} size={16} color={Primary500} />
            </IconWrapper>
          </LinkStyled>
        </LinksWrapper>
      );
    }
  },
  {
    title: isSmallDevice ? '' : (<Title>Actions</Title>),
    width: '20%',
    field: 'actions',
    render(data, { accountInfo }: (Account & { accountInfo: AccountInfo })) {
      if (accountInfo.deposit && !isSmallDevice) {
        return (
          <DepositActionsWrapper>
            <Button title={'Withdraw'} onClick={onShowWithdrawDepositModal(accountInfo.address)} role={'primary'} />
            <IconWithHint align={{ appearance: 'vertical', vertical: 'bottom', horizontal: 'right' }}>
              <span>Learn more in <StyledLink href='/FAQ' target='_blank' rel='noreferrer'>FAQ</StyledLink></span>
            </IconWithHint>
          </DepositActionsWrapper>
        );
      }
      return (
        <>
          <ActionsWrapper>
            <Button title={'Send'} onClick={onShowSendFundsModal(accountInfo.address)} disabled={formatKusamaBalance(accountInfo.balance?.KSM?.toString() || 0) === '0'} />
            <Button
              title={'Get'}
              onClick={onShowGetKsmModal}
              disabled={!config.rampApiKey}
            />
            {accountInfo.signerType === 'Local' && <Button title={'Delete'} onClick={onShowDeleteLocalAccountModal(accountInfo.address)} />}
          </ActionsWrapper>
          {(accountInfo.deposit && isSmallDevice) && <DepositActionsWrapper>
            <Button title={'Withdraw'} onClick={onShowWithdrawDepositModal(accountInfo.address)} role={'primary'} />
            <IconWithHint align={{ appearance: 'vertical', vertical: 'bottom', horizontal: 'right' }}>
              <span>Learn more in <StyledLink href='/FAQ' target='_blank' rel='noreferrer'>FAQ</StyledLink></span>
            </IconWithHint>
          </DepositActionsWrapper>}
        </>
      );
    }
  }
];

const caretDown = { name: 'carret-down', size: 16, color: AdditionalLight };
const caretUp = { name: 'carret-up', size: 16, color: AdditionalLight };

enum AccountModal {
  create,
  importViaSeed,
  importViaJSON,
  importViaQRCode,
  sendFunds,
  withdrawDeposit,
  deleteLocalAccount,
  getKsmModal,
  recoveryMnemonic
}

export const AccountsPage = () => {
  const {
    accounts,
    fetchAccounts,
    isLoading,
    isLoadingDeposits,
    deleteLocalAccount,
    hasEncryptedMnemonic
  } = useAccounts();
  const [searchString, setSearchString] = useState<string>('');
  const [currentModal, setCurrentModal] = useState<AccountModal | undefined>();
  const [selectedAddress, setSelectedAddress] = useState<string>();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);
  const deviceSize = useDeviceSize();
  const { chainData } = useApi();

  const formatAddress = useCallback((address: string) => {
    return toChainFormatAddress(address, chainData?.SS58Prefix || 0);
  }, [chainData?.SS58Prefix]);

  const onShowModal = useCallback((modal: AccountModal) => () => {
    setCurrentModal(modal);
  }, []);

  const onShowModalForAccount = useCallback((modal: AccountModal) => (address: string) => () => {
    setCurrentModal(modal);
    setSelectedAddress(address);
  }, []);

  const onShowGetKsmModal = useCallback(() => {
    if (!config.rampApiKey) return;
    setCurrentModal(AccountModal.getKsmModal);
  }, []);

  const onSearchStringChange = useCallback((value: string) => {
    setSearchString(value);
  }, []);

  const filteredAccounts = useMemo(() => {
    const reduceAccounts = (acc: (Account & { accountInfo: AccountInfo })[], account: Account) => {
      acc.push({
        ...account,
        accountInfo: {
          address: account.address,
          name: account.meta.name || '',
          balance: account.balance,
          signerType: account.signerType,
          hasEncryptedMnemonic: hasEncryptedMnemonic(account.address)
        }
      });
      if (!account.deposits) return acc;

      const { sponsorshipFee, bids } = account.deposits;
      const { leader, withdraw } = bids || { leader: [], withdraw: [] };

      if ((!sponsorshipFee?.isZero() || leader.length !== 0 || withdraw.length !== 0)) {
        const getTotalAmount = (acc: BN, bid: TWithdrawBid) => acc.add(new BN(bid.amount));
        // add row with deposit info only on big screens
        if (deviceSize !== DeviceSize.sm) {
          acc.push({
            ...account,
            accountInfo: {
              address: account.address,
              name: account.meta.name || '',
              deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0))),
              signerType: account.signerType
            }
          });
        } else {
          acc[acc.length - 1] = {
            ...account,
            accountInfo: {
              address: account.address,
              name: account.meta.name || '',
              balance: account.balance,
              deposit: (sponsorshipFee || new BN(0))
              .add(withdraw.reduce(getTotalAmount, new BN(0)))
              .add(leader.reduce(getTotalAmount, new BN(0))),
              signerType: account.signerType
            }
          };
        }
      }
      return acc;
    };

    if (!searchString) {
      return accounts.reduce(reduceAccounts, []);
    }
    return accounts
    .filter(
      (account) =>
        formatAddress(account.address).toLowerCase().includes(searchString.trim().toLowerCase()) ||
        account.meta.name?.toLowerCase().includes(searchString.trim().toLowerCase())
    )
    .reduce(reduceAccounts, []);
  }, [accounts, searchString, formatAddress, deviceSize]);

  const onChangeAccountsFinish = useCallback(async () => {
    setCurrentModal(undefined);
    await fetchAccounts();
  }, [fetchAccounts]);

  const onModalClose = useCallback(() => {
    setCurrentModal(undefined);
  }, []);

  const deleteLocalAccountConfirmed = useCallback(() => {
    deleteLocalAccount(selectedAddress || '');
    onChangeAccountsFinish();
  }, [selectedAddress, deleteLocalAccount, onChangeAccountsFinish]);

  return (<PagePaper>
    <AccountPageWrapper>
      <Row>
        <CreateAccountButton
          testid={`${testid}-create-substrate-button`}
          title={'Create substrate account'}
          onClick={onShowModal(AccountModal.create)}
        />
        <DropdownStyled
          dropdownRender={() => <DropdownMenu>
            <DropdownMenuItem onClick={onShowModal(AccountModal.importViaSeed)} data-testid={`${testid}-seed-button`}>Seed phrase</DropdownMenuItem>
            <DropdownMenuItem onClick={onShowModal(AccountModal.importViaJSON)} data-testid={`${testid}-json-file-button`}>Backup JSON file</DropdownMenuItem>
            <DropdownMenuItem onClick={onShowModal(AccountModal.importViaQRCode)} data-testid={`${testid}-qr-button`}>QR-code</DropdownMenuItem>
          </DropdownMenu>}
          onOpenChange={setIsDropdownOpened}
        >
          <AddAccountButton
            testid={`${testid}-add-via-button`}
            title={'Add account via'}
            role={'primary'}
            iconRight={isDropdownOpened ? caretUp : caretDown}
          />
        </DropdownStyled>
        <SearchInputWrapper>
          <SearchInputStyled
            testid={`${testid}-search`}
            placeholder={'Account'}
            iconLeft={{ name: 'magnify', size: 18 }}
            value={searchString}
            onChange={onSearchStringChange}
          />
        </SearchInputWrapper>
      </Row>
      <TableWrapper>
        <Table
          columns={getAccountsColumns({
            isSmallDevice: deviceSize === DeviceSize.sm,
            formatAddress,
            onShowSendFundsModal: onShowModalForAccount(AccountModal.sendFunds),
            onShowWithdrawDepositModal: onShowModalForAccount(AccountModal.withdrawDeposit),
            onShowDeleteLocalAccountModal: onShowModalForAccount(AccountModal.deleteLocalAccount),
            onShowRecoveryMnemonic: onShowModalForAccount(AccountModal.recoveryMnemonic),
            onShowGetKsmModal
          })}
          data={filteredAccounts}
          loading={isLoading || isLoadingDeposits}
          emptyIconProps={searchString ? { name: 'magnifier-found' } : { file: NoAccountsIcon }}
          idColumnName={'address'}
        />
      </TableWrapper>
      <CreateAccountModal
        isVisible={currentModal === AccountModal.create}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-create-modal`}
      />
      <ImportViaSeedAccountModal
        isVisible={currentModal === AccountModal.importViaSeed}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-import-via-seed-modal`}
      />
      <ImportViaJSONAccountModal
        isVisible={currentModal === AccountModal.importViaJSON}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-import-via-json-modal`}
      />
      <ImportViaQRCodeAccountModal
        isVisible={currentModal === AccountModal.importViaQRCode}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        testid={`${testid}-import-via-qr-modal`}
      />
      <TransferFundsModal
        isVisible={currentModal === AccountModal.sendFunds}
        onFinish={onChangeAccountsFinish}
        senderAddress={selectedAddress}
        testid={`${testid}-transfer-funds-modal`}
      />
      <WithdrawDepositModal
        isVisible={currentModal === AccountModal.withdrawDeposit}
        onFinish={onChangeAccountsFinish}
        onClose={onModalClose}
        address={selectedAddress}
        testid={`${testid}-withdraw-modal`}
      />
      <RecoveryMnemonicPhraseModal
        isVisible={currentModal === AccountModal.recoveryMnemonic}
        onClose={onModalClose}
        address={selectedAddress}
      />
      <ConfirmModal
        isVisible={currentModal === AccountModal.deleteLocalAccount}
        onCancel={onModalClose}
        onConfirm={deleteLocalAccountConfirmed}
        headerText={'Delete local account'}
        testid={`${testid}-delete-account-modal`}
      >
        <p>Are you sure, you want to perform this action? You won&apos;t be able to recover this account in future.</p>
      </ConfirmModal>
    </AccountPageWrapper>
    {config.rampApiKey && currentModal === AccountModal.getKsmModal && <GetKSMModal key={'modal-accounts-getKsm'} onClose={onModalClose}/>}
  </PagePaper>);
};

const AccountPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 2);
  width: 100%;
  .unique-table-data-row {
    height: fit-content;
  }

  @media (max-width: 640px) {
    .unique-modal-wrapper .unique-modal {
      width: calc(520px - var(--prop-gap) * 3);
    }
  }

  @media (max-width: 567px) {
    .unique-modal-wrapper .unique-modal {
      width: calc(288px - var(--prop-gap) * 2);
      padding: 24px 16px;
    }
  }
`;

const Row = styled.div`
  display: flex;
  column-gap: var(--gap);
  width: 100%;

  @media (max-width: 1024px) {
    flex-direction: column;
    row-gap: var(--gap);
    
    div[class^=DropdownMenu] {
      width: 100%;
      button {
        width: 100%;
      }
    }
  }
  
`;

const SearchInputWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  
  @media (max-width: 1024px) {
    justify-content: space-between;
    .unique-input-text {
      width: 100%;
      flex-grow: 1;
    }
  }
`;

const SearchInputStyled = styled(TextInput)`
  flex-basis: 720px;
`;

const CreateAccountButton = styled(Button)`
  width: 243px;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const DropdownStyled = styled(Dropdown)`
  .dropdown-options {
    padding: 0;
    width: 100%;
  }
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const AddAccountButton = styled(Button)`
  width: 196px;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const Title = styled.p`
  color: ${Grey500};
  font-size: 16px;
  line-height: 24px;
  @media (max-width: 768px) {
    margin-bottom: 4px;
  }
`;

const AccountCellWrapper = styled.div`
  display: flex;
  column-gap: calc(var(--gap) / 2);
  align-items: center;
`;

const LinksWrapper = styled.div`
  padding: 0 !important;
`;

const LinkStyled = styled.a`
  display: flex;
  align-items: center;
  column-gap: calc(var(--gap) / 4);
  width: fit-content;
`;

const ActionsWrapper = styled.div`
  && {
    display: flex;
    align-items: center;
    column-gap: var(--gap);
    padding: var(--gap) 0;
    flex-wrap: wrap;
    gap: 16px;
    margin: var(--gap) 0;
    @media (max-width: 768px) {
      flex-direction: row;
      row-gap: var(--gap);
      width: 100%;
      margin: 0;
      button {
        width: calc((100% - var(--gap)) / 2);
      }
    }
  }
`;

const DepositActionsWrapper = styled(ActionsWrapper)`
  && {
    column-gap: calc(var(--gap) / 2);
    padding: 0;
    button {
      width: calc(100% - 32px);
      max-width: 148px;
    }
    @media (max-width: 768px) {
      button {
        max-width: 100%;
      }
    }
  }
`;

const TextStyled = styled(Text)`
  && {
    color: var(--color-primary-500);
  }
`;

const IconWrapper = styled.div`
  && {
    width: 16px;
    height: 16px;
    color: var(--color-primary-500);
    padding: 0;

    path {
      stroke: currentColor;
    }
  }
`;

const TableWrapper = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const DropdownMenuItem = styled.div`
  padding: var(--gap);
  cursor: pointer;
  &:hover {
    background: var(--color-primary-100);
    color: var(--color-primary-500);
  }
  &:active {
    background: ${BlueGrey300};
    color: ${Primary100};
  }
`;

const StyledLink = styled.a`
  color: ${AdditionalLight};
  text-decoration: underline;
  
  &&:hover {
    text-decoration: none;
  }
`;
