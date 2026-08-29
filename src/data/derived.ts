import { WORKSTREAMS } from './workstreams';

export const TOTAL_FULL_COST = WORKSTREAMS.reduce(
  (sum, workstream) => sum + workstream.costSEK,
  0,
);

export const TOTAL_FULL_BENEFIT = WORKSTREAMS.reduce(
  (sum, workstream) => sum + workstream.benefitSEK,
  0,
);

export const FULL_MULTIPLE = TOTAL_FULL_BENEFIT / TOTAL_FULL_COST;

export const MAX_FULLY_COVERABLE_WORKSTREAMS = 6;
