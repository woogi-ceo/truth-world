const languageNames = {
  en: "English",
  ko: "Korean",
  es: "Spanish",
  ja: "Japanese",
  ar: "Arabic",
  fr: "French",
  zh: "Chinese",
  hi: "Hindi",
  pt: "Portuguese",
  de: "German",
  it: "Italian",
  ru: "Russian",
  id: "Indonesian",
  vi: "Vietnamese",
  tr: "Turkish"
};

const regionMembers = {
  WORLD: [],
  APAC: ["KR", "JP", "CN", "IN", "AU", "SG", "ID", "VN", "PH", "TH", "TW"],
  NA: ["US", "CA", "MX"],
  EU: ["GB", "DE", "FR", "IT", "ES", "PL", "UA"],
  LATAM: ["BR", "MX", "AR", "CL", "CO"],
  MENA: ["SA", "AE", "IL", "TR", "EG", "QA"],
  AFRICA: ["ZA", "NG", "EG", "KE"]
};

const UI_ITEM_ID = "ui:chrome";

const uiCatalog = {
  "nav.truth": "Truth",
  "nav.topics": "Topics",
  "nav.news": "News",
  "copilot.title": "Truth World Copilot",
  "copilot.placeholder": "Ask Truth World AI...",
  "auth.title": "Sign up / Log in",
  "auth.subtitle": "Create a reader account to write and save briefs.",
  "auth.signup": "Sign up",
  "auth.login": "Log in",
  "auth.displayName": "Display name",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.countryCode": "Country code",
  "auth.phoneNumber": "Phone number",
  "auth.passwordHint": "Use at least 8 characters.",
  "auth.submitSignup": "Create account",
  "auth.submitLogin": "Log in",
  "auth.logout": "Log out",
  "auth.signedInAs": "Signed in as",
  "auth.phoneVerified": "Phone and country verified. Writing is enabled.",
  "auth.phonePending": "Verify your phone and country before writing.",
  "auth.sendCode": "Send code",
  "auth.verifyCode": "Verify",
  "auth.writeBlocked": "Writing requires verified phone and country.",
  "action.signUpLogin": "Sign up / Log in",
  "action.reply": "Reply",
  "action.repost": "Repost",
  "action.like": "Like",
  "action.bookmark": "Bookmark",
  "action.share": "Share",
  "action.viewAi": "View AI",
  "action.hideAi": "Hide AI",
  "action.followTopic": "Follow topic",
  "action.openLiveRoom": "Open live room",
  "action.signInToPost": "Sign in to post",
  "action.preview": "Preview",
  "action.subscribe": "Subscribe",
  "action.askAi": "Ask AI",
  "action.backToNews": "Back to News",
  "policy.read": "Read without sign-in.",
  "policy.write": "Sign in only to write.",
  "footer.access": "Read without sign-in. Sign in only to write.",
  "control.region": "Region",
  "control.language": "Language",
  "status.online": "Online",
  "status.translating": "Translating visible content...",
  "status.translationUnavailable": "Live translation pending. Showing original text.",
  "provider.manual": "Demo feed active. Live provider pending.",
  "provider.live": "Truth partner feed is live.",
  "provider.degraded": "Partner feed unavailable. Showing manual seed fallback.",
  "provider.grokWaiting": "Local copilot fallback active.",
  "provider.grokReady": "AI backend live.",
  "provider.codexReady": "Codex translation backend live.",
  "disclaimer.ai": "AI answers are for reference only. Please verify important information.",
  "stat.defaultSources": "default sources",
  "stat.countryAlerts": "country alerts",
  "stat.critical": "critical",
  "runtime.readerMode": "Reader mode",
  "runtime.updates": "Updates",
  "runtime.watchlistPolicy": "No crawler. Partner API required.",
  "section.truth.title": "Truth",
  "section.topics.title": "Topics",
  "section.news.title": "News",
  "filter.all": "All",
  "filter.following": "Following",
  "filter.verified": "Verified",
  "filter.critical": "Critical",
  "filter.media": "Media",
  "filter.politics": "Politics",
  "filter.economy": "Economy",
  "filter.security": "Security",
  "filter.technology": "Technology",
  "filter.society": "Society",
  "filter.daily": "Daily",
  "filter.saved": "Saved",
  "analysis.summaryEyebrow": "AI summary",
  "analysis.summaryTitle": "Language summary",
  "analysis.translationEyebrow": "Translation",
  "analysis.translationTitle": "Faithful translation",
  "analysis.claimsEyebrow": "Claims",
  "analysis.claimsTitle": "What this says",
  "analysis.verificationEyebrow": "Verification",
  "analysis.verificationTitle": "Status",
  "analysis.countryImpactEyebrow": "Country impact",
  "analysis.truthWorldAi": "Truth World AI",
  "detail.package": "Brief package",
  "detail.why": "Why it matters",
  "detail.sourceMix": "Source mix",
  "detail.readerActions": "Reader actions",
  "detail.relatedTruth": "Related Truth signals",
  "detail.relatedTopics": "Related Topics",
  "detail.guestPreview": "Guest preview",
  "detail.askBrief": "Ask AI about this brief",
  "empty.topics.title": "No matching topics",
  "empty.topics.copy": "Choose another filter to see more topics.",
  "empty.news.title": "No matching briefs",
  "empty.news.copy": "Change the region or filter to view subscription templates.",
  "empty.truth.title": "No matching Truth posts",
  "empty.truth.copy": "Open another filter to inspect the source feed.",
  "suggestion.truth.0": "Summarize today's key political issues",
  "suggestion.truth.1": "Security and diplomacy highlights",
  "suggestion.truth.2": "Show only economic and industry impact",
  "suggestion.truth.3": "Organize the verification status",
  "suggestion.topics.0": "Rank the hottest topics",
  "suggestion.topics.1": "Summarize security topics only",
  "suggestion.topics.2": "Core dispute in economic topics",
  "suggestion.topics.3": "Source reliability by topic",
  "suggestion.news.0": "Today's daily brief",
  "suggestion.news.1": "Security and diplomacy breaking summary",
  "suggestion.news.2": "Technology and company trend brief",
  "suggestion.news.3": "Full summary briefing"
};

function buildStaticUiLabels(labels) {
  const fields = {
    "nav.truth": labels.truth,
    "nav.topics": labels.topics,
    "nav.news": labels.news,
    "copilot.title": labels.copilotTitle,
    "copilot.placeholder": labels.chatPlaceholder,
    "auth.title": labels.authTitle,
    "auth.subtitle": labels.authSubtitle,
    "auth.signup": labels.authSignup,
    "auth.login": labels.authLogin,
    "auth.displayName": labels.authDisplayName,
    "auth.email": labels.authEmail,
    "auth.password": labels.authPassword,
    "auth.passwordHint": labels.authPasswordHint,
    "auth.submitSignup": labels.authSubmitSignup,
    "auth.submitLogin": labels.authSubmitLogin,
    "auth.logout": labels.authLogout,
    "auth.signedInAs": labels.authSignedInAs,
    "action.signUpLogin": labels.signUpLogin,
    "action.viewAi": labels.viewAi,
    "action.hideAi": labels.hideAi,
    "action.followTopic": labels.followTopic,
    "action.openLiveRoom": labels.openLiveRoom,
    "action.signInToPost": labels.signInToPost,
    "action.preview": labels.preview,
    "action.subscribe": labels.subscribe,
    "action.askAi": labels.askAi,
    "action.backToNews": labels.backToNews,
    "policy.read": labels.read,
    "policy.write": labels.write,
    "footer.access": `${labels.read} ${labels.write}`,
    "control.region": labels.region,
    "control.language": labels.language,
    "status.online": labels.online,
    "status.translating": labels.translating,
    "status.translationUnavailable": labels.translationUnavailable,
    "provider.manual": labels.providerManual,
    "provider.live": labels.providerLive,
    "provider.degraded": labels.providerDegraded,
    "provider.grokWaiting": labels.providerWaiting,
    "provider.grokReady": labels.providerAiReady,
    "provider.codexReady": labels.providerCodexReady,
    "disclaimer.ai": labels.disclaimer,
    "stat.defaultSources": labels.defaultSources,
    "stat.countryAlerts": labels.countryAlerts,
    "stat.critical": labels.critical,
    "runtime.readerMode": labels.readerMode,
    "runtime.updates": labels.updates,
    "runtime.watchlistPolicy": labels.watchlistPolicy,
    "section.truth.title": labels.truth,
    "section.topics.title": labels.topics,
    "section.news.title": labels.news,
    "filter.all": labels.all,
    "filter.following": labels.following,
    "filter.verified": labels.verified,
    "filter.critical": labels.critical,
    "filter.media": labels.media,
    "filter.politics": labels.politics,
    "filter.economy": labels.economy,
    "filter.security": labels.security,
    "filter.technology": labels.technology,
    "filter.society": labels.society,
    "filter.daily": labels.daily,
    "filter.saved": labels.saved,
    "analysis.summaryEyebrow": labels.aiSummary,
    "analysis.summaryTitle": labels.languageSummary,
    "analysis.translationEyebrow": labels.translation,
    "analysis.translationTitle": labels.faithfulTranslation,
    "analysis.claimsEyebrow": labels.claims,
    "analysis.claimsTitle": labels.whatThisSays,
    "analysis.verificationEyebrow": labels.verification,
    "analysis.verificationTitle": labels.status,
    "analysis.countryImpactEyebrow": labels.countryImpact,
    "analysis.truthWorldAi": labels.truthWorldAi,
    "detail.package": labels.briefPackage,
    "detail.why": labels.whyItMatters,
    "detail.sourceMix": labels.sourceMix,
    "detail.readerActions": labels.readerActions,
    "detail.relatedTruth": labels.relatedTruth,
    "detail.relatedTopics": labels.relatedTopics,
    "detail.guestPreview": labels.guestPreview,
    "detail.askBrief": labels.askBrief,
    "empty.topics.title": labels.emptyTopicsTitle,
    "empty.topics.copy": labels.emptyTopicsCopy,
    "empty.news.title": labels.emptyNewsTitle,
    "empty.news.copy": labels.emptyNewsCopy,
    "empty.truth.title": labels.emptyTruthTitle,
    "empty.truth.copy": labels.emptyTruthCopy
  };

  labels.truthSuggestions?.forEach((value, index) => {
    fields[`suggestion.truth.${index}`] = value;
  });
  labels.topicSuggestions?.forEach((value, index) => {
    fields[`suggestion.topics.${index}`] = value;
  });
  labels.newsSuggestions?.forEach((value, index) => {
    fields[`suggestion.news.${index}`] = value;
  });

  return fields;
}

