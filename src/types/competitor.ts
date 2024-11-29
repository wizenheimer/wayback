// src/types/competitor.ts

export interface Competitor {
  id: number; // auto-generated
  domain: string; // extracted domain
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitorUrl {
  id: number;
  competitor_id: number;
  url: string;
  domain_hash: string; // moved here from Competitor
  created_at: string;
}

export interface CompetitorWithUrls extends Competitor {
  urls: string[];
}
