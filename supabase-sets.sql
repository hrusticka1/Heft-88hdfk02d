create table workout_sets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

alter table workout_sets enable row level security;

create policy "Users manage own sets"
  on workout_sets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table set_exercises (
  id uuid default gen_random_uuid() primary key,
  set_id uuid references workout_sets(id) on delete cascade not null,
  exercise_id text references exercises(id) on delete cascade not null,
  position integer not null default 0,
  added_at timestamptz default now() not null,
  unique(set_id, exercise_id)
);

alter table set_exercises enable row level security;

create policy "Users manage exercises in own sets"
  on set_exercises for all
  using (exists (select 1 from workout_sets where workout_sets.id = set_exercises.set_id and workout_sets.user_id = auth.uid()))
  with check (exists (select 1 from workout_sets where workout_sets.id = set_exercises.set_id and workout_sets.user_id = auth.uid()));
