import React, { FC, useMemo } from 'react';
import { Text, Table, Link } from '@unique-nft/ui-kit';
import styled from 'styled-components/macro';

import { Offer } from '../../../api/restApi/offers/types';
import { TableColumnProps } from '@unique-nft/ui-kit/dist/cjs/types';
import { timestampTableFormat } from '../../../utils/timestampUtils';
import { formatKusamaBalance, shortcutText } from '../../../utils/textUtils';
import config from '../../../config';
import { toAddress } from '../../../api/chainApi/utils/addressUtils';

interface BidsProps {
  offer: Offer
}

const getColumns = (tokenSymbol: string): TableColumnProps[] => ([
  {
    title: 'Bid',
    field: 'bidValue',
    width: '100%',
    render: (bid: string) => <Text color={'dark'}>{`${formatKusamaBalance(bid)} ${tokenSymbol}`}</Text>
  },
  {
    title: 'Time',
    field: 'createdAt',
    width: '100%',
    render: (createdAt: string) => timestampTableFormat(new Date(createdAt).valueOf())
  },
  {
    title: 'Bidder',
    field: 'bidderAddress',
    width: '100%',
    render: (account: string) => <Link href={`${config.scanUrl}account/${toAddress(account || '') || ''}`} title={shortcutText(toAddress(account || '') || '')} />
  }
]);

const tokenSymbol = 'KSM';

const Bids: FC<BidsProps> = ({ offer }) => {
  const bids = useMemo(() => {
    return offer?.auction?.bids?.map((item) => ({
      ...item,
      bidValue: item.balance !== '0' ? item.balance : item.amount
    })) || [];
  }, [offer?.auction?.bids]);

  if (!offer) return null;

  return (
    <BidsWrapper>
      {!offer.auction?.bids?.length && <Text >There is no bids</Text>}
      {!!offer.auction?.bids?.length && <Table
        data={bids}
        columns={getColumns(tokenSymbol)}
      />}
    </BidsWrapper>
  );
};

export default Bids;

const BidsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--gap) * 1.5);
  margin-bottom: calc(var(--gap) * 1.5);
`;
