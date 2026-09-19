import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, watchAppStateForTokenRefresh } from '../server/client';
import { authRedirectUrl, watchAuthLinks } from '../server/deepLink';
import { problemOf, type Problem } from '../server/errors';

/**
 * Hesap durumu.
 *
 * Tasarım kararı: **hesap zorunlu değil.** Uygulama telefonda kendi başına
 * çalışıyor; sunucu yalnızca ilerlemeyi cihazlar arasında taşımak için var.
 * Öğrenmeye başlamadan önce kayıt olmayı dayatmak, henüz hiçbir şey vermeden
 * bedel istemek olurdu. Bu yüzden `AuthProvider` hiçbir zaman ekranı
 * kilitlemez: oturum okunurken bile alttaki uygulama çizilir.
 */
type AuthValue = {
  /** Oturum yoksa `null`. Bu bir hata değil, geçerli bir durum. */
  session: Session | null;
  user: User | null;
  /** İlk oturum okuması sürüyor. Ekranı kilitlemek için değil, düğmeleri beklemeye almak için. */
  loading: boolean;

  /**
   * Kayıt sonucu.
   *
   * `pendingEmail` durumuna bakmak yetmiyordu: `signUp` onu ayarlasa bile
   * çağıran fonksiyonun elindeki değer o anki render'dan kalma eski değerdir,
   * yani ekran "doğrulama bekleniyor" durumunu göremeden ana sayfaya atardı.
   * Sonucu doğrudan döndürüyoruz.
   */
  signUp: (
    email: string,
    password: string,
  ) => Promise<
    { ok: true; needsConfirmation: boolean } | { ok: false; problem: Problem }
  >;
  signIn: (email: string, password: string) => Promise<Problem | null>;
  sendReset: (email: string) => Promise<Problem | null>;
  resendConfirmation: (email: string) => Promise<Problem | null>;
  updatePassword: (password: string) => Promise<Problem | null>;
  signOut: () => Promise<Problem | null>;

  /**
   * Hesabı ve sunucudaki tüm veriyi siler. Geri alınamaz.
   *
   * App Store 5.1.1(v) bunu uygulama içinde sunmayı zorunlu tutuyor, ama
   * kural olmasa da olmalıydı: veriyi vermeyi iki dokunuşa indirip geri
   * almayı e-posta yazmaya bağlamak, rızayı tek yönlü bir kapı yapar.
   *
   * Telefondaki ilerlemeye dokunmaz. Silinen, sunucudaki kopyadır; öğrenci
   * hesabından vazgeçtiğinde aylarca biriktirdiği ilerlemeyi de kaybetmek
   * zorunda değil. Telefondaki veriyi ayrıca silmek isteyen için Ayarlar'da
   * sıfırlama zaten var.
   */
  deleteAccount: () => Promise<Problem | null>;

  /**
   * Kayıt oldu ama e-posta henüz doğrulanmadı.
   *
   * Supabase doğrulama açıkken oturum açmaz ve hata da döndürmez — sadece
   * boş bir oturum verir. O sessiz durumu ekrana anlatabilmek için burada
   * tutuyoruz.
   */
  pendingEmail: string | null;
  clearPending: () => void;

  /** E-postadaki sıfırlama bağlantısı açıldı; yeni şifre bekleniyor. */
  recovering: boolean;
  /** Bağlantı bozuk ya da süresi dolmuşsa sebebi. Ekran bunu gösterir. */
  linkProblem: Problem | null;
  clearLinkProblem: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [linkProblem, setLinkProblem] = useState<Problem | null>(null);

  useEffect(() => {
    let alive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    // Jeton yenilendiğinde, çıkış yapıldığında ve bir bağlantıyla oturum
    // açıldığında burası haber alır. Tek doğru kaynak bu; ekranlar kendi
    // kopyalarını tutmuyor.
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (next) setPendingEmail(null);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
    });

    const unwatchAppState = watchAppStateForTokenRefresh();

    const unwatchLinks = watchAuthLinks((result) => {
      if (!alive) return;
      if (result.kind === 'recovery') {
        setRecovering(true);
        setLinkProblem(null);
        return;
      }
      if (result.kind === 'signedIn') {
        setLinkProblem(null);
        return;
      }
      if (result.kind === 'error') {
        setLinkProblem(
          result.code === 'otp_expired'
            ? { text: 'Bağlantının süresi dolmuş. Yeni bir tane iste.' }
            : {
                text: 'Bağlantı çalışmadı.',
                raw: result.message || result.code,
              },
        );
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
      unwatchAppState();
      unwatchLinks();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const address = email.trim();
    const { data, error } = await supabase.auth.signUp({
      email: address,
      password,
      options: { emailRedirectTo: authRedirectUrl() },
    });
    if (error) return { ok: false as const, problem: problemOf(error) };

    // Oturum yoksa doğrulama e-postası beklemede demektir. Kullanıcıya "kayıt
    // oldun" deyip giriş ekranına atmak, neden giremediğini anlamamasına
    // yol açardı.
    const needsConfirmation = !data.session;
    if (needsConfirmation) setPendingEmail(address);
    return { ok: true as const, needsConfirmation };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const address = email.trim();
    const { error } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    });
    if (error) {
      if (error.code === 'email_not_confirmed') setPendingEmail(address);
      return problemOf(error);
    }
    return null;
  }, []);

  const sendReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl(),
    });
    return error ? problemOf(error) : null;
  }, []);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: authRedirectUrl() },
    });
    return error ? problemOf(error) : null;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return problemOf(error);
    setRecovering(false);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    // Oturum zaten yoksa çıkış istemek hata sayılmaz; kullanıcının istediği
    // sonuç (oturumsuz olmak) zaten sağlanmış durumda.
    if (error && error.code !== 'session_not_found') return problemOf(error);
    setSession(null);
    setRecovering(false);
    return null;
  }, []);

  const deleteAccount = useCallback(async () => {
    // Sunucu tarafı tek satır: delete_my_account() silinecek kimliği
    // oturumdan okuyor, bu yüzden buradan gönderilecek bir parametre yok.
    const { error } = await supabase.rpc('delete_my_account');
    if (error) return problemOf(error);

    // Silme başarılıysa elimizdeki erişim anahtarı artık olmayan bir
    // kullanıcıya ait. signOut sunucuya da gitmeye çalışır ve o çağrı
    // beklenen biçimde başarısız olur; sonucu yutuyoruz çünkü asıl iş
    // bitti ve kullanıcıya "hesabın silindi ama çıkış yapılamadı" demek
    // doğru olmayan bir endişe yaratırdı.
    await supabase.auth.signOut().catch(() => undefined);
    setSession(null);
    setRecovering(false);
    return null;
  }, []);

  const clearPending = useCallback(() => setPendingEmail(null), []);
  const clearLinkProblem = useCallback(() => setLinkProblem(null), []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp,
      signIn,
      sendReset,
      resendConfirmation,
      updatePassword,
      signOut,
      deleteAccount,
      pendingEmail,
      clearPending,
      recovering,
      linkProblem,
      clearLinkProblem,
    }),
    [
      session,
      loading,
      signUp,
      signIn,
      sendReset,
      resendConfirmation,
      updatePassword,
      signOut,
      deleteAccount,
      pendingEmail,
      clearPending,
      recovering,
      linkProblem,
      clearLinkProblem,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
