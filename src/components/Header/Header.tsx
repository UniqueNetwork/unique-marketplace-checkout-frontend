import { Text } from '@unique-nft/ui-kit';
import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro'; // Todo: https://cryptousetech.atlassian.net/browse/NFTPAR-1201

import { useScreenWidthFromThreshold } from '../../hooks/useScreenWidthFromThreshold';
import menu from '../../static/icons/menu.svg';
import { TMenuItems } from '../PageLayout';
import { WalletManager } from './WalletManager/WalletManager';
import { AdditionalDark, AdditionalLight, Primary500 } from '../../styles/colors';

interface HeaderProps {
  activeItem: TMenuItems;
}

export const Header: FC<HeaderProps> = ({ activeItem }) => {
  const { lessThanThreshold: showMobileMenu } =
    useScreenWidthFromThreshold(1279);
  const [mobileMenuIsOpen, toggleMobileMenu] = useState(false);

  const mobileMenuToggler = useCallback(() => {
    toggleMobileMenu((prevState) => !prevState);
  }, []);

  return (
    <HeaderStyled>
      <LeftSideColumn>
        {showMobileMenu && <MenuIcon
          onClick={mobileMenuToggler}
          src={menu}
        />}
        <Link to={'/'}>
          <LogoIcon src={'/logos/logo.svg'} />
        </Link>
        {!showMobileMenu && (
          <Nav>
            <Link to='/'>
              <TextStyled
                $active={activeItem === 'Market'}
                color= 'additional-dark'
                size='m'
                weight='medium'
              >
                Market
              </TextStyled>
            </Link>
            <Link to='myTokens'>
              <TextStyled
                $active={activeItem === 'My tokens'}
                color= 'additional-dark'
                size='m'
                weight='medium'
              >
                My tokens
              </TextStyled>
            </Link>
            <Link to='trades'>
              <TextStyled
                $active={activeItem === 'Trades'}
                color= 'additional-dark'
                size='m'
                weight='medium'
              >
                Trades
              </TextStyled>
            </Link>
            <Link to='faq'>
              <TextStyled
                $active={activeItem === 'FAQ'}
                color= 'additional-dark'
                size='m'
                weight='medium'
              >
                FAQ
              </TextStyled>
            </Link>
          </Nav>
        )}
      </LeftSideColumn>
      <RightSide>
        <WalletManager />
      </RightSide>
      {showMobileMenu && mobileMenuIsOpen && (
        <MobileMenu>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='/'>
              <TextStyled
                $active={activeItem === 'Market'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Market
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='myTokens'>
              <TextStyled
                $active={activeItem === 'My tokens'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                My tokens
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='trades'>
              <TextStyled
                $active={activeItem === 'Trades'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                Trades
              </TextStyled>
            </Link>
          </LinkWrapper>
          <LinkWrapper onClick={mobileMenuToggler}>
            <Link to='faq'>
              <TextStyled
                $active={activeItem === 'FAQ'}
                color='additional-dark'
                size='m'
                weight='medium'
              >
                FAQ
              </TextStyled>
            </Link>
          </LinkWrapper>
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
`;

const Nav = styled.nav`
  && {display: flex;
  align-items: center;

  a {
    margin-right: 8px;
  }
}
`;

const LeftSideColumn = styled.div`
  display: flex;
  align-items: center;
`;

const MenuIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

const LogoIcon = styled.img`
  margin-right: 32px;
`;

const RightSide = styled.div`
  display: flex;
  align-items: center;
`;

const LinkWrapper = styled.div`
  display: contents;

  a {
    margin-right: 0;
  }
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 81px;
  left: 0;
  right: 0;
  height: 100vh;
  background-color: ${AdditionalLight};
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 6%);
  display: flex;
  flex-direction: column;
  padding: 16px;
  z-index: 9;
`;

const TextStyled = styled(Text) <{ $active?: boolean }>`
  && {
    display: flex;
    border-radius: 4px;
    padding: 8px 16px;
    background-color: ${(props) => props.$active ? Primary500 : 'transparent'};
    color: ${(props) => props.$active ? AdditionalLight : AdditionalDark};

    &:hover {
      color: ${(props) => (props.$active ? AdditionalLight : Primary500)};
    }
  }
`;
