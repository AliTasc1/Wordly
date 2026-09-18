#!/usr/bin/env python3
"""
Bir metnin hangi seviyeye uyduğunu ölçer.

Okuma parçası ve dinleme metni yazarken asıl risk, metnin seviyenin üstüne
kaçmasıdır: A2 öğrencisine içinde C1 kelimeleri geçen bir parça vermek, parçayı
süs hâline getirir. Elimizde 9.461 kelimelik seviyeli sözlük olduğu için bunu
gözle değil makineyle denetliyoruz.

Sözlükte yalın biçimler var (go, child), metinlerde çekimli biçimler geçiyor
(went, children). Aradaki farkı kapatmak için küçük bir kök bulucu var; düzenli
ekleri soyuyor, düzensiz biçimleri tabloya bakıyor.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]

# Sözlükte kart olarak bulunmayan ama her seviyede serbest sayılan kapalı sınıf
# sözcükler. Çoğu zaten gramer dersinde öğretiliyor; metinde geçmesi kelime
# yükü saymaz.
FREE = {
    "i", "you", "he", "she", "it", "we", "they",
    "me", "him", "her", "us", "them",
    "my", "your", "his", "its", "our", "their",
    "mine", "yours", "hers", "ours", "theirs",
    "myself", "yourself", "himself", "herself", "itself",
    "ourselves", "yourselves", "themselves",
    "am", "is", "are", "was", "were", "be", "been", "being",
    "do", "does", "did", "done", "have", "has", "had", "having",
    "will", "would", "shall", "should", "can", "could", "may", "might", "must",
    "a", "an", "the", "this", "that", "these", "those",
    "and", "or", "but", "so", "if", "because", "when", "while", "as", "than",
    "not", "no", "yes", "there", "here", "what", "which", "who", "whom",
    "whose", "where", "why", "how", "to", "of", "in", "on", "at", "for",
    "with", "from", "by", "about", "into", "over", "after", "before", "up",
    "down", "out", "off", "very", "too", "also", "then", "now", "just",
    "some", "any", "all", "both", "each", "every", "more", "most", "much",
    "many", "few", "less", "least", "other", "another", "such", "own",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen", "twenty", "thirty", "forty", "fifty",
    "sixty", "seventy", "eighty", "ninety", "hundred", "thousand", "million",
    "zero", "first", "second", "third", "fourth", "fifth", "sixth",
    "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth",
    "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth",
    "eighteenth", "nineteenth", "twentieth", "last", "next", "s", "t", "ll", "re",
    "ve", "d", "m",
}

# Sözlüğün tamamı Amerikan yazımıyla: favorite var, favourite yok. İngiliz
# yazımı kullanılırsa denetim "sözlükte yok" der ve yazar kelimeyi sözlükçeye
# eklemeye kalkar — oysa yapılacak şey yazımı düzeltmektir. Bu tablo hatayı
# doğru adla söyleyebilmek için var.
BRITISH = {
    "favourite": "favorite", "neighbour": "neighbor", "colour": "color",
    "centre": "center", "theatre": "theater", "metre": "meter",
    "litre": "liter", "grey": "gray", "travelled": "traveled",
    "travelling": "traveling", "organise": "organize", "realise": "realize",
    "recognise": "recognize", "apologise": "apologize", "practise": "practice",
    "defence": "defense", "licence": "license", "programme": "program",
    "cheque": "check", "tyre": "tire", "jewellery": "jewelry",
    "labour": "labor", "honour": "honor", "humour": "humor",
    "behaviour": "behavior", "neighbourhood": "neighborhood",
    "flavour": "flavor", "harbour": "harbor", "rumour": "rumor",
    "favour": "favor", "favours": "favors", "favoured": "favored",
    "endeavour": "endeavor", "vapour": "vapor", "armour": "armor",
    "splendour": "splendor", "rigour": "rigor", "savour": "savor",
    "analyse": "analyze", "cancelled": "canceled", "modelling": "modeling",
    "aeroplane": "airplane", "maths": "math", "storey": "story",
    "judgement": "judgment", "kilometres": "kilometers", "kilometre": "kilometer",
    "summarise": "summarize", "summarises": "summarizes", "criticise": "criticize",
    "emphasise": "emphasize", "specialise": "specialize", "civilisation": "civilization",
    "favourites": "favorites", "colours": "colors", "neighbours": "neighbors",
    "behaviours": "behaviors", "labelled": "labeled", "traveller": "traveler",
    "travellers": "travelers", "fulfil": "fulfill", "enrol": "enroll",
    "sceptical": "skeptical", "aluminium": "aluminum", "pyjamas": "pajamas",
    "catalogue": "catalog", "catalogues": "catalogs", "dialogue": "dialog",
    "digitise": "digitize", "digitising": "digitizing", "prise": "pry",
}

# Düzenli ek soyma bunları bulamaz.
IRREGULAR = {
    "cannot": "can", "won't": "will", "shan't": "shall", "went": "go", "gone": "go", "goes": "go",
    "came": "come", "become": "become", "became": "become",
    "saw": "see", "seen": "see", "said": "say", "told": "tell",
    "took": "take", "taken": "take", "gave": "give", "given": "give",
    "got": "get", "gotten": "get", "made": "make", "knew": "know",
    "known": "know", "thought": "think", "found": "find", "left": "leave",
    "felt": "feel", "kept": "keep", "held": "hold", "brought": "bring",
    "bought": "buy", "caught": "catch", "taught": "teach", "sent": "send",
    "fought": "fight",
    "spent": "spend", "built": "build", "lost": "lose", "won": "win",
    "met": "meet", "paid": "pay", "sat": "sit", "stood": "stand",
    "began": "begin", "begun": "begin", "shown": "show", "showed": "show", "drank": "drink", "drunk": "drink",
    "sunk": "sink", "sprung": "spring", "swum": "swim", "shrunk": "shrink", "meant": "mean", "sought": "seek",
    "dealt": "deal", "bent": "bend", "bound": "bind", "bit": "bite",
    "bled": "bleed", "bred": "breed", "burnt": "burn", "clung": "cling",
    "crept": "creep", "fled": "flee", "flung": "fling", "forbade": "forbid",
    "forgave": "forgive", "froze": "freeze", "frozen": "freeze",
    "ground": "grind", "hung": "hang", "knelt": "kneel", "leant": "lean",
    "leapt": "leap", "learnt": "learn", "lent": "lend", "lit": "light",
    "misled": "mislead", "mistook": "mistake", "overcame": "overcome",
    "shone": "shine", "shrank": "shrink", "sank": "sink", "slid": "slide",
    "smelt": "smell", "sowed": "sow", "spelt": "spell", "spilt": "spill",
    "spun": "spin", "spoilt": "spoil", "sprang": "spring", "stuck": "stick",
    "stung": "sting", "strode": "stride", "struck": "strike",
    "strove": "strive", "swore": "swear", "swept": "sweep", "swelled": "swell",
    "swung": "swing", "tore": "tear", "torn": "tear", "trod": "tread",
    "wept": "weep", "wound": "wind", "withdrew": "withdraw",
    "withheld": "withhold", "wrung": "wring", "arose": "arise",
    "awoke": "awake", "bore": "bear", "borne": "bear", "woken": "wake",
    "lying": "lie", "dying": "die", "tying": "tie", "selves": "self",
    "breadth": "broad", "depth": "deep", "width": "wide", "strength": "strong",
    "length": "long", "height": "high", "growth": "grow", "death": "die",
    "understood": "understand", "wrote": "write", "written": "write",
    "spoke": "speak", "spoken": "speak", "broke": "break", "broken": "break",
    "chose": "choose", "chosen": "choose", "drove": "drive", "driven": "drive",
    "ate": "eat", "eaten": "eat", "fell": "fall", "fallen": "fall",
    "flew": "fly", "flown": "fly", "forgot": "forget", "forgotten": "forget",
    "grew": "grow", "grown": "grow", "heard": "hear", "hid": "hide",
    "kept": "keep", "led": "lead", "let": "let", "lay": "lie", "lain": "lie",
    "put": "put", "read": "read", "ran": "run", "rang": "ring", "rose": "rise",
    "risen": "rise", "sang": "sing", "sold": "sell", "shut": "shut",
    "slept": "sleep", "spread": "spread", "swam": "swim", "threw": "throw",
    "thrown": "throw", "woke": "wake", "wore": "wear", "worn": "wear",
    "children": "child", "people": "person", "men": "man", "women": "woman",
    "feet": "foot", "teeth": "tooth", "mice": "mouse", "geese": "goose",
    "lives": "life", "wives": "wife", "knives": "knife", "leaves": "leaf",
    "shelves": "shelf", "halves": "half", "wolves": "wolf", "loaves": "loaf",
    "better": "good", "best": "good", "worse": "bad", "worst": "bad",
    "further": "far", "furthest": "far", "farther": "far", "farthest": "far",
}

# Gramer dersinde öğretilen ama kelime kartı olmayan sözcükler.
#
# Sözlük ile müfredat aynı şey değil: CEFR-J `sometimes` kelimesini B1'e koyar,
# ama bizim A1 gramer dersimiz sıklık zarflarını (always, usually, sometimes,
# never) öğretiyor. Bu kelimeleri A1 okuma parçasından çıkarmak, öğrenciye o
# hafta öğrettiğimiz yapıyı kullanmamak olurdu. Liste elle tutuluyor çünkü
# derslerin tablolarında Türkçe etiketlerle İngilizce biçimler iç içe;
# otomatik çıkarım gürültü üretiyor. Her satırın karşılığı bir derstir.
GRAMMAR_WORDS = {
    # A1: sıklık zarfları (ders 10), emir ve öneri (13), öbek fiiller (22)
    "A1": {"always", "usually", "often", "sometimes", "never", "let", "please",
           "again", "together", "up", "on", "off", "for"},
    # A2: present perfect belirteçleri (7), another/much (11), going to (4)
    "A2": {"ever", "just", "already", "yet", "another", "since", "going"},
    # B1: used to (2), kip fiiller (1), ilgi zarfları (11)
    "B1": {"used", "able", "ought"},
    # B2: whether/so that (9), -ever sözcükleri (10), enough/such (7)
    "B2": {"whether", "whatever", "whoever", "whenever", "however", "enough",
           "such", "none"},
    # C2: quasi-negation zarfları (7), dare (5)
    "C2": {"hardly", "scarcely", "seldom", "barely", "dare"},
}

# Aksanlı harfler de sınıfa dahil: yoksa "café" sessizce "caf" diye
# kırpılıyor ve denetim yanlış kelimeyi bildiriyor.
WORD_RE = re.compile(r"[a-zà-ÿ][a-zà-ÿ'’-]*")
# Özel adı bulmak için büyük harfli biçime de bakmak gerekiyor.
CASED_RE = re.compile(r"[A-Za-z][A-Za-z'’-]*")


def proper_nouns(text: str) -> set[str]:
    """Metindeki özel adları bulur.

    Öğrenci "Izmir" kelimesini sözlükten öğrenmez, okurken tanır; bu yüzden
    kelime yükü sayılmamalı. Ayırt etme ölçütü konum: cümle başındaki her
    kelime büyük harfle başlar, o yüzden yalnızca cümle başı DIŞINDA büyük
    harfle geçen kelimeler özel ad sayılıyor. "The" cümle ortasında da büyük
    yazılmadığı için listeye girmiyor, "Deniz" giriyor.
    """
    names, sentence_start = set(), True
    for match in re.finditer(r"[A-Za-z][A-Za-z'’-]*|[.!?]", text):
        token = match.group(0)
        if token in ".!?":
            sentence_start = True
            continue
        # Bilinen bir İngiliz yazımı büyük harfle geçse de özel ad değildir;
        # yoksa "Maths" seçeneği yazım denetiminden kaçar.
        if not sentence_start and token[0].isupper() and token.lower() not in BRITISH:
            names.add(token.lower())
        sentence_start = False
    return names


def load_levels() -> dict[str, str]:
    """Her kelimenin öğretildiği en erken seviye."""
    levels: dict[str, str] = {}
    for level in ORDER:
        path = ROOT / "lexicon" / f"{level.lower()}.json"
        if not path.exists():
            continue
        for entry in json.loads(path.read_text(encoding="utf-8")):
            word = entry["word"].lower()
            levels.setdefault(word, level)
            # Çok kelimeli girdinin parçaları da tanıdık sayılır: "bus stop"
            # öğretildiyse metindeki "bus" ayrıca bilinmeyen değildir.
            for part in word.split():
                levels.setdefault(part, level)

    # Gramer dersinde öğretilen sözcük, sözlükte daha üst seviyede duruyorsa
    # dersin seviyesi kazanır: öğrenci onu o hafta görmüş oluyor.
    for level, words in GRAMMAR_WORDS.items():
        for word in words:
            current = levels.get(word)
            if current is None or ORDER.index(level) < ORDER.index(current):
                levels[word] = level
    return levels


# Çekim ekleri kelimeyi değiştirmez, türetme ekleri yeni kelime yapar. Yine de
# kökü bilen öğrenci türevi çözebilir: `slow` biliniyorsa `slowness`, `measure`
# biliniyorsa `measurable` okunabilir. Bunları "bilinmeyen kelime" saymak
# denetimi gereksiz gürültüyle doldurup asıl seviye ihlallerini gizliyordu.
DERIVATION = [
    ("ness", [""]),
    ("ably", ["able", ""]),
    ("ibly", ["ible", ""]),
    ("able", ["", "e"]),
    ("ible", ["", "e"]),
    ("ity", ["e", "", "y"]),
    ("ist", ["", "e"]),
    ("ism", ["", "e"]),
    ("ment", ["", "e"]),
    ("ful", ["", "e"]),
    ("less", [""]),
    ("ish", ["", "e"]),
    ("ive", ["", "e"]),
    ("ation", ["e", ""]),
    ("ally", ["", "al"]),
    # -ure: expose → exposure, please → pleasure
    ("ure", ["", "e"]),
    # -y ile biten kök: vary → variable, justify → justifiable
    ("iable", ["y"]),
    ("ifiable", ["ify"]),
    ("ifiably", ["ify"]),
    # Latince çoğullar: supernova → supernovae, criterion → criteria
    ("ae", ["a"]),
    ("i", ["us"]),
    # -al, -or, -ship, -ically: institution → institutional, contribute →
    # contributor, reader → readership, period → periodically
    ("al", ["", "e"]),
    ("or", ["", "e"]),
    ("ship", [""]),
    ("ically", ["", "y", "ic"]),
]

PREFIXES = ("un", "re", "dis", "mis", "non", "over", "under", "pre", "in",
            "en", "im", "il", "ir", "anti", "co", "de", "inter", "sub")


# -ise/-isation ile biten İngiliz yazımlarını tek tek listelemek yerine kuralla
# yakalıyoruz: Amerikan karşılığı z ile yazılır ve sözlükte o var.
BRITISH_Z = re.compile(r"is(e|es|ed|ing|er|ers|ation|ations)$")


def british_z(token: str) -> str | None:
    """standardisation → standardization gibi düzenli farkı bulur."""
    if BRITISH_Z.search(token):
        return BRITISH_Z.sub(lambda m: "iz" + m.group(1), token)
    return None


def strip_once(token: str) -> list[str]:
    """Bir turluk ek ve ön ek soyma."""
    forms = []
    for suffix, replacements in (
        ("ies", ["y"]),
        ("ied", ["y"]),
        ("ier", ["y"]),
        ("iest", ["y"]),
        ("ily", ["y"]),
        ("es", ["", "e"]),
        ("s", [""]),
        ("ed", ["", "e"]),
        ("ing", ["", "e"]),
        ("er", ["", "e"]),
        ("est", ["", "e"]),
        ("ly", [""]),
        # Olumsuz kısaltmada iki ayrı yol gerekiyor. "n't" soyulursa don't → do
        # olur ama can't → "ca" olur, çünkü oradaki n can'ın parçası. Yalnızca
        # "'t" soyulursa can't → can olur ama don't → "don" olur. İkisi de
        # denenip hangisi sözlükte bulunursa o alınıyor.
        ("n't", [""]),
        ("'t", [""]),
        ("'s", [""]),
        # Çoğul iyelik sonda yalnız kesme bırakır: friends' → friends.
        ("'", [""]),
        ("'ll", [""]),
        ("'re", [""]),
        ("'ve", [""]),
        ("'d", [""]),
        *DERIVATION,
    ):
        if token.endswith(suffix) and len(token) > len(suffix) + 1:
            stem = token[: -len(suffix)]
            forms.extend(stem + replacement for replacement in replacements)
            # koşarak → running: son ünsüz ikizleşmiş olabilir
            if len(stem) > 2 and stem[-1] == stem[-2]:
                forms.append(stem[:-1])

    for prefix in PREFIXES:
        if token.startswith(prefix) and len(token) > len(prefix) + 2:
            forms.append(token[len(prefix):])
    return forms


def candidates(token: str) -> list[str]:
    """Bir kelimenin olabilecek yalın biçimleri.

    İki tur soyuluyor: `noticeably` tek turda `noticeab`a iner, ikinci turda
    `notice`a. Sıra önemsiz; hepsi denenip en erken seviyeli karşılık alınıyor.
    Amaç dilbilimsel doğruluk değil, "bu kelime öğrenciye tanıdık mı" sorusuna
    pratik bir cevap vermek.
    """
    forms = [token]
    if token in IRREGULAR:
        forms.append(IRREGULAR[token])
    # Tireli birleşikte parçalar ayrı ayrı bilinebilir: twenty-three,
    # well-known. Parçaların hepsi tanıdıksa kelime de tanıdık sayılır, o yüzden
    # parçalar da aday listesine giriyor.
    if "-" in token:
        forms.extend(part for part in token.split("-") if part)

    first = strip_once(token)
    forms.extend(first)
    for form in first:
        forms.extend(strip_once(form))
        if form in IRREGULAR:
            forms.append(IRREGULAR[form])
    return forms


def analyse(text: str, level: str, levels: dict[str, str], known: set[str]) -> dict:
    """Metni seviyeye göre çözümler.

    `known`, parçanın kendi sözlükçesinde açıklanmış kelimeler: bunlar seviyenin
    üstünde olsa bile sorun sayılmaz, çünkü öğrenci karşılığını orada görüyor.
    """
    limit = ORDER.index(level)
    tokens = WORD_RE.findall(text.lower())
    names = proper_nouns(text)
    above, unknown = {}, set()

    british = {}
    for token in tokens:
        if token in FREE or token in names:
            continue

        # Kelimenin KENDİSİ listelenmiş bir İngiliz yazımıysa, sözlüğe hiç
        # bakmadan hata sayılıyor. Çünkü türetme eki soyucu yanlış yazımı
        # gizleyebiliyor: "judgement" → "ment" soyulunca "judge" kalıyor,
        # `judge` sözlükte olduğu için kelime doğruymuş gibi geçiyordu.
        # Sözlükte gerçekten öğretilen biçimler (cheque, prise) muaf.
        if token in BRITISH and token not in levels:
            british[token] = BRITISH[token]
            continue

        forms = candidates(token)
        # Sıra önemli. Önce sözlükte karşılık aranıyor: "analyses" hem
        # `analyse`ın (İngiliz yazımı) hem `analysis`in çekimi olabilir, ve
        # ikincisi doğru Amerikan yazımıdır. Yazım denetimini öne alsaydık
        # doğru kelimeyi hatalı ilan ederdik.
        found = None
        for form in forms:
            level_of = levels.get(form)
            if level_of and (found is None or ORDER.index(level_of) < ORDER.index(found)):
                found = level_of

        if found is None:
            # Sözlükte karşılığı yok: İngiliz yazımı olabilir. Bu denetim
            # sözlükçeden ÖNCE geliyor, yoksa yazar yanlış yazımı sözlükçeye
            # ekleyerek hatayı görünmez kılabilirdi — "flavours" böyle kaçtı.
            spelling = next((f for f in forms if f in BRITISH), None)
            if spelling:
                # Öneriyi mümkünse kelimenin kendi çekimiyle ver: "organisations"
                # için "organize" değil "organizations" demek daha yardımcı.
                # Ama yalnızca üretilen biçim gerçek bir kelimeyse: "practise"
                # için kural "practize" üretiyor, oysa doğrusu "practice".
                z = british_z(token)
                british[token] = z if (z and z in levels) else BRITISH[spelling]
                continue
            z_form = british_z(token)
            if z_form and any(f in levels for f in candidates(z_form)):
                british[token] = z_form
                continue

        # Sözlükçe yalın biçimi veriyor (gym), metin çekimli kullanıyor (gyms).
        # Çekimli biçimi de tanınmış saymazsak yazar aynı kelimeyi sözlükçeye
        # iki kez yazmak zorunda kalır.
        if any(form in known for form in forms):
            continue
        # Aday biçimlerin EN ERKEN seviyesi alınıyor, ilk bulunan değil.
        # "walking" sözlükte A2'de isim olarak da duruyor ama "walk" A1'de
        # öğretiliyor; A1 öğrencisi için walking yeni bir kelime değildir.
        found = None
        for form in candidates(token):
            level_of = levels.get(form)
            if level_of and (found is None or ORDER.index(level_of) < ORDER.index(found)):
                found = level_of
        if found is None:
            unknown.add(token)
        elif ORDER.index(found) > limit:
            above[token] = found

    return {
        "words": len(tokens),
        "above": above,
        "unknown": sorted(unknown),
        "british": british,
    }
