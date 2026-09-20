import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen } from '../components/Screen';
import { BackButton, GhostButton } from '../components/Buttons';
import { Card, StatTile } from '../components/Surfaces';
import { AnswerFeedback, QuizOption } from '../components/QuizOption';
import { GlossedText } from '../components/GlossedText';
import { ReadingArt } from '../components/art/ReadingArt';
import { StepFooter } from '../components/StepFooter';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { readingOf } from '../content';
import { artFor } from '../content/reading-art';
import { useQuiz } from '../state/useQuiz';
import { useApp } from '../state/AppContext';
import { useStudySession } from '../state/useStudySession';
import { useBack, useGo } from '../navigation/useGo';

/** 13 · Okuma — passage with tappable words and a comprehension check. */
export function ReadScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  useStudySession();
  const { go } = useGo();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, award, recordMistake } = useApp();

  const items = useMemo(() => readingOf(cefr), [cefr]);
  const index = Math.min(position('reading', cefr), items.length - 1);
  const item = items[index];

  // Görsel parça değişince değişiyor; her çizimde harita sorgulamanın anlamı yok.
  const art = useMemo(() => artFor(item.id), [item.id]);

  const [asked, setAsked] = useState(0);
  const [right, setRight] = useState(0);
  const [showTr, setShowTr] = useState(false);
  const question = item.questions[asked];

  // The quiz hook locks on the first tap, so it has to be remounted for each
  // question. Keying it on the passage and question index does that.
  const quiz = useQuiz(question.answer, (_, correct) => {
    if (correct) {
      setRight((n) => n + 1);
      award(20);
      fire('Doğru! +20 XP', question.note);
      return;
    }
    recordMistake({
      kind: 'reading',
      level: cefr,
      id: item.id,
      q: asked,
      text: question.q,
      answer: question.options[question.answer],
    });
  });

  const last = asked === item.questions.length - 1;

  const nextQuestion = () => {
    // `useQuiz` locks after the first tap and keeps that lock in state, so the
    // lock has to be released explicitly before the next question is shown.
    quiz.reset();
    if (last) {
      setPosition('reading', cefr, (index + 1) % items.length);
      setAsked(0);
      setRight(0);
      setShowTr(false);
      go('speak');
      return;
    }
    setAsked((n) => n + 1);
  };

  return (
    <Screen
      padTop={62}
      gap={14}
      footer={
        <StepFooter
          label={last ? 'Sonraki bölüm · Konuşma' : 'Sonraki soru'}
          onPress={nextQuestion}
          onExit={last ? back : undefined}
        />
      }>
      <View style={styles.header}>
        <BackButton onPress={back} />
        <View style={styles.flex}>
          <Txt f="m" s={font.callout} w={800}>
            {item.title}
          </Txt>
          <Txt s={font.caption} w={600} c={t.colors.textDim}>
            {item.level} · {item.minutes} dk · {index + 1}/{items.length}
          </Txt>
        </View>
        {item.textTr ? (
          <GhostButton
            label={showTr ? 'EN' : 'TR'}
            height={30}
            radius={radii.chipSm}
            size={11}
            fill={t.alpha.w06}
            onPress={() => setShowTr((v) => !v)}
          />
        ) : null}
      </View>

      <View style={styles.article}>
        {/* Görseli üretilmiş parça fotoğrafı gösteriyor; üretilmemiş olan
            başlığı taşıyan çizilmiş bir kapakta kalıyor. İkisi de 16:9,
            böylece görseller parça parça geldikçe ekran zıplamıyor. */}
        {art != null ? (
          <Image
            source={art}
            style={styles.art}
            resizeMode="cover"
            // Görsel metnin tekrarı değil, girişi: ekran okuyucu için parçanın
            // başlığını söylemek, "dekoratif" deyip geçmekten de, sahneyi
            // uydurup anlatmaktan da doğru.
            accessible
            accessibilityRole="image"
            accessibilityLabel={`${item.title} — konu görseli`}
          />
        ) : (
          <ReadingArt id={item.id} title={item.title} />
        )}
        {showTr && item.textTr ? (
          <Txt s={font.callout} lh={1.75} c={t.colors.textBright}>
            {item.textTr}
          </Txt>
        ) : (
          <GlossedText
            text={item.text}
            glossary={item.glossary}
            onWord={(gloss) => fire(gloss.w, gloss.tr)}
          />
        )}
        <Txt s={font.footnote} lh={1.7} c={t.colors.textFaint}>
          Altı çizili kelimelere dokunarak Türkçesini görebilirsin.
        </Txt>
      </View>

      <Card>
        <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.14}>
          SORU {asked + 1}/{item.questions.length}
        </Txt>
        <Txt f="m" s={font.title} w={700} lh={1.4}>
          {question.q}
        </Txt>
        {question.options.map((option, i) => (
          <QuizOption
            key={`${asked}-${option}`}
            label={option}
            mark={quiz.markOf(i)}
            state={quiz.stateOf(i)}
            onPress={() => quiz.pick(i)}
          />
        ))}
        {quiz.answered ? (
          <AnswerFeedback
            correct={quiz.correct}
            title={
              quiz.correct
                ? 'Doğru! +20 XP'
                : `Yanlış — doğrusu: ${question.options[question.answer]}`
            }
            note={question.note}
            titleSize={13.5}
            noteSize={12}
            radius={radii.card}
          />
        ) : null}
      </Card>

      <View style={styles.stats}>
        <StatTile value={`${right}/${item.questions.length}`} label="doğru" tint={t.colors.accent} />
        <StatTile value={`${item.minutes} dk`} label="okuma süresi" tint={t.colors.successSoft} />
        <StatTile
          value={String(item.glossary.length)}
          label="yeni kelime"
          tint={t.colors.warning}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    // Yer tutucu 132 piksel sabitti; görsel öyle değil. Üretim araçlarının
    // tamamına yakını 16:9 veriyor ve sabit yüksekliğe sığdırmak, her görselin
    // üstünü altını kırpmak demekti — kadrajı kuran taraf biz olmadığımız için
    // neyin kesileceğini de bilemezdik. Oran veriliyor, yükseklik genişlikten
    // çıkıyor.
    art: { width: '100%', aspectRatio: 16 / 9, borderRadius: radii.input },
    article: {
      backgroundColor: t.colors.sunken,
      borderWidth: 1,
      borderColor: t.alpha.w08,
      borderRadius: radii.section,
      padding: 18,
      gap: 12,
    },
    stats: { flexDirection: 'row', gap: 10 },
  });