const staticUiTranslations = {
  ko: buildStaticUiLabels({
    truth: "트루스", topics: "토픽", news: "뉴스", copilotTitle: "Truth World 코파일럿", chatPlaceholder: "Truth World AI에게 묻기...",
    authTitle: "회원가입 / 로그인", authSubtitle: "글 작성과 브리프 저장을 위한 독자 계정을 만드세요.", authSignup: "회원가입", authLogin: "로그인", authDisplayName: "표시 이름", authEmail: "이메일", authPassword: "비밀번호", authPasswordHint: "8자 이상을 사용하세요.", authSubmitSignup: "계정 만들기", authSubmitLogin: "로그인", authLogout: "로그아웃", authSignedInAs: "로그인 계정",
    signUpLogin: "회원가입 / 로그인", viewAi: "AI 보기", hideAi: "AI 숨기기", followTopic: "토픽 팔로우", openLiveRoom: "라이브룸 열기", signInToPost: "글 작성 로그인", preview: "미리보기", subscribe: "구독", askAi: "AI에게 묻기", backToNews: "뉴스로 돌아가기",
    read: "로그인 없이 읽기.", write: "글 작성만 로그인 필요.", region: "지역", language: "언어", online: "온라인", translating: "보이는 내용을 번역 중...", translationUnavailable: "실시간 번역 대기 중입니다. 원문을 표시합니다.",
    providerManual: "데모 피드가 활성화되어 있습니다. 라이브 제공자는 대기 중입니다.", providerLive: "Truth 파트너 피드가 연결되었습니다.", providerDegraded: "파트너 피드를 사용할 수 없어 수동 시드 fallback을 표시합니다.", providerWaiting: "로컬 코파일럿 fallback 활성화.", providerAiReady: "AI 백엔드 연결됨.", providerCodexReady: "Codex 번역 백엔드 연결됨.", disclaimer: "AI 답변은 참고용입니다. 중요한 정보는 반드시 확인하세요.",
    defaultSources: "기본 소스", countryAlerts: "국가 알림", readerMode: "읽기 모드", updates: "업데이트", watchlistPolicy: "크롤러 없음. 파트너 API 필요.", all: "전체", following: "팔로잉", verified: "인증", critical: "중요", media: "미디어", politics: "정치", economy: "경제", security: "안보", technology: "기술", society: "사회", daily: "데일리", saved: "저장됨",
    aiSummary: "AI 요약", languageSummary: "언어 요약", translation: "번역", faithfulTranslation: "충실한 번역", claims: "주장", whatThisSays: "이 글이 말하는 것", verification: "검증", status: "상태", countryImpact: "국가 영향", truthWorldAi: "Truth World AI",
    briefPackage: "브리프 패키지", whyItMatters: "중요한 이유", sourceMix: "소스 구성", readerActions: "독자 행동", relatedTruth: "관련 Truth 신호", relatedTopics: "관련 토픽", guestPreview: "게스트 미리보기", askBrief: "이 브리프를 AI에게 묻기",
    emptyTopicsTitle: "일치하는 토픽 없음", emptyTopicsCopy: "다른 필터를 선택해 더 많은 토픽을 보세요.", emptyNewsTitle: "일치하는 브리프 없음", emptyNewsCopy: "지역이나 필터를 바꿔 구독 템플릿을 보세요.", emptyTruthTitle: "일치하는 Truth 게시물 없음", emptyTruthCopy: "다른 필터를 열어 소스 피드를 확인하세요.",
    truthSuggestions: ["오늘 정치 주요 이슈 요약", "안보·외교 핵심 포인트", "경제·산업 영향만 보기", "검증 상태를 정리해줘"],
    topicSuggestions: ["가장 뜨거운 토픽 순위", "안보 토픽만 요약", "경제 토픽 핵심 쟁점", "토픽별 출처 신뢰도"],
    newsSuggestions: ["오늘 데일리 브리프", "안보·외교 속보 요약", "기술·기업 동향 정리", "전체 요약 브리핑"]
  }),
  es: buildStaticUiLabels({
    truth: "Verdad", topics: "Temas", news: "Noticias", copilotTitle: "Copiloto de Truth World", chatPlaceholder: "Preguntar a la IA de Truth World...",
    authTitle: "Registrarse / Iniciar sesion", authSubtitle: "Crea una cuenta para escribir y guardar briefs.", authSignup: "Registrarse", authLogin: "Iniciar sesion", authDisplayName: "Nombre visible", authEmail: "Email", authPassword: "Contrasena", authPasswordHint: "Usa al menos 8 caracteres.", authSubmitSignup: "Crear cuenta", authSubmitLogin: "Iniciar sesion", authLogout: "Cerrar sesion", authSignedInAs: "Sesion iniciada como",
    signUpLogin: "Registrarse / Iniciar sesion", viewAi: "Ver IA", hideAi: "Ocultar IA", followTopic: "Seguir tema", openLiveRoom: "Abrir sala en vivo", signInToPost: "Inicia sesion para publicar", preview: "Vista previa", subscribe: "Suscribirse", askAi: "Preguntar a IA", backToNews: "Volver a Noticias",
    read: "Leer sin iniciar sesion.", write: "Inicia sesion solo para escribir.", region: "Region", language: "Idioma", online: "En linea", translating: "Traduciendo contenido visible...", translationUnavailable: "Traduccion en vivo pendiente. Mostrando texto original.",
    providerManual: "Feed demo activo. Proveedor en vivo pendiente.", providerLive: "Feed asociado de Truth activo.", providerDegraded: "Feed asociado no disponible. Se muestra fallback manual.", providerWaiting: "Fallback local del copiloto activo.", providerAiReady: "Backend de IA activo.", providerCodexReady: "Backend de traduccion Codex activo.", disclaimer: "Las respuestas de IA son solo referencia. Verifica la informacion importante.",
    defaultSources: "fuentes base", countryAlerts: "alertas por pais", readerMode: "Modo lector", updates: "Actualizaciones", watchlistPolicy: "Sin rastreador. Se requiere API de socio.", all: "Todo", following: "Siguiendo", verified: "Verificado", critical: "Critico", media: "Medios", politics: "Politica", economy: "Economia", security: "Seguridad", technology: "Tecnologia", society: "Sociedad", daily: "Diario", saved: "Guardado",
    aiSummary: "Resumen IA", languageSummary: "Resumen por idioma", translation: "Traduccion", faithfulTranslation: "Traduccion fiel", claims: "Afirmaciones", whatThisSays: "Que dice esto", verification: "Verificacion", status: "Estado", countryImpact: "Impacto nacional", truthWorldAi: "Truth World IA",
    briefPackage: "Paquete de brief", whyItMatters: "Por que importa", sourceMix: "Mezcla de fuentes", readerActions: "Acciones del lector", relatedTruth: "Senales Truth relacionadas", relatedTopics: "Temas relacionados", guestPreview: "Vista de invitado", askBrief: "Preguntar a IA sobre este brief",
    emptyTopicsTitle: "No hay temas coincidentes", emptyTopicsCopy: "Elige otro filtro para ver mas temas.", emptyNewsTitle: "No hay briefs coincidentes", emptyNewsCopy: "Cambia la region o el filtro para ver plantillas.", emptyTruthTitle: "No hay posts Truth coincidentes", emptyTruthCopy: "Abre otro filtro para revisar el feed fuente.",
    truthSuggestions: ["Resumir los temas politicos de hoy", "Puntos clave de seguridad y diplomacia", "Ver solo impacto economico e industrial", "Ordenar el estado de verificacion"],
    topicSuggestions: ["Ranking de temas mas calientes", "Resumir solo temas de seguridad", "Puntos centrales de temas economicos", "Confiabilidad de fuentes por tema"],
    newsSuggestions: ["Brief diario de hoy", "Resumen urgente de seguridad y diplomacia", "Tendencias de tecnologia y empresas", "Briefing completo"]
  }),
  ja: buildStaticUiLabels({
    truth: "トゥルース", topics: "トピック", news: "ニュース", copilotTitle: "Truth World コパイロット", chatPlaceholder: "Truth World AIに質問...",
    authTitle: "登録 / ログイン", authSubtitle: "投稿とブリーフ保存のための読者アカウントを作成します。", authSignup: "登録", authLogin: "ログイン", authDisplayName: "表示名", authEmail: "メール", authPassword: "パスワード", authPasswordHint: "8文字以上を使用してください。", authSubmitSignup: "アカウント作成", authSubmitLogin: "ログイン", authLogout: "ログアウト", authSignedInAs: "ログイン中",
    signUpLogin: "登録 / ログイン", viewAi: "AIを表示", hideAi: "AIを隠す", followTopic: "トピックをフォロー", openLiveRoom: "ライブルームを開く", signInToPost: "投稿にはログイン", preview: "プレビュー", subscribe: "購読", askAi: "AIに質問", backToNews: "ニュースに戻る",
    read: "ログインなしで閲覧できます。", write: "書き込みのみログインが必要です。", region: "地域", language: "言語", online: "オンライン", translating: "表示中の内容を翻訳中...", translationUnavailable: "ライブ翻訳は保留中です。原文を表示しています。",
    providerManual: "デモフィードが有効です。ライブ提供元は保留中です。", providerLive: "Truthパートナーフィードが有効です。", providerDegraded: "パートナーフィードを利用できないため手動シードfallbackを表示しています。", providerWaiting: "ローカルコパイロットのフォールバックが有効です。", providerAiReady: "AIバックエンドが有効です。", providerCodexReady: "Codex翻訳バックエンドが有効です。", disclaimer: "AI回答は参考用です。重要な情報は確認してください。",
    defaultSources: "基本ソース", countryAlerts: "国別アラート", readerMode: "閲覧モード", updates: "更新", watchlistPolicy: "クローラーなし。パートナーAPIが必要です。", all: "すべて", following: "フォロー中", verified: "認証済み", critical: "重要", media: "メディア", politics: "政治", economy: "経済", security: "安全保障", technology: "技術", society: "社会", daily: "デイリー", saved: "保存済み",
    aiSummary: "AI要約", languageSummary: "言語別要約", translation: "翻訳", faithfulTranslation: "忠実な翻訳", claims: "主張", whatThisSays: "これが述べていること", verification: "検証", status: "状態", countryImpact: "国への影響", truthWorldAi: "Truth World AI",
    briefPackage: "ブリーフパッケージ", whyItMatters: "重要な理由", sourceMix: "ソース構成", readerActions: "読者アクション", relatedTruth: "関連Truthシグナル", relatedTopics: "関連トピック", guestPreview: "ゲストプレビュー", askBrief: "このブリーフをAIに質問",
    emptyTopicsTitle: "一致するトピックがありません", emptyTopicsCopy: "別のフィルターでさらに表示できます。", emptyNewsTitle: "一致するブリーフがありません", emptyNewsCopy: "地域またはフィルターを変えてください。", emptyTruthTitle: "一致するTruth投稿がありません", emptyTruthCopy: "別のフィルターでソースフィードを確認してください。",
    truthSuggestions: ["今日の政治主要イシューを要約", "安全保障・外交の要点", "経済・産業への影響だけ見る", "検証状態を整理"],
    topicSuggestions: ["最も熱いトピック順位", "安全保障トピックだけ要約", "経済トピックの核心争点", "トピック別ソース信頼度"],
    newsSuggestions: ["今日のデイリーブリーフ", "安保・外交速報要約", "技術・企業動向整理", "全体要約ブリーフィング"]
  }),
  zh: buildStaticUiLabels({
    truth: "真相", topics: "话题", news: "新闻", copilotTitle: "Truth World 副驾驶", chatPlaceholder: "询问 Truth World AI...",
    authTitle: "注册 / 登录", authSubtitle: "创建读者账号以发帖并保存简报。", authSignup: "注册", authLogin: "登录", authDisplayName: "显示名称", authEmail: "邮箱", authPassword: "密码", authPasswordHint: "至少使用 8 个字符。", authSubmitSignup: "创建账号", authSubmitLogin: "登录", authLogout: "退出登录", authSignedInAs: "已登录为",
    signUpLogin: "注册 / 登录", viewAi: "查看 AI", hideAi: "隐藏 AI", followTopic: "关注话题", openLiveRoom: "打开直播间", signInToPost: "登录后发帖", preview: "预览", subscribe: "订阅", askAi: "询问 AI", backToNews: "返回新闻",
    read: "无需登录即可阅读。", write: "只有写作需要登录。", region: "地区", language: "语言", online: "在线", translating: "正在翻译可见内容...", translationUnavailable: "实时翻译待处理。正在显示原文。",
    providerManual: "演示信息流已启用。实时提供方待接入。", providerLive: "Truth 合作信息流已上线。", providerDegraded: "合作信息流不可用，正在显示手动种子fallback。", providerWaiting: "本地副驾驶 fallback 已启用。", providerAiReady: "AI 后端已上线。", providerCodexReady: "Codex 翻译后端已上线。", disclaimer: "AI 回答仅供参考。请核实重要信息。",
    defaultSources: "默认来源", countryAlerts: "国家提醒", readerMode: "阅读模式", updates: "更新", watchlistPolicy: "无爬虫。需要合作伙伴 API。", all: "全部", following: "正在关注", verified: "已验证", critical: "关键", media: "媒体", politics: "政治", economy: "经济", security: "安全", technology: "技术", society: "社会", daily: "每日", saved: "已保存",
    aiSummary: "AI 摘要", languageSummary: "语言摘要", translation: "翻译", faithfulTranslation: "忠实翻译", claims: "主张", whatThisSays: "这表示什么", verification: "核验", status: "状态", countryImpact: "国家影响", truthWorldAi: "Truth World AI",
    briefPackage: "简报包", whyItMatters: "为何重要", sourceMix: "来源组合", readerActions: "读者操作", relatedTruth: "相关 Truth 信号", relatedTopics: "相关话题", guestPreview: "访客预览", askBrief: "向 AI 询问此简报",
    emptyTopicsTitle: "没有匹配的话题", emptyTopicsCopy: "选择其他筛选查看更多话题。", emptyNewsTitle: "没有匹配的简报", emptyNewsCopy: "更改地区或筛选以查看订阅模板。", emptyTruthTitle: "没有匹配的 Truth 帖文", emptyTruthCopy: "打开其他筛选查看来源信息流。",
    truthSuggestions: ["总结今日政治重点", "安全与外交要点", "只看经济和产业影响", "整理核验状态"],
    topicSuggestions: ["最热门话题排名", "只总结安全话题", "经济话题核心争议", "按话题查看来源可信度"],
    newsSuggestions: ["今日每日简报", "安全与外交快讯摘要", "技术与企业趋势整理", "完整摘要简报"]
  })
};

