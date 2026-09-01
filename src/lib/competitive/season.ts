export type CompetitiveSeason = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
};

export function isSeasonActive(season: CompetitiveSeason, now = new Date()) {
  const startsAt = new Date(season.startsAt);
  const endsAt = season.endsAt ? new Date(season.endsAt) : null;
  return startsAt <= now && (!endsAt || endsAt >= now);
}
