// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { unitToPlanck } from '@polkadotcloud/utils';
import BigNumber from 'bignumber.js';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { usePoolMembers } from 'contexts/Pools/PoolMembers';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';
import { useSetup } from 'contexts/Setup';
import { Warning } from 'library/Form/Warning';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Header } from 'library/SetupSteps/Header';
import { MotionContainer } from 'library/SetupSteps/MotionContainer';
import type { SetupStepProps } from 'library/SetupSteps/types';
import { SubmitTx } from 'library/SubmitTx';
import { useTranslation } from 'react-i18next';
import { SummaryWrapper } from './Wrapper';

export const Summary = ({ section }: SetupStepProps) => {
  const { t } = useTranslation('pages');
  const { api, network } = useApi();
  const { units } = network;
  const { activeAccount, activeProxy, accountHasSigner } = useConnect();
  const { getSetupProgress, removeSetupProgress } = useSetup();
  const { stats } = usePoolsConfig();
  const { queryPoolMember, addToPoolMembers } = usePoolMembers();
  const { queryBondedPool, addToBondedPools } = useBondedPools();

  const { lastPoolId } = stats;
  const poolId = lastPoolId.plus(1);

  const setup = getSetupProgress('pool', activeAccount);
  const { progress } = setup;

  const { metadata, bond, roles, nominations } = progress;

  const getTxs = () => {
    if (!activeAccount || !api) {
      return null;
    }

    const targetsToSubmit = nominations.map((item: any) => item.address);

    const bondToSubmit = unitToPlanck(bond, units);
    const bondAsString = bondToSubmit.isNaN() ? '0' : bondToSubmit.toFixed();

    const txs = [
      api.tx.nominationPools.create(
        bondAsString,
        roles?.root || activeAccount,
        roles?.nominator || activeAccount,
        roles?.stateToggler || activeAccount
      ),
      api.tx.nominationPools.nominate(poolId.toString(), targetsToSubmit),
      api.tx.nominationPools.setMetadata(poolId.toString(), metadata),
    ];
    return api.tx.utility.batch(txs);
  };

  const submitExtrinsic = useSubmitExtrinsic({
    tx: getTxs(),
    from: activeAccount,
    shouldSubmit: true,
    callbackSubmit: () => {},
    callbackInBlock: async () => {
      // query and add created pool to bondedPools list
      const pool = await queryBondedPool(poolId.toNumber());
      addToBondedPools(pool);

      // query and add account to poolMembers list
      const member = await queryPoolMember(activeAccount);
      addToPoolMembers(member);

      // reset localStorage setup progress
      removeSetupProgress('pool', activeAccount);
    },
  });

  return (
    <>
      <Header
        thisSection={section}
        complete={null}
        title={`${t('pools.summary')}`}
        bondFor="pool"
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        {!(
          accountHasSigner(activeAccount) || accountHasSigner(activeProxy)
        ) && <Warning text={t('pools.readOnly')} />}
        <SummaryWrapper>
          <section>
            <div>
              <FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;{' '}
              {t('pools.poolName')}:
            </div>
            <div>{metadata ?? `${t('pools.notSet')}`}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;{' '}
              {t('pools.bondAmount')}:
            </div>
            <div>
              {new BigNumber(bond).toFormat()} {network.unit}
            </div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;
              Nominating:
            </div>
            <div>
              {nominations.length} Validator
              {nominations.length === 1 ? '' : 's'}
            </div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon icon={faCheckCircle} transform="grow-1" /> &nbsp;{' '}
              {t('pools.roles')}:
            </div>
            <div>{t('pools.assigned')}</div>
          </section>
        </SummaryWrapper>
        <div
          style={{
            flex: 1,
            width: '100%',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}
        >
          <SubmitTx
            submitText={`${t('pools.createPool')}`}
            valid
            noMargin
            {...submitExtrinsic}
          />
        </div>
      </MotionContainer>
    </>
  );
};
