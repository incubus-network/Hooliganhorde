import React from 'react';
import { Container, Stack } from '@mui/material';
import PageHeader from '~/components/Common/PageHeader';
import { HOW_TO_VOTE } from '~/util/Guides';
import GuideButton from '~/components/Common/Guide/GuideButton';

import { FC } from '~/types';
import GovernanceSpaces from '~/components/Governance/GovernanceSpaces';

const GovernancePage: FC<{}> = () => (
  <Container maxWidth="lg">
    <Stack gap={2}>
      <PageHeader
        title="Governance"
        description="Participate in Hooliganhorde governance"
        href="https://docs.hooligan.black/almanac/governance/proposals"
        control={
          <GuideButton
            title="The Guvnors' Almanac: Governance Guides"
            guides={[HOW_TO_VOTE]}
          />
        }
      />
      <GovernanceSpaces />
    </Stack>
  </Container>
);

export default GovernancePage;
