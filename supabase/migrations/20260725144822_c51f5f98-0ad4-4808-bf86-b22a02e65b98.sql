
-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  target_year INT,
  attempt_number INT DEFAULT 1,
  daily_hours INT DEFAULT 4,
  prep_stage TEXT DEFAULT 'beginner',
  optional_subject TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ content tree ============
CREATE TABLE public.syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  exam TEXT NOT NULL DEFAULT 'prelims',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syllabus_id UUID NOT NULL REFERENCES public.syllabus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  weightage INT NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.knowledge_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner',
  summary TEXT,
  content TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_misconception TEXT,
  concept_tag TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  knowledge_unit_id UUID REFERENCES public.knowledge_units(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'practice',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option INT,
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  concept_tag TEXT,
  level TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pyqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  year INT NOT NULL,
  exam TEXT NOT NULL DEFAULT 'Prelims',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option INT NOT NULL DEFAULT 0,
  explanation TEXT,
  concept_tag TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.syllabus, public.subjects, public.topics, public.knowledge_units, public.questions, public.pyqs TO anon, authenticated;
GRANT ALL ON public.syllabus, public.subjects, public.topics, public.knowledge_units, public.questions, public.pyqs TO service_role;
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read syllabus" ON public.syllabus FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read subjects" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read topics" ON public.topics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read knowledge_units" ON public.knowledge_units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read questions" ON public.questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read pyqs" ON public.pyqs FOR SELECT TO anon, authenticated USING (true);

-- ============ learner data ============
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'learning',
  stage TEXT NOT NULL DEFAULT 'diagnose',
  status TEXT NOT NULL DEFAULT 'in_progress',
  level TEXT,
  score NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  pyq_id UUID REFERENCES public.pyqs(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'practice',
  user_answer TEXT,
  selected_option INT,
  is_correct BOOLEAN,
  score NUMERIC DEFAULT 0,
  time_taken_seconds INT,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.attempts(id) ON DELETE CASCADE,
  concept_tag TEXT,
  mistake_type TEXT NOT NULL DEFAULT 'conceptual',
  description TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.revision_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  mistake_id UUID REFERENCES public.mistakes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL DEFAULT (now()::date + 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'user',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.mastery_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  mastery NUMERIC NOT NULL DEFAULT 0,
  diagnostic_score NUMERIC DEFAULT 0,
  recall_score NUMERIC DEFAULT 0,
  practice_score NUMERIC DEFAULT 0,
  attempts_count INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'beginner',
  last_studied_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions, public.attempts, public.mistakes, public.revision_tasks, public.notes, public.mastery_scores TO authenticated;
GRANT ALL ON public.study_sessions, public.attempts, public.mistakes, public.revision_tasks, public.notes, public.mastery_scores TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own study_sessions" ON public.study_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own attempts" ON public.attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mistakes" ON public.mistakes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own revision_tasks" ON public.revision_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes" ON public.notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mastery" ON public.mastery_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_sessions_updated BEFORE UPDATE ON public.study_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_mastery_updated BEFORE UPDATE ON public.mastery_scores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_topics_subject ON public.topics(subject_id);
CREATE INDEX idx_ku_topic ON public.knowledge_units(topic_id, level);
CREATE INDEX idx_questions_topic_kind ON public.questions(topic_id, kind);
CREATE INDEX idx_pyqs_topic ON public.pyqs(topic_id, year);
CREATE INDEX idx_attempts_user_topic ON public.attempts(user_id, topic_id);
CREATE INDEX idx_sessions_user ON public.study_sessions(user_id, started_at DESC);

-- ============ seed: syllabus / subject / topic ============
INSERT INTO public.syllabus (id, code, name, exam, description) VALUES
('11111111-1111-1111-1111-111111111111', 'CSE-GS', 'UPSC Civil Services General Studies', 'prelims', 'General Studies syllabus for the UPSC Civil Services Examination.');

INSERT INTO public.subjects (id, syllabus_id, name, slug, description, icon, sort_order) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Indian Polity', 'indian-polity', 'Constitution, governance, political system and public policy.', 'Landmark', 1);

INSERT INTO public.topics (id, subject_id, name, slug, description, weightage, difficulty, is_active, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Fundamental Rights', 'fundamental-rights', 'Part III of the Constitution: Articles 12 to 35, their scope, limits and enforcement.', 18, 'medium', true, 1),
('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'Directive Principles of State Policy', 'dpsp', 'Part IV of the Constitution: Articles 36 to 51.', 8, 'easy', false, 2),
('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222222', 'Parliament', 'parliament', 'Composition, powers and procedures of the Union Legislature.', 14, 'medium', false, 3);

-- ============ seed: knowledge units ============
INSERT INTO public.knowledge_units (topic_id, title, level, summary, content, key_points, common_misconception, concept_tag, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', 'Foundations: What Fundamental Rights Are', 'beginner',
'Part III, Articles 12-35: six categories of rights, who they bind, and why they are called fundamental.',
'Fundamental Rights are contained in **Part III of the Constitution (Articles 12-35)**. They are called "fundamental" for two reasons: they are guaranteed by the Constitution itself, and they are directly enforceable in courts.

**The six categories today**
1. Right to Equality (Articles 14-18)
2. Right to Freedom (Articles 19-22)
3. Right against Exploitation (Articles 23-24)
4. Right to Freedom of Religion (Articles 25-28)
5. Cultural and Educational Rights (Articles 29-30)
6. Right to Constitutional Remedies (Article 32)

The **Right to Property** was originally the seventh category (Article 31), but the 44th Amendment Act, 1978 removed it from Part III and inserted it as a legal right under Article 300A.

**Who do these rights bind?**
Article 12 defines "State" to include the Union and State governments, Parliament and State legislatures, all local authorities, and "other authorities" within India or under the control of the Government of India. Fundamental Rights are primarily claimed **against the State**. A few — Articles 15(2), 17, 23 and 24 — are available against private individuals too.

**Citizens only vs all persons**
Articles 15, 16, 19, 29 and 30 are available **only to citizens**. Articles 14, 20, 21, 21A, 22, 23, 24, 25-28 are available to **all persons**, including foreigners and, in several cases, corporations.',
'["Part III covers Articles 12 to 35", "Six categories of rights after the 44th Amendment (1978) moved property to Article 300A", "Article 12 defines the State; rights are mainly claimed against the State", "Articles 15, 16, 19, 29, 30 are citizen-only rights", "Articles 15(2), 17, 23, 24 are enforceable against private persons too"]',
'Students often assume all Fundamental Rights are available to foreigners. In fact Articles 15, 16, 19, 29 and 30 are reserved for citizens only.',
'part-iii-structure', 1),

('33333333-3333-3333-3333-333333333333', 'Core Articles: Equality, Freedom and Life', 'intermediate',
'Articles 14, 19 and 21 in depth: reasonable classification, the eight freedoms with their grounds of restriction, and the expanded reading of Article 21.',
'**Article 14 — Equality before law and equal protection of the laws**
"Equality before law" is a negative concept borrowed from the British tradition (absence of special privilege). "Equal protection of the laws" is a positive concept borrowed from the US Constitution (like should be treated alike). Article 14 permits **reasonable classification** but forbids **class legislation**. A classification is valid only if it rests on an intelligible differentia and that differentia has a rational nexus with the object of the law. *E.P. Royappa* and *Maneka Gandhi* added the doctrine that arbitrariness itself violates Article 14.

**Article 19 — Six freedoms (originally seven)**
19(1)(a) speech and expression; (b) assembly peaceably and without arms; (c) associations or unions or co-operative societies; (d) movement throughout India; (e) residence and settlement; (g) profession, occupation, trade or business. Freedom to acquire property, formerly 19(1)(f), was deleted by the 44th Amendment.

Each freedom carries its **own grounds of reasonable restriction**: for 19(1)(a) they are the eight grounds in 19(2) — sovereignty and integrity of India, security of the State, friendly relations with foreign States, public order, decency or morality, contempt of court, defamation, and incitement to an offence. Note that "public order" and "sovereignty and integrity" were added by the 1st and 16th Amendments respectively.

**Article 21 — Protection of life and personal liberty**
Text: no person shall be deprived of life or personal liberty except according to procedure established by law. *A.K. Gopalan* (1950) read this narrowly; *Maneka Gandhi v. Union of India* (1978) held the procedure must also be fair, just and reasonable — importing substantive due process in effect. Article 21 has since been read to include the right to privacy (*K.S. Puttaswamy*, 2017), livelihood, clean environment, health, shelter, speedy trial, legal aid and dignity. Article 21A (86th Amendment, 2002) makes free and compulsory education for ages 6-14 a Fundamental Right.',
'["Article 14 allows reasonable classification but bans class legislation; arbitrariness is itself a violation", "Article 19 now has six freedoms; 19(1)(f) property was deleted in 1978", "19(2) lists eight grounds of restriction on speech, including public order (1st Amendment) and sovereignty and integrity (16th Amendment)", "Maneka Gandhi (1978) made Article 21 procedure fair, just and reasonable", "Article 21A added by the 86th Amendment, 2002 for ages 6-14"]',
'Many aspirants think one common set of restrictions applies to all Article 19 freedoms. Each sub-clause has its own distinct grounds listed in clauses 19(2) to 19(6).',
'articles-14-19-21', 2),

('33333333-3333-3333-3333-333333333333', 'Advanced: Enforcement, Amendability and Emergency', 'advanced',
'Article 32 writs, Article 33-35 exceptions, the basic structure doctrine, and what happens to rights during a National Emergency.',
'**Article 32 — the heart and soul of the Constitution (Ambedkar)**
The Supreme Court can issue five writs: *habeas corpus*, *mandamus*, *prohibition*, *certiorari* and *quo warranto*. Article 226 gives High Courts a **wider** writ power — for Fundamental Rights *and* other legal rights — but unlike Article 32, Article 226 is not itself a Fundamental Right. Article 32 cannot be suspended except as provided by Article 359 during a National Emergency.

**Exceptions built into Part III**
- Article 33: Parliament may restrict rights of armed forces, police and analogous forces.
- Article 34: restriction of rights while martial law is in force.
- Article 35: only Parliament — not State legislatures — may make laws for certain Part III provisions.

**Amendability and basic structure**
*Shankari Prasad* (1951) and *Sajjan Singh* (1965) allowed amendment of Fundamental Rights. *Golaknath* (1967) held they could not be abridged. The 24th Amendment reversed this, and *Kesavananda Bharati* (1973) settled the position: Parliament may amend any part, including Part III, but cannot damage the **basic structure**. *Minerva Mills* (1980) struck down parts of the 42nd Amendment; *Waman Rao* (1981) fixed 24 April 1973 as the cut-off for Ninth Schedule protection, and *I.R. Coelho* (2007) held post-1973 Ninth Schedule laws are open to basic structure review.

**Emergency**
Under **Article 358**, when a National Emergency is proclaimed on the ground of war or external aggression, Article 19 is automatically suspended for citizens. Under **Article 359**, the President may suspend the *enforcement* of specified rights — but after the 44th Amendment, **Articles 20 and 21 can never be suspended**.',
'["Five writs under Article 32; Article 226 is wider but is not itself a Fundamental Right", "Articles 33, 34, 35 are built-in exceptions to Part III", "Kesavananda Bharati (1973): Part III is amendable but not so as to damage the basic structure", "Article 358 suspends Article 19 only in a war or external-aggression emergency", "Articles 20 and 21 can never be suspended (44th Amendment)"]',
'A frequent error is believing all Fundamental Rights are suspended during any Emergency. Article 358 applies only to Article 19 and only in an external emergency, and Articles 20 and 21 are permanently protected.',
'enforcement-amendment-emergency', 3);

-- ============ seed: diagnostic questions ============
INSERT INTO public.questions (topic_id, kind, question_text, options, correct_option, explanation, difficulty, concept_tag, level, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', 'diagnostic',
'Which of the following statements about Fundamental Rights is correct?',
'["All Fundamental Rights are available to citizens as well as foreigners.","The Right to Property was removed from Part III by the 44th Amendment Act, 1978.","Fundamental Rights can only be enforced by the Supreme Court and not by High Courts.","Fundamental Rights cannot be amended by Parliament under any circumstances."]',
1, 'The 44th Amendment Act, 1978 deleted Article 31 and Article 19(1)(f) and made property a legal right under Article 300A. Articles 15, 16, 19, 29 and 30 are citizen-only, High Courts enforce rights under Article 226, and Part III is amendable subject to the basic structure doctrine.',
'medium', 'part-iii-structure', 'beginner', 1),

('33333333-3333-3333-3333-333333333333', 'diagnostic',
'In your own words, explain what Article 21 protects today and how the Maneka Gandhi judgment changed its interpretation.',
'[]', NULL,
'A strong answer notes that Article 21 protects life and personal liberty for all persons, that A.K. Gopalan (1950) read "procedure established by law" narrowly, and that Maneka Gandhi (1978) held the procedure must be fair, just and reasonable — opening the way to reading privacy, livelihood, dignity, clean environment and speedy trial into Article 21.',
'medium', 'articles-14-19-21', 'intermediate', 2),

('33333333-3333-3333-3333-333333333333', 'diagnostic',
'During a National Emergency proclaimed on the ground of external aggression, which Fundamental Rights can never be suspended?',
'["Articles 14 and 19","Articles 20 and 21","Articles 25 and 26","Articles 29 and 30"]',
1, 'After the 44th Amendment Act, 1978, Article 359 expressly bars suspension of the enforcement of Articles 20 and 21. Article 19 is automatically suspended under Article 358 in an external emergency.',
'hard', 'enforcement-amendment-emergency', 'advanced', 3);

-- ============ seed: recall questions ============
INSERT INTO public.questions (topic_id, kind, question_text, options, correct_option, explanation, difficulty, concept_tag, level, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', 'recall',
'Without looking back at the lesson, list the six categories of Fundamental Rights and the Articles that cover each.',
'[]', NULL,
'Expected: Equality (14-18), Freedom (19-22), Against Exploitation (23-24), Freedom of Religion (25-28), Cultural and Educational (29-30), Constitutional Remedies (32).',
'medium', 'part-iii-structure', 'beginner', 1),
('33333333-3333-3333-3333-333333333333', 'recall',
'State the two-part test for a valid classification under Article 14, and name one case that added the doctrine of arbitrariness.',
'[]', NULL,
'Expected: (i) intelligible differentia, (ii) rational nexus with the object of the law. E.P. Royappa (1974) or Maneka Gandhi (1978) added that arbitrariness itself violates Article 14.',
'medium', 'articles-14-19-21', 'intermediate', 2),
('33333333-3333-3333-3333-333333333333', 'recall',
'Explain the difference between Article 358 and Article 359 in relation to Fundamental Rights during an Emergency.',
'[]', NULL,
'Expected: Article 358 automatically suspends Article 19 only when the Emergency is on grounds of war or external aggression. Article 359 empowers the President to suspend the enforcement of specified rights, but never Articles 20 and 21.',
'hard', 'enforcement-amendment-emergency', 'advanced', 3);

-- ============ seed: practice questions ============
INSERT INTO public.questions (topic_id, kind, question_text, options, correct_option, explanation, difficulty, concept_tag, level, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', 'practice',
'Which Article of the Constitution defines the term "State" for the purposes of Part III?',
'["Article 11","Article 12","Article 13","Article 14"]', 1,
'Article 12 defines "State" to include the Government and Parliament of India, State governments and legislatures, all local authorities, and other authorities under the control of the Government of India.',
'easy', 'part-iii-structure', 'beginner', 1),
('33333333-3333-3333-3333-333333333333', 'practice',
'Which of the following freedoms was deleted from Article 19(1) by the 44th Amendment Act, 1978?',
'["Freedom of assembly","Freedom of movement","Freedom to acquire, hold and dispose of property","Freedom to form associations"]', 2,
'Article 19(1)(f), the freedom to acquire, hold and dispose of property, was deleted in 1978. Property is now a legal right under Article 300A.',
'medium', 'articles-14-19-21', 'intermediate', 2),
('33333333-3333-3333-3333-333333333333', 'practice',
'Consider the following statements about Article 32:
1. It is described by Dr. B.R. Ambedkar as the heart and soul of the Constitution.
2. The Supreme Court can issue five types of writs under it.
3. Article 226 confers a narrower writ jurisdiction on High Courts than Article 32 does on the Supreme Court.
Which of the statements are correct?',
'["1 and 2 only","2 and 3 only","1 and 3 only","1, 2 and 3"]', 0,
'Statements 1 and 2 are correct. Statement 3 is wrong: Article 226 is wider in scope because High Courts can issue writs for Fundamental Rights as well as other legal rights.',
'medium', 'enforcement-amendment-emergency', 'advanced', 3),
('33333333-3333-3333-3333-333333333333', 'practice',
'Which of the following Fundamental Rights is available against private individuals and not merely against the State?',
'["Article 16 — equality of opportunity in public employment","Article 17 — abolition of untouchability","Article 19 — freedom of speech and expression","Article 30 — rights of minorities to establish institutions"]', 1,
'Article 17 (abolition of untouchability), along with Articles 15(2), 23 and 24, is enforceable against private individuals as well.',
'medium', 'part-iii-structure', 'beginner', 4),
('33333333-3333-3333-3333-333333333333', 'practice',
'The doctrine of basic structure, limiting Parliament''s power to amend Fundamental Rights, was laid down in:',
'["Golaknath v. State of Punjab (1967)","Kesavananda Bharati v. State of Kerala (1973)","Minerva Mills v. Union of India (1980)","I.R. Coelho v. State of Tamil Nadu (2007)"]', 1,
'Kesavananda Bharati (1973) held that Parliament may amend any part of the Constitution, including Part III, but cannot damage or destroy its basic structure.',
'medium', 'enforcement-amendment-emergency', 'advanced', 5),
('33333333-3333-3333-3333-333333333333', 'practice',
'Article 21A, which makes elementary education a Fundamental Right, was inserted by which Constitutional Amendment?',
'["73rd Amendment, 1992","86th Amendment, 2002","93rd Amendment, 2005","97th Amendment, 2011"]', 1,
'The 86th Amendment Act, 2002 inserted Article 21A guaranteeing free and compulsory education to children between six and fourteen years.',
'easy', 'articles-14-19-21', 'intermediate', 6);

-- ============ seed: mock test questions ============
INSERT INTO public.questions (topic_id, kind, question_text, options, correct_option, explanation, difficulty, concept_tag, level, sort_order) VALUES
('33333333-3333-3333-3333-333333333333', 'mock', 'Fundamental Rights are contained in which Part of the Constitution?', '["Part II","Part III","Part IV","Part IVA"]', 1, 'Part III, Articles 12 to 35.', 'easy', 'part-iii-structure', 'beginner', 1),
('33333333-3333-3333-3333-333333333333', 'mock', 'Which of the following rights is available ONLY to citizens?', '["Article 14","Article 20","Article 19","Article 21"]', 2, 'Article 19 freedoms are available only to citizens. Articles 14, 20 and 21 extend to all persons.', 'easy', 'part-iii-structure', 'beginner', 2),
('33333333-3333-3333-3333-333333333333', 'mock', 'How many grounds of reasonable restriction are listed under Article 19(2)?', '["Six","Seven","Eight","Nine"]', 2, 'Eight grounds: sovereignty and integrity of India, security of the State, friendly relations with foreign States, public order, decency or morality, contempt of court, defamation, incitement to an offence.', 'medium', 'articles-14-19-21', 'intermediate', 3),
('33333333-3333-3333-3333-333333333333', 'mock', 'The right to privacy was declared a Fundamental Right under Article 21 in which case?', '["Maneka Gandhi (1978)","K.S. Puttaswamy (2017)","Kharak Singh (1962)","Gobind v. State of MP (1975)"]', 1, 'A nine-judge bench in K.S. Puttaswamy v. Union of India (2017) held privacy to be intrinsic to Article 21.', 'medium', 'articles-14-19-21', 'intermediate', 4),
('33333333-3333-3333-3333-333333333333', 'mock', 'Which writ is issued to secure the release of a person unlawfully detained?', '["Mandamus","Certiorari","Habeas corpus","Quo warranto"]', 2, 'Habeas corpus literally means "to have the body of".', 'easy', 'enforcement-amendment-emergency', 'advanced', 5),
('33333333-3333-3333-3333-333333333333', 'mock', 'Article 33 of the Constitution empowers Parliament to:', '["Suspend Fundamental Rights during Emergency","Restrict Fundamental Rights of armed forces and police personnel","Amend Part III by simple majority","Extend Fundamental Rights to foreigners"]', 1, 'Article 33 allows Parliament to restrict or abrogate the rights of members of the armed forces, police and analogous forces.', 'medium', 'enforcement-amendment-emergency', 'advanced', 6),
('33333333-3333-3333-3333-333333333333', 'mock', 'Which Article prohibits employment of children below 14 years in factories and hazardous work?', '["Article 23","Article 24","Article 39","Article 45"]', 1, 'Article 24 is part of the Right against Exploitation.', 'easy', 'part-iii-structure', 'beginner', 7),
('33333333-3333-3333-3333-333333333333', 'mock', 'Article 14 forbids class legislation but permits:', '["Arbitrary state action","Reasonable classification","Retrospective criminal law","Preventive detention without safeguards"]', 1, 'A classification is valid if it has an intelligible differentia and a rational nexus with the object of the law.', 'medium', 'articles-14-19-21', 'intermediate', 8),
('33333333-3333-3333-3333-333333333333', 'mock', 'Which Amendment fixed that Articles 20 and 21 cannot be suspended during an Emergency?', '["42nd Amendment, 1976","44th Amendment, 1978","52nd Amendment, 1985","61st Amendment, 1988"]', 1, 'The 44th Amendment Act, 1978 amended Article 359 to protect Articles 20 and 21 absolutely.', 'medium', 'enforcement-amendment-emergency', 'advanced', 9),
('33333333-3333-3333-3333-333333333333', 'mock', 'Untouchability is abolished by which Article?', '["Article 15","Article 16","Article 17","Article 18"]', 2, 'Article 17 abolishes untouchability and makes its practice in any form punishable.', 'easy', 'part-iii-structure', 'beginner', 10);

-- ============ seed: PYQs ============
INSERT INTO public.pyqs (topic_id, year, exam, question_text, options, correct_option, explanation, concept_tag, difficulty) VALUES
('33333333-3333-3333-3333-333333333333', 2021, 'Prelims',
'Which one of the following categories of Fundamental Rights incorporates protection against untouchability as a form of discrimination?',
'["Right against Exploitation","Right to Freedom","Right to Equality","Right to Life"]', 2,
'Abolition of untouchability under Article 17 falls under the Right to Equality (Articles 14-18), not the Right against Exploitation.',
'part-iii-structure', 'easy'),
('33333333-3333-3333-3333-333333333333', 2017, 'Prelims',
'Right to Privacy is protected as an intrinsic part of Right to Life and Personal Liberty. Which of the following in the Constitution of India correctly and appropriately imply the above statement?',
'["Article 14 and the provisions under the 42nd Amendment Act","Article 17 and the Directive Principles of State Policy in Part IV","Article 21 and the freedoms guaranteed in Part III","Article 24 and the provisions under the 44th Amendment Act"]', 2,
'The K.S. Puttaswamy judgment (2017) located privacy in Article 21 read with the freedoms guaranteed in Part III.',
'articles-14-19-21', 'medium'),
('33333333-3333-3333-3333-333333333333', 2018, 'Prelims',
'Consider the following statements:
1. The Parliament cannot enlarge the jurisdiction of the Supreme Court of India as its jurisdiction is limited to that conferred by the Constitution.
2. The officers and servants of the Supreme Court and High Courts are appointed by the concerned Chief Justice and the administrative expenses are charged on the Consolidated Fund.
Which of the statements given above is/are correct?',
'["1 only","2 only","Both 1 and 2","Neither 1 nor 2"]', 1,
'Statement 1 is incorrect: Article 138 allows Parliament to enlarge the Supreme Court''s jurisdiction. Statement 2 is correct.',
'enforcement-amendment-emergency', 'hard'),
('33333333-3333-3333-3333-333333333333', 2019, 'Prelims',
'The Preamble to the Constitution of India is a part of the Constitution and can be amended, but the basic structure cannot be destroyed. This position flows primarily from:',
'["Golaknath case","Kesavananda Bharati case","Berubari Union case","Shankari Prasad case"]', 1,
'Kesavananda Bharati (1973) held the Preamble to be a part of the Constitution, amendable under Article 368 subject to the basic structure.',
'enforcement-amendment-emergency', 'medium'),
('33333333-3333-3333-3333-333333333333', 2020, 'Prelims',
'A legislation which confers on the executive or administrative authority an unguided and uncontrolled discretionary power in the matter of application of law violates which one of the following Articles?',
'["Article 14","Article 19","Article 21","Article 32"]', 0,
'Unguided discretionary power is arbitrary and therefore violates Article 14, following E.P. Royappa and Maneka Gandhi.',
'articles-14-19-21', 'medium'),
('33333333-3333-3333-3333-333333333333', 2022, 'Prelims',
'With reference to the writs issued by the Courts in India, consider the following statements:
1. Mandamus will not lie against a private organisation unless it is entrusted with a public duty.
2. Mandamus will not lie against a Company even though it may be a Government Company.
3. Any public minded person can be a petitioner to move the Court to obtain the writ of Quo Warranto.
Which of the statements given above are correct?',
'["1 and 2 only","2 and 3 only","1 and 3 only","1, 2 and 3"]', 3,
'All three statements are correct as per settled writ jurisprudence.',
'enforcement-amendment-emergency', 'hard');
