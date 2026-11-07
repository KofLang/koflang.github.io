/**
 * kof-changelog — histórico versão a versão curado a partir do
 * CHANGELOG.md / CHANGELOG.pt_BR.md oficiais em KofLang/Kof4j (0.0.3 → 0.7.2).
 * Uma entrada por release documentada; `items` são resumos fiéis dos registros
 * da seção (os registros completos vivem no changelog do repositório).
 */
export type ChangelogRelease = {
  version: string;
  date: string;
  tag?: string;
  items: string[];
};

export const KOF_CHANGELOG: ChangelogRelease[] = [
  {
    version: "0.7.2",
    date: "05/11",
    tag: "Latest",
    items: [
      'publicada 05/11 nas 4 plataformas (09:09Z) — CI de PRIMEIRA: o fix de sequenciamento da 0.7.1 segurou (o bump viaja às 4 branches ANTES do dispatch; a nota do corte registra "bump-first held"), run 41990666559 verde sem recusa. Suite carimbada 7756/0F em 2c920c4c1 (relançada de propósito quando o `Workflow.kf` pousou depois do stamp anterior + re-medida a face do surefire 3.6.1)',
      "#1002 fechado (parser): `await`/`spawn` NU, sem operando na linha, ROUBAVA a expressão da linha seguinte — com caras diferentes por alvo (JVM morria em VerifyError silencioso, Script vazava NoSuchElementException, JS dava COMP002, Native emitia `kof_await(void)` em silêncio); o operando agora precisa começar NA MESMA LINHA do keyword nos dois sítios de parse, com recusa PARSE041 nomeando a keyword; pinos PortuKof EN+PT re-regenerados (294/294, paridade rc=0); prova RED-first SpawnAwaitOperandLineE2ETest 5/5 + KofAwaitTest 8/8",
      'universal-platform continua — e o drift do "fila exausta" foi corrigido junto (foi a própria mantenedora que pegou): a linha 7.3 fecha com o `libs/bio/Workflow.kf`, que monta o pipeline QC stats→filter→report como DAG REAL de `kof.workflow` (`job`/`after`/`run` → `KofWfReport`), com os estágios trocando dados por artefatos TSV duráveis no diretório do chamador (nada de round-trip JSON de record de lib — o §727 perde o tipo); lista vazia recusa QC001 em BUILD, filtro que esvazia é resultado LEGÍTIMO count=0, e um throw no corpo (BIO001) deixa o job `failed` com dependentes `skipped`. E2E 2/2 JVM+Script, RED-first. A fatia de wiring 5.9 (`sentinel/Http.kf` sobre `app.use`) foi desenhada e PARADA — saiu da árvore porque o #1080 abaixo torna o middleware inalcançável: "no red ships" (a fatia voltou ainda no 05/11, com o fix do #1080 no main — sem tag, ver o estado pós-release)',
      "estado honesto que a release carrega: #1080 ABERTO (§935) — lambda de tipo-function com retorno NULÁVEL compila mas a classe gerada não implementa a interface funcional, e a primeira chamada morre em IncompatibleClassChangeError na JVM; na prática a cadeia de middleware do kof.web (`app.use`) está INALCANÇÁVEL ponta a ponta — HTTP 500 com qualquer middleware; um burst de bugs de contribuidor externo entrou em triagem (#1093–#1101: builder genérico herdado, cast silenciosamente errado, `as Object` em nulável, `kof fmt -w` reescrevendo arquivo inválido); os 1.0-blocks seguem em 3 (#979/#999/#1000); a release também carrega os bumps dependabot que destravaram (mariadb #998 + grupo maven-minor-patch #997). Verificação do dia: as sondas de paridade dos eixos 1–4 (aritmética/strings/coleções, records/dispatch/try, stdlib base, concorrência/enum/herança) rodam byte-idênticas 4/4 contra o oráculo JVM com o jar publicado — a única divergência catalogada continua sendo a MATH-D do Native",
      "pós-tag no main, SEM release (não anunciar como disponível): o export 5.10 landed no main (`libs/audit/Observability.kf` — `metricsToEntries` parseia o snapshot Prometheus do `observability.metrics()` em AuditEntries encadeadas `obs:<nome>=<valor>` verbatim, OBS001 na amostra malformada, + `exportMetrics` para uma trilha viva — a métrica entra no histórico à prova de adulteração), o pump de logs 5.9 (`libs/sentinel/LogPump.kf` — `ingestLog` lê o redirecionamento do stderr que o OPERADOR aponta, kof.log medido WRITERS-ONLY, classifica `log:<nível>`, LOGP001/LOGP002; JSON não parseado) e, FECHANDO o plano, a wiring HTTP 5.9 (`libs/sentinel/Http.kf` — `sentinelHttp` vira o sentinela em middleware observador: um evento por request e sempre passa, nunca bloqueia) — 2/2 JVM+Script cada. A mantenedora autorizou encerrar (`eu autorizo a concluir tudo que ta aberto`) e o universal-platform foi TERMINADO e PROMOVIDO para `docs/universal-platform.md`; as faces restantes ficam como follow-ups registrados (R3/FFI, Arrow, key-store 5.2, ordem R12). Também pousaram no main sem tag: a correção do #1080 (o middleware 500 — emitter tipando pelo tipo DECLARADO, PR #1092 de contribuidor externo, + bridge `kof_web_use`) e o erro nomeado JSN006 para `json.decode` de shape errado (#1103, decisão da mantenedora); o corte 0.7.3 está RETIDO no gate de classificação (~130 issues do burst externo sem classificação — nada waiveado, escalado à mantenedora) com suite carimbada 7773/0F certificando os fixes",
    ],
  },
  {
    version: "0.7.1",
    date: "04/11",
    tag: "publicada 04/11",
    items: [
      "publicada 04/11 nas 4 plataformas (07:19Z) — CI na 2ª tentativa, com a história honesta: a 1ª recusa NÃO foi flake, foi um bug REAL de sequenciamento da chain (a promoção saiu de um commit com VERSION ainda 0.7.0 e o candidato esbarrou nas tags `kof-0.7.0-*` já existentes); root-caused e corrigido propagando o commit de bump às 4 branches ANTES do dispatch, sem waiver. Suite carimbada 7749/0F em 66c589e7a (SUITE-DIRTY 0; o flake de borrow-race #1000 não se repetiu no carimbo)",
      "TLS DE PRODUÇÃO LIBERADA (o plano de endurecimento fechou as 4 fatias definidas, JVM-first): servidor com SNI — `web.secureHost(host, certPem, keyPem)` + `app.listenSecure(port, listOf(secureHost(...)))` com seleção de contexto pelo ClientHello (a JDK `SSLSocket` não expõe SNI — medido) e SNI desconhecido = HTTP 421 + WEB007, nunca o certificado padrão; hot-reload de certificado `app.reloadTls(certPem, keyPem)` com troca atômica (reload que falha = WEB007 catchable como String e o estado velho segue servindo); `kof.http` na JVM agora VERIFICA cadeia + hostname POR PADRÃO — https estrito é o default e o trust-all é opt-in explícito `http.insecure()` com aviso TLS-TRUST-ALL (JS/Native: recusa honesta HTTP002 do opt-in); cliente ACME completo (`acme.jwsEs256` RFC 7515, `newAccount` com thumbprint RFC 7638, `newOrder`/`dns01Txt`/`challenge` DNS-01, `finalize` com chave efêmera + CSR DER feito à mão) com EMISSÃO REAL de certificado contra Pebble 1.0.1 no CI. Prova: família 32/32 (KofWebTlsTest 14/14 + KofWebTlsVerifyTest 5/5 + KofAcmeClientTest 4/4 + KofAcmePebbleE2ETest 1/1 + KofHttpE2ETest 8/8). Gap nomeado: WEB008 — ACME fora da JVM",
      "onda universal-platform em bibliotecas de Kof PURO (Stages 4–7 promovidos de `future/` por ordem direta da mantenedora): `libs/experiments` (runs/métricas/parâmetros sobre `kof.db` + export JSON-Lines), `libs/stats` (mean/median/minimum/maximum/pvariance/stddev/percentile — amostra vazia STATS001, p fora de faixa STATS002, nunca zero silencioso), `libs/svg` (documento/retângulo/linha/texto com escaping XML + `barChart` determinístico de geometria quantizada em INT — série vazia SVG001), `libs/sentinel` (detecção de ameaças: anel de eventos com poda por janela, burst por (source, kind), alerta JSON — defensivo, nunca bloqueia), `libs/audit` (corrente à prova de adulteração sobre `crypto.sha256` AUDITADA da stdlib: cada entrada amarra na ponta; `verifyChain()` quebra LOUD em remoção/reordenação/edição/splice) e `libs/bio` (leitores FASTA/FASTQ/VCF com BIO001–BIO003 + pipeline QC stats→filter→report, vazio = QC001). Provas E2E 2/2 JVM+Script por lib, RED-first. A fila de candidatas em Kof puro está EXAUSTA: as metades restantes (distribuições de probabilidade e o engine de SVG travam em R3/FFI, BAM é binário, os wiring são composição do chamador por desenho) ficam registradas linha a linha no plano",
      "WASI: 15.2-STRSIG — helpers top-level com assinatura String (retorno E parâmetro) entram no subset escalar (pousou depois do corte da 0.7.0, carona nesta tag)",
      "reparo do gate CodeQL ANTES do corte (#1001, aberto pela própria lane de deploy): o binding morto `un` removido da fonte no ramo wasi-bool do `WasmStateCode` (no-op semântico; WasmWasiE2ETest 8/8) e o alerta de chained-type-tests triado no baseline como contrato medido do backend WASI (o refactor pattern-switch seria churn de alto risco) — o gate vermelho travava os PRs dependabot #997/#998/#988",
      "estado honesto: o corte sai com 3 abertos na lista 1.0-block — #979 (`validation.matches` no nativo ainda é substring literal), #999 (NOVO: diretório-fonte com prefixo de ponto falha no JVM com COMP001 e produz FALSE GREEN em `sub/.agent`) e #1000 (o flake de borrow-race é bug REAL do harness, com raiz medida; não se repetiu no carimbo). Pós-release no main SEM tag: bump dependabot do mariadb #998 — nada disso é anunciado aqui",
    ],
  },
  {
    version: "0.7.0",
    date: "02/11",
    tag: "publicada 02/11",
    items: [
      "MENOR publicada na noite de 02/11 nas 4 plataformas — CI de primeira; suite 7710/0F carimbada no corte; gates rc=0 em todos os hops (500, test-hygiene e portukof concertados ANTES do corte). O bump é por ORDEM da mantenedora (`D-RELEASE-0.7.0`): a linha 0.6.x encerra na 0.6.10 — não há 0.6.11; não espere revolução de linguagem nesta tag, o corte é pequeno e honesto",
      "#991 — um método da classe dona chamado de dentro do `Column`/`Row` volta a resolver (era regressão desde a 0.6.5, #827); um-linha na inferência, fechada com prova",
      "kof.io ganha `File(p).createNew(): Bool` (#854, PR #992): cria o arquivo atomicamente (O_EXCL) e fecha o race TOCTOU do `ZipReader.extractTo`, que testava-existência antes de criar; a lei do #996 (shadowing de ctor por receiver `String`) foi re-aplicada no segundo sitio do `createNew`",
      "higiene de CI que a release carrega: a face do borrow-race (o flake que fez a 0.6.10 recusar) deixou de usar sleep e virou barrier_mark determinístico no fixture C; o diagnóstico SEM102 de campo primitivo ganhou a variante PT que faltava (catálogo 170 códigos / 293 variantes, paridade rc=0); splits de kof.io/BuiltinCallTyper para o check_500",
      "estado honesto: sobe 1 só 1.0-block aberto — #979 (`validation.matches` no nativo ainda é substring literal), RE-MEDIDO vivo no tip da 0.7.0 (JVM verdadeiro×4 vs nativo falso/verdadeiro/falso/falso; a suíte nativa passa porque só asserta substrings literais); #995 (Zip no JS) e #993 (compressor DEFLATE) seguem abertos; o plano de TLS de produção fez a volta completa no lab (servidor SNI + hot-reload + `https` estrito por padrão + cliente ACME com emissão real contra Pebble) mas AINDA SEM TAG — nada disso é 'disponível' nesta release",
    ],
  },
  {
    version: "0.6.10",
    date: "01/11",
    tag: "publicada 01/11",
    items: [
      "publicada em 01/11 nas 4 plataformas — CI na 2ª tentativa (~1h); suite 7696 verdes / 0F carimbada no corte (7231950ac; 7680/0F também em 84a88f74f). A 1ª recusa do gate foi um teste FLAKE do harness (borrow-race de 2ms que perdia o agendamento em runner lento) — root-caused e corrigido no lab com a asserção MEM020 intacta; nunca waiveada",
      "WASI fecha os ÚLTIMOS construtos de linguagem núcleo fora do subset escalar: TRY-1 — `try`/`catch`/`throw(String)` de instrução avaliam (rodada 85; 9 faces T1–T9 com stdout byte-idêntico ao JVM real) e T-2 — `finally`/catchAll (rodada 86; faces T10–T16, incl. throw dentro do `finally` SUBSTITUINDO a exceção como no Java) — com ZERO runtime e ZERO instrução wasm nova; catch tipado não-String ainda recusa WASM002 honestamente (T-3 na fila)",
      "MATH-POW-1 — `math.pow(Double, Double)` pousa no WASI pelo port fdlibm `__ieee754_pow`, a ÚLTIMA fatia libm da família math: 89 faces medidas — 85 byte-idênticas a `Math.pow` e 4 EXATAS a `StrictMath.pow` (o intrínseco do JVM difere 1 ulp ali; diferencial pinado, não drift do port); a recusa de 28/10 foi REVERTIDA com prova nova",
      "onda de contribuidor fechada na release: #981 (modificadores top-level re-landed), #980 (§765 — `throw` dentro de operando de `return` em `try` é capturado no Script/Native como no JVM), #982 (§766 — `Zip.extractTo` preserva diretórios aninhados a qualquer profundidade e lança em escrita falha) e #985 (18 alertas CodeQL em wasm/formatter/ffi/bytecode-recover)",
      "nativo sem 1.0-blocks, exceto um: #933 (o grow do `Map<String, Int>` corrompia o heap — capacidade gravada em bytes e array de valores pela metade), #934 (marshaling `extern String` para de depender da ORDEM de compilação — a tabela vira pré-passe) e #931/#932 (lei de shadowing: `extern poll(...)`/`writeFile(...)` do usuário não são mais roubados pelo builtin homônimo) fecham — sobe 1 só 1.0-block aberto: #979 (`validation.matches` nativo)",
      "#996 — método desconhecido em receiver `String` é diagnosticado (SEM025) mesmo quando existe classe com esse nome (o ramo de ctor implícito disparava para qualquer receiver)",
      "#852 — leitor ZIP INCREMENTAL em Kof puro: `ZipReader` + `ZipEntryStream` + `image.InflateStream` sobre DEFLATE retomável (`open(entry, maxBytes)` → `readChunk(): Int[]?`); um archive de 12 MB é listado com ≤ 70 KB lidos e streama sob `-Xmx40m` onde o `Zip(path)` legado morria com OutOfMemoryError. Ficou ABERTO de propósito: #995 (qualquer `import archive.Zip` ainda fura a compilação JS — IOJS001, provado por teste dedicado) e #993 (compressor DEFLATE em Kof puro — o `GzipWriter` só escreve STORED)",
      "o corte foi BLOQUEADO pelo check_500 e destravado no mesmo dia: `CompilerPipeline` 600→460, `NativeRiscvAsmMapset0` 606→440 e `WasmPowMain` 845→342/203/338 splitados por responsabilidade, com ASM emitido byte-idêntico provado por diff",
    ],
  },
  {
    version: "0.6.9",
    date: "31/10",
    tag: "publicada 31/10",
    items: [
      "publicada em 31/10 nas 4 plataformas — CI de primeira (~1h17m); suite 7617 verdes / 0F no corte (6274d7300); release enxuta de bugfix e diagnóstico",
      "#978 — `kof deploy`: a linha de artefato e a atesta de publicação agora carregam o sha do .tar.gz, não o do jar interno (os dois apontavam para o jar)",
      "#977 — membro desconhecido em receiver primitivo agora é diagnosticado (SEM102) em todos os alvos, nunca mais valor garbage silencioso por target",
      "probe #30 — eixo Float verificado com paridade byte nos 4 targets (0 divergência): fecha a lacuna de largura numérica restante",
      "#979 ABERTO (honesto) — `validation.matches` no nativo é busca de substring LITERAL, não o contrato regex do JVM: valores errados em silêncio, e a matriz de paridade dizia ✅ — 1.0-block, frente da lane native/asm",
      "plano de endurecimento de TLS registrado em docs/future (de self-signed de dev para TLS de produção)",
    ],
  },
  {
    version: "0.6.8",
    date: "27–30/10",
    tag: "publicada 30/10",
    items: [
      "publicada em 30/10 nas 4 plataformas — CI de primeira (1h13m); suite 7611 verdes / 0F no corte",
      "WASI ganha CLASSES: instâncias (CLASS-1), despacho virtual, super-métodos, campos de classe e classes em List/Set/Map e arrays (CLASS-2→CLASS-2j, fatias A onde anotado) — byte-idênticas ao oracle JVM; COLEÇÕES no bump heap: List/Set/Map nas larguras escalares, membros String, listas aninhadas, records em coleções (LIST/SET/MAP-REC, igualdade por conteúdo) e a chave escalar do Map COMPLETA (Map<String|Int|Long, Int|Long|String|Double|Bool|Char>); arrays new Int/String/Bool/Char/Long/Double[n] no heap",
      "dois Q0 reais achados pelas sondas: a célula de Set/Map alocava 16 bytes com o cap em cell+16 (o grow nunca disparava e os appends passavam por cima dos blocos vizinhos) e o get/remove do Map tinha os braços hit/miss trocados — corrigidos e travados por sondas byte-iguais",
      "WASI math/libm: abs/floor/ceil/min/max e clamp/sign para Double, roundTo e a família trig (sin pequeno/médio/largo, tan, atan, asin, acos, atan2) em port fiel ao fdlibm — byte-idêntico ao StrictMath/oráculo JVM; o braço cos do sin largo segue trap honesto (decisão da mantenedora); o drift glibc×fdlibm (~3% do intervalo 1e8–1e9, 1 ulp) foi medido e registrado",
      "Schubfach COMPLETO: Double.toString byte-a-byte no WASI — records com campos Double no toString fecham a fatia F face 2",
      "o JOIN de if-expressão com braços HETEROGÊNEOS agora avalia no WASI (caixa de erasure §284 portada ao terceiro backend) e o render de Map<String, Char|Bool|Double|String> completa; o ternário de profundidade 4 do desugar nullable cruza a máquina de estados",
      "GC no WASI: GC-1 (mark-sweep disparado por exaustão), GC-2 (roteamento de safe points + fix da gray-list) e GC-3 (integridade do sweep + validação do candidato conservador) pousados byte-idênticos; o GC-4 (coleta nos allocs de runtime) foi TENTADO E REVERTIDO — o sim de pilha conservador não é exato o bastante; fica bloqueado no tracker de pilha em emit-time (design D-gated), decisão da mantenedora",
      "fixes e extras: #975 — break de for-in aninhado em if era DROPADO no JS (valor errado silencioso, COMP002); #976 — o gate §368 over-fire em atribuição composta e stores estreitantes destrava a cadeia 0.6.8; println(!false) emitia módulo WASI inválido; String.replace(Char, Char) no WASI; tabela de aliases math 35→37 (atan/asin) e diagnósticos SEM014/SEM021 regenerados",
    ],
  },
  {
    version: "0.6.7",
    date: "22–27/10",
    tag: "publicada 27/10",
    items: [
      "publicada em 27/10 nas 4 plataformas — CI de primeira (1h01m); suite 7536 verdes / 0F na árvore de fechamento",
      'WASM/WASI fatia F (strings) COMPLETA: `String` ==/!=, length (code units UTF-16), isEmpty/equals/concat, startsWith/endsWith, indexOf, charAt/substring com mapeamento UTF-16→UTF-8, trim, lastIndexOf, compareTo, replace, fromIndex, contains — byte-iguais ao oracle JVM (wasmtime); `String.valueOf(Char)` e `"texto" + <numero|bool>` deixam de recusar WASM002',
      "WASI: família INT de math (abs/sign/min/max/clamp + predicates) e aritmética DOUBLE pura (sqrt/toRadians/toDegrees/lerp/percentage) avaliam; cadeias lógicas `&&`/`||` e JOIN de if-EXPRESSION na máquina de um único temporário (braços heterogêneos seguem recusados, registrado); Double integral imprime (fatia F 2m)",
      "base WASI: `WasmOpSupport` declara o que o target suporta e guarda drift nas duas direções (§22); jump threading ligado em produção (D-JS-ROBUST, backend JS intocado); `AsmMetrics` conta asm emitido; export duplicado corrigido; FFI downcall já alinhado a 16 bytes não quebra a stack mais (#974)",
      "primeiros PRs de contribuidor externo mergeados (4): override de `toString` do usuário, toString herdado no nativo, cast de dupla-avaliação no JS e cast catchable no nativo",
      "nativos: SIGSEGV de captura de `this` em lambda cross corrigido (§758)",
      "decompiler: DO-WHILE multi-bloco e seus break/continue recuperam (última forma aberta do do-while); DecompileTest 252/252",
      "AVIF: requisito de temporal-delimiter removido (TD é opcional no ISOBMFF) e gate de film-grain fiel (passes 140/141)",
    ],
  },
  {
    version: "0.6.6",
    date: "17–19/10",
    tag: "publicada 19/10",
    items: [
      "publicada em 19/10 nas 4 plataformas — primeira tentativa de CI que passa (1h14m), sem recusas desta vez",
      "libs/archive completa a face de escrita: `GzipWriter` (RFC 1952, blocos DEFLATE STORED) e o leitor **TAR** (POSIX ustar + nomes longos GNU, checksum conferido, pax recusado pelo nome) — `tarEntriesFrom(gzipRead(...))` lê `.tar.gz` sem máquina nova (issue #852)",
      "nativos corrigidos: `Enum.valueOf(String)` não faz mais SEGFAULT (§750, golden `enum-valueof` trava os 4 alvos); bridge de vtable de classe base genérica abstrata passa a ocupar o slot certo (§720 face nativa, golden `generic-abstract-base`); `strings.padLeft/padRight` com caracteres NÃO-BMP corrigido e travado por golden",
      "contratos fixados por goldens novos: `record` em coleção no toString (§746), `math.abs(Int.MIN_VALUE)`, faces de separador/padrão vazio em split",
      "AVIF: quadro não alinhado 20x20 decodifica EXATAMENTE (§753); golden de paleta na linha MI-16 (#889 do image-vision)",
      "tooling: `kof lsp` não guarda mais buffer vazio no `didChange` (#894); pin do ASM 9.10.1 repousado com verificação independente (§652)",
      "decompiler: **80 validações consecutivas SEM código novo** (domínios praia, receita, cinema, goal, filme, gas, guarda-roupa...) — DecompileTest 209/209, bateria 313/313; `String.repeat` → `strings.repeat`; o `||` dentro de loop com join compartilhado do `continue` recupera",
      "honestidade que virou lição: a guarda `NAT009` do §745 (recusa em compile-time para `List` de elemento nu + primitivo) foi REVERTIDA em 18/10 — recusava o contrato GOLDEN §374 (`xs.add(2)` no top level) e deixou 9 faces do AV1 vermelhas (1.0-blocks #889); o §745 segue ABERTO/PARCIAL (crash só dentro de lambda), com o fix real (boxing na fronteira de erasure ou gate ciente do contexto da lambda) aguardando decisão da mantenedora",
    ],
  },
  {
    version: "0.6.5",
    date: "13–16/10",
    tag: "publicada 16/10",
    items: [
      "corte EXTRAORDINÁRIO ordenado pela mantenedora (exceção explícita da regra de 1/dia); as tags só saíram na 3ª tentativa de CI em 16/10 — cada uma das 3 recusas do gate virou um fix real (regen da tabela PortuKof, `mkdir` do histdbg, skip dos corpus de dados no run-golden), não um retry cego",
      "KofBOL (D-KOFBOL) — plataforma de migração de legado COBOL: `kof legacy <copybook>` + libs/legacy em Kof puro (fixed-width PIC, EBCDIC CP037, COMP-3, copybook com OCCURS/88/REDEFINES, adapter com return-codes, transporte, mensageria/batch, transações); limites nomeados LEG001–LEG019; `kof compare` faz o teste diferencial Java↔Kof",
      "bibliotecas oficiais novas em Kof puro: leitor ZIP (RFC 1951) e GZIP (RFC 1952) em `libs/archive` (#852); `sha256File(path)` em `libs/security` (#853); `time.formatInstantIso(Long)` no kof.time (#857 — JS/Native diagnosticam TIME005, honesto)",
      "CLI: `kof run/deploy --jvm-option <opt>` (#855) e `kof test --module-root <dir> --tests-only` (#856)",
      "semântica unificada nos 4 alvos: `Byte`/`Short` fora de faixa estreitam no store (§696), shifts de Int seguem o JVM também no cross/JS (§698), divisão por zero de runtime LANÇA no cross (§699); JS: switch Int com case 0 (§700), try aninhado com finally interno (§702), break em if dentro de case (§701); `catch (String e)` volta a receber a String do contrato congelado, não o objeto Error (#843)",
      "entity-history FASE 5 COMPLETA: variantes nativas `history_page`/`history_one` no asm x86-64 (4 causas-raiz consertadas); plano promovido de future/ para docs/",
      "decompiler (reaberto como trabalho corrente): concat multi-argumento invertida corrigida, `&&`/`||`/cadeias/break/shifts/multidim/for-each wide/instanceof-binding/string-switch/maxOf recuperam, Math.sqrt/pow → math; DecompileTest 150/150; domínios eleições/aluguel/matemático validados out-of-the-box",
      "gêmeo capturado do §664: local de tipo função mutado em closure caixa com o FunctionType DECLARADO (antes VerifyError) — par do §664 da 0.6.1",
      "gaps catalogados (honestos): §745 ABERTO — `List` com tipo de elemento NU derruba os nativos (SIGSEGV) ao adicionar primitivo (JVM/Script/JS corretos); §706 ABERTO — `Box<Box<Int>>` quebra o acessor externo no JVM; §734 FECHADO (face JS do COMP-3); §741/§743/§744 FECHADOS (equalsIgnoreCase nativo, array, coleção)",
    ],
  },
  {
    version: "0.6.4",
    date: "13/10",
    tag: "publicada 13/10",
    items: [
      "evolução da linguagem: `for (var c in s)` — o for-in aceita String (variável do loop é Char) nos 4 alvos, pelo mesmo desugar de índice via length/charAt; o que era recusa SEM058 desde 14/09 vira o contrato natural que o backend JS já tinha",
      "linguagem: `case Tipo ->` nu em switch sobre sealed é TYPE TEST (#817); `val` anotado (`val x: Int = 1`) impõe imutabilidade como o inferido (#816); record estendendo classe do usuário mantém toString/equals/hashCode por CONTEÚDO nos 4 alvos (#818)",
      "casts unificados nos 4 alvos (§678 fechado): `as` que falha LANÇA também nos nativos; `x as T?` é o cast suave sempre-null; `as Byte`/`as Short` estreitam de verdade no nativo (§695); `as Char` mascara para 16 bits no nativo (§697)",
      "cross riscv64/aarch64: `instanceof` polimórfico não trava mais para sempre no super-walk da kof_super_table (§688); frame Kof acima de ~2 KiB não morre no assembler (§687)",
      "semântica medida: campo desconhecido em coleção/String recusado com SEM102 (§692); divisão inteira por zero de runtime com UM significado nos 4 alvos (§693); String.valueOf(coleção) imprime a forma de contêiner Kof nos nativos (§686); (-bigLong) as Int não satura mais no Script (§694)",
      "entity-history Fase 5 core: createHistory/save_recorded/delete_recorded + consulta ascendente AGORA NO NATIVE x86-64 em asm puro (cross e JS seguem ORM001 honesto); tabela de consultas §9.2 completa com história por revisão (fatia 2e)",
      "debugger: o hang do DAP (#815) revelou causa raiz — corrida de ordem resposta/evento no cliente JDWP — corrigida; adaptador travado agora é falha rápida e nomeada",
      "AVIF: caminho CFL fechado e verificado contra o libaom (fatias 3ai→3an), grade de blocos do driver (3as) e o PRIMEIRO stream de tile intercalado real com costura de leitor compartilhado (3at)",
      "suite stampada: 6248 verdes / 0F / 0E; suíte oficial de equivalência cresce para 74 casos (zip-pairs, record-values)",
    ],
  },
  {
    version: "0.6.3",
    date: "12/10",
    items: [
      "json: decodificação de campo de record corrigida (§659), face `.0` de ponto flutuante no JSON (§659d) e `json.decode<String>` em 4 targets (§667)",
      "AV1/AVIF: o driver de tiles intra passa a ler `tx_type` em blocos ≤16x16 (§679) e na ordem certa do bitstream (§680) — byte-exato contra o oracle libaom",
      "kof profile: consertado o ratio 0% do relatório (#820)",
      "entity-history: Phase 3 (golden byte-estável das faces `history`/`at`/`changes`) + Phase 4 (actor autenticado + correlation_id por request)",
      "suite de testes stampada: 6078 verdes; o primeiro corte da 0.6.3 foi recusado honestamente pelo gate (export duplicado no ES module do runtime) e re-cortado no mesmo dia",
    ],
  },
  {
    version: "0.6.2",
    date: "12/10",
    items: [
      "strings: `padLeft`/`padRight` voltam a aceitar char-literal como pad — regressão da família §669 pega pela validação de release do CI (recusa honesta nº 4 do corte)",
      "catálogo/LSP: registro do membro `orm.createHistory` completado na tabela de assinaturas",
      "auto-cascade: primeiro corte de patch promovido lab→testing→stable→prerelease com a guarda fail-closed intacta",
      "suite stampada: 5979 testes — a 1 falha é o hang ambiental conhecido do DAP (#815), debug sources idênticos à árvore verde da 0.6.1",
    ],
  },
  {
    version: "0.6.1",
    date: "11/10",
    items: [
      "guardas de tipo na stdlib pós-auditoria da 0.6.0: overloads do kof.http (§665), família Int do kof.math (§658), overloads do kof.time (§666), tópicos do kof.mq (§657) — argumentos errados agora caem no SEM025 em vez de VerifyError/lixo silencioso",
      "diagnósticos legíveis: `Type.display()` no SEM012/SEM021/SEM014 de construtor (§663) e dedup de duplicatas exatas no sink (§671)",
      "local de tipo função sem inicializador deixa de emitir `iconst_0` (§664)",
      "empacotamento: guarda `KofVersionParityTest` (VERSION == pom == version.properties == jar; §656/#814) — o artefato publicado da 0.6.0 se reportava 0.5.0-beta; corrigido na fonte",
      "carrega tudo da 0.6.0 (sealed, variância, interop.schema, M1, GC cross) — corte de correções, sem mudança de sintaxe",
    ],
  },
  {
    version: "0.6.0",
    date: "11/10",
    tag: "release oficial",
    items: [
      "sealed (classes e interfaces) + switch exaustivo sobre subtipos diretos (SEM080/SEM081)",
      "variância out/in em declaração + projeção use-site `List<out T>`/`List<in T>` (SEM082)",
      "reflexão de fronteira `interop.schema(R)` — intrínseco de compile-time, zero reflexão em runtime",
      "memory-safety M1 completa: callbacks FFI no Native x86-64 E cross riscv64/aarch64 via trampoline gerado",
      "GC cross riscv64/aarch64: 3 defeitos de reclaim corrigidos (§602); `math.pi()/e()/tau()` fold para literal — fecha COMP001 no link nativo",
      "kof.ui accessibility: superfície intent-based + defaults automáticos por widget (#789)",
      "kof.net: front de sockets (listen/accept/connect/UDP) real no cross — NET002 aposentado; recusado em JS v1 (NETN001)",
      "auto-cascade por commit (lab→testing→stable→prerelease, guarda fail-closed); mergeada em main (#806) com releases nas 4 plataformas",
    ],
  },
  {
    version: "0.5.0-beta",
    date: "27/09",
    tag: "mergeada em main",
    items: [
      "paridade de processos: process/shell/ssh reais no Native x86-64 E cross riscv64/aarch64 (fileira D-FULL-PARITY-050, linhas 1–3); SQLite cross fechado 15/09",
      "motores de interop KofPy/KofR + timeout/cancel no engine (X2, JVM/x86/JS/Script/cross)",
      "memory-safety: ownership pass + O-03 clear-null; Kofmd + `kof md check/format`",
      "secrets, makealive, LSP com 32 namespaces, FFI structs de acordo com a ABI + callbacks no JS",
      "supervisor OTP em todos os Native; multiarch GC/dtoa/canais/io/ssh/time/pow",
      "tree-shaking + workflow runner + debug info DWARF no cross",
    ],
  },
  {
    version: "0.4.10-beta",
    date: "23/09",
    items: ["janela de corte sem mudanças registradas na seção do changelog"],
  },
  {
    version: "0.4.9-beta",
    date: "20/09",
    items: [
      "verificador determinístico por risco + close guard que só fecha issue com prova (HIGH exige verifier independente); manifesto de evidência (SHA + comandos reais + NOT_RUN)",
      "kof debug: attach REAL no JVM e no Native — cliente JDWP reconstruído contra o wire medido do JDK 25; fim do falso-verde do canal (§376/§377)",
      "kof profile --methods: profiler de amostragem em nível de método (JFR na JVM; --cpu-prof + source maps no JS)",
      "extern escalar BINDA no Native x86-64 e no cross riscv64/aarch64 (#431 — ABI direta, gate+shim+E2E qemu)",
      "gate de despacho por impressão digital determinística + telemetria JSONL (custo de modelo = 0)",
    ],
  },
  {
    version: "0.4.8-beta",
    date: "20/09",
    items: [
      "kof.workflow: introspecção real — `list`/`run` com deps, `runJob`, host puro-Kof (fatias 1–2)",
      "line table DWARF nos cross riscv64/aarch64 (X7-2 fatia 1)",
      "7 métodos de coleção no nativo + Map.containsValue/putIfAbsent (front compartilhado JVM/Script/JS)",
      "X10 fechada: catálogo de assinaturas 32/32 namespaces — trava comportamental ao SEM025",
      "kof.shell runWith(argv,cwd,env) JVM+JS — env aditivo, falhas honestas -1",
    ],
  },
  {
    version: "0.4.7-beta",
    date: "19/09",
    items: [
      "kof deploy --publish publica no GitHub Releases (X9 fatia 5)",
      "LSP multi-módulo: rootUri do initialize entra na busca do projeto — workspace/symbol/hover/definition/references cobrem deps fora do pai",
      "enum em arquivo importado ponta a ponta em 4 targets (#445/§308) + forma identidade no switch-enum JS",
      "dag.retry (fixo/exponencial) + Report.retries no host puro-Kof",
      "ratificadas as 11 decisões pendentes da D-POLL-19 pela mantenedora",
    ],
  },
  {
    version: "0.4.6-beta",
    date: "19/09",
    items: [
      "kof.workflow MVP na stdlib (2.1.2): job/dag/after/run/Report, host puro-Kof",
      "shell.pipeline REAL no JS (20/09) — fecha o último resíduo de pipe vivo da linha 2.2",
      "kof deploy multi-target da mesma fonte (X9 fatia 4)",
      "hover domain-aware (linha 8.3 do plano universal)",
      "docs de shell idiomáticas + samples provados por compilação no jar do tip",
    ],
  },
  {
    version: "0.4.5-beta",
    date: "19/09",
    items: [
      "kof.shell MVP (fatias 2.2.0–2.2.2 do plano universal)",
      "§132 sleep async cooperativo — KofJS roda o supervisor OTP até a paridade (OTP002 removido)",
      "UI: auto-unsubscribe no ciclo de vida do componente + diff de root (nó DOM e handle sobrevivem ao re-render)",
      "io: copyTo/moveTo/modifiedTime/isSymlink (JVM); getOrDefault nas coleções",
      "D-NULL-INTENT (atmosferas B+C+D atômicas JVM/Script/JS); SEM076 estrito — um campo por nome",
      "bind String como argumento de callback em JVM+JS, byte a byte",
    ],
  },
  {
    version: "0.4.4-beta",
    date: "18/09",
    items: [
      "scheduler.at(cron) parseia a expressão de verdade (CRON001)",
      "app.serveDir no Native/JS emite o WEB005 documentado (era WEB001 fantasma)",
      "classe estendendo interface não vira mais super_class → IncompatibleClassChangeError (#302)",
      "kof.script passa a usar var/val (não o `let` removido)",
      "sincronização de contagens de testes e status nos registros vivos (EN+PT)",
    ],
  },
  {
    version: "0.4.3-beta",
    date: "17/09–18/09",
    items: [
      "§259: timeout/retry/circuit REAIS no x86-64 e no riscv64/aarch64 — fecha o silent no-op nos 4 targets nativos (retry em exceção/≥500, fail-fast 30s half-open)",
      "DWARF no ELF x86: .debug_info com subprogram por função, params/locals via frame_base, DW_AT_type — gdb lê valores tipados (frente 4, fatias 1–3)",
      "AND002 forçado: kof.web é gap honesto em compile-time no Android",
      "kof build --target android ganha --min-sdk/--target-sdk (Fase 4)",
      "SSE handler-scoped no host GraalJS (resíduo WEB001)",
    ],
  },
  {
    version: "0.4.2-beta",
    date: "16/09",
    items: [
      "CONC001 fechado — helpers de concorrência cross riscv64+aarch64 (fatia RtB48, cancel por TID real, E2E qemu nas duas arches)",
      "DB001 fatias 0+1 — link-by-use da libsqlite3 cross + runtime kof_db_* no riscv64/aarch64",
      "D-NARROW-WHILE (#159) — narrowing de fluxo no while e em campo de receiver",
      "FLT001 cross — RuntimeDtoa riscv64/aarch64 (println/valueOf/coleções)",
      "GC cross: varredura G-4 + collect riscv64/aarch64 (NATIVE002 face 1)",
    ],
  },
  {
    version: "0.4.1-beta",
    date: "15/09",
    items: [
      "print heterogêneo em expressões if/switch com ramos de tipos distintos",
      "§101: IEEE NaN em todos os alvos; §179 tipo UI/media declarado",
      "NATIVA002 face 1 — free-list riscv (G-1) + kof_free + kof_memstats",
      "§129 — moldura de exceção por thread fecha o unwind entre threads (opção B das decisões)",
      "supervisor: parada cooperativa por flag (DD-OTP-08) + supervisorStats/restartLimitWindow + relógio injetável",
      "app.security() modelo Spring — CSRF ligado por padrão + alias permitAll (DECISÕES §5)",
      "math.roundTo(Double, Int) em 5 targets (S1b.3); validation.isNis nos 4 targets (S12c)",
    ],
  },
  {
    version: "0.4.0-beta",
    date: "14/09",
    items: [
      "math.roundTo com arredondamento meio-para-longe-do-zero por escala decimal determinística, sem libm (5 alvos)",
      "conversões saturantes Double/Float → Int/Long (JLS 5.1.3) em todos os targets",
      "bloco ui-config + funções de kof.config",
      "time: tzOffsetSeconds (TIME003 honesto), parseDateIso, hoursBetween, todayIso/formatDateIso/isToday nos 5 alvos",
      "math.parse{Int,Long,Double}OrDefault (S13b, 5 alvos)",
      "estreitamento ifnull/ifnonnull (0xc6/0xc7) no JVM recupera e executa (Fase C degrau 2b)",
    ],
  },
  {
    version: "0.3.23-beta",
    date: "13/09",
    items: ["flag --json no `kof check`"],
  },
  {
    version: "0.3.22-beta",
    date: "11/09",
    items: [
      "math: lerp/percentage/isInteger/isDecimal/sqrt (Double) em JVM/Script/JS/x86 com NaN IEEE",
      "SG-009 — subtypeagem nominal no isAssignable (SEM021)",
      "SG-005/SEM049 — desreferência de T? sem narrowing é erro de compilação",
      "SG-008/SEM048 — proibido literal null solto; Map.get devolve V? sempre",
      "validation.formatCpf/formatCnpj/formatCep com pontuação BR; uuid.isUuid; time.isWeekend nos 5 alvos",
    ],
  },
  {
    version: "0.3.21-beta",
    date: "11/09",
    items: ["uuid.v7() ordenado no tempo conforme RFC 9562"],
  },
  {
    version: "0.3.20-beta",
    date: "10/09",
    items: ["higiene: separação do JvmUuidRuntime do runtime de math (classes ≤500 linhas)"],
  },
  {
    version: "0.3.19-beta",
    date: "10/09",
    items: ["uuid.isUuid(STR)→Bool em 4 targets; gate UUID001 honesto no riscv/aarch"],
  },
  {
    version: "0.3.18-beta",
    date: "10/09",
    items: ["§80 fechado + endurecido — matrizes stdmath/stdstrings/stdvalidation"],
  },
  {
    version: "0.3.17-beta",
    date: "10/09",
    items: ["stdvalidation ganha os casos isCpf==true/isCpf==false — fecha a família sinalizada"],
  },
  {
    version: "0.3.16-beta",
    date: "10/09",
    items: [
      "Bool==true no JS normalizado no ponto de comparação — paridade JVM/Native",
      "time addDays/diffDays no Native x86 (S7c); matrizes travam a comparação ==true/==false em 4 targets",
    ],
  },
  {
    version: "0.3.15-beta",
    date: "10/09",
    items: [
      "math.is*/random.boolean devolvem boolean JS real (paridade com JVM/Native)",
      "plano de expansão da stdlib + learn/39 atualizados; addDays/diffDays x86 fechados (TIME002 residual só riscv/aarch)",
    ],
  },
  {
    version: "0.3.14-beta",
    date: "10/09",
    items: [
      "transação aninhada no native x86 passa a cometer o escopo externo (bug real medido e corrigido)",
    ],
  },
  {
    version: "0.3.13-beta",
    date: "10/09",
    items: [
      "time.addDays/diffDays no Native x86 — RuntimeTimeIso em asm (round-trip exaustivo 1..9999)",
    ],
  },
  {
    version: "0.3.12-beta",
    date: "10/09",
    items: ["ano com pad de 4 dígitos no time.addDays JS — byte-idêntico ao %04d do JVM"],
  },
  {
    version: "0.3.11-beta",
    date: "10/09",
    items: ["time.addDays/diffDays no JS — algoritmo civil sem Date, paridade byte-idêntica"],
  },
  {
    version: "0.3.10-beta",
    date: "10/09",
    items: [
      "time.addDays/diffDays em data ISO (JVM/Script via java.time) + gate TIME002 em JS/Native",
    ],
  },
  {
    version: "0.3.9-beta",
    date: "10/09",
    items: [
      "reorganização de docs/planejamento pela nova regra (planning-switch-expr e planning-mutability movidos como FEITOS)",
    ],
  },
  {
    version: "0.3.8-beta",
    date: "10/09",
    items: [
      "namespace kof.random com double/boolean/int/hex + testes multiplataforma",
      "corrigido o random.double() que usava 2^52 como divisor (constante errada) nos runtimes x86 e riscv/aarch",
    ],
  },
  {
    version: "0.3.7-beta",
    date: "10/09",
    items: ["preserva os operandos da pilha em expressões if/switch (#69)"],
  },
  {
    version: "0.3.6-beta",
    date: "09/09",
    items: ["nascimento do namespace kof.random"],
  },
  {
    version: "0.3.5-beta",
    date: "09/09",
    items: [
      "strings.escapeJson nos 5 backends (RFC 8259, oracle Python)",
      "arrays multidimensionais `new T[a][b]`",
      "SECN000 fechado — uuid.v4 riscv/aarch (getrandom ecall 278) + paridade de variante no x86",
      "S8-B/S8-C — net.* URI-parse no x86 e portado riscv/aarch: NET001 fechado",
      "Fase E — anewarray/acessos e new/dup/init nos caminhos de statement",
    ],
  },
  {
    version: "0.3.4-beta",
    date: "09/09",
    items: ["templates de formulário de issue no GitHub"],
  },
  {
    version: "0.3.3-beta",
    date: "09/09",
    items: ["hashCode() sintetizado para records no backend nativo (#55)"],
  },
  {
    version: "0.3.2-beta",
    date: "09/09",
    items: [
      "widgets Fieldset/Iframe/Video/Audio/Hr (UI003)",
      "parâmetro após Long/Double deixa de sumir da assinatura (bug 64/#47 no KofJS)",
      "inventário reverificado contra o build 0.3.1-beta; bugs 62/63 registrados (mutabilidade não validada; let redeclarado em parâmetro)",
    ],
  },
  {
    version: "0.3.1-beta",
    date: "08/09",
    items: [
      "FFI: suporte a função extern + diagnósticos aprimorados",
      "UI fase 3–4: Textarea, Select(options), Table(header,rows), Ul/Ol orientados por dados, Input/Textarea setName/setReadonly (UI003/UI004/UI005)",
      "Canvas: save/restore/alpha/fillText/measureText/transform + drawImage (fecha UI009)",
      "JvmFrameDiagnostics — erros de moldura legíveis",
    ],
  },
  {
    version: "0.3.0-beta",
    date: "05/09",
    items: [
      "NATIVA002-stdlib no cross riscv64+aarch64: String methods, spawn/await, http.get/post/status, JSON completo (listas), time.now() real (clock_gettime)",
      "FLT001 cross — println/valueOf(double) viram diagnóstico honesto em vez de segfault",
      "lambda aninhada capturando variável externa",
      "correções de condição de corrida no spawn",
    ],
  },
  {
    version: "0.2.8-beta",
    date: "04/09",
    items: ["organização: seção 0.2.7 movida para o topo; sem mudança de código"],
  },
  {
    version: "0.2.7-beta",
    date: "04/09",
    items: [
      "CORE COMPLETO em asm puro riscv64→aarch64 por tradutor (NATIVA002) — 13/13 E2E sob qemu",
      "WEB002 T1 — laço de aceitação HTTP/1.1 no Native (listen→accept→read→write→close)",
      "HTTP002 fechado — kof.http no Native (asm HTTP/1.1)",
      "prepared statements MySQL no wire binário (COM_STMT_PREPARE/EXECUTE, módulo ≤500 linhas)",
      "GC mark-sweep real no Native (varredura funcional; auto-collect ainda desligado)",
      "validation 13/13 + observability (counter/gauge/histogram) em asm puro; log/cache/mq viram reais — suíte 842/0",
    ],
  },
  {
    version: "0.2.6-beta",
    date: "30/08–02/09",
    items: [
      "switch-expressão: `case ... ->` produzindo valor (SYN001)",
      "PKG005 — re-import transitivo não é colisão; Set<T> como tipo declarado; membros de classe com retorno genérico",
      "Map.get devolve V?; readLine/File.readText() → String?; File.size sem sentinela -1",
      "captura mutável de lambda de fora da closure; consertado concat de String com FP descartando o operando",
      "riscv64 codegen real mergeado (02/09); caça-bugs da noite 03/09 — 14 corrigidos",
    ],
  },
  {
    version: "0.2.5-beta",
    date: "30/08",
    items: [
      "kof fmt — formatador via parser real (KofFormatter, idempotente)",
      "kof.cache fechado no nativo (clobbers de registradores) + E2E 5 casos × 3 targets",
      "String.length via inferência de toString; removido o travamento do GC automático no caminho de alocação",
    ],
  },
  {
    version: "0.2.4-beta",
    date: "30/08",
    items: [
      "processos externos: F10 spawn (stdin/stdout vivos — a contratação do stdin mudou depois para /dev/null com gravação no-op, na linha 0.6)",
      "gate PROC001 explícito para process.spawn no Native",
      "aritmética Int trunca em 32 bits (fecha N21/família N10); cdq no idivl fecha N22 + SIGFPE do agendador",
      "R3 narrowing de null-safety + R4 Box<T> genérico na JVM; API String + lastIndexOf",
    ],
  },
  {
    version: "0.2.3-beta",
    date: "29/08",
    items: [
      "resposta HTTP rica: status + headerSet; agendador every/at (JVM+JS)",
      "4 bugs de paridade: concat com null, if com null, List e subclasses",
    ],
  },
  {
    version: "0.2.2-beta",
    date: "28/08",
    items: ["esteira de release: passo de artefatos duplicado removido (conserto do Windows pwsh)"],
  },
  {
    version: "0.2.1-beta",
    date: "28/08",
    items: ["GC mark-sweep (rascunho), handshake MySQL, placeholder RISC-V"],
  },
  {
    version: "0.2.0-beta",
    date: "27/08",
    items: [
      "saltar de versão com a linha de 658 testes: KofC, KofScript, kof.http no JS, correção de imports",
    ],
  },
  {
    version: "0.1.11-beta",
    date: "27/08",
    items: ["empacotar + publicar como um único job (perda zero de artefato)"],
  },
  {
    version: "0.1.10-beta",
    date: "27/08",
    items: ["JDK 21 no job de publicação; kof-cli no mesmo passo do release"],
  },
  {
    version: "0.1.9-beta",
    date: "27/08",
    items: ["kof-cli + dist empacotados no mesmo job da release"],
  },
  {
    version: "0.1.8-beta",
    date: "27/08",
    items: ["garantidos os jars kof-cli + lib/kof.jar na dist"],
  },
  {
    version: "0.1.7-beta",
    date: "27/08",
    items: ["pipefail no Windows + checagem de lib/kof.jar + upload de jar"],
  },
  {
    version: "0.1.6-beta",
    date: "27/08",
    items: [
      "GC automático na alocação com coalescência do kof_gc_collect; SIGPIPE 141 no Windows; lib/kof.jar dentro do tar.gz",
    ],
  },
  {
    version: "0.1.5-beta",
    date: "27/08",
    items: ["GC automático na alocação; artefatos sempre enviados"],
  },
  {
    version: "0.1.4-beta",
    date: "27/08",
    items: [
      "KofScript MVP (Fase 6): execução direta sem compilar + JIT em memória + let no topo + `kof test` isolado",
      "CLI: kof script --target, repl, jar de classpath, diagnósticos",
      "switch com `case String s` + instanceof + checkcast em JVM/Native/JS",
      "cache in-process, WebSocket/SSE, agendador every/at, destructuring de record no padrão",
      "nativos RISC-V e ARM aprimorados; compilador de subconjunto C (embrião do KofC)",
    ],
  },
  {
    version: "0.1.3-beta",
    date: "26/08",
    items: ["poll/done + exceção limpa no await — itens de alta prioridade da fila"],
  },
  {
    version: "0.1.2-beta",
    date: "26/08",
    items: [
      "LSP com hover/completion; kof init/fmt/script; collect não recursivo",
      "spawn/await no JS registrados como CONC003 — o fechamento real com async/await nativo veio em 03/09",
    ],
  },
  {
    version: "0.1.1-alpha",
    date: "26/08",
    items: [
      "enum P1: declaração, values/valueOf/name, == por conteúdo em 3 targets",
      "switch exaustivo sobre enum (SEM031); Map/Set nativo em asm — COL001 fechado",
      "G12 TLS/HTTPS (web.listenSecure + kof.http HTTPS); G9 web security completo no Native",
    ],
  },
  {
    version: "0.1.0",
    date: "25/08",
    tag: "primeira estável",
    items: [
      "G5 kof.observability — health/readiness/liveness, counter/gauge, requestId/correlationId (3 targets)",
      "G9 web security — rateLimit, sessões, API keys (3 targets)",
      "G12 TLS/HTTPS — web.listenSecure + kof.http HTTPS",
      "Enums, Map<K,V>/Set<T>, spawn/await, kof.validation",
      "corrige o decode<List<Int>> nativo que caía no ramo JSN002",
    ],
  },
  {
    version: "0.1.0-beta",
    date: "25/08",
    items: [
      "kof.security no Native — asm x86-64 sem libc (PBKDF2-HMAC-SHA256 600k)",
      "lambdas com captura mutável via caixa sintética — kof.time.interval real",
      "kof.http client + kof.mq + kof.time (agendador) + kof.config no nativo",
      "ORM completo: where com operadores, saveAll, page, count, deleteAll",
      "divisão do JvmRuntime em runtimes separados (constant pool 65535); gaps de target deixam de falhar o build silenciosamente",
    ],
  },
  {
    version: "0.0.14-alpha",
    date: "24/08",
    items: [
      "camada de banco nativa: kof.db com SQLite por link direto do .so (sem driver JDBC)",
      "protocolo de autenticação MySQL/MariaDB sobre soquetes nativos — SHA-1 scramble (em andamento)",
      "JSON completo (Float/Double, arrays), logging estruturado, kof.db com JDBC + transações",
    ],
  },
  {
    version: "0.0.13-alpha",
    date: "24/08",
    items: [
      "corte da leva de 24/08 — mesma leva documentada da 0.0.14 (banco nativo + wire MySQL)",
    ],
  },
  {
    version: "0.0.12-alpha",
    date: "24/08",
    items: [
      "corte da leva de 24/08 — process output com virtual threads; substituição de strings + content-type no servidor",
    ],
  },
  {
    version: "0.0.11-alpha",
    date: "24/08",
    items: [
      "corte da leva de 24/08 — registro da versão centralizada, launchers oficiais e empacotamento",
    ],
  },
  {
    version: "0.0.10-alpha",
    date: "24/08",
    items: ["corte da leva de 24/08 — gramática TextMate oficial + docs de editor/LSP"],
  },
  {
    version: "0.0.9-alpha",
    date: "24/08",
    items: [
      "status 375/375 testes — KofJS 100% (GraalJS embutido)",
      "arquitetura da Legacy Migration Platform documentada",
      "reorganização: docs concluídos saem de future/; corpus de aprendizado alinhado com 0.0.4-alpha",
    ],
  },
  {
    version: "0.0.8-alpha",
    date: "23/08",
    items: [
      "kof.ui: múltiplas janelas, redimensionar, fechar=terminar; fonte/negrito/cor nos rótulos",
      "kof test — executa programas e reporta PASS/FAIL por código de saída",
      "Fase I — spawn: tarefas concorrentes na JVM (virtual threads)",
      "API de sistema de arquivos kof.io + CI multiplataforma com guarda de plataforma",
    ],
  },
  {
    version: "0.0.7-alpha",
    date: "23/08",
    items: [
      "primitivas kof.time e kof.io com paridade JVM↔Native",
      "descaracterização de exceção nativa real — try/catch/finally no x86-64",
      "expressões lambda e if-expr com lowering real",
      "gerenciamento de memória nativa real — cabeçalho do alocador, kof_free funcional, memstats ao vivo",
      "comandos de plataforma na CLI: info, check, lsp, install",
    ],
  },
  {
    version: "0.0.6-alpha",
    date: "22/08",
    items: [
      "API rica de List — contains/isEmpty/remove/clear/listOf com paridade JVM+Native",
      "API de String no nativo — indexOf/trim/toUpper/toLower/replace/equalsIgnoreCase/split",
      "JSON com inferência de tipo na codificação/decodificação; List<T> como coleção builtin",
    ],
  },
  {
    version: "0.0.5-alpha",
    date: "22/08",
    items: [
      "backend KofJS (alpha) — a mesma Kof IR emitindo módulos ESM (ECMAScript 2022+)",
      "motor JS embutido (GraalJS) — `kof run --target=js` sem Node.js no caminho",
      "camadas de runtime: kof-runtime.mjs (core) + kof-runtime-io.mjs (plataforma via kof_platform)",
      "classes/records/herança/interfaces, List/String/arrays/JSON, exceções, lambdas, source maps",
      "forma de record em classe: `class User(String name)` com a mesma semântica",
    ],
  },
  {
    version: "0.0.4-alpha",
    date: "22/08",
    items: [
      "versionamento centralizado: VERSION como fonte única + <revision> no Maven",
      "kof info (relatório do ambiente), kof check (type-check sem emissão), kof lsp (Language Server sobre stdio no frontend real)",
      "launchers bin/kof (Unix) e bin/kof.bat (Windows) com suporte a JDK embutido",
      "scripts/package.sh — pacote oficial `kof-<versão>-<os>-<arch>` + SHA256SUMS",
      "GitHub Actions: ci.yml (PR) e release.yml (push na main → teste, bump, publicação)",
    ],
  },
  {
    version: "0.0.3",
    date: "21/08",
    items: [
      "primeiro registro do changelog — as alfas 0.0.1 e 0.0.2 o precedem mas não foram documentadas seção a seção; o histórico completo está no git log",
      "define-se aqui a convenção de commits (feat/fix/docs/refactor/test/build/tooling)",
    ],
  },
];
