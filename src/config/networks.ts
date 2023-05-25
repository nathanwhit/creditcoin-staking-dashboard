// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DefaultParams } from 'consts';
import { ReactComponent as CreditcoinLogoSVG } from 'img/creditcoin_logo.svg';
import { ReactComponent as PolkadotIconSVG } from 'img/polkadot_icon.svg';
import { ReactComponent as PolkadotInlineSVG } from 'img/polkadot_inline.svg';
import type { Networks } from 'types';

export const NetworkList: Networks = {
  creditcoin: {
    name: 'creditcoin',
    endpoints: {
      rpc: 'ws://localhost:9944',
      lightClient: null,
    },
    namespace: '09573a3526818a8ecd6eb92f60f1175d',
    api: {
      unit: 'CTC',
      priceTicker: 'CTCUSDT',
    },
    params: {
      ...DefaultParams,
    },
    ss58: 42,
    unit: 'CTC',
    units: 18,
    brand: {
      icon: PolkadotIconSVG,
      logo: {
        svg: CreditcoinLogoSVG,
        width: '7.2em',
      },
      inline: {
        svg: PolkadotInlineSVG,
        size: '1.05em',
      },
    },
    colors: {
      primary: {
        light: 'rgb(211, 48, 121)',
        dark: 'rgb(211, 48, 121)',
      },
      secondary: {
        light: '#552bbf',
        dark: '#6d39ee',
      },
      stroke: {
        light: 'rgb(211, 48, 121)',
        dark: 'rgb(211, 48, 121)',
      },
      transparent: {
        light: 'rgb(211, 48, 121, 0.05)',
        dark: 'rgb(211, 48, 121, 0.05)',
      },
      pending: {
        light: 'rgb(211, 48, 121, 0.33)',
        dark: 'rgb(211, 48, 121, 0.33)',
      },
    },
    subscanEndpoint: 'http://127.0.0.1:4399',
  },
};
