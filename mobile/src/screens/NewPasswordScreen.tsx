import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen, Spacer } from '../components/Screen';
import { PrimaryButton, Press } from '../components/Buttons';
import { Field } from '../components/Field';
import { Notice } from '../components/Notice';
import { Txt } from '../components/Txt';
import { MIN_PASSWORD, passwordProblem } from '../server/errors';
import { useAuth } from '../state/AuthContext';
import { useGo } from '../navigation/useGo';

/**
 * Yeni şifre.
 *
 * Buraya yalnızca e-postadaki sıfırlama bağlantısıyla gelinir; o bağlantı
 * geçici bir oturum açtığı için şifre değiştirilebiliyor. Geri düğmesi yok:
 * yarıda bırakmak, açık ama sahibinin şifresini bilmediği bir oturum
 * bırakmak olurdu. Vazgeçmenin yolu çıkış yapmak.
 */
export function NewPasswordScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const { go } = useGo();
  const { updatePassword, signOut, user } = useAuth();

  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [passwordBad, setPasswordBad] = useState<string | null>(null);
  const [againBad, setAgainBad] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ text: string; raw?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setProblem(null);

    const p = passwordProblem(password);
    const a = password !== again ? 'Şifreler birbirini tutmuyor.' : null;
    setPasswordBad(p);
    setAgainBad(a);
    if (p || a) return;

    setBusy(true);
    const failed = await updatePassword(password);
    setBusy(false);
    if (failed) {
      setProblem(failed);
      return;
    }
    go('home');
  };

  const cancel = async () => {
    await signOut();
    go('signin');
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        gap={16}
        glows={[
          {
            rx: 220,
            ry: 170,
            cx: 0.18,
            cy: 0.06,
            color: t.colors.primary,
            opacity: 0.16,
            stop: 0.62,
          },
        ]}>
        <View style={styles.header}>
          <Txt f="m" s={20} w={800}>
            Yeni şifre belirle
          </Txt>
        </View>

        <Txt s={13.5} lh={1.55} c={t.colors.textDim}>
          {user?.email
            ? `${user.email} hesabı için yeni bir şifre seç.`
            : 'Hesabın için yeni bir şifre seç.'}
        </Txt>

        <Field
          label="Yeni şifre"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            if (passwordBad) setPasswordBad(null);
          }}
          problem={passwordBad}
          hint={`En az ${MIN_PASSWORD} karakter, en az bir harf ve bir rakam.`}
          secret
          placeholder="••••••••"
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />

        <Field
          label="Yeni şifre (tekrar)"
          value={again}
          onChangeText={(v) => {
            setAgain(v);
            if (againBad) setAgainBad(null);
          }}
          problem={againBad}
          secret
          placeholder="••••••••"
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={submit}
        />

        {problem ? (
          <Notice tone="error" text={problem.text} detail={problem.raw} />
        ) : null}

        <PrimaryButton
          label={busy ? 'Kaydediliyor…' : 'Şifreyi kaydet'}
          onPress={submit}
          disabled={busy}
        />

        <Spacer />

        <Press onPress={cancel} accessibilityRole="button" style={styles.center}>
          <Txt f="m" s={13} w={700} c={t.colors.textGhost}>
            Vazgeç ve çıkış yap
          </Txt>
        </Press>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    fill: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    center: { alignSelf: 'center', paddingVertical: 6 },
  });
