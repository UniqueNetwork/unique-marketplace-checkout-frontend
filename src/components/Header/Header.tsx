import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Icon } from 'components/UI';

import { useScreenWidthFromThreshold } from 'hooks/useScreenWidthFromThreshold';
import useDeviceSize, { DeviceSize } from 'hooks/useDeviceSize';
import { useAdminLoggingIn } from 'api/restApi/admin/login';
import { useAccounts } from 'hooks/useAccounts';
import { TMenuItems } from '../PageLayout';
import { WalletManager } from './WalletManager/WalletManager';
import { DesktopMenuLink, MobileMenuLink } from './MenuLink';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FC<HeaderProps> = ({ activeItem }) => {
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);
  const { selectedAccount, isLoading } = useAccounts();
  const { hasAdminPermission } = useAdminLoggingIn();

  const mobileMenuToggler = useCallback(() => {
    toggleMobileMenu((prevState) => !prevState);
  }, [selectedAccount]);

  const deviceSize = useDeviceSize();

  return (
    <HeaderStyled>
      <LeftSideColumn>
        {showMobileMenu && <MenuIcon
          onClick={mobileMenuToggler}
        >
          <Icon name={'menu'} size={32} />
        </MenuIcon>}
        <LogoLink to={'/'}>
          <LogoIcon src={activeItem === 'Collections' ? '/logos/admin.svg' : '/logos/logo.png'} />
        </LogoLink>
        {!showMobileMenu && (
          <nav>
            <DesktopMenuLink to='/' active={activeItem === 'Market'}>
              Market
            </DesktopMenuLink>
            <DesktopMenuLink to='myTokens' active={activeItem === 'My tokens'} disabled={!selectedAccount && !isLoading}>
              My tokens
            </DesktopMenuLink>
            <DesktopMenuLink to='trades' active={activeItem === 'Trades'}>
              Trades
            </DesktopMenuLink>
            <DesktopMenuLink to='faq' active={activeItem === 'FAQ'}>
              FAQ
            </DesktopMenuLink>
            {hasAdminPermission &&
              <DesktopMenuLink to='administration' active={activeItem === 'Collections'}>
                Admin panel
              </DesktopMenuLink>
            }
          </nav>
        )}
      </LeftSideColumn>
      <RightSide>
        <WalletManager />
      </RightSide>
      {showMobileMenu && mobileMenuIsOpen && (
        <MobileMenu>
          <MobileMenuLink to='/' active={activeItem === 'Market'} onClick={mobileMenuToggler}>
            Market
          </MobileMenuLink>
          <MobileMenuLink
            to='myTokens'
            active={activeItem === 'My tokens'}
            onClick={mobileMenuToggler}
            disabled={!selectedAccount && !isLoading}
          >
            My tokens
          </MobileMenuLink>
          <MobileMenuLink to='trades' active={activeItem === 'Trades'} onClick={mobileMenuToggler}>
            Trades
          </MobileMenuLink>
          <MobileMenuLink to='faq' active={activeItem === 'FAQ'} onClick={mobileMenuToggler}>
            FAQ
          </MobileMenuLink>
          {deviceSize !== DeviceSize.lg &&
            <MobileMenuLink to='accounts' active={activeItem === 'Manage accounts'} onClick={mobileMenuToggler}>
              Manage accounts
            </MobileMenuLink>
          }
          {hasAdminPermission &&
            <MobileMenuLink to='administration' active={activeItem === 'Collections'} onClick={mobileMenuToggler}>
              Admin panel
            </MobileMenuLink>
          }
        </MobileMenu>
      )}
    </HeaderStyled>
  );
};

const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  @media (max-width: 567px) {
    .unique-modal-wrapper {
      padding: 0;
    }
  }
`;

const LeftSideColumn = styled.div`
  display: flex;
  align-items: center;
`;

const MenuIcon = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

const LogoLink = styled(Link)`
  @media (max-width: 567px) {
    display: none;
  }
`;

const LogoIcon = styled.img`
  margin-right: 32px;
  height: 64px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 81px;
  left: 0;
  right: 0;
  height: 100vh;
  background-color: var(--color-additional-light);
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 6%);
  display: flex;
  flex-direction: column;
  padding: 16px;
  z-index: 9;
`;
