import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen, Spacer } from '../components/Screen';
import { Gradient } from '../components/Gradient';
import { BackButton, Press } from '../components/Buttons';
import { SkillBar } from '../components/Progress';
import { REC_WAVE, Waveform } from '../components/Waveform';
import { FadeIn } from '../components/motion';
import { Txt } from '../components/Txt';
import { alpha, colors, gradients, radii } from '../theme/tokens';
import { SPEAKING } from '../data/play';
import { useApp } from '../state/AppContext';
import { useBack } from '../navigation/useGo';

/** 14 · Konuşma — AI role play with recording states and a five-axis score. */
export function SpeakScreen() {
  const back = useBack('lesson');
  const { fire } = useApp();
  const [recording, setRecording] = useState(false);
  const [scored, setScored] = useState(false);

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (recording) fire(SPEAKING.toasts.recorded.title, SPEAKING.toasts.recorded.note);
    setRecording((r) => !r);
  };

  return (
    <Screen
      padTop={0}
      padH={0}
      padBottom={34}
      gap={0}
      glows={[
        { rx: 210, ry: 160, cx: 0.5, cy: 0.08, color: colors.secondary, opacity: 0.24, stop: 0.62 },
      ]}>
      <View style={styles.header}>
        <BackButton onPress={back} strong />
        <View style={styles.teacher}>
          <Gradient colors={gradients.violetCyan} style={styles.teacherBadge}>
            <Txt f="m" s={13} w={800}>
              AI
            </Txt>
          </Gradient>
          <View>
            <Txt f="m" s={15} w={800}>
              {SPEAKING.teacher.name}
            </Txt>
            <Txt s={11} w={600} c={colors.successSoft}>
              {SPEAKING.teacher.status}
            </Txt>
          </View>
        </View>
        <Press
          onPress={() => {
            setScored(true);
            setRecording(false);
          }}
          style={styles.finish}>
          <Txt f="m" s={11.5} w={700} c={colors.textSubtle}>
            {SPEAKING.finish}
          </Txt>
        </Press>
      </View>

      <View style={styles.chat}>
        <View style={styles.scenario}>
          <Txt s={11} w={600} c={colors.textDim}>
            {SPEAKING.scenario}
          </Txt>
        </View>

        {SPEAKING.chat.map((message, i) => {
          const ai = message.from === 'ai';
          return (
            <View
              key={i}
              style={[styles.bubbleRow, { justifyContent: ai ? 'flex-start' : 'flex-end' }]}>
              {ai ? (
                <View style={[styles.bubble, styles.bubbleAi]}>
                  <Txt s={13.5} lh={1.55}>
                    {message.text}
                  </Txt>
                  <Txt s={11.5} lh={1.45} c={colors.textFaint} style={styles.translation}>
                    {message.tr}
                  </Txt>
                </View>
              ) : (
                <Gradient
                  colors={['rgba(46,107,255,.85)', 'rgba(124,92,255,.85)']}
                  style={[styles.bubble, styles.bubbleMe]}>
                  <Txt s={13.5} lh={1.55}>
                    {message.text}
                  </Txt>
                  <Txt s={11.5} lh={1.45} c="rgba(255,255,255,.72)" style={styles.translation}>
                    {message.tr}
                  </Txt>
                </Gradient>
              )}
            </View>
          );
        })}
      </View>

      {scored ? (
        <FadeIn duration={300} style={styles.scoreWrap}>
          <Gradient deg={180} colors={gradients.cardHigh} style={styles.score}>
            <View style={styles.scoreHead}>
              <Txt f="m" s={15} w={800}>
                {SPEAKING.score.title}
              </Txt>
              <Txt f="m" s={24} w={800} c={colors.accent}>
                {SPEAKING.score.total}
              </Txt>
            </View>
            {SPEAKING.score.axes.map((axis) => (
              <SkillBar
                key={axis.name}
                name={axis.name}
                value={String(axis.value)}
                pct={axis.value}
                from={axis.value < 70 ? colors.warning : colors.success}
                to={axis.value < 70 ? colors.warningText : colors.accent}
                nameWidth={86}
                valueWidth={30}
                barHeight={6}
              />
            ))}
            <View style={styles.tip}>
              <Txt f="m" s={11.5} w={700} c={colors.warningSoft}>
                {SPEAKING.score.tipTitle}
              </Txt>
              <Txt s={12.5} lh={1.55} c={colors.textBright} style={styles.tipBody}>
                {SPEAKING.score.tipBefore}
                <Txt s={12.5} w={700}>
                  {SPEAKING.score.tipWords[0]}
                </Txt>
                {', '}
                <Txt s={12.5} w={700}>
                  {SPEAKING.score.tipWords[1]}
                </Txt>
                {SPEAKING.score.tipAfter}
              </Txt>
            </View>
          </Gradient>
        </FadeIn>
      ) : null}

      <Spacer />

      <View style={styles.recorder}>
        <Txt s={12} w={600} c={colors.textDim}>
          {recording ? SPEAKING.recording.live : SPEAKING.recording.idle}
        </Txt>
        <Waveform heights={REC_WAVE} idle={!recording} height={36} style={styles.recWave} />

        <Press
          onPress={toggleRecording}
          scale={0.95}
          accessibilityRole="button"
          accessibilityLabel={recording ? 'Kaydı durdur' : 'Kayda başla'}>
          <Gradient
            colors={recording ? gradients.danger : gradients.brand}
            style={[styles.mic, recording ? styles.micLive : styles.micIdle]}>
            <Txt s={recording ? 24 : 28}>{recording ? '■' : '🎙'}</Txt>
          </Gradient>
        </Press>

        <View style={styles.recActions}>
          <Press
            onPress={() => fire(SPEAKING.toasts.hint.title, SPEAKING.toasts.hint.note)}
            style={styles.recAction}>
            <Txt f="m" s={12} w={700} c={colors.textSubtle}>
              {SPEAKING.actions.hint}
            </Txt>
          </Press>
          <Press
            onPress={() => fire(SPEAKING.toasts.slow.title, SPEAKING.toasts.slow.note)}
            style={styles.recAction}>
            <Txt f="m" s={12} w={700} c={colors.textSubtle}>
              {SPEAKING.actions.slow}
            </Txt>
          </Press>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 62,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  teacherBadge: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  finish: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: alpha.w14,
    backgroundColor: alpha.w05,
  },
  chat: { paddingHorizontal: 18, gap: 10 },
  scenario: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.chip,
    backgroundColor: alpha.w05,
  },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '78%', paddingVertical: 12, paddingHorizontal: 14 },
  bubbleAi: {
    backgroundColor: colors.surfaceBubble,
    borderWidth: 1,
    borderColor: alpha.w10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
  },
  bubbleMe: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 18,
  },
  translation: { marginTop: 5 },
  scoreWrap: { marginTop: 14, paddingHorizontal: 18 },
  score: {
    borderWidth: 1,
    borderColor: alpha.w10,
    borderRadius: radii.section,
    padding: 16,
    gap: 11,
  },
  scoreHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tip: {
    backgroundColor: 'rgba(245,165,36,.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,165,36,.26)',
    borderRadius: radii.card,
    padding: 12,
  },
  tipBody: { marginTop: 3 },
  recorder: { paddingTop: 16, paddingHorizontal: 18, alignItems: 'center', gap: 12 },
  recWave: { width: '100%' },
  mic: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  micIdle: {
    boxShadow: '0px 0px 0px 10px rgba(46,107,255,.12), 0px 18px 40px rgba(46,107,255,.42)',
  },
  micLive: {
    boxShadow: '0px 0px 0px 12px rgba(255,77,94,.16), 0px 18px 40px rgba(255,77,94,.4)',
  },
  recActions: { flexDirection: 'row', gap: 8 },
  recAction: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: alpha.w12,
    backgroundColor: alpha.w04,
  },
});