[
  ["ar", "الحقيقة", "المواضيع", "الأخبار", "المنطقة", "اللغة", "الكل", "السياسة", "الاقتصاد", "الأمن", "التقنية", "المجتمع"],
  ["fr", "Vérité", "Sujets", "Actualités", "Région", "Langue", "Tout", "Politique", "Économie", "Sécurité", "Technologie", "Société"],
  ["hi", "सत्य", "विषय", "समाचार", "क्षेत्र", "भाषा", "सभी", "राजनीति", "अर्थव्यवस्था", "सुरक्षा", "तकनीक", "समाज"],
  ["pt", "Verdade", "Topicos", "Noticias", "Regiao", "Idioma", "Tudo", "Politica", "Economia", "Seguranca", "Tecnologia", "Sociedade"],
  ["de", "Wahrheit", "Themen", "Nachrichten", "Region", "Sprache", "Alle", "Politik", "Wirtschaft", "Sicherheit", "Technologie", "Gesellschaft"],
  ["it", "Verita", "Temi", "Notizie", "Regione", "Lingua", "Tutto", "Politica", "Economia", "Sicurezza", "Tecnologia", "Societa"],
  ["ru", "Правда", "Темы", "Новости", "Регион", "Язык", "Все", "Политика", "Экономика", "Безопасность", "Технологии", "Общество"],
  ["id", "Kebenaran", "Topik", "Berita", "Wilayah", "Bahasa", "Semua", "Politik", "Ekonomi", "Keamanan", "Teknologi", "Masyarakat"],
  ["vi", "Sự thật", "Chủ đề", "Tin tức", "Khu vực", "Ngôn ngữ", "Tất cả", "Chính trị", "Kinh tế", "An ninh", "Công nghệ", "Xã hội"],
  ["tr", "Gercek", "Konular", "Haberler", "Bolge", "Dil", "Tum", "Siyaset", "Ekonomi", "Guvenlik", "Teknoloji", "Toplum"]
].forEach(([code, truth, topics, news, region, language, all, politics, economy, security, technology, society]) => {
  staticUiTranslations[code] = buildStaticUiLabels({
    truth, topics, news, copilotTitle: "Truth World Copilot", chatPlaceholder: "Ask Truth World AI...",
    authTitle: "Sign up / Log in", authSubtitle: "Create a reader account to write and save briefs.", authSignup: "Sign up", authLogin: "Log in", authDisplayName: "Display name", authEmail: "Email", authPassword: "Password", authPasswordHint: "Use at least 8 characters.", authSubmitSignup: "Create account", authSubmitLogin: "Log in", authLogout: "Log out", authSignedInAs: "Signed in as",
    signUpLogin: "Sign up / Log in", viewAi: "AI", hideAi: "AI", followTopic: topics, openLiveRoom: "Live", signInToPost: "Sign in", preview: "Preview", subscribe: "Subscribe", askAi: "AI", backToNews: news,
    read: "Read without sign-in.", write: "Sign in only to write.", region, language, online: "Online", translating: "Translating...", translationUnavailable: "Translation pending. Showing original text.",
    providerManual: "Demo feed active. Live provider pending.", providerLive: "Truth partner feed is live.", providerDegraded: "Partner feed unavailable. Showing manual seed fallback.", providerWaiting: "Local copilot fallback active.", providerAiReady: "AI backend live.", providerCodexReady: "Codex translation backend live.", disclaimer: "AI answers are for reference only. Please verify important information.",
    defaultSources: "sources", countryAlerts: "alerts", readerMode: "Reader mode", updates: "Updates", watchlistPolicy: "No crawler. Partner API required.", all, following: "Following", verified: "Verified", critical: "Critical", media: "Media", politics, economy, security, technology, society, daily: "Daily", saved: "Saved",
    aiSummary: "AI", languageSummary: "Summary", translation: "Translation", faithfulTranslation: "Translation", claims: "Claims", whatThisSays: "Claims", verification: "Verification", status: "Status", countryImpact: "Impact", truthWorldAi: "Truth World AI",
    briefPackage: "Brief", whyItMatters: "Why it matters", sourceMix: "Sources", readerActions: "Actions", relatedTruth: truth, relatedTopics: topics, guestPreview: "Preview", askBrief: "Ask AI",
    emptyTopicsTitle: "No topics", emptyTopicsCopy: "Choose another filter.", emptyNewsTitle: "No briefs", emptyNewsCopy: "Change region or filter.", emptyTruthTitle: "No Truth posts", emptyTruthCopy: "Open another filter.",
    truthSuggestions: [politics, security, economy, "Verification"],
    topicSuggestions: [topics, security, economy, "Sources"],
    newsSuggestions: [news, security, technology, "Summary"]
  });
});

const languagePackOverrides = {
  ar: {
    "action.signUpLogin": "إنشاء حساب / تسجيل الدخول", "action.followTopic": "متابعة الموضوع", "action.openLiveRoom": "فتح غرفة مباشرة", "action.signInToPost": "سجل الدخول للنشر", "action.preview": "معاينة", "action.subscribe": "اشتراك", "action.askAi": "اسأل الذكاء الاصطناعي", "action.backToNews": "العودة إلى الأخبار",
    "filter.following": "المتابعة", "filter.verified": "موثق", "filter.critical": "مهم", "filter.media": "الإعلام", "filter.daily": "يومي", "filter.saved": "محفوظ",
    "status.online": "متصل", "status.translating": "جار ترجمة المحتوى الظاهر...", "status.translationUnavailable": "الترجمة الحية قيد الانتظار. يتم عرض النص الأصلي.",
    "suggestion.truth.0": "لخص أهم القضايا السياسية اليوم", "suggestion.truth.1": "أبرز نقاط الأمن والدبلوماسية", "suggestion.truth.2": "اعرض أثر الاقتصاد والصناعة فقط", "suggestion.truth.3": "رتب حالة التحقق",
    "suggestion.topics.0": "رتب أكثر المواضيع سخونة", "suggestion.topics.1": "لخص مواضيع الأمن فقط", "suggestion.topics.2": "النزاع الأساسي في الاقتصاد", "suggestion.topics.3": "موثوقية المصادر حسب الموضوع",
    "suggestion.news.0": "موجز اليوم", "suggestion.news.1": "ملخص عاجل للأمن والدبلوماسية", "suggestion.news.2": "اتجاهات التقنية والشركات", "suggestion.news.3": "موجز شامل"
  },
  fr: {
    "action.signUpLogin": "S'inscrire / Se connecter", "action.followTopic": "Suivre le sujet", "action.openLiveRoom": "Ouvrir le salon en direct", "action.signInToPost": "Connectez-vous pour publier", "action.preview": "Apercu", "action.subscribe": "S'abonner", "action.askAi": "Demander a l'IA", "action.backToNews": "Retour aux actualites",
    "filter.following": "Abonnements", "filter.verified": "Verifie", "filter.critical": "Critique", "filter.media": "Medias", "filter.daily": "Quotidien", "filter.saved": "Enregistre",
    "status.online": "En ligne", "status.translating": "Traduction du contenu visible...", "status.translationUnavailable": "Traduction en direct en attente. Texte original affiche.",
    "suggestion.truth.0": "Resumer les enjeux politiques du jour", "suggestion.truth.1": "Points securite et diplomatie", "suggestion.truth.2": "Voir seulement l'impact economique et industriel", "suggestion.truth.3": "Organiser l'etat de verification",
    "suggestion.topics.0": "Classer les sujets les plus chauds", "suggestion.topics.1": "Resumer seulement les sujets securite", "suggestion.topics.2": "Point central des sujets economiques", "suggestion.topics.3": "Fiabilite des sources par sujet",
    "suggestion.news.0": "Brief quotidien", "suggestion.news.1": "Resume urgent securite et diplomatie", "suggestion.news.2": "Tendances technologie et entreprises", "suggestion.news.3": "Briefing complet"
  },
  hi: {
    "action.signUpLogin": "साइन अप / लॉग इन", "action.followTopic": "विषय फॉलो करें", "action.openLiveRoom": "लाइव रूम खोलें", "action.signInToPost": "पोस्ट करने के लिए लॉग इन करें", "action.preview": "पूर्वावलोकन", "action.subscribe": "सदस्यता लें", "action.askAi": "AI से पूछें", "action.backToNews": "समाचार पर लौटें",
    "filter.following": "फॉलोइंग", "filter.verified": "सत्यापित", "filter.critical": "महत्वपूर्ण", "filter.media": "मीडिया", "filter.daily": "दैनिक", "filter.saved": "सहेजा गया",
    "status.online": "ऑनलाइन", "status.translating": "दिख रही सामग्री का अनुवाद हो रहा है...", "status.translationUnavailable": "लाइव अनुवाद लंबित है। मूल पाठ दिखाया जा रहा है।",
    "suggestion.truth.0": "आज के प्रमुख राजनीतिक मुद्दों का सार", "suggestion.truth.1": "सुरक्षा और कूटनीति के मुख्य बिंदु", "suggestion.truth.2": "केवल आर्थिक और औद्योगिक प्रभाव दिखाएं", "suggestion.truth.3": "सत्यापन स्थिति व्यवस्थित करें",
    "suggestion.topics.0": "सबसे गर्म विषयों की रैंकिंग", "suggestion.topics.1": "केवल सुरक्षा विषयों का सार", "suggestion.topics.2": "आर्थिक विषयों का मुख्य विवाद", "suggestion.topics.3": "विषय के अनुसार स्रोत विश्वसनीयता",
    "suggestion.news.0": "आज का दैनिक ब्रीफ", "suggestion.news.1": "सुरक्षा और कूटनीति त्वरित सार", "suggestion.news.2": "तकनीक और कंपनी रुझान", "suggestion.news.3": "पूरा सार ब्रीफिंग"
  },
  pt: {
    "action.signUpLogin": "Criar conta / Entrar", "action.followTopic": "Seguir topico", "action.openLiveRoom": "Abrir sala ao vivo", "action.signInToPost": "Entre para publicar", "action.preview": "Previa", "action.subscribe": "Assinar", "action.askAi": "Perguntar a IA", "action.backToNews": "Voltar as noticias",
    "filter.following": "Seguindo", "filter.verified": "Verificado", "filter.critical": "Critico", "filter.media": "Midia", "filter.daily": "Diario", "filter.saved": "Salvo",
    "status.online": "Online", "status.translating": "Traduzindo conteudo visivel...", "status.translationUnavailable": "Traducao ao vivo pendente. Exibindo texto original."
  },
  de: {
    "action.signUpLogin": "Registrieren / Anmelden", "action.followTopic": "Thema folgen", "action.openLiveRoom": "Live-Raum offnen", "action.signInToPost": "Zum Posten anmelden", "action.preview": "Vorschau", "action.subscribe": "Abonnieren", "action.askAi": "KI fragen", "action.backToNews": "Zuruck zu Nachrichten",
    "filter.following": "Folge ich", "filter.verified": "Verifiziert", "filter.critical": "Kritisch", "filter.media": "Medien", "filter.daily": "Taglich", "filter.saved": "Gespeichert",
    "status.online": "Online", "status.translating": "Sichtbare Inhalte werden ubersetzt...", "status.translationUnavailable": "Live-Ubersetzung ausstehend. Originaltext wird angezeigt."
  },
  it: {
    "action.signUpLogin": "Registrati / Accedi", "action.followTopic": "Segui tema", "action.openLiveRoom": "Apri stanza live", "action.signInToPost": "Accedi per pubblicare", "action.preview": "Anteprima", "action.subscribe": "Abbonati", "action.askAi": "Chiedi all'AI", "action.backToNews": "Torna alle notizie",
    "filter.following": "Seguiti", "filter.verified": "Verificato", "filter.critical": "Critico", "filter.media": "Media", "filter.daily": "Giornaliero", "filter.saved": "Salvato",
    "status.online": "Online", "status.translating": "Traduzione dei contenuti visibili...", "status.translationUnavailable": "Traduzione live in attesa. Testo originale mostrato."
  },
  ru: {
    "action.signUpLogin": "Регистрация / Вход", "action.followTopic": "Следить за темой", "action.openLiveRoom": "Открыть live-комнату", "action.signInToPost": "Войдите, чтобы писать", "action.preview": "Предпросмотр", "action.subscribe": "Подписаться", "action.askAi": "Спросить AI", "action.backToNews": "Назад к новостям",
    "filter.following": "Подписки", "filter.verified": "Проверено", "filter.critical": "Важно", "filter.media": "Медиа", "filter.daily": "Ежедневно", "filter.saved": "Сохранено",
    "status.online": "Онлайн", "status.translating": "Перевод видимого содержимого...", "status.translationUnavailable": "Онлайн-перевод ожидает. Показан исходный текст."
  },
  id: {
    "action.signUpLogin": "Daftar / Masuk", "action.followTopic": "Ikuti topik", "action.openLiveRoom": "Buka ruang live", "action.signInToPost": "Masuk untuk menulis", "action.preview": "Pratinjau", "action.subscribe": "Berlangganan", "action.askAi": "Tanya AI", "action.backToNews": "Kembali ke Berita",
    "filter.following": "Diikuti", "filter.verified": "Terverifikasi", "filter.critical": "Kritis", "filter.media": "Media", "filter.daily": "Harian", "filter.saved": "Tersimpan",
    "status.online": "Online", "status.translating": "Menerjemahkan konten terlihat...", "status.translationUnavailable": "Terjemahan live tertunda. Menampilkan teks asli."
  },
  vi: {
    "action.signUpLogin": "Dang ky / Dang nhap", "action.followTopic": "Theo doi chu de", "action.openLiveRoom": "Mo phong truc tiep", "action.signInToPost": "Dang nhap de dang bai", "action.preview": "Xem truoc", "action.subscribe": "Dang ky", "action.askAi": "Hoi AI", "action.backToNews": "Quay lai Tin tuc",
    "filter.following": "Dang theo doi", "filter.verified": "Da xac minh", "filter.critical": "Quan trong", "filter.media": "Truyen thong", "filter.daily": "Hang ngay", "filter.saved": "Da luu",
    "status.online": "Truc tuyen", "status.translating": "Dang dich noi dung hien thi...", "status.translationUnavailable": "Ban dich truc tiep dang cho. Dang hien thi van ban goc."
  },
  tr: {
    "action.signUpLogin": "Kaydol / Giris yap", "action.followTopic": "Konuyu takip et", "action.openLiveRoom": "Canli odayi ac", "action.signInToPost": "Yazmak icin giris yap", "action.preview": "Onizleme", "action.subscribe": "Abone ol", "action.askAi": "AI'ye sor", "action.backToNews": "Haberlere don",
    "filter.following": "Takip", "filter.verified": "Dogrulanmis", "filter.critical": "Kritik", "filter.media": "Medya", "filter.daily": "Gunluk", "filter.saved": "Kaydedildi",
    "status.online": "Cevrimici", "status.translating": "Gorunen icerik cevriliyor...", "status.translationUnavailable": "Canli ceviri bekliyor. Orijinal metin gosteriliyor."
  }
};

