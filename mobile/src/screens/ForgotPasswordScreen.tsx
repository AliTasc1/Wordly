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
 * Şifremi unuttum.
 *
 * Gönderim başarılı olduğunda "böyle bir hesap var" demiyoruz, "adres
 * kayıtlıysa gönderdik" diyoruz. Aksi hâlde ekran, bir e-postanın sistemde
 * kayıtlı olup olmadığını isteyen herkese söyleyen bir araca dönüşürdü.
 */
export function ForgotPasswordScreen() {
  const back = useBack('signin');
  const { go } = useGo();
  const { sendReset } = useAuth();

  const [email, setEmail] = useState('');
  const [emailBad, setEmailBad] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ text: string; raw?: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setProblem(null);

    const bad = emailProblem(email);
    setEmailBad(bad);
    if (bad) return;

    setBusy(true);
    const failed = await sendReset(email);
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
            color: colors.accent,
            opacity: 0.13,
            stop: 0.62,
          },
        ]}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={20} w={800}>
            Şifremi unuttum
          </Txt>
        </View>

        <Txt s={13.5} lh={1.55} c={colors.textDim}>
          E-posta adresini yaz; şifreni yenilemen için bir bağlantı gönderelim.
        </Txt>

        <Field
          label="E-posta"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (emailBad) setEmailBad(null);
            if (sent) setSent(false);
          }}
          problem={emailBad}
          placeholder="ornek@eposta.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {problem ? (
          <Notice tone="error" text={problem.text} detail={problem.raw} />
        ) : null}

        {sent ? (
          <Notice
            tone="ok"
            text="Bu adres kayıtlıysa sıfırlama bağlantısını gönderdik."
            detail="Bağlantıya telefonundan tıkla; uygulama açılıp yeni şifreni sorar. Gereksiz (spam) klasörüne de bak."
          />
        ) : null}

        <PrimaryButton
          label={busy ? 'Gönderiliyor…' : sent ? 'Tekrar gönder' : 'Bağlantı gönder'}
          onPress={submit}
          disabled={busy}
        />

        <Spacer />

        <Press
          onPress={() => go('signin')}
          accessibilityRole="button"
          style={styles.center}>
          <Txt f="m" s={13} w={700} c={colors.link}>
            Giriş ekranına dön
          </Txt>
        </Press>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  center: { alignSelf: 'center', paddingVertical: 6 },
});
