-- Expand practice/exam coverage across JLPT levels so simulator sections are available.
INSERT INTO public.practice_questions
  (level, topic, section, prompt, display_text, options, correct_index, explanation, is_exam_ready)
VALUES
  ('N4','vocabulary','vocabulary','Choose the best meaning.','けんこう','{"weather","health","station","culture"}',1,'けんこう means health.', true),
  ('N4','grammar','grammar','Fill in the blank: 日本へ行ったこと___あります。','日本へ行ったこと___あります。','{"が","は","を","に"}',1,'Pattern is 〜たことはあります.', true),
  ('N4','reading','reading','Choose the best interpretation.','あしたはあめがふるでしょう。','{"It may rain tomorrow.","It rained yesterday.","It is sunny today.","It will snow tomorrow."}',0,'でしょう indicates probability.', true),
  ('N4','listening','listening','Listening placeholder: choose the likely response.','だいじょうぶです。','{"I am fine.","Please wait.","Turn left.","I am hungry."}',0,'だいじょうぶです = I am okay.', true),
  ('N3','vocabulary','vocabulary','Choose the best meaning.','らしい','{"strict","seems / apparently","suddenly","deeply"}',1,'らしい can express appearance/hearsay.', true),
  ('N3','grammar','grammar','Choose the correct form.','日本語が上手になる___毎日練習しています。','{"ように","ばかり","ほど","しか"}',0,'Goal/result pattern 〜ように.', true),
  ('N3','reading','reading','Choose the best summary.','ニュースによると、来月から新しい制度が始まるそうです。','{"A new policy starts next month.","The system ended last month.","A company closed today.","The weather is changing."}',0,'そうです reports information.', true),
  ('N3','listening','listening','Listening placeholder: choose likely meaning.','たった今終わったばかりです。','{"It finished just now.","It starts tomorrow.","It never ended.","It was delayed."}',0,'ばかりです = just finished.', true),
  ('N2','vocabulary','vocabulary','Choose the best meaning.','観点','{"point of view","train line","deadline","shelf"}',0,'観点 means viewpoint.', true),
  ('N2','grammar','grammar','Choose the best fit.','規則上、この書類は提出する___なっている。','{"ことに","ように","ほどに","のみで"}',0,'〜ことになっている = it is مقرر/decided.', true),
  ('N2','reading','reading','Choose the best summary.','筆者は効率だけを重視する働き方に疑問を投げかけている。','{"The author questions efficiency-only work culture.","The author supports longer meetings.","The author discusses weather policy.","The author explains train delays."}',0,'Core idea is critique of efficiency-only mindset.', true),
  ('N2','listening','listening','Listening placeholder: choose likely meaning.','その点につきましては、再度検討いたします。','{"We will reconsider that point.","We have already finished.","Please submit today.","That is impossible."}',0,'再度検討いたします = we will reconsider.', true),
  ('N1','vocabulary','vocabulary','Choose the best meaning.','顕著','{"remarkable","temporary","mild","costly"}',0,'顕著 means remarkable/notable.', true),
  ('N1','grammar','grammar','Choose the best fit.','環境問題は一国だけで解決できる___。','{"ものではない","わけがある","ばかりである","こともない"}',0,'It is not something solvable by one country alone.', true),
  ('N1','reading','reading','Choose the best summary.','筆者は、情報の氾濫が判断力そのものを鈍らせる危険を指摘している。','{"Too much information can dull judgment.","Information always improves decisions.","The article is about sports training.","The writer praises social media advertising."}',0,'Main point is danger of information overload.', true),
  ('N1','listening','listening','Listening placeholder: choose likely meaning.','本件につきましては、先送りせず早急に対処すべきだ。','{"It should be addressed promptly.","It should be ignored.","It was solved last year.","It requires no action."}',0,'早急に対処 = address promptly.', true)
ON CONFLICT DO NOTHING;