Object.entries(languagePackOverrides).forEach(([code, fields]) => {
  Object.assign(staticUiTranslations[code], fields);
});

const sectionConfig = {
  truth: {
    title: "Truth",
    filters: [
      ["all", "All"],
      ["following", "Following"],
      ["verified", "Verified"],
      ["critical", "Critical"],
      ["media", "Media"]
    ],
    suggestions: ["Summarize today's key political issues", "Security and diplomacy highlights", "Show only economic and industry impact", "Organize the verification status"]
  },
  topics: {
    title: "Topics",
    filters: [
      ["all", "All"],
      ["politics", "Politics"],
      ["economy", "Economy"],
      ["security", "Security"],
      ["technology", "Technology"],
      ["society", "Society"]
    ],
    suggestions: ["Rank the hottest topics", "Summarize security topics only", "Core dispute in economic topics", "Source reliability by topic"]
  },
  news: {
    title: "News",
    filters: [
      ["all", "All"],
      ["daily", "Daily"],
      ["security", "Security"],
      ["economy", "Economy"],
      ["saved", "Saved"]
    ],
    suggestions: ["Today's daily brief", "Security and diplomacy breaking summary", "Technology and company trend brief", "Full summary briefing"]
  }
};

const state = {
  countryProfiles: {},
  posts: [],
  topics: [],
  newsBundles: [],
  watchlist: null,
  accessModel: null,
  provider: null,
  readiness: null,
  selectedId: null,
  newsDetailId: null,
  country: "WORLD",
  language: "ko",
  activeSection: "truth",
  filters: {
    truth: "all",
    topics: "all",
    news: "all"
  },
  translationCache: {},
  translationPending: false,
  translationError: "",
  translationModel: "",
  translationRequestId: 0,
  translationTimer: null,
  mobileAiOpen: false,
  authPromptSent: false,
  authUser: null,
  authOpen: false,
  authMode: "signup"
};

const els = {
  timelineHeading: document.querySelector("#timeline-heading"),
  feedList: document.querySelector("#feed-list"),
  navSections: document.querySelectorAll(".nav-section"),
  sectionFilters: document.querySelector("#section-filters"),
  countrySelect: document.querySelector("#country-select"),
  languageSelect: document.querySelector("#language-select"),
  countryBrief: document.querySelector("#country-brief"),
  countryHeadline: document.querySelector("#country-headline"),
  watchlistCount: document.querySelector("#watchlist-count"),
  visibleCount: document.querySelector("#visible-count"),
  criticalCount: document.querySelector("#critical-count"),
  visibilityPill: document.querySelector("#visibility-pill"),
  updateClock: document.querySelector("#update-clock"),
  watchlistPolicy: document.querySelector("#watchlist-policy"),
  translationStatus: document.querySelector("#translation-status"),
  providerStatus: document.querySelector("#provider-status"),
  rightSidebar: document.querySelector("#ai-panel"),
  chatForm: document.querySelector("#chat-form"),
  chatInput: document.querySelector("#chat-input"),
  chatLog: document.querySelector("#chat-log"),
  chatSuggestions: document.querySelector("#chat-suggestions"),
  mobileAiToggle: document.querySelector("#mobile-ai-toggle"),
  mobileAuthButton: document.querySelector("#mobile-auth-button"),
  mobileAiBackdrop: document.querySelector("#mobile-ai-backdrop"),
  sidebarAuthButton: document.querySelector(".sidebar-compose"),
  sidebarAuthLabel: document.querySelector(".sidebar-compose [data-i18n='action.signUpLogin']"),
  authModal: document.querySelector("#auth-modal"),
  authTitle: document.querySelector("#auth-title"),
  authSubtitle: document.querySelector("#auth-subtitle"),
  authAccount: document.querySelector("#auth-account"),
  authAccountCopy: document.querySelector("#auth-account-copy"),
  authLogout: document.querySelector("#auth-logout"),
  authTabs: document.querySelector("#auth-tabs"),
  authModeButtons: document.querySelectorAll("[data-auth-mode]"),
  authForm: document.querySelector("#auth-form"),
  authNameField: document.querySelector("#auth-name-field"),
  authDisplayLabel: document.querySelector("#auth-display-label"),
  authEmailLabel: document.querySelector("#auth-email-label"),
  authPasswordLabel: document.querySelector("#auth-password-label"),
  authCountryLabel: document.querySelector("#auth-country-label"),
  authPhoneLabel: document.querySelector("#auth-phone-label"),
  authDisplayName: document.querySelector("#auth-display-name"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
  authPhoneFields: document.querySelector("#auth-phone-fields"),
  authCountryCode: document.querySelector("#auth-country-code"),
  authPhoneNumber: document.querySelector("#auth-phone-number"),
  authHint: document.querySelector("#auth-hint"),
  authMessage: document.querySelector("#auth-message"),
  authSubmit: document.querySelector("#auth-submit"),
  authVerification: document.querySelector("#auth-verification"),
  authVerificationStatus: document.querySelector("#auth-verification-status"),
  authStartPhone: document.querySelector("#auth-start-phone"),
  authPhoneCode: document.querySelector("#auth-phone-code"),
  authCheckPhone: document.querySelector("#auth-check-phone"),
  manualForm: document.querySelector("#manual-form"),
  apiMessage: document.querySelector("#api-message"),
  manualUrl: document.querySelector("#manual-url"),
  manualText: document.querySelector("#manual-text")
};

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function translationBucket(language = state.language) {
  if (!state.translationCache[language]) state.translationCache[language] = {};
  return state.translationCache[language];
}

function seedLanguagePack(language = state.language) {
  if (language === "en") return;
  const fields = staticUiTranslations[language];
  if (!fields) return;
  const bucket = translationBucket(language);
  const existing = bucket[UI_ITEM_ID]?.fields || {};
  bucket[UI_ITEM_ID] = {
    fields: {
      ...fields,
      ...existing
    }
  };
}

function translatedField(itemId, field, fallback) {
  const value = translationBucket()[itemId]?.fields?.[field];
  if (Array.isArray(fallback)) {
    return Array.isArray(value) && value.length === fallback.length ? value : fallback;
  }
  return typeof value === "string" && value.trim() ? value : fallback;
}

function t(key, fallback = uiCatalog[key] || key) {
  return translatedField(UI_ITEM_ID, key, fallback);
}

function safeSourceUrl(value, fallback = "#") {
  const raw = String(value || "").trim();
  if (!raw || raw === "#") return fallback;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    const host = url.hostname.toLowerCase();
    if (host !== "truthsocial.com" && host !== "www.truthsocial.com") return fallback;
    return url.href;
  } catch {
    return fallback;
  }
}

function safeImageSrc(value, fallback = "/assets/preview-policy.svg") {
  const raw = String(value || "").trim();
  if (/^\/assets\/[a-z0-9._/-]+\.(svg|png|jpg|jpeg|webp)$/i.test(raw) && !raw.includes("..")) return raw;
  return fallback;
}

function domainForUrl(value, fallback = "source") {
  try {
    return new URL(value).hostname;
  } catch {
    return fallback;
  }
}

function baseLocalized(post, key) {
  const byLanguage = post.ai?.[state.language]?.[key];
  const fallback = post.ai?.ko?.[key];
  return byLanguage || fallback || (Array.isArray(fallback) ? [] : "");
}

function postTranslationId(post) {
  return `truth:${state.country}:${post.id}`;
}

function topicTranslationId(topic) {
  return `topic:${topic.id}`;
}

function newsTranslationId(bundle) {
  return `news:${bundle.id}`;
}

async function loadPosts() {
  const response = await fetch("/api/feed");
  if (!response.ok) {
    throw new Error("Unable to load Truth World feed.");
  }
  const payload = await response.json();
  state.countryProfiles = payload.countryProfiles || {};
  state.watchlist = payload.watchlist || null;
  state.accessModel = payload.accessModel || null;
  state.provider = payload.provider || null;
  state.readiness = payload.readiness || null;
  state.topics = payload.topics || [];
  state.newsBundles = payload.newsBundles || [];
  state.posts = payload.posts || [];
  state.selectedId = state.posts[0]?.id || null;
}

