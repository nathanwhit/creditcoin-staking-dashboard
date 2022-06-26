// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import BN from 'bn.js';
import { useApi } from 'contexts/Api';
import { useBalances } from 'contexts/Balances';
import { APIContextInterface } from 'types/api';
import { BalancesContextInterface } from 'types/balances';
import { ConnectContextInterface, ImportedAccount } from 'types/connect';
import { planckBnToUnit } from 'Utils';
import { useConnect } from 'contexts/Connect';

export const getEligibleControllers = () => {
  const { network } = useApi() as APIContextInterface;
  const { activeAccount, accounts: connectAccounts } =
    useConnect() as ConnectContextInterface;
  const { isController, getAccountBalance, minReserve } =
    useBalances() as BalancesContextInterface;

  const [accounts, setAccounts] = useState<any>([]);

  useEffect(() => {
    setAccounts(filterAccounts());
  }, [activeAccount, connectAccounts]);

  const filterAccounts = () => {
    // filter items that are already controller accounts
    let _accounts = connectAccounts.filter((acc: ImportedAccount) => {
      return !isController(acc?.address ?? null);
    });

    // remove active account from eligible accounts
    _accounts = _accounts.filter(
      (acc: ImportedAccount) => acc.address !== activeAccount
    );

    // inject balances and whether account can be an active item
    let _accountsAsInput = _accounts.map((acc: ImportedAccount) => {
      const balance = getAccountBalance(acc?.address ?? null);
      return {
        ...acc,
        balance,
        active:
          planckBnToUnit(balance.free, network.units) >=
          planckBnToUnit(minReserve, network.units),
        alert: `Not Enough ${network.unit}`,
      };
    });

    // sort accounts with at least free balance first
    _accountsAsInput = _accountsAsInput.sort((a: any, b: any) => {
      const aFree = a?.balance?.free ?? new BN(0);
      const bFree = b?.balance?.free ?? new BN(0);
      return bFree.sub(aFree).toNumber();
    });

    return _accountsAsInput;
  };

  return accounts;
};
