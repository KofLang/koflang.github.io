/**
 * kof-changelog — histórico versão a versão curado a partir do
 * CHANGELOG.md / CHANGELOG.pt_BR.md oficiais em KofLang/Kof4j (0.0.3 → 0.6.4).
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
    version: "0.6.5",
    date: "13–14/10",
    tag: "corte em main — release pendente",
    items: [
      "corte EXTRAORDINÁRIO ordenado pela mantenedora (exceção explícita da regra de 1/dia) — mergeada em main pela auto-cascade, mas o gate de release recusou honestamente a publicação: 2 falhas determinísticas do DecompileTest (interação da lane do decompiler com o rewiring do BytecodeDecoder) bloqueiam as tags; Latest segue a 0.6.4",
      "semântica unificada: local/atribuição/retorno `Byte`/`Short` fora de faixa agora estreita no store nos 4 alvos (antes o JVM crashava, o Script estreitava e native/JS mantinham o valor cru — §696); shifts de Int seguem o JVM em todo alvo — `1 << 33` vale `2` também no cross, `-5 >>> 1` idem (§698); divisão por zero de runtime LANÇA nos cross (§699, medição da face inferida do §693)",
      "JS: `switch` sobre Int com `case 0` compila (antes crash interno COMP002 — §700); `try` aninhado em `try` com `finally` interno compila (§702); `break` aninhado em `if` dentro de case de `switch` emite JS correto (§701)",
      "entity-history FASE 5 COMPLETA: as variantes nativas `history_page`/`history_one` pousaram no asm x86-64 (com 4 causas-raiz consertadas, incluindo o slot @@CONN@@ compartilhado que segfaultava a página) — o plano foi promovido de future/ para docs/",
      "decompiler REABERTO e promovido a trabalho corrente (D-FUTURE-PROMOTION, 14/10): concat multi-argumento invertida corrigida (emergia código errado compilável!), `&&`/`||`/cadeias/break/shifts/multidim/instanceof-binding/string-switch/maxOf realista recuperam, Math.sqrt/pow mapeiam para o namespace math; cobertura ~47%→54%",
      "gêmeo capturado do §664: local de tipo função mutado em closure caixa com o FunctionType DECLARADO (antes VerifyError na closure) — o par do §664 da 0.6.1",
      "novos gaps catalogados (honestos, abertos): §706 argumento de tipo genérico aninhado (`Box<Box<Int>>`) quebra o acessor externo no JVM; §703/§704 emitência JS errada/inválida em casos raros de return/break dentro de try-finally em loops",
    ],
  },
  {
    version: "0.6.4",
    date: "13/10",
    tag: "Latest",
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