function countryProfile() {
  return state.countryProfiles[state.country] || state.countryProfiles.WORLD || {};
}

function selectedRegionSet() {
  const members = regionMembers[state.country];
  return members ? new Set(members) : null;
}

function matchesRegion(code) {
  if (!code || state.country === "WORLD") return true;
  if (code === state.country) return true;
  const members = selectedRegionSet();
  return Boolean(members && members.has(code));
}

function matchesCountryCodes(codes) {
  if (state.country === "WORLD") return true;
  if (!Array.isArray(codes) || codes.length === 0) return true;
  return codes.some((code) => matchesRegion(code));
}

function visiblePosts() {
  return state.posts.filter((post) => matchesCountryCodes(post.countryCodes));
}

function visibleTopics() {
  return state.topics.filter((topic) => matchesCountryCodes(topic.countryCodes));
}

function visibleNewsBundles() {
  return state.newsBundles.filter((bundle) => matchesRegion(bundle.countryCode));
}

function selectedNewsBundle() {
  if (!state.newsDetailId) return null;
  return filteredNewsBundles().find((bundle) => bundle.id === state.newsDetailId) || null;
}

function bundleRegionLabel(bundle) {
  return state.countryProfiles[bundle.countryCode]?.label || bundle.countryCode || countryProfile().label || "Global";
}

function countryCodesMatchBundle(codes, bundle) {
  if (bundle.countryCode === "WORLD") return true;
  if (!Array.isArray(codes) || codes.length === 0) return true;
  const members = regionMembers[bundle.countryCode];
  if (members) return codes.some((code) => members.includes(code));
  return codes.includes(bundle.countryCode);
}

function relatedPostsForBundle(bundle) {
  return state.posts.filter((post) => countryCodesMatchBundle(post.countryCodes, bundle)).slice(0, 3);
}

function relatedTopicsForBundle(bundle) {
  return state.topics.filter((topic) => countryCodesMatchBundle(topic.countryCodes, bundle)).slice(0, 3);
}

function newsDetailCopy(bundle) {
  const region = bundleRegionLabel(bundle);
  const includes = Array.isArray(bundle.includes) && bundle.includes.length ? bundle.includes.join(", ") : "Truth watchlist";
  return {
    previewLead: `Structured briefing page for ${region} readers.`,
    whyItMatters: `${bundle.description} It gives ${region} readers one hourly lens across source posts, live topics, and country impact.`,
    sourceMix: `Combines ${includes} with the approved-source Truth watchlist and public-interest topic layer.`,
    readerActions: `${bundle.subscription || "Guest preview available"}. ${bundle.signupRequired || "Only to save subscription or write"}.`
  };
}

function activeFilter() {
  return state.filters[state.activeSection] || "all";
}

function filteredPosts() {
  const filter = state.filters.truth;
  const posts = visiblePosts();
  if (filter === "critical") return posts.filter((post) => post.impactLevel === "Critical");
  if (filter === "media") return posts.filter((post) => post.linkPreview);
  if (filter === "verified") return posts.filter((post) => /watchlist|approved|influence/i.test(`${post.sourceTier} ${post.sourceStatus}`));
  return posts;
}

function filteredTopics() {
  const filter = state.filters.topics;
  const topics = visibleTopics();
  if (filter === "all") return topics;
  return topics.filter((topic) => String(topic.category || "").toLowerCase() === filter);
}

function filteredNewsBundles() {
  const filter = state.filters.news;
  const bundles = visibleNewsBundles();
  if (filter === "all" || filter === "saved") return bundles;
  return bundles.filter((bundle) => String(bundle.category || "").toLowerCase() === filter);
}

function visibleCounts() {
  return {
    truth: visiblePosts().length,
    topics: visibleTopics().length,
    news: visibleNewsBundles().length
  };
}

function localized(post, key) {
  return translatedField(postTranslationId(post), key, baseLocalized(post, key));
}

