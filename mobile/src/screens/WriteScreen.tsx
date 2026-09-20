import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { tint } from '../theme/tint';
import { Screen } from '../components/Screen';
import { BackButton, Press, PrimaryButton } from '../components/Buttons';
import { Card, Panel } from '../components/Surfaces';
import { AnswerFeedback } from '../components/QuizOption';
import { ProgressBar } from '../components/Progress';
import { Txt } from '../components/Txt';
import { font, radii } from '../theme/tokens';
import { writingOf } from '../content';
import { accepts, diagnose } from '../content/writing';
import { useApp } from '../state/AppContext';
import { useStudySession } from '../state/useStudySession';
import { useBack, useGo } from '../navigation/useGo';

/**
 * 34 · Yazma.
 *
 * Uygulamanın verip tutmadığı tek sözdü: onboarding altı beceri sayıyor,
 * "Yazma" onlardan biri, ama tek bir alıştırma yoktu.
 *
 * Diğer bölümlerden farkı kasıtlı: ekranda İngilizce hiçbir ipucu yok. Şık
 * yok, kelime havuzu yok. Türkçe cümle var, öğrenci İngilizcesini yazıyor.
 * Tanıma ile üretim aynı beceri değildir — şıklar arasından doğruyu bulan
 * öğrenci boş satıra aynı cümleyi yazamayabilir.
 */
