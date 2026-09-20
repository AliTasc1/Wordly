import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { Screen, Spacer } from '../components/Screen';
import { BackButton, PrimaryButton, Press } from '../components/Buttons';
import { Field } from '../components/Field';
import { Notice } from '../components/Notice';
import { Txt } from '../components/Txt';
import { emailProblem, MIN_PASSWORD, passwordProblem } from '../server/errors';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';

/**
 * Kayıt.
 *
 * Şifre kuralları alanın altında, denemeden **önce** yazılı. Kuralı sadece
 * ihlal edildiğinde göstermek, kullanıcıya bilmediği bir sınavı geçirmeye
 * çalışmaktır.
 */
export function SignUpScreen() {
  const t = useTheme();
  const styles = useStyles(makeStyles);
  const back = useBack('signin');
  const { go } = useGo();
  const { signUp, resendConfirmation, pendingEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [emailBad, setEmailBad] = useState<string | null>(null);
  const [passwordBad, setPasswordBad] = useState<string | null>(null);
  const [againBad, setAgainBad] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ text: string; raw?: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setProblem(null);

    const e = emailProblem(email);
    const p = passwordProblem(password);
    const a = password !== again ? 'Şifreler birbirini tutmuyor.' : null;
    setEmailBad(e);
    setPasswordBad(p);
    setAgainBad(a);
    if (e || p || a) return;

    setBusy(true);
    const result = await signUp(email, password);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.problem);
      return;
    }
    // Doğrulama gerekiyorsa bu ekranda kalıyoruz; aşağıdaki bekleme görünümü
    // devreye girer. Oturum hemen açıldıysa öğrenmeye devam.
    if (!result.needsConfirmation) go('home');
  };

  const resend = async () => {
    if (!pendingEmail) return;
    setBusy(true);
    const failed = await resendConfirmation(pendingEmail);
    setBusy(false);
    if (failed) setProblem(failed);
    else setSent(true);
  };

  if (pendingEmail) {
    return (
      <Screen
        gap={16}
        glows={[
          {
            rx: 220,
            ry: 170,
            cx: 0.18,
            cy: 0.06,
            color: t.colors.secondary,
            opacity: 0.16,
            stop: 0.62,
          },
        ]}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={20} w={800}>
            E-postanı doğrula
          </Txt>
        </View>

        <Notice
          tone="ok"
          text={`${pendingEmail} adresine bir doğrulama bağlantısı gönderdik.`}
        />

        <Txt s={13.5} lh={1.6} c={t.colors.textDim}>
          Bağlantıya telefonundan tıkla; uygulama kendiliğinden açılıp girişini tamamlar.
          E-posta görünmüyorsa gereksiz (spam) klasörüne bak.
        </Txt>

        {problem ? (
          <Notice tone="error" text={problem.text} detail={problem.raw} />
        ) : null}
        {sent ? <Notice tone="ok" text="E-posta yeniden gönderildi." /> : null}

        <Spacer />

        {!sent ? (
          <Press
            onPress={resend}
            accessibilityRole="button"
            style={styles.center}
            disabled={busy}>
            <Txt f="m" s={13} w={700} c={t.colors.link}>
              E-postayı yeniden gönder
            </Txt>
          </Press>
        ) : null}

        <PrimaryButton label="Giriş ekranına dön" onPress={() => go('signin')} />
      </Screen>
    );
  }

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
            color: t.colors.secondary,
            opacity: 0.16,
            stop: 0.62,
          },
        ]}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={20} w={800}>
            Kayıt ol
          </Txt>
        </View>

        <Txt s={13.5} lh={1.55} c={t.colors.textDim}>
          Hesap, ilerlemeni telefonun dışında da saklar. Telefonunu değiştirdiğinde
          kaldığın yerden devam edersin.
        </Txt>

        <Field
          label="E-posta"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailBad) setEmailBad(null);
          }}
          problem={emailBad}
          placeholder="ornek@eposta.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />

        <Field
          label="Şifre"
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
          label="Şifre (tekrar)"
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
          label={busy ? 'Hesap açılıyor…' : 'Hesap aç'}
          onPress={submit}
          disabled={busy}
        />

        <Press
          onPress={() => go('signin')}
          accessibilityRole="button"
          style={styles.center}>
          <Txt s={13} c={t.colors.textDim}>
            Zaten hesabın var mı?{' '}
            <Txt f="m" s={13} w={700} c={t.colors.link}>
              Giriş yap
            </Txt>
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
