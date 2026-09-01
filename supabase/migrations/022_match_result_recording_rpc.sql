-- ============================================================
-- RIO ESPORTS
-- Migration 022 - Match result recording boundary
-- ============================================================
-- Result recording remains restricted to trusted backend execution.

create or replace function public.record_competitive_match_result(
  p_match_id uuid,
  p_winner_team_side text,
  p_result_source text
)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare v_match public.matches;
begin
  if p_winner_team_side not in ('team_a', 'team_b') then
    raise exception 'invalid winner team side';
  end if;

  update public.matches
  set winner_team_side = p_winner_team_side,
      result_source = p_result_source,
      result_recorded_at = now(),
      completed_at = coalesce(completed_at, now()),
      status = 'completed'
  where id = p_match_id
  returning * into v_match;

  if not found then
    raise exception 'match not found';
  end if;

  return v_match;
end;
$$;

revoke all on function public.record_competitive_match_result(uuid, text, text)
from public, anon, authenticated;
