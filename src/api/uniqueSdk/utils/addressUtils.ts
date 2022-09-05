import { addressToEvm, encodeAddress } from '@polkadot/util-crypto';
import { keyring } from '@polkadot/ui-keyring';
import Web3 from 'web3';
import { CrossAccountId } from '../types';

export const subToEthLowercase = (address: string): string => {
  const bytes = addressToEvm(address);

  return '0x' + Buffer.from(bytes).toString('hex');
};

export const compareEncodedAddresses = (subAddress1: string, subAddress2: string): boolean => {
  if (!subAddress1 || !subAddress2) return false;
  return encodeAddress(subAddress1) === encodeAddress(subAddress2);
};

export const getEthAccount = (account: string) => {
  if (!account) throw new Error('Account was not provided');
  const ethAccount = Web3.utils.toChecksumAddress(subToEthLowercase(account));
  return ethAccount.toLowerCase();
};

export const isTokenOwner = (account: string, tokenOwner: string): boolean => {
  if (tokenOwner.startsWith('0x')) {
    return getEthAccount(account).toLowerCase() === tokenOwner.toLowerCase();
  }

  return compareEncodedAddresses(account, tokenOwner);
};

export function normalizeAccountId(account: string): CrossAccountId {
  if (account.startsWith('0x')) {
    return { Ethereum: account };
  }

  return { Substrate: account };
}

export function toChainFormatAddress (address: string, ss58Format: number) {
  if (address.startsWith('0x')) return address;
  return keyring.encodeAddress(address, ss58Format);
}

export function collectionIdToAddress (address: number): string {
  if (address >= 0xffffffff || address < 0) {
    throw new Error('id overflow');
  }

  const buf = Buffer.from([0x17, 0xc4, 0xe6, 0x45, 0x3c, 0xc4, 0x9a, 0xaa, 0xae, 0xac, 0xa8, 0x94, 0xe6, 0xd9, 0x68, 0x3e,
    address >> 24,
    (address >> 16) & 0xff,
    (address >> 8) & 0xff,
    address & 0xff
  ]);

  return Web3.utils.toChecksumAddress('0x' + buf.toString('hex'));
}
