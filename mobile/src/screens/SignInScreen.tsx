import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { BackButton, PrimaryButton, Press } from '../components/Buttons';
import { Field } from '../components/Field';
import { Notice } from '../components/Notice';
import { Txt } from '../components/Txt';
import { colors } from '../theme/tokens';
import { emailProblem } from '../server/errors';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';

/**
 * Giriş.
 *
 * Hesap isteğe bağlı olduğu için bu ekran bir duvar değil, bir kapı: geri
 * dönülebiliyor ve "hesapsız devam et" bağlantısı duruyor. İlerlemeyi zaten
 * telefon tutuyor; giriş yalnızca onu ikinci bir cihaza taşımak için.
 */
export function SignInScreen() {
  const back = useBack('settings');
  const { go } = useGo();
  const {
    signIn,
    resendConfirmation,
    pendingEmail,
    clearPending,
    linkProblem,
    clearLinkProblem,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailBad, setEmailBad] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ text: string; raw?: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setProblem(null);
    clearLinkProblem();

    const bad = emailProblem(email);
    setEmailBad(bad);
    if (bad) return;
    if (!password) {
      setProblem({ text: 'Şifreni gir.' });
      return;
    }

    setBusy(true);
    const failed = await signIn(email, password);
    setBusy(false);
    if (failed) {
      setProblem(failed);
      return;
    }
    go('home');
  };

  const resend = async () => {
    if (!pendingEmail) return;
    setBusy(true);
    const failed = await resendConfirmation(pendingEmail);
    setBusy(false);
    if (failed) setProblem(failed);
    else setSent(true);
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
            color: colors.primary,
            opacity: 0.16,
            stop: 0.62,
          },
        ]}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={20} w={800}>
            Giriş yap
          </Txt>
        </View>

        <Txt s={13.5} lh={1.55} c={colors.textDim}>
          İlerlemen bu telefonda zaten kayıtlı. Giriş yapmak onu diğer cihazlarına da
          taşır.
        </Txt>

        {linkProblem ? (
          <Notice tone="error" text={linkProblem.text} detail={linkProblem.raw} />
        ) : null}

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
          returnKeyType="next"
        />

        <Field
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          secret
          placeholder="••••••••"
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        <Press
          onPress={() => go('forgot')}
          accessibilityRole="button"
          style={styles.linkRow}>
          <Txt f="m" s={13} w={700} c={colors.link}>
            Şifremi unuttum
          </Txt>
        </Press>

        {problem ? (
          <Notice tone="error" text={problem.text} detail={problem.raw} />
        ) : null}

        {/* Doğrulanmamış e-posta, şifre hatasından farklı bir sorun: şifre
            doğru olsa bile giriş olmaz. Kullanıcıyı şifresini değiştirmeye
            göndermek yerine gerçek engeli ve çözümünü gösteriyoruz. */}
        {pendingEmail ? (
          <View style={styles.pending}>
            <Notice
              tone="info"
              text={`${pendingEmail} adresine gönderdiğimiz doğrulama bağlantısına tıklaman gerekiyor.`}
            />
            {sent ? (
              <Notice tone="ok" text="Doğrulama e-postası yeniden gönderildi." />
            ) : (
              <Press onPress={resend} accessibilityRole="button" style={styles.linkRow}>
                <Txt f="m" s={13} w={700} c={colors.link}>
                  E-postayı yeniden gönder
                </Txt>
              </Press>
            )}
          </View>
        ) : null}

        <PrimaryButton
          label={busy ? 'Giriş yapılıyor…' : 'Giriş yap'}
          onPress={submit}
          disabled={busy}
        />

        <Press
          onPress={() => {
            clearPending();
            go('signup');
          }}
          accessibilityRole="button"
          style={styles.center}>
          <Txt s={13} c={colors.textDim}>
            Hesabın yok mu?{' '}
            <Txt f="m" s={13} w={700} c={colors.link}>
              Kayıt ol
            </Txt>
          </Txt>
        </Press>

        <Spacer />

        <Press
          onPress={() => go('home')}
          accessibilityRole="button"
          style={styles.center}>
          <Txt f="m" s={13} w={700} c={colors.textGhost}>
            Hesapsız devam et
          </Txt>
        </Press>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkRow: { alignSelf: 'flex-start', paddingVertical: 2 },
  center: { alignSelf: 'center', paddingVertical: 6 },
  pending: { gap: 8 },
});
