export type PartnerId = 'EY' | 'Accenture' | 'TCS';

export type PartnerShare = Record<PartnerId, number>;

export interface Partner {
  id: PartnerId;
  fullScopeCostSEK: number;
}

export const PARTNER_IDS: PartnerId[] = ['EY', 'Accenture', 'TCS'];

export const PARTNERS: Partner[] = [
  { id: 'EY', fullScopeCostSEK: 30_000_000 },
  { id: 'Accenture', fullScopeCostSEK: 3_000_000 },
  { id: 'TCS', fullScopeCostSEK: 8_400_000 },
];

export const PARTNER_FULL_ANNUAL_COST: Record<PartnerId, number> = {
  EY: 30_000_000,
  Accenture: 3_000_000,
  TCS: 8_400_000,
};

export const PARTNER_SHARE_STARTS_IN_Q1: PartnerShare = {
  EY: 6_250_000,
  Accenture: 625_000,
  TCS: 1_750_000,
};

export const PARTNER_SHARE_STARTS_MONTH4: PartnerShare = {
  EY: 3_750_000,
  Accenture: 375_000,
  TCS: 1_050_000,
};
