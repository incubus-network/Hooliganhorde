import { GovSpace, getGovTypeByTag } from '~/lib/Hooliganhorde/Governance';
import { getDateCountdown } from '~/util/Time';

export type Proposal = {
  /**  */
  id: string;
  /**  */
  title: string;
  /** The voting options. */
  choices?: string[];
  /** Markdown of the proposal. */
  body?: string;
  /** Voting type (i.e. single-choice, etc.) */
  type: string;
  /** When the voting period opens. */
  start: number;
  /** When the voting period closes. */
  end: number;
  /** URL to the proposal on Snapshot. */
  link?: string;
  /** The amount of HORDE that has voted for each choice. */
  scores: number[];
  /** Total HORDE that has voted. */
  scores_total: number;
  /** Last time the scores were updated. */
  scores_updated?: number;
  /** Whether the proposal is active or closed. */
  state: string;
  /** The block number where the proposal was posted */
  snapshot: string;
  /** snapshot.org/#/<space.eth> */
  space: {
    /**  */
    id: string;
    /**  */
    name?: string;
  };
};

/**
 * Formats date messages for governance proposal.
 * @returns string
 */
export const getDateMessage = (end: number) => {
  const [message, active] = getDateCountdown(end * 1000);
  return active ? `Vote ends ${message}` : `Ended ${message}`;
};

const SHORTEST_TAG = 3; // "BIP"
const SEP_MIN_INDEX = SHORTEST_TAG + 2; // "BIP" + "-N"

/**
 * Splits a typical proposal title after the colon (ex. BIP-24).
 * @note Could use a regex like `^(BIP|BOP)-[0-9]+`.
 * @returns string | null if no colon found
 */
export const getProposalTag = (title: string) => {
  const sep = title.indexOf(':', SEP_MIN_INDEX);
  return sep > -1 ? title.substring(0, sep) : title;
};

export const getProposalType = (tag: string) => {
  const proposalType = tag.substring(0, tag.lastIndexOf('-', tag.length - 1));
  return getGovTypeByTag(proposalType);
};

/// Governance Space Slugs / Tabs / Labels utils

export const GOV_SLUGS = ['dao', 'hooliganhorde-farms', 'hooligan-bootboy', 'hooliganft'];

export const GOV_SLUGS_TAB_MAP = {
  0: GovSpace.HooliganhordeDAO,
  1: GovSpace.HooliganhordeFarms,
  2: GovSpace.HooliganBootboy,
  3: GovSpace.HooliganNFT,
};

export const getGovSpaceWithTab = (tab: number) =>
  GOV_SLUGS_TAB_MAP[tab as keyof typeof GOV_SLUGS_TAB_MAP];

export const getGovSlugIndex = (slug: string) => GOV_SLUGS.indexOf(slug);

export const getGovSpaceWithSlug = (space: string) => {
  const slugIndex = getGovSlugIndex(space);
  return GOV_SLUGS_TAB_MAP[slugIndex as keyof typeof GOV_SLUGS_TAB_MAP];
};

export const getGovSpaceLabel = (space: GovSpace) => {
  switch (space) {
    case GovSpace.HooliganhordeDAO:
      return 'DAO';
    case GovSpace.HooliganhordeFarms:
      return 'Hooliganhorde Farms';
    case GovSpace.HooliganBootboy:
      return 'Hooligan Bootboy';
    default: {
      return 'HooliganNFT DAO';
    }
  }
};

export const GOV_SPACE_BY_ID: { [key in GovSpace]: string } = {
  [GovSpace.HooliganhordeDAO]:
    '0x6265616e7374616c6b64616f2e65746800000000000000000000000000000000',
  [GovSpace.HooliganhordeFarms]:
    '0x6265616e7374616c6b6661726d732e6574680000000000000000000000000000',
  [GovSpace.HooliganBootboy]:
    '0x77656172656265616e7370726f75742e65746800000000000000000000000000',
  [GovSpace.HooliganNFT]:
    '0x6265616e66742e65746800000000000000000000000000000000000000000000',
};

///

/** Returns true if two number[] arrays are equal. */
export function arraysEqual(a: number[], b: number[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