function authorInitials(author) {
  return String(author || "TW")
    .replace("@", "")
    .split(/[_\s-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TW";
}

function impactForCountry(post) {
  const impact = post.countryImpact || {};
  if (state.country === "WORLD") {
    return impact.WORLD || Object.values(impact)[0] || "";
  }
  if (impact[state.country]) return impact[state.country];
  const members = selectedRegionSet();
  if (members) {
    const memberImpact = Object.entries(impact).find(([code]) => members.has(code));
    if (memberImpact) return memberImpact[1];
  }
  return impact.WORLD || impact.KR || Object.values(impact)[0] || "";
}

function renderTags(tags, parent) {
  if (!Array.isArray(tags) || tags.length === 0) return;
  const row = createElement("div", "tag-row");
  tags.forEach((tag) => {
    row.append(createElement("span", "tag", tag));
  });
  parent.append(row);
}

function renderLinkPreview(post, parent) {
  const preview = post.linkPreview;
  if (!preview) return;

  const card = createElement("a", "link-preview");
  const safeUrl = safeSourceUrl(post.sourceUrl);
  card.href = safeUrl;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const image = createElement("img", "preview-image");
  image.src = safeImageSrc(preview.image);
  image.alt = "";
  image.loading = "lazy";
  card.append(image);

  const copy = createElement("div", "preview-copy");
  copy.append(createElement("span", "preview-domain", safeUrl === "#" ? preview.domain : domainForUrl(safeUrl, preview.domain)));
  copy.append(createElement("strong", null, translatedField(postTranslationId(post), "previewTitle", preview.title)));
  copy.append(createElement("p", null, translatedField(postTranslationId(post), "previewDescription", preview.description)));
  card.append(copy);

  parent.append(card);
}

function renderAnalysis(post, parent) {
  const drawer = createElement("section", "analysis-drawer");
  drawer.setAttribute("aria-label", "AI summary and translation");

  const summary = createElement("div", "analysis-block primary");
  summary.append(createElement("p", "eyebrow", t("analysis.summaryEyebrow")));
  summary.append(createElement("h3", null, t("analysis.summaryTitle")));
  summary.append(createElement("p", null, localized(post, "summary")));
  drawer.append(summary);

  const translation = createElement("div", "analysis-block");
  translation.append(createElement("p", "eyebrow", t("analysis.translationEyebrow")));
  translation.append(createElement("h3", null, t("analysis.translationTitle")));
  translation.append(createElement("p", null, localized(post, "translation")));
  drawer.append(translation);

  const claims = createElement("div", "analysis-block");
  claims.append(createElement("p", "eyebrow", t("analysis.claimsEyebrow")));
  claims.append(createElement("h3", null, t("analysis.claimsTitle")));
  const claimsList = createElement("ul", "claims-list");
  (localized(post, "claims") || post.ai.ko.claims).forEach((claim) => {
    claimsList.append(createElement("li", null, claim));
  });
  claims.append(claimsList);
  drawer.append(claims);

  const verification = createElement("div", "analysis-block verification-block");
  verification.append(createElement("p", "eyebrow", t("analysis.verificationEyebrow")));
  verification.append(createElement("h3", null, t("analysis.verificationTitle")));
  verification.append(createElement("p", "verification", translatedField(postTranslationId(post), "verificationStatus", post.verificationStatus)));
  drawer.append(verification);

  const countryImpact = createElement("div", "analysis-block country-impact-block");
  countryImpact.append(createElement("p", "eyebrow", t("analysis.countryImpactEyebrow")));
  countryImpact.append(createElement("h3", null, t("analysis.countryImpactEyebrow")));
  countryImpact.append(createElement("p", null, translatedField(postTranslationId(post), "impact", impactForCountry(post))));
  drawer.append(countryImpact);

  parent.append(drawer);
}

function renderPost(post) {
  const isSelected = post.id === state.selectedId;
  const article = createElement("article", `truth-post${isSelected ? " selected" : ""}`);

  const avatar = createElement("div", "avatar", authorInitials(post.author));
  article.append(avatar);

  const body = createElement("div", "post-body");

  const header = createElement("header", "post-header");
  const identity = createElement("div", "post-identity");
  const nameLine = createElement("div", "name-line");
  nameLine.append(createElement("strong", null, translatedField(postTranslationId(post), "title", post.title)));
  nameLine.append(createElement("span", "verified-dot", "✓"));
  identity.append(nameLine);
  identity.append(createElement("span", null, `${post.author} · ${post.hourSlot || post.publishedAt} · ${post.sourceTier || post.sourceStatus}`));
  header.append(identity);

  const more = createElement("button", "more-button", "•••");
  more.type = "button";
  more.setAttribute("aria-label", "More post actions");
  header.append(more);
  body.append(header);

  body.append(createElement("p", "source-text", translatedField(postTranslationId(post), "sourceText", post.sourceText)));
  const impactLine = createElement("div", `impact-line ${String(post.impactLevel || "").toLowerCase()}`);
  impactLine.append(createElement("span", null, post.impactLevel || "Watch"));
  impactLine.append(createElement("p", null, translatedField(postTranslationId(post), "impact", impactForCountry(post))));
  body.append(impactLine);
  renderTags(post.tags, body);
  renderLinkPreview(post, body);

  const summary = createElement("div", "world-summary");
  summary.append(createElement("span", null, t("analysis.truthWorldAi")));
  summary.append(createElement("p", null, localized(post, "summary")));
  body.append(summary);

  const actions = createElement("div", "post-actions");
  [
    ["action.reply", "○"],
    ["action.repost", "↻"],
    ["action.like", "♡"],
    ["action.bookmark", "▯"],
    ["action.share", "⇧"]
  ].forEach(([labelKey, icon]) => {
    const action = createElement("button", "icon-action", icon);
    action.type = "button";
    action.setAttribute("aria-label", t(labelKey));
    actions.append(action);
  });

  const expand = createElement("button", "analysis-toggle", isSelected ? t("action.hideAi") : t("action.viewAi"));
  expand.type = "button";
  expand.addEventListener("click", () => {
    state.selectedId = isSelected ? null : post.id;
    renderFeed();
    scheduleTranslationRefresh();
  });
  actions.append(expand);
  body.append(actions);

  if (isSelected) renderAnalysis(post, body);

  article.append(body);
  return article;
}

function renderTopic(topic) {
  const article = createElement("article", "topic-card");

  const media = createElement("div", "card-media");
  const image = createElement("img");
  image.src = safeImageSrc(topic.image);
  image.alt = "";
  image.loading = "lazy";
  media.append(image);
  article.append(media);

  const body = createElement("div", "topic-card-body");
  body.append(createElement("p", "topic-kicker", translatedField(topicTranslationId(topic), "title", topic.title)));

  const header = createElement("header", "card-title-row");
  header.append(createElement("h2", null, topic.tag));
  header.append(createElement("span", `topic-heat ${String(topic.heat).toLowerCase()}`, topic.heat));
  body.append(header);

  const meta = createElement("div", "card-meta");
  meta.append(createElement("span", null, translatedField(topicTranslationId(topic), "activity", topic.activity)));
  meta.append(createElement("span", null, translatedField(topicTranslationId(topic), "category", topic.category || "Community")));
  body.append(meta);

  body.append(createElement("p", "source-text", translatedField(topicTranslationId(topic), "description", topic.description)));

  const actions = createElement("div", "card-actions topic-actions");
  [
    ["action.followTopic", "secondary"],
    ["action.openLiveRoom", "live"],
    ["action.signInToPost", "muted"]
  ].forEach(([labelKey, tone]) => {
    const button = createElement("button", `card-button ${tone}`, t(labelKey));
    button.type = "button";
    if (labelKey === "action.followTopic" || labelKey === "action.signInToPost") {
      button.addEventListener("click", () => requestWriteAction(`topic.${labelKey === "action.followTopic" ? "follow" : "post"}`, topic.tag));
    } else if (labelKey === "action.openLiveRoom") {
      button.addEventListener("click", async () => {
        if (await requestWriteAction("topic.live_room", topic.tag)) handleChatQuestion(`${topic.tag} 실시간 토론 핵심만 요약해줘`);
      });
    }
    actions.append(button);
  });
  body.append(actions);

  article.append(body);
  return article;
}

function renderNewsBundle(bundle) {
  const article = createElement("article", "news-card");

  const media = createElement("div", "card-media");
  const image = createElement("img");
  image.src = safeImageSrc(bundle.image);
  image.alt = "";
  image.loading = "lazy";
  media.append(image);
  article.append(media);

  const body = createElement("div", "topic-card-body");

  const meta = createElement("div", "news-meta-row");
  meta.append(createElement("span", null, countryProfile().label || bundle.countryCode || "Global"));
  meta.append(createElement("span", null, translatedField(newsTranslationId(bundle), "cadence", bundle.cadence)));
  body.append(meta);

  const header = createElement("header", "card-title-row");
  header.append(createElement("h2", null, translatedField(newsTranslationId(bundle), "title", bundle.title)));
  body.append(header);

  const includes = createElement("div", "bundle-includes");
  translatedField(newsTranslationId(bundle), "includes", bundle.includes || []).forEach((item) => includes.append(createElement("span", "tag", item)));
  body.append(includes);

  body.append(createElement("p", "source-text", translatedField(newsTranslationId(bundle), "description", bundle.description)));

  const actions = createElement("div", "card-actions news-actions");
  [
    ["action.preview", "secondary"],
    ["action.subscribe", "primary"],
    ["action.askAi", "secondary"]
  ].forEach(([labelKey, tone]) => {
    const button = createElement("button", `card-button ${tone}`, t(labelKey));
    button.type = "button";
    if (labelKey === "action.preview") {
      button.addEventListener("click", () => openNewsDetail(bundle.id));
    } else if (labelKey === "action.askAi") {
      button.addEventListener("click", () => handleChatQuestion(`${bundle.title} 핵심만 요약해줘`));
    } else if (labelKey === "action.subscribe") {
      button.addEventListener("click", async () => {
        if (await requestWriteAction("news.subscribe", bundle.id)) handleChatQuestion(`${bundle.title} 구독 방식과 가입 필요 조건 알려줘`);
      });
    }
    actions.append(button);
  });
  body.append(actions);

  article.append(body);
  return article;
}

function openNewsDetail(bundleId) {
  state.newsDetailId = bundleId;
  renderScreen();
  scheduleTranslationRefresh();
  scrollTimelineToTop();
}

function closeNewsDetail() {
  state.newsDetailId = null;
  renderScreen();
  scheduleTranslationRefresh();
  scrollTimelineToTop();
}

function scrollTimelineToTop() {
  window.requestAnimationFrame(() => {
    const column = document.querySelector(".timeline-column");
    if (column?.scrollTo) column.scrollTo({ top: 0, behavior: "smooth" });
    if (window.scrollTo) window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderNewsDetailSection(title, copy, children = []) {
  const section = createElement("section", "detail-section");
  section.append(createElement("p", "eyebrow", title));
  if (copy) section.append(createElement("p", null, copy));
  children.forEach((child) => section.append(child));
  return section;
}

function renderNewsDetail(bundle) {
  const itemId = newsTranslationId(bundle);
  const detail = newsDetailCopy(bundle);
  const title = translatedField(itemId, "title", bundle.title);
  const description = translatedField(itemId, "description", bundle.description);
  const includes = translatedField(itemId, "includes", bundle.includes || []);
  const relatedPosts = relatedPostsForBundle(bundle);
  const relatedTopics = relatedTopicsForBundle(bundle);

  const article = createElement("article", "news-detail");

  const back = createElement("button", "detail-back", `← ${t("action.backToNews")}`);
  back.type = "button";
  back.addEventListener("click", closeNewsDetail);
  article.append(back);

  const hero = createElement("section", "news-detail-hero");
  const media = createElement("div", "news-detail-media");
  const image = createElement("img");
  image.src = safeImageSrc(bundle.image);
  image.alt = "";
  image.loading = "lazy";
  media.append(image);
  hero.append(media);

  const copy = createElement("div", "news-detail-copy");
  const meta = createElement("div", "news-meta-row");
  meta.append(createElement("span", null, bundleRegionLabel(bundle)));
  meta.append(createElement("span", null, translatedField(itemId, "cadence", bundle.cadence)));
  meta.append(createElement("span", null, bundle.category || "Daily"));
  meta.append(createElement("span", null, t("detail.guestPreview")));
  copy.append(meta);
  copy.append(createElement("h2", null, title));
  copy.append(createElement("p", "source-text", description));
  copy.append(createElement("p", "detail-lead", translatedField(itemId, "previewLead", detail.previewLead)));

  const includeRow = createElement("div", "bundle-includes detail-includes");
  includes.forEach((item) => includeRow.append(createElement("span", "tag", item)));
  copy.append(includeRow);

  const actions = createElement("div", "detail-actions");
  const ask = createElement("button", "card-button secondary", t("detail.askBrief"));
  ask.type = "button";
  ask.addEventListener("click", () => handleChatQuestion(`${bundle.title} 상세 브리프를 기사처럼 정리해줘`));
  actions.append(ask);
  const subscribe = createElement("button", "card-button primary", t("action.subscribe"));
  subscribe.type = "button";
  subscribe.addEventListener("click", async () => {
    if (await requestWriteAction("news.subscribe", bundle.id)) handleChatQuestion(`${bundle.title} 구독 방식과 가입 필요 조건 알려줘`);
  });
  actions.append(subscribe);
  copy.append(actions);

  hero.append(copy);
  article.append(hero);

  const grid = createElement("div", "news-detail-grid");

  const packageList = createElement("ul", "check-list");
  includes.forEach((item) => packageList.append(createElement("li", null, item)));
  grid.append(renderNewsDetailSection(t("detail.package"), translatedField(itemId, "readerActions", detail.readerActions), [packageList]));

  grid.append(renderNewsDetailSection(t("detail.why"), translatedField(itemId, "whyItMatters", detail.whyItMatters)));
  grid.append(renderNewsDetailSection(t("detail.sourceMix"), translatedField(itemId, "sourceMix", detail.sourceMix)));

  const actionsList = createElement("ul", "check-list");
  actionsList.append(createElement("li", null, translatedField(itemId, "subscription", bundle.subscription)));
  actionsList.append(createElement("li", null, translatedField(itemId, "signupRequired", bundle.signupRequired)));
  grid.append(renderNewsDetailSection(t("detail.readerActions"), "", [actionsList]));

  const truthList = createElement("div", "related-list");
  relatedPosts.forEach((post) => {
    const item = createElement("div", "related-item");
    item.append(createElement("strong", null, translatedField(postTranslationId(post), "title", post.title)));
    item.append(createElement("span", null, `${post.hourSlot || post.publishedAt} · ${post.impactLevel || "Watch"}`));
    item.append(createElement("p", null, translatedField(postTranslationId(post), "impact", impactForCountry(post))));
    truthList.append(item);
  });
  grid.append(renderNewsDetailSection(t("detail.relatedTruth"), "", [truthList]));

  const topicList = createElement("div", "related-list");
  relatedTopics.forEach((topic) => {
    const item = createElement("div", "related-item");
    item.append(createElement("strong", null, topic.tag));
    item.append(createElement("span", null, translatedField(topicTranslationId(topic), "title", topic.title)));
    item.append(createElement("p", null, translatedField(topicTranslationId(topic), "description", topic.description)));
    topicList.append(item);
  });
  grid.append(renderNewsDetailSection(t("detail.relatedTopics"), "", [topicList]));

  article.append(grid);
  return article;
}

function renderFeed() {
  els.feedList.innerHTML = "";
  if (state.activeSection === "topics") {
    const topics = filteredTopics();
    if (topics.length === 0) {
      els.feedList.append(renderEmptyState(t("empty.topics.title"), t("empty.topics.copy")));
      return;
    }
    topics.forEach((topic) => els.feedList.append(renderTopic(topic)));
    return;
  }

  if (state.activeSection === "news") {
    const detailBundle = selectedNewsBundle();
    if (state.newsDetailId && detailBundle) {
      els.feedList.append(renderNewsDetail(detailBundle));
      return;
    }
    if (state.newsDetailId && !detailBundle) state.newsDetailId = null;

    const bundles = filteredNewsBundles();
    if (bundles.length === 0) {
      els.feedList.append(renderEmptyState(t("empty.news.title"), t("empty.news.copy")));
      return;
    }
    bundles.forEach((bundle) => els.feedList.append(renderNewsBundle(bundle)));
    return;
  }

  const posts = filteredPosts();
  if (posts.length === 0) {
    els.feedList.append(renderEmptyState(t("empty.truth.title"), t("empty.truth.copy")));
    return;
  }
  posts.forEach((post) => els.feedList.append(renderPost(post)));
}

function renderEmptyState(title, copy) {
  const empty = createElement("section", "empty-state");
  empty.append(createElement("h2", null, title));
  empty.append(createElement("p", null, copy));
  return empty;
}

function renderDashboard() {
  const profile = countryProfile();
  const posts = filteredPosts();
  const topics = filteredTopics();
  const bundles = filteredNewsBundles();
  const critical = posts.filter((post) => post.impactLevel === "Critical").length;
  const config = sectionConfig[state.activeSection] || sectionConfig.truth;

  document.body.dataset.section = state.activeSection;
  els.timelineHeading.textContent = t(`section.${state.activeSection}.title`, config.title);
  els.countryBrief.textContent = "";
  els.chatInput.placeholder = t("copilot.placeholder");
  els.countryHeadline.textContent = "";
  els.watchlistCount.textContent = String(state.watchlist?.count || 98);
  els.visibleCount.textContent = String(state.activeSection === "topics" ? topics.length : state.activeSection === "news" ? bundles.length : posts.length);
  els.criticalCount.textContent = String(critical);
  els.visibilityPill.textContent = t("runtime.readerMode");
  els.updateClock.textContent = t("runtime.updates");
  els.watchlistPolicy.textContent = t("runtime.watchlistPolicy");

  if (!posts.some((post) => post.id === state.selectedId)) {
    state.selectedId = posts[0]?.id || null;
  }
}

function renderFilters() {
  const config = sectionConfig[state.activeSection] || sectionConfig.truth;
  els.sectionFilters.innerHTML = "";

  config.filters.forEach(([id, label]) => {
    const button = createElement("button", activeFilter() === id ? "active" : "", t(`filter.${id}`, label));
    button.type = "button";
    button.dataset.filter = id;
    button.addEventListener("click", () => {
      state.filters[state.activeSection] = id;
      if (state.activeSection === "news") state.newsDetailId = null;
      renderScreen();
      scheduleTranslationRefresh();
    });
    els.sectionFilters.append(button);
  });
}

function renderChatSeed() {
  els.chatLog.innerHTML = "";
  renderChatSuggestions();
}

function renderChatSuggestions() {
  els.chatSuggestions.innerHTML = "";
  const suggestions = sectionConfig[state.activeSection]?.suggestions || sectionConfig.truth.suggestions;
  suggestions.forEach((question, index) => {
    const button = createElement("button", null, t(`suggestion.${state.activeSection}.${index}`, question));
    button.type = "button";
    button.addEventListener("click", () => handleChatQuestion(question));
    els.chatSuggestions.append(button);
  });
}

function applyChromeTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    node.textContent = t(key, uiCatalog[key] || node.textContent);
  });
}

function renderTranslationStatus() {
  if (!els.translationStatus) return;
  if (state.translationPending) {
    els.translationStatus.textContent = t("status.translating");
    els.translationStatus.className = "translation-status";
    return;
  }
  if (state.translationError) {
    els.translationStatus.textContent = t("status.translationUnavailable");
    els.translationStatus.className = "translation-status error";
    return;
  }
  els.translationStatus.textContent = "";
  els.translationStatus.className = "translation-status";
}

function providerStatusCopy() {
  const provider = state.provider || {};
  const translationProvider = state.readiness?.providers?.translation?.provider;
  const translationReady = Boolean(state.readiness?.providers?.translation?.configured);
  const feedCopy = provider.live
    ? t("provider.live")
    : provider.status === "partner_feed_fallback" || provider.fallbackReason
      ? t("provider.degraded")
      : t("provider.manual");
  const grokCopy = translationReady
    ? translationProvider === "codex_cli" ? t("provider.codexReady") : t("provider.grokReady")
    : t("provider.grokWaiting");
  return `${feedCopy} ${grokCopy}`;
}

function renderProviderStatus() {
  if (!els.providerStatus) return;
  const live = Boolean(state.provider?.live);
  els.providerStatus.textContent = providerStatusCopy();
  els.providerStatus.className = `provider-status${live ? " live" : ""}`;
}

function renderMobileAiState() {
  document.body.classList.toggle("mobile-ai-open", state.mobileAiOpen);
  if (els.mobileAiToggle) {
    els.mobileAiToggle.setAttribute("aria-expanded", String(state.mobileAiOpen));
    els.mobileAiToggle.classList.toggle("active", state.mobileAiOpen);
  }
  if (els.mobileAiBackdrop) {
    els.mobileAiBackdrop.hidden = !state.mobileAiOpen;
  }
}

function setMobileAiOpen(open, { focusInput = false } = {}) {
  state.mobileAiOpen = Boolean(open);
  renderMobileAiState();
  if (state.mobileAiOpen && focusInput) {
    window.requestAnimationFrame(() => els.chatInput?.focus());
  }
}

function renderScreen({ resetChat = false } = {}) {
  renderDashboard();
  renderFilters();
  renderFeed();
  if (resetChat) {
    renderChatSeed();
  } else {
    renderChatSuggestions();
  }
  applyChromeTranslations();
  renderTranslationStatus();
  renderProviderStatus();
  renderMobileAiState();
  renderAuthState();
}

function addChatMessage(role, text) {
  const message = createElement("div", `chat-message ${role}`);
  message.append(createElement("p", null, text));
  els.chatLog.append(message);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function buildLocalBriefAnswer(question) {
  if (/가입|로그인|sign.?in|log.?in|signup|sign.?up|write|작성|계정|auth/i.test(question)) {
    return [
      "읽기와 브리프 확인은 가입 없이 열려 있습니다.",
      "글 작성, 토픽 참여, 구독 저장 같은 쓰기 기능은 회원가입 또는 로그인 후 진행하는 구조입니다.",
      state.authUser
        ? `현재 ${state.authUser.displayName} 계정으로 로그인되어 있습니다.`
        : "현재 간편 이메일 계정으로 실제 회원가입과 로그인이 가능합니다."
    ].join(" ");
  }

  if (/api|partner|파트너|연결|ready|readiness|준비|grok|codex|truth social|트루스소셜|그록|코덱스/i.test(question)) {
    const truthReady = Boolean(state.readiness?.providers?.truthPartner?.configured);
    const translationReady = Boolean(state.readiness?.providers?.translation?.configured);
    const translationProvider = state.readiness?.providers?.translation?.provider || "local_dev";
    return [
      `현재 피드 Provider는 ${state.provider?.sourceProvider || "manual_seed"}입니다.`,
      truthReady
        ? "Truth World 운영 서버의 Truth Social 파트너 피드가 준비된 상태입니다."
        : "Truth World 운영 서버의 Truth Social 파트너 피드는 아직 대기 중이고 demo feed fallback으로 동작합니다.",
      translationReady
        ? `Truth World 번역 백엔드는 ${translationProvider}로 준비된 상태입니다.`
        : "Truth World AI 백엔드는 아직 대기 중이라 로컬 copilot fallback으로 답합니다.",
      "사용자는 API 키가 필요 없고, 브라우저에는 어떤 API 키도 노출하지 않습니다."
    ].join(" ");
  }

  const posts = visiblePosts();
  const critical = posts.filter((post) => post.impactLevel === "Critical");
  const topPosts = (critical.length ? critical : posts).slice(0, 3);
  const titles = topPosts.map((post) => `${post.hourSlot} ${post.title}`).join(" / ");
  const selected = posts.find((post) => post.id === state.selectedId) || posts[0];

  if (/중요|핵심|요약|today|오늘/i.test(question)) {
    return `오늘 ${countryProfile().label || "선택 국가"} 관점 핵심은 ${topPosts.length}건입니다: ${titles}. 가장 먼저 볼 항목은 ${selected?.title || "없음"}입니다. 원문 왼쪽 피드에서 확인하고, AI 박스에서 주장과 국가 영향을 분리해 보세요.`;
  }

  if (/출처|98|팔로|watchlist|source/i.test(question)) {
    return `기본 베이스는 ${state.watchlist?.label || "default_watchlist_98"}입니다. 현재 UI는 ${state.watchlist?.count || 98}개 영향력 계정 목록을 전제로 설계됐지만, 실제 자동 수집은 승인 API가 필요합니다. 지금은 manual_seed 데모만 사용합니다.`;
  }

  if (/토픽|topic|해시|커뮤니티/i.test(question)) {
    return `Topics는 자유 해시태그 기반 커뮤니티 영역입니다. 현재 ${visibleTopics().length}개 토픽을 ${countryProfile().label || "선택 국가"} 관점으로 보여주며, 읽기는 게스트 가능하지만 글 작성은 가입 후 가능합니다.`;
  }

  if (/뉴스|news|구독|묶/i.test(question)) {
    return `News는 Truth 피드와 Topics를 나라별 템플릿으로 묶어 보는 영역입니다. ${countryProfile().label || "선택 국가"}용 템플릿은 ${visibleNewsBundles().map((bundle) => bundle.title).join(" / ") || "아직 없음"}입니다.`;
  }

  return `${countryProfile().label || "선택 국가"} 렌즈로 보면 현재 선택된 항목의 핵심 영향은 “${impactForCountry(selected) || "영향 요약 없음"}”입니다. 더 구체적으로 물어보면 시간별, 안보, 경제, 기술 관점으로 나눠 정리할 수 있습니다.`;
}

function handleChatQuestion(question) {
  const normalized = question.trim();
  if (!normalized) return;
  addChatMessage("user", normalized);
  addChatMessage("assistant", buildLocalBriefAnswer(normalized));
}

function setAuthMessage(message = "", tone = "") {
  if (!els.authMessage) return;
  els.authMessage.textContent = message;
  els.authMessage.className = `auth-message ${tone}`.trim();
}

function renderAuthState() {
  if (els.sidebarAuthLabel) {
    els.sidebarAuthLabel.textContent = state.authUser?.displayName || t("action.signUpLogin");
  }
  if (els.sidebarAuthButton) {
    els.sidebarAuthButton.setAttribute("aria-label", state.authUser?.displayName || t("action.signUpLogin"));
  }
  if (els.mobileAuthButton) {
    els.mobileAuthButton.setAttribute("aria-label", state.authUser?.displayName || t("action.signUpLogin"));
  }
  renderAuthModal();
}

function renderAuthModal() {
  if (!els.authModal) return;
  els.authModal.hidden = !state.authOpen;
  document.body.classList.toggle("auth-open", state.authOpen);

  if (els.authTitle) els.authTitle.textContent = state.authUser ? t("auth.signedInAs") : t("auth.title");
  if (els.authSubtitle) els.authSubtitle.textContent = state.authUser ? state.authUser.email : t("auth.subtitle");

  const isAccount = Boolean(state.authUser);
  if (els.authAccount) els.authAccount.hidden = !isAccount;
  if (els.authTabs) els.authTabs.hidden = isAccount;
  if (els.authForm) els.authForm.hidden = isAccount;
  if (els.authAccountCopy) {
    els.authAccountCopy.textContent = state.authUser
      ? `${t("auth.signedInAs")} ${state.authUser.displayName} (${state.authUser.email})`
      : "";
  }
  if (els.authLogout) els.authLogout.textContent = t("auth.logout");

  els.authModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === state.authMode);
    button.textContent = button.dataset.authMode === "signup" ? t("auth.signup") : t("auth.login");
  });

  if (els.authNameField) els.authNameField.hidden = state.authMode !== "signup";
  if (els.authPhoneFields) els.authPhoneFields.hidden = state.authMode !== "signup";
  if (els.authDisplayLabel) els.authDisplayLabel.textContent = t("auth.displayName");
  if (els.authEmailLabel) els.authEmailLabel.textContent = t("auth.email");
  if (els.authPasswordLabel) els.authPasswordLabel.textContent = t("auth.password");
  if (els.authCountryLabel) els.authCountryLabel.textContent = t("auth.countryCode");
  if (els.authPhoneLabel) els.authPhoneLabel.textContent = t("auth.phoneNumber");
  if (els.authHint) els.authHint.textContent = t("auth.passwordHint");
  if (els.authSubmit) els.authSubmit.textContent = state.authMode === "signup" ? t("auth.submitSignup") : t("auth.submitLogin");

  const needsPhoneVerification = Boolean(state.authUser && !state.authUser.writeEligible);
  if (els.authVerification) els.authVerification.hidden = !needsPhoneVerification;
  if (els.authVerificationStatus) {
    const verification = state.authUser?.phoneVerification || {};
    els.authVerificationStatus.textContent = state.authUser?.writeEligible
      ? t("auth.phoneVerified")
      : `${t("auth.phonePending")} ${verification.countryCode || ""} ${verification.phoneNumber || ""}`.trim();
  }
  if (els.authStartPhone) els.authStartPhone.textContent = t("auth.sendCode");
  if (els.authCheckPhone) els.authCheckPhone.textContent = t("auth.verifyCode");
}