export function WriteScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  useStudySession();
  const { go } = useGo();
  const back = useBack('lesson');
  const { cefr, position, setPosition, fire, award, recordMistake } = useApp();

  const sets = useMemo(() => writingOf(cefr), [cefr]);

  const [asked, setAsked] = useState(0);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [right, setRight] = useState(0);
  const [showHint, setShowHint] = useState(false);
  // Serbest yazma bölümü en sonda açılıyor; örnek metin, öğrenci kendi
  // metnini yazmadan gösterilmiyor — gösterilirse kopyalanır.
  const [essay, setEssay] = useState('');
  const [showModel, setShowModel] = useState(false);

  if (!sets.length) {
    return (
      <Screen padTop={62} gap={14}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={font.title} w={800}>
            Yazma
          </Txt>
        </View>
        <Panel gap={8} radius={radii.hero}>
          <Txt s={font.jumbo}>✍️</Txt>
          <Txt f="m" s={font.callout} w={800}>
            {cefr} için yazma henüz hazır değil
          </Txt>
          <Txt s={font.footnote} lh={1.6} c={t.colors.textDim}>
            Yazma setleri seviye seviye yazılıyor. Bu seviye eklendiğinde
            burada görünecek.
          </Txt>
        </Panel>
      </Screen>
    );
  }

  const index = Math.min(position('writing', cefr), sets.length - 1);
  const item = sets[index];
  const done = asked >= item.tasks.length;
  const task = item.tasks[Math.min(asked, item.tasks.length - 1)];

  const correct = checked && accepts(task.answers, typed);
  // Tuzak uymazsa null: uydurma bir teşhis koymaktansa yalnızca doğrusunu
  // göstermek daha dürüst.
  const why = checked && !correct ? diagnose(task.traps, typed) : null;

  const check = () => {
    if (!typed.trim() || checked) return;
    setChecked(true);
    if (accepts(task.answers, typed)) {
      setRight((n) => n + 1);
      award(25);
      fire('Doğru! +25 XP', task.answers[0]);
      return;
    }
    recordMistake({
      kind: 'writing',
      level: cefr,
      id: item.id,
      q: asked,
      text: task.tr,
      answer: task.answers[0],
    });
  };

  const next = () => {
    setChecked(false);
    setTyped('');
    setShowHint(false);
    setAsked((n) => n + 1);
  };

  const finish = () => {
    setPosition('writing', cefr, (index + 1) % sets.length);
    setAsked(0);
    setRight(0);
    setEssay('');
    setShowModel(false);
    go('lesson');
  };

  return (
    /*
      Klavye koruması. Yazma ekranında iki metin kutusu var ve ikisi de
      ekranın alt yarısında; iOS'ta klavye açılınca yazdığın satır klavyenin
      altında kalıyordu. Eylem çubuğu alta sabitlendikten sonra "Kontrol et"
      düğmesi de aynı yere düşecekti, yani sorun büyüyordu.

      Giriş ekranlarında bu sarmalayıcı zaten vardı; burada unutulmuş.
    */
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        padTop={62}
        gap={14}
        footer={
          <PrimaryButton
            label={done ? 'Bölümü bitir' : checked ? 'Sonraki cümle' : 'Kontrol et'}
            height={54}
            size={15.5}
            shadow={t.shadows.ctaBrand}
            onPress={done ? finish : checked ? next : check}
          />
        }>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <View style={styles.flex}>
            <Txt f="m" s={font.callout} w={800}>
              {item.title}
            </Txt>
            <Txt s={font.caption} w={600} c={t.colors.textDim}>
              {item.level} · {index + 1}/{sets.length} · {right}/{item.tasks.length} doğru
            </Txt>
          </View>
        </View>

        <ProgressBar
          pct={(Math.min(asked, item.tasks.length) / item.tasks.length) * 100}
          height={6}
        />

        {/* Setin başındaki uyarı: bu sette Türkçe konuşanı ne zorluyor.
            Hatayı yaptıktan sonra açıklamak yerine önce söylemek, aynı hatayı
            sekiz kez yapmasını önlüyor. */}
        <Panel gap={6} radius={radii.panel}>
          <Txt f="mono" s={font.label} w={700} c={t.colors.accentSoft} ls={0.12}>
            BU SETTE DİKKAT
          </Txt>
          <Txt s={font.footnote} lh={1.55} c={t.colors.textDim}>
            {item.focus}
          </Txt>
        </Panel>

        {done ? (
          <Card gap={12}>
            <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.14}>
              SERBEST YAZMA
            </Txt>
            <Txt f="m" s={font.callout} w={700} lh={1.4}>
              {item.compose.prompt}
            </Txt>

            <TextInput
              value={essay}
              onChangeText={setEssay}
              placeholder="Buraya yaz…"
              placeholderTextColor={t.colors.textGhost}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.essay]}
              accessibilityLabel="Serbest yazma alanı"
            />

            <Txt f="m" s={font.footnote} w={700}>
              Kendi metnini şunlara göre kontrol et
            </Txt>
            {item.compose.checklist.map((line) => (
              <View key={line} style={styles.check}>
                <Txt s={font.caption} c={t.colors.accentSoft}>
                  ☐
                </Txt>
                <Txt s={font.footnote} lh={1.5} c={t.colors.textDim} style={styles.flex}>
                  {line}
                </Txt>
              </View>
            ))}

            {/* Örnek metin puanlama değil, karşılaştırma içindir. Kısa bir
                metni gerçekten değerlendirmek dil modeli ister ve o sunucuda
                çalışmalı; sahte bir puan vermektense karşılaştıracak iyi bir
                örnek vermek daha dürüst. */}
            {showModel ? (
              <Panel gap={6} radius={radii.input}>
                <Txt f="mono" s={font.label} w={700} c={t.colors.successSoft} ls={0.1}>
                  ÖRNEK METİN
                </Txt>
                <Txt s={font.body} lh={1.6}>
                  {item.compose.model}
                </Txt>
                <Txt s={font.caption} lh={1.5} c={t.colors.textFaint}>
                  Tek doğru bu değil. Seninkiyle karşılaştır: hangi cümleyi
                  farklı kurmuşsun?
                </Txt>
              </Panel>
            ) : (
              <Press
                onPress={() => setShowModel(true)}
                disabled={!essay.trim()}
                accessibilityRole="button"
                style={[styles.ghost, !essay.trim() && styles.ghostOff]}>
                <Txt f="m" s={font.footnote} w={700} c={essay.trim() ? t.colors.text : t.colors.textGhost}>
                  {essay.trim() ? 'Örnek metni göster' : 'Önce kendi metnini yaz'}
                </Txt>
              </Press>
            )}
          </Card>
        ) : (
          <Card gap={12}>
            <Txt f="mono" s={font.label} w={700} c={t.colors.textFaint} ls={0.14}>
              {asked + 1}/{item.tasks.length} · İNGİLİZCESİNİ YAZ
            </Txt>
            <Txt f="m" s={font.title} w={700} lh={1.4}>
              {task.tr}
            </Txt>

            <TextInput
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={check}
              editable={!checked}
              placeholder="İngilizcesi…"
              placeholderTextColor={t.colors.textGhost}
              autoCapitalize="sentences"
              autoCorrect={false}
              // Otomatik düzeltme kapalı: telefon "dont" yazınca düzeltirse
              // öğrenci kendi hatasını hiç görmez.
              returnKeyType="done"
              style={[
                styles.input,
                checked && (correct ? styles.inputOk : styles.inputBad),
              ]}
              accessibilityLabel="Cevabını yaz"
            />

            {checked ? (
              <AnswerFeedback
                correct={correct}
                title={correct ? 'Doğru! +25 XP' : `Doğrusu: ${task.answers[0]}`}
                note={why ?? task.hint}
                titleSize={13.5}
                noteSize={12}
                radius={radii.card}
              />
            ) : showHint ? (
              <Panel gap={0} radius={radii.input}>
                <Txt s={font.footnote} lh={1.5} c={t.colors.textDim}>
                  💡 {task.hint}
                </Txt>
              </Panel>
            ) : (
              <Press
                onPress={() => setShowHint(true)}
                accessibilityRole="button"
                style={styles.ghost}>
                <Txt f="m" s={font.footnote} w={700} c={t.colors.textDim}>
                  İpucu ver
                </Txt>
              </Press>
            )}

            {/* Birden fazla doğru varsa söyleniyor: öğrenci kendi yazdığı da
                doğruyken "doğrusu bu" görüp kafası karışmasın. */}
            {checked && !correct && task.answers.length > 1 ? (
              <Txt s={font.caption} lh={1.5} c={t.colors.textFaint}>
                Şu da kabul edilirdi: {task.answers.slice(1).join(' · ')}
              </Txt>
            ) : null}
          </Card>
        )}

      </Screen>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: { flex: 1 },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: t.alpha.w14,
      backgroundColor: t.alpha.w04,
      borderRadius: radii.input,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: t.colors.text,
      fontSize: 15.5,
    },
    essay: { minHeight: 120 },
    inputOk: { borderColor: tint(t.colors.success, 0.55), backgroundColor: tint(t.colors.success, 0.08) },
    inputBad: { borderColor: tint(t.colors.error, 0.55), backgroundColor: tint(t.colors.error, 0.08) },
    ghost: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: t.alpha.w12,
      borderRadius: radii.chip,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    ghostOff: { borderColor: t.alpha.w07 },
    check: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  });
