import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Screen, Spacer } from '../components/Screen';
import { BackButton, PrimaryButton, Press } from '../components/Buttons';
import { Field } from '../components/Field';
import { Notice } from '../components/Notice';
import { Txt } from '../components/Txt';
import { alpha, colors, radii } from '../theme/tokens';
import {
  fetchParticipation,
  nameProblem,
  NAME_MAX,
  setParticipation,
} from '../server/leaderboard';
import { useApp } from '../state/AppContext';
import { useAuth } from '../state/AuthContext';
import { useBack, useGo } from '../navigation/useGo';

/**
 * Liderlik tablosuna katılım.
 *
 * Katılım **varsayılan olarak kapalı** ve bu ekran onu açmanın tek yolu.
 * Tersi, hesap açan herkesin adını ve çalışma temposunu diğer bütün
 * kullanıcılara göstermek olurdu; kimse bunu istemeden vermiş olmamalı.
 *
 * Ne paylaşıldığı burada açıkça yazılı. "Katıl" düğmesine basan kişi tam
 * olarak neyin görüneceğini bilmeli — sonradan öğrenilen bir paylaşım,
 * paylaşım değil sürprizdir.
 */
export function BoardJoinScreen() {
  const back = useBack('settings');
  const { go } = useGo();
  const { user } = useAuth();
  const { fire } = useApp();

  const [name, setName] = useState('');
  const [optIn, setOptIn] = useState(false);
  const [nameBad, setNameBad] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ text: string; raw?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setLoading(false);
      return;
    }
    void fetchParticipation(user.id).then((result) => {
      if (!alive) return;
      if (result.ok) {
        setOptIn(result.value.optIn);
        setName(result.value.displayName ?? '');
      } else {
        setProblem(result.problem);
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) {
    return (
      <Screen padTop={62} gap={16}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={20} w={800}>
            Liderlik
          </Txt>
        </View>
        <Notice tone="info" text="Liderlik tablosu için önce hesap açman gerekiyor." />
        <PrimaryButton label="Giriş yap" onPress={() => go('signin')} />
      </Screen>
    );
  }

  const join = async () => {
    setProblem(null);
    const bad = nameProblem(name);
    setNameBad(bad);
    if (bad) return;

    setBusy(true);
    const failed = await setParticipation(user.id, true, name);
    setBusy(false);
    if (failed) {
      setProblem(failed);
      return;
    }
    setOptIn(true);
    fire('Tabloya katıldın', 'Bu haftaki XP’n sıralamaya giriyor');
  };

  const leave = async () => {
    setProblem(null);
    setBusy(true);
    // Ad silinmiyor: yarın tekrar katılmak isteyen biri adını yeniden
    // yazmak zorunda kalmasın.
    const failed = await setParticipation(user.id, false);
    setBusy(false);
    if (failed) {
      setProblem(failed);
      return;
    }
    setOptIn(false);
    fire('Tablodan çıktın', 'Adın artık kimseye görünmüyor');
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen padTop={62} gap={16}>
        <View style={styles.header}>
          <BackButton onPress={back} />
          <Txt f="m" s={20} w={800}>
            Liderlik
          </Txt>
        </View>

        {loading ? (
          <Txt s={13} c={colors.textDim}>
            Yükleniyor…
          </Txt>
        ) : (
          <>
            <Txt s={13.5} lh={1.6} c={colors.textDim}>
              Haftalık tablo, katılmayı seçen kullanıcıların bu hafta kazandığı XP’yi
              sıralar. Pazartesi sıfırlanır.
            </Txt>

            {/* Ne paylaşıldığı ve ne paylaşılmadığı yan yana. İkincisi en az
                birincisi kadar önemli: insanlar çoğu zaman neyin
                paylaşılmadığını merak eder. */}
            <View style={styles.sheet}>
              <Txt f="mono" s={10} w={700} c={colors.textDisabled} ls={0.14}>
                KATILIRSAN GÖRÜNEN
              </Txt>
              <Txt s={12.5} lh={1.6} c={colors.textSubtle}>
                · Seçtiğin ad{'\n'}· Bu hafta kazandığın XP
              </Txt>

              <View style={styles.rule} />

              <Txt f="mono" s={10} w={700} c={colors.textDisabled} ls={0.14}>
                GÖRÜNMEYEN
              </Txt>
              <Txt s={12.5} lh={1.6} c={colors.textSubtle}>
                · E-posta adresin{'\n'}· Seviyen ve ders ilerlemen{'\n'}· Hata defterin ve
                kaydettiğin kelimeler
              </Txt>
            </View>

            <Field
              label="Tabloda görünecek ad"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (nameBad) setNameBad(null);
              }}
              problem={nameBad}
              hint={`En fazla ${NAME_MAX} karakter. Gerçek adın olmak zorunda değil.`}
              placeholder="Örn. Ali T."
              maxLength={NAME_MAX}
              autoCapitalize="words"
              autoCorrect={false}
            />

            {problem ? (
              <Notice tone="error" text={problem.text} detail={problem.raw} />
            ) : null}

            {optIn ? (
              <Notice tone="ok" text="Tablodasın. Adın diğer kullanıcılara görünüyor." />
            ) : (
              <Notice
                tone="info"
                text="Şu an tabloda değilsin. Adın kimseye görünmüyor."
              />
            )}

            {optIn ? (
              <>
                <PrimaryButton
                  label={busy ? 'Kaydediliyor…' : 'Adı güncelle'}
                  onPress={join}
                  disabled={busy}
                />
                <Press onPress={leave} disabled={busy} style={styles.leave}>
                  <Txt f="m" s={13.5} w={700} c={colors.errorSoft}>
                    Tablodan çık
                  </Txt>
                </Press>
              </>
            ) : (
              <PrimaryButton
                label={busy ? 'Katılıyor…' : 'Tabloya katıl'}
                onPress={join}
                disabled={busy}
              />
            )}

            <Spacer />

            <Press onPress={() => go('board')} style={styles.center}>
              <Txt f="m" s={13} w={700} c={colors.link}>
                Tabloyu gör
              </Txt>
            </Press>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheet: {
    gap: 7,
    padding: 15,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: alpha.w08,
    backgroundColor: colors.surface,
  },
  rule: { height: 1, backgroundColor: alpha.w08, marginVertical: 5 },
  leave: {
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: 'rgba(255,77,94,.3)',
    backgroundColor: 'rgba(255,77,94,.1)',
  },
  center: { alignSelf: 'center', paddingVertical: 6 },
});
