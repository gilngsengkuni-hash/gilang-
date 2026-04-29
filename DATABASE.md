# Supabase Database Setup

Jalankan query berikut di SQL Editor Supabase untuk membuat tabel yang dibutuhkan.

## 1. Tabel Users (Profile)
```sql
-- Create a table for public profiles
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  role text check (role in ('admin', 'guru', 'siswa')) not null default 'siswa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone." on public.users
  for select using (true);

create policy "Users can insert their own profile." on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.users
  for update using (auth.uid() = id);
```

## 2. Tabel Questions
```sql
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text check (correct_answer in ('a', 'b', 'c', 'd')) not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.questions enable row level security;

create policy "Everyone can view questions." on public.questions for select using (true);
create policy "Guru/Admin can insert questions." on public.questions for insert with check (auth.role() = 'authenticated');
create policy "Guru/Admin can update questions." on public.questions for update using (auth.role() = 'authenticated');
create policy "Guru/Admin can delete questions." on public.questions for delete using (auth.role() = 'authenticated');
```

## 3. Tabel Exams
```sql
create table public.exams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  duration integer not null, -- dalam menit
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exams enable row level security;
create policy "Everyone can view exams." on public.exams for select using (true);
create policy "Guru/Admin can insert exams." on public.exams for insert with check (auth.role() = 'authenticated');
create policy "Guru/Admin can update exams." on public.exams for update using (auth.role() = 'authenticated');
create policy "Guru/Admin can delete exams." on public.exams for delete using (auth.role() = 'authenticated');
```

## 4. Tabel Exam Questions (Junction)
```sql
create table public.exam_questions (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid references public.exams(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null
);

alter table public.exam_questions enable row level security;
create policy "Everyone can view exam links." on public.exam_questions for select using (true);
create policy "Guru/Admin can insert exam links." on public.exam_questions for insert with check (auth.role() = 'authenticated');
create policy "Guru/Admin can delete exam links." on public.exam_questions for delete using (auth.role() = 'authenticated');
```

## 5. Tabel Results
```sql
create table public.results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exam_id uuid references public.exams(id) on delete cascade not null,
  score integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.results enable row level security;
create policy "Users can view their own results." on public.results for select using (auth.uid() = user_id);
create policy "Guru/Admin can view all results." on public.results for select using (true);
create policy "Users can insert their own results." on public.results for insert with check (auth.uid() = user_id);
```

## 6. Tabel Answers (Optional for Review)
```sql
create table public.answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exam_id uuid references public.exams(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  answer text not null
);

alter table public.answers enable row level security;
create policy "Users can view their own answers." on public.answers for select using (auth.uid() = user_id);
create policy "Users can insert their own answers." on public.answers for insert with check (auth.uid() = user_id);
```

## Sync Auth Trigger (Penting!)
Jalankan ini agar setiap kali ada user baru, datanya otomatis masuk ke tabel `public.users`.

```sql
/**
 * This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
 */
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User Baru'), 
    'siswa'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