function openAuthPrompt(mode = "signup") {
  state.authOpen = true;
  if (!state.authUser) state.authMode = mode;
  setAuthMessage();
  renderAuthModal();
  window.requestAnimationFrame(() => {
    if (state.authUser) return;
    (state.authMode === "signup" ? els.authDisplayName : els.authEmail)?.focus();
  });
}

function closeAuthModal() {
  state.authOpen = false;
  setAuthMessage();
  renderAuthModal();
}

function requireAuth() {
  if (state.authUser) return true;
  openAuthPrompt("signup");
  return false;
}

function requireWriteEligibility() {
  if (!requireAuth()) return false;
  if (state.authUser?.writeEligible) return true;
  openAuthPrompt("signup");
  setAuthMessage(t("auth.writeBlocked"), "error");
  return false;
}

async function requestWriteAction(action, target = "") {
  if (!requireWriteEligibility()) return false;
  try {
    const payload = await authRequest("/api/write/action", { action, target });
    state.authUser = payload.user || state.authUser;
    return Boolean(payload.writeEligible);
  } catch (error) {
    openAuthPrompt("signup");
    setAuthMessage(error.message || t("auth.writeBlocked"), "error");
    return false;
  }
}

async function authRequest(path, body = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "Authentication failed.");
  return payload;
}

async function loadAuthSession() {
  try {
    const response = await fetch("/api/auth/me");
    const payload = await response.json();
    state.authUser = payload.user || null;
  } catch {
    state.authUser = null;
  }
}

async function submitAuthForm(event) {
  event.preventDefault();
  if (!els.authSubmit) return;
  els.authSubmit.disabled = true;
  setAuthMessage();

  try {
    const body = {
      email: els.authEmail.value.trim(),
      password: els.authPassword.value
    };
    if (state.authMode === "signup") {
      body.displayName = els.authDisplayName.value.trim();
      body.countryCode = els.authCountryCode.value.trim().toUpperCase();
      body.phoneNumber = els.authPhoneNumber.value.trim();
    }
    const payload = await authRequest(`/api/auth/${state.authMode}`, body);
    state.authUser = payload.user || null;
    els.authForm?.reset();
    setAuthMessage(state.authUser ? `${t("auth.signedInAs")} ${state.authUser.displayName}` : "", "success");
    state.authOpen = false;
    renderScreen();
  } catch (error) {
    setAuthMessage(error.message, "error");
  } finally {
    els.authSubmit.disabled = false;
  }
}

async function startPhoneVerification() {
  if (!state.authUser) return;
  if (els.authStartPhone) els.authStartPhone.disabled = true;
  try {
    const payload = await authRequest("/api/auth/phone/start");
    state.authUser = payload.user || state.authUser;
    const code = payload.challenge?.developmentCode;
    setAuthMessage(code ? `${t("auth.verifyCode")}: ${code}` : t("auth.phonePending"), "success");
    renderScreen();
  } catch (error) {
    setAuthMessage(error.message, "error");
  } finally {
    if (els.authStartPhone) els.authStartPhone.disabled = false;
  }
}

async function checkPhoneVerification() {
  if (!state.authUser) return;
  if (els.authCheckPhone) els.authCheckPhone.disabled = true;
  try {
    const payload = await authRequest("/api/auth/phone/check", {
      code: els.authPhoneCode?.value.trim()
    });
    state.authUser = payload.user || state.authUser;
    setAuthMessage(state.authUser.writeEligible ? t("auth.phoneVerified") : t("auth.phonePending"), state.authUser.writeEligible ? "success" : "error");
    renderScreen();
  } catch (error) {
    setAuthMessage(error.message, "error");
  } finally {
    if (els.authCheckPhone) els.authCheckPhone.disabled = false;
  }
}

async function submitLogout() {
  if (els.authLogout) els.authLogout.disabled = true;
  try {
    await authRequest("/api/auth/logout");
    state.authUser = null;
    state.authOpen = false;
    renderScreen();
  } catch (error) {
    setAuthMessage(error.message, "error");
  } finally {
    if (els.authLogout) els.authLogout.disabled = false;
  }
}

function addTranslationField(fields, key, value) {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item || "").trim()).filter(Boolean);
    if (items.length) fields[key] = items;
    return;
  }

  const text = String(value || "").trim();
  if (text) fields[key] = text;
}

function buildUiTranslationItem() {
  return {
    id: UI_ITEM_ID,
    type: "ui_catalog",
    fields: { ...uiCatalog }
  };
}

function buildPostTranslationItem(post) {
  const fields = {};
  addTranslationField(fields, "title", post.title);
  addTranslationField(fields, "sourceText", post.sourceText);
  addTranslationField(fields, "impact", impactForCountry(post));
  addTranslationField(fields, "summary", baseLocalized(post, "summary"));
  addTranslationField(fields, "translation", baseLocalized(post, "translation"));
  addTranslationField(fields, "claims", baseLocalized(post, "claims"));
  addTranslationField(fields, "verificationStatus", post.verificationStatus);
  addTranslationField(fields, "previewTitle", post.linkPreview?.title);
  addTranslationField(fields, "previewDescription", post.linkPreview?.description);
  return {
    id: postTranslationId(post),
    type: "truth_post",
    fields
  };
}

function buildTopicTranslationItem(topic) {
  const fields = {};
  addTranslationField(fields, "title", topic.title);
  addTranslationField(fields, "description", topic.description);
  addTranslationField(fields, "activity", topic.activity);
  addTranslationField(fields, "category", topic.category || "Community");
  addTranslationField(fields, "sourceMix", topic.sourceMix);
  addTranslationField(fields, "writePolicy", topic.writePolicy);
  return {
    id: topicTranslationId(topic),
    type: "topic_card",
    fields
  };
}

function buildNewsTranslationItem(bundle) {
  const fields = {};
  const detail = newsDetailCopy(bundle);
  addTranslationField(fields, "title", bundle.title);
  addTranslationField(fields, "description", bundle.description);
  addTranslationField(fields, "includes", bundle.includes || []);
  addTranslationField(fields, "cadence", bundle.cadence);
  addTranslationField(fields, "subscription", bundle.subscription);
  addTranslationField(fields, "signupRequired", bundle.signupRequired);
  addTranslationField(fields, "previewLead", detail.previewLead);
  addTranslationField(fields, "whyItMatters", detail.whyItMatters);
  addTranslationField(fields, "sourceMix", detail.sourceMix);
  addTranslationField(fields, "readerActions", detail.readerActions);
  return {
    id: newsTranslationId(bundle),
    type: "news_bundle",
    fields
  };
}

function collectVisibleTranslationItems() {
  const items = [buildUiTranslationItem()];

  if (state.activeSection === "topics") {
    filteredTopics().forEach((topic) => items.push(buildTopicTranslationItem(topic)));
    return items;
  }

  if (state.activeSection === "news") {
    const detailBundle = selectedNewsBundle();
    if (detailBundle) {
      items.push(buildNewsTranslationItem(detailBundle));
      relatedPostsForBundle(detailBundle).forEach((post) => items.push(buildPostTranslationItem(post)));
      relatedTopicsForBundle(detailBundle).forEach((topic) => items.push(buildTopicTranslationItem(topic)));
      return items;
    }
    filteredNewsBundles().forEach((bundle) => items.push(buildNewsTranslationItem(bundle)));
    return items;
  }

  filteredPosts().forEach((post) => items.push(buildPostTranslationItem(post)));
  return items;
}

function missingTranslationItem(item) {
  const cachedFields = translationBucket()[item.id]?.fields || {};
  const fields = {};
  Object.entries(item.fields).forEach(([key, value]) => {
    const cachedValue = cachedFields[key];
    if (Array.isArray(value)) {
      if (!Array.isArray(cachedValue) || cachedValue.length !== value.length) fields[key] = value;
      return;
    }
    if (typeof cachedValue !== "string" || cachedValue.trim() === "") fields[key] = value;
  });
  return Object.keys(fields).length ? { ...item, fields } : null;
}

function buildTranslationBatches(items) {
  const priority = items.filter((item) => item.id === UI_ITEM_ID);
  const content = items.filter((item) => item.id !== UI_ITEM_ID);
  const batches = [];
  if (priority.length) batches.push(priority);
  content.forEach((item) => batches.push([item]));
  return batches;
}

function mergeTranslatedItems(items) {
  const bucket = translationBucket();
  (items || []).forEach((item) => {
    if (!item?.id || !item.fields || typeof item.fields !== "object") return;
    const existing = bucket[item.id]?.fields || {};
    bucket[item.id] = {
      fields: {
        ...existing,
        ...item.fields
      }
    };
  });
}

function shouldResetChatAfterTranslation() {
  return !els.chatLog.querySelector(".chat-message.user");
}

function scheduleTranslationRefresh() {
  window.clearTimeout(state.translationTimer);
  state.translationTimer = window.setTimeout(refreshVisibleTranslations, 40);
}

async function refreshVisibleTranslations() {
  const requestId = state.translationRequestId + 1;
  state.translationRequestId = requestId;

  if (state.language === "en") {
    state.translationPending = false;
    state.translationError = "";
    renderTranslationStatus();
    return;
  }

  seedLanguagePack();
  const items = collectVisibleTranslationItems().map(missingTranslationItem).filter(Boolean);
  if (items.length === 0) {
    state.translationError = "";
    renderTranslationStatus();
    return;
  }

  state.translationPending = true;
  state.translationError = "";
  renderTranslationStatus();

  try {
    const batches = buildTranslationBatches(items);
    for (const batch of batches) {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetLanguage: languageNames[state.language] || state.language,
          items: batch
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message || "Translation request failed.");
      }
      if (requestId !== state.translationRequestId) return;
      mergeTranslatedItems(payload.items);
      state.translationModel = payload.model || "";
      state.translationError = "";
      renderScreen({ resetChat: shouldResetChatAfterTranslation() });
    }
  } catch (error) {
    if (requestId !== state.translationRequestId) return;
    state.translationError = error.message || "Translation unavailable.";
  } finally {
    if (requestId !== state.translationRequestId) return;
    state.translationPending = false;
    renderScreen({ resetChat: shouldResetChatAfterTranslation() });
  }
}

function setMessage(message, tone = "") {
  if (!els.apiMessage) return;
  els.apiMessage.textContent = message;
  els.apiMessage.className = `api-message ${tone}`.trim();
}

function setActiveSection(section) {
  state.activeSection = section;
  if (section !== "news") state.newsDetailId = null;
  els.navSections.forEach((item) => item.classList.toggle("active", item.dataset.section === section));
  renderScreen({ resetChat: true });
  scheduleTranslationRefresh();
}

function addManualResult({ sourceUrl, text, result }) {
  const safeUrl = safeSourceUrl(sourceUrl);
  const previewDomain = safeUrl === "#" ? "manual.source" : domainForUrl(safeUrl, "manual.source");

  const post = {
    id: `manual-${Date.now()}`,
    title: "Manual source analysis",
    author: "@manual_input",
    publishedAt: new Date().toISOString().slice(0, 10),
    hourSlot: new Date().toTimeString().slice(0, 5),
    countryCodes: state.country === "WORLD" ? [] : [state.country],
    impactLevel: "Watch",
    sourceTier: "Manual approved source",
    sourceStatus: "Manual source",
    sourceUrl: safeUrl,
    sourceText: text,
    linkPreview: {
      domain: previewDomain,
      title: "Manual source analysis",
      description: result.summary,
      image: "/assets/preview-policy.svg"
    },
    countryImpact: {
      [state.country]: result.summary
    },
    verificationStatus: result.verificationStatus,
    tags: ["manual", "grok"],
    ai: {
      [state.language]: {
        summary: result.summary,
        translation: result.translation,
        claims: result.claims
      },
      ko: {
        summary: result.summary,
        translation: result.translation,
        claims: result.claims
      }
    }
  };
  state.posts = [post, ...state.posts];
  state.selectedId = post.id;
}

async function analyzeManualSource(event) {
  event.preventDefault();
  if (!els.manualForm) return;
  const submit = els.manualForm.querySelector("button");
  const text = els.manualText.value.trim();
  const sourceUrl = els.manualUrl.value.trim();

  submit.disabled = true;
  setMessage("Calling Grok...");

  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text,
        sourceUrl,
        targetLanguage: state.language
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || "Grok request failed.");
    }

    addManualResult({ sourceUrl, text, result: payload });
    renderScreen();
    scheduleTranslationRefresh();
    setMessage(`Analyzed with ${payload.model}.`, "success");
  } catch (error) {
    setMessage(error.message, "error");
  } finally {
    submit.disabled = false;
  }
}

els.languageSelect.addEventListener("change", (event) => {
  state.language = event.target.value;
  state.translationError = "";
  seedLanguagePack();
  renderScreen({ resetChat: true });
  scheduleTranslationRefresh();
});

els.countrySelect.addEventListener("change", (event) => {
  state.country = event.target.value;
  state.newsDetailId = null;
  const profile = countryProfile();
  if (profile.language && languageNames[profile.language]) {
    state.language = profile.language;
    els.languageSelect.value = profile.language;
  }
  state.translationError = "";
  seedLanguagePack();
  renderScreen({ resetChat: true });
  scheduleTranslationRefresh();
});

els.navSections.forEach((item) => {
  item.addEventListener("click", () => setActiveSection(item.dataset.section));
});

els.mobileAiToggle?.addEventListener("click", () => {
  setMobileAiOpen(!state.mobileAiOpen, { focusInput: !state.mobileAiOpen });
});

els.mobileAuthButton?.addEventListener("click", () => openAuthPrompt("signup"));
els.sidebarAuthButton?.addEventListener("click", () => openAuthPrompt("signup"));
els.mobileAiBackdrop?.addEventListener("click", () => setMobileAiOpen(false));
els.authModal?.querySelectorAll("[data-auth-close]").forEach((button) => {
  button.addEventListener("click", closeAuthModal);
});
els.authModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.authMode = button.dataset.authMode || "signup";
    setAuthMessage();
    renderAuthModal();
  });
});
els.authForm?.addEventListener("submit", submitAuthForm);
els.authLogout?.addEventListener("click", submitLogout);
els.authStartPhone?.addEventListener("click", startPhoneVerification);
els.authCheckPhone?.addEventListener("click", checkPhoneVerification);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.mobileAiOpen) setMobileAiOpen(false);
  if (event.key === "Escape" && state.authOpen) closeAuthModal();
});

els.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = els.chatInput.value.trim();
  if (!question) return;
  els.chatInput.value = "";
  handleChatQuestion(question);
});

if (els.manualForm) {
  els.manualForm.addEventListener("submit", analyzeManualSource);
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) setMobileAiOpen(false);
});

setMobileAiOpen(false);

Promise.all([loadPosts(), loadAuthSession()])
  .then(() => {
    seedLanguagePack();
    renderScreen({ resetChat: true });
    scheduleTranslationRefresh();
  })
  .catch((error) => {
    els.feedList.textContent = error.message;
  });
