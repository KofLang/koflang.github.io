export type WidgetModule = { id: string; title: string; desc: string; code: string; file: string };
export type WidgetExample = { id: string; title: string; desc: string; code: string; file: string };

export const widgetModules: WidgetModule[] = [
  {
    id: "00-core",
    title: "Core — App, cores e helpers",
    desc: "Fundação: App (Window+Theme), cores semânticas e helpers puros repeat/pad/ellipsis.",
    file: "src/00-core.kf",
    code: `// 00-core.kf — fundação: App, tema, e helpers puros de texto/número.
//
// Tudo aqui é composição dos primitivos do kof.ui ou funções puras.
// As funções puras são o coração testável da biblioteca: cada componente
// interativo delega a transição de estado para uma delas.

// ---- App --------------------------------------------------------------------

// "abra o app" — janela pronta: tema escuro do Kof, tamanho civilizado.
App(String title): Int {
    var w = Window(title)
    w.size(960, 640)
    w.theme = Theme.dark()
    Int wh = w
    return wh
}

// ---- Cores semânticas (atalhos do tema escuro) ------------------------------

SurfaceColor(): Int {
    Int c = Theme.dark().surface()
    return c
}

ErrorColor(): Int {
    Int c = Theme.dark().error()
    return c
}

PrimaryColor(): Int {
    Int c = Theme.dark().primary()
    return c
}

TextColor(): Int {
    Int c = Theme.dark().text()
    return c
}

// ---- Texto puro -------------------------------------------------------------

// repete \`piece\` n vezes — base de barras, skeletons e grids.
repeat(String piece, Int n): String {
    var out = ""
    var i = 0
    while (i < n) {
        out = out + piece
        i = i + 1
    }
    return out
}

// completa com espaços à direita até \`width\` (tabelas, colunas).
padEnd(String s, Int width): String {
    var out = s
    while (out.length < width) {
        out = out + " "
    }
    return out
}

// completa com espaços à esquerda até \`width\` (números alinhados).
padStart(String s, Int width): String {
    var out = s
    while (out.length < width) {
        out = " " + out
    }
    return out
}

// trunca com reticências quando passa de \`width\`.
ellipsis(String s, Int width): String {
    if (s.length <= width) {
        return s
    }
    if (width < 2) {
        return substringN(s, 0, width)
    }
    return substringN(s, 0, width - 1) + "…"
}

// substring segura: corta nos limites, nunca estoura.
substringN(String s, Int start, Int end): String {
    if (s.length == 0) {
        return ""
    }
    var a = clamp(start, 0, s.length)
    var b = clamp(end, 0, s.length)
    if (b <= a) {
        return ""
    }
    return s.substring(a, b)
}

// conta ocorrências de um caractere (um char = string de 1).
countChar(String s, String ch): Int {
    var n = 0
    var i = 0
    while (i < s.length) {
        if (s.charAt(i) == ch.charAt(0)) {
            n = n + 1
        }
        i = i + 1
    }
    return n
}

// junta uma lista com separador (breadcrumbs, menus).
join(List<String> parts, String sep): String {
    if (parts.size == 0) {
        return ""
    }
    var out = parts.get(0)
    var i = 1
    while (i < parts.size) {
        out = out + sep + parts.get(i)
        i = i + 1
    }
    return out
}

// ---- Números puros ------------------------------------------------------------

clamp(Int v, Int min, Int max): Int {
    if (v < min) {
        return min
    }
    if (v > max) {
        return max
    }
    return v
}

// wrap-around: avança voltando ao início (carrosséis, relógios).
wrapNext(Int i, Int n): Int {
    if (n <= 0) {
        return 0
    }
    return (i + 1) % n
}

wrapPrev(Int i, Int n): Int {
    if (n <= 0) {
        return 0
    }
    return (i - 1 + n) % n
}
`,
  },
  {
    id: "01-typography",
    title: "Tipografia",
    desc: "Heading/Subheading/Text/Muted/Quote — texto nos três níveis.",
    file: "src/01-typography.kf",
    code: `// 01-typography.kf — texto nos três níveis + variações.
//
// Link clicável é primitivo da plataforma desde o update:
//   Link("documentação", "https://kof.dev")   // texto + url
//
// Padrão do Kof: cada intenção é um construtor que devolve o handle pronto.

Heading(String text): Int {
    var l = Label(text)
    l.fontSize = 26
    l.bold = true
    Int h = l
    return h
}

Subheading(String text): Int {
    var l = Label(text)
    l.fontSize = 18
    l.bold = true
    Int h = l
    return h
}

Text(String text): Int {
    var l = Label(text)
    Int h = l
    return h
}

Muted(String text): Int {
    var l = Label(text)
    l.fontSize = 13
    l.color = Palette.gray
    Int h = l
    return h
}

Code(String text): Int {
    var l = Label(text)
    l.color = Palette.cyan
    Int f = Font("monospace", 13)
    l.setFont(f)
    Int h = l
    return h
}

Quote(String text): Int {
    var theme = Theme.dark()
    var bar = View(Style(theme.primary(), Palette.transparent, 2, 2))
    var l = Label(text)
    l.color = Palette.gray
    bar.bind(l)
    Int h = bar
    return h
}
`,
  },
  {
    id: "02-layout",
    title: "Layout",
    desc: "Section/Panel/Card + VSpace/HSpace/Divider — containers com nome.",
    file: "src/02-layout.kf",
    code: `// 02-layout.kf — containers com nome: seção, painel, respiro, divisor.

Section(String title): Int {
    var theme = Theme.dark()
    var t = Subheading(title)
    var col = Column(listOf(t))
    var box = View(Style(theme.surface(), Palette.white, 16, 12))
    box.bind(col)
    Int h = box
    return h
}

Panel(Int content): Int {
    var theme = Theme.dark()
    var box = View(Style(theme.surface(), Palette.white, 16, 12))
    box.bind(content)
    Int h = box
    return h
}

Card(String title): Int {
    var theme = Theme.dark()
    var titulo = Heading(title)
    var box = View(Style(theme.surface(), Palette.white, 16, 12))
    box.bind(titulo)
    Int h = box
    return h
}

// espaço vertical entre blocos (a plataforma não tem gap: é um label vazio).
VSpace(Int px): Int {
    var l = Label("")
    l.fontSize = clamp(px, 4, 120)
    Int h = l
    return h
}

HSpace(Int px): Int {
    var l = Label(" ")
    l.fontSize = clamp(px, 4, 120)
    Int h = l
    return h
}

Divider(): Int {
    var theme = Theme.dark()
    var box = View(Style(theme.primary(), Palette.transparent, 1, 1))
    box.bind(Label(" "))
    Int h = box
    return h
}

Badge(String text): Int {
    var l = Label(text)
    l.fontSize = 12
    var box = View(Style(Color.rgba(255, 255, 255, 24), Palette.white, 4, 999))
    box.bind(l)
    Int h = box
    return h
}

Tag(String text, Int color): Int {
    var l = Label(text)
    l.fontSize = 12
    l.color = color
    var box = View(Style(Color.rgba(255, 255, 255, 16), color, 4, 999))
    box.bind(l)
    Int h = box
    return h
}

Chip(String text): Int {
    var theme = Theme.dark()
    var l = Label(text + " ✕")
    l.fontSize = 12
    var box = View(Style(theme.surface(), Palette.white, 6, 999))
    box.bind(l)
    Int h = box
    return h
}
`,
  },
  {
    id: "03-forms",
    title: "Formulários",
    desc: "TextField, validação pura isEmail/validationSummary.",
    file: "src/03-forms.kf",
    code: `// 03-forms.kf — campos de formulário e validação.
//
// A plataforma não tem evento de teclado: o valor do Input é lido quando
// a ação roda (clique). TextField sincroniza para fora via botão ↻ e via
// leitura direta do input capturado no seu próprio escopo.
//
// Multi-instância: cada TextField criado compartilha TextFieldState
// (limite alpha documentado). Para campos independentes, crie os Inputs
// direto e leia com input.text() — docs/learn/04-forms.md mostra a receita.

class TextFieldState {
    static String value = ""
}

record TextFieldParts(Int root, Int refresh)

TextField(String caption, String placeholder): TextFieldParts {
    var theme = Theme.dark()
    var cap = Muted(caption)
    var inp = Input(placeholder)
    var hint = Label("")
    hint.fontSize = 12
    hint.color = Palette.gray

    Int capH = cap
    Int inpH = inp
    var field = Column(listOf(capH, inpH))
    var box = View(Style(theme.surface(), Palette.white, 12, 8))
    box.bind(field)
    box.bind(hint)

    box.bind(Button("↻ salvar valor", () -> {
        TextFieldState.value = inp.text()
        hint.setText("valor salvo")
    }))

    Int rootH = box
    return TextFieldParts(rootH, rootH)
}

// ---- Validação (pura — testável em todos os alvos) ---------------------------

isBlank(String s): Bool {
    return s == ""
}

minLength(String s, Int n): Bool {
    return s.length >= n
}

maxLength(String s, Int n): Bool {
    return s.length <= n
}

isEmail(String s): Bool {
    if (s.length < 5) {
        return false
    }
    if (!s.contains("@")) {
        return false
    }
    if (!s.contains(".")) {
        return false
    }
    if (s.charAt(0) == '@') {
        return false
    }
    var at = indexOf(s, "@")
    var dot = indexOf(s, ".")
    return at < dot && at > 0 && dot < s.length - 1
}

isNumber(String s): Bool {
    if (s.length == 0) {
        return false
    }
    var i = 0
    while (i < s.length) {
        var c = s.charAt(i)
        if (c < '0' || c > '9') {
            return false
        }
        i = i + 1
    }
    return true
}

indexOf(String s, String needle): Int {
    var n = needle.length
    if (n == 0 || n > s.length) {
        return -1
    }
    var i = 0
    while (i <= s.length - n) {
        if (s.substring(i, i + n) == needle) {
            return i
        }
        i = i + 1
    }
    return -1
}

// resumo de validação: lista de erros -> texto para o label do formulário.
validationSummary(List<String> errors): String {
    if (errors.size == 0) {
        return "✓ tudo certo"
    }
    var out = "✕ corrija " + errors.size + " campo(s):"
    var i = 0
    while (i < errors.size) {
        out = out + "\\n• " + errors.get(i)
        i = i + 1
    }
    return out
}
`,
  },
  {
    id: "04-choices",
    title: "Escolhas",
    desc: "Checkbox, ToggleSwitch, RadioGroup, Rating — estado por instância.",
    file: "src/04-choices.kf",
    code: `// 04-choices.kf — checkbox, toggle-switch, radio group e rating.
//
// Padrão de componente interativo da biblioteca:
//   estado local BOXADO (captura por referência desde o update do
//   kof.time/interval) + transições puras testáveis + rebind de irmão
//   capturado. Cada instância tem estado PRÓPRIO e independente.
//
// Espelhos estáticos: onde o app precisa LER a escolha (radio, paginação,
// busca), a ação escreve também num estático documentado — ele reflete a
// última instância interagida. O visual, porém, nunca depende dele.

// ---- Checkbox -----------------------------------------------------------------

record CheckboxParts(Int root)

Checkbox(String label): CheckboxParts {
    var theme = Theme.dark()
    var on = false
    var mark = Label("[ ]")
    var btn = Button(label, () -> {
        on = flip(on)
        if (on) {
            mark.setText("[x] " + label)
        } else {
            mark.setText("[ ] " + label)
        }
    })
    Int m = mark
    Int b = btn
    var col = Column(listOf(m, b))
    var box = View(Style(theme.surface(), Palette.white, 8, 8))
    box.bind(col)
    Int root = box
    return CheckboxParts(root)
}

// transição pura (testável): alterna.
flip(Bool v): Bool {
    if (v) {
        return false
    }
    return true
}

// ---- Toggle switch --------------------------------------------------------------

record SwitchParts(Int root)

ToggleSwitch(String label): SwitchParts {
    var theme = Theme.dark()
    var on = false
    var knob = Label("○ off")
    var btn = Button(label, () -> {
        on = flip(on)
        if (on) {
            knob.setText("● on")
        } else {
            knob.setText("○ off")
        }
    })
    Int k = knob
    Int b = btn
    var row = Row(listOf(k, b))
    var box = View(Style(theme.surface(), Palette.white, 8, 8))
    box.bind(row)
    Int root = box
    return SwitchParts(root)
}

// ---- Radio group ----------------------------------------------------------------

class RadioMirror {
    static Int lastSelected = -1
}

record RadioParts(Int root)

RadioGroup(List<String> options): RadioParts {
    var theme = Theme.dark()
    var selected = -1
    var choice = Label("nenhuma opção")

    // até 4 opções, sem loop: cada botão captura a própria cópia do índice
    var b0 = Button(options.get(0), () -> {
        selected = 0
        RadioMirror.lastSelected = 0
        choice.setText("> " + options.get(0))
    })
    var items = listOf(b0)
    if (options.size > 1) {
        var b1 = Button(options.get(1), () -> {
            selected = 1
            RadioMirror.lastSelected = 1
            choice.setText("> " + options.get(1))
        })
        items.add(b1)
    }
    if (options.size > 2) {
        var b2 = Button(options.get(2), () -> {
            selected = 2
            RadioMirror.lastSelected = 2
            choice.setText("> " + options.get(2))
        })
        items.add(b2)
    }
    if (options.size > 3) {
        var b3 = Button(options.get(3), () -> {
            selected = 3
            RadioMirror.lastSelected = 3
            choice.setText("> " + options.get(3))
        })
        items.add(b3)
    }

    Int c = choice
    var col = Column(listOf(c))
    var i = 0
    while (i < items.size) {
        col.bind(items.get(i))
        i = i + 1
    }
    var box = View(Style(theme.surface(), Palette.white, 8, 8))
    box.bind(col)
    Int root = box
    return RadioParts(root)
}

// espelho da última seleção (qualquer grupo) para lógica do app.
radioSelected(): Int {
    return RadioMirror.lastSelected
}

// ---- Rating -----------------------------------------------------------------------

record RatingParts(Int root)

Rating(String subject): RatingParts {
    var theme = Theme.dark()
    var stars = 0
    var face = Label(ratingFace(0))
    var b1 = Button("★", () -> {
        stars = toggleStars(stars, 1)
        face.setText(ratingFace(stars))
    })
    var b2 = Button("★★", () -> {
        stars = toggleStars(stars, 2)
        face.setText(ratingFace(stars))
    })
    var b3 = Button("★★★", () -> {
        stars = toggleStars(stars, 3)
        face.setText(ratingFace(stars))
    })
    Int f = face
    Int r1 = b1
    Int r2 = b2
    Int r3 = b3
    Int strip = Row(listOf(r1, r2, r3))
    Int sub = Muted(subject)
    var col = Column(listOf(f, strip, sub))
    var box = View(Style(theme.surface(), Palette.white, 8, 8))
    box.bind(col)
    Int root = box
    return RatingParts(root)
}

// transição pura: clicar na nota já dada volta a zero.
toggleStars(Int current, Int target): Int {
    if (current == target) {
        return 0
    }
    return target
}

ratingFace(Int stars): String {
    if (stars <= 0) {
        return "☆☆☆"
    }
    if (stars == 1) {
        return "★☆☆"
    }
    if (stars == 2) {
        return "★★☆"
    }
    return "★★★"
}
`,
  },
  {
    id: "05-navigation",
    title: "Navegação",
    desc: "Tabs, Accordion, Pagination, Navbar, Breadcrumbs, SearchBox.",
    file: "src/05-navigation.kf",
    code: `// 05-navigation.kf — tabs, accordion, paginação, breadcrumbs, navbar, busca.
//
// Navegação sem rotas da plataforma: estado estático + transições puras +
// rebind de labels capturados. O conteúdo é texto (List<String>) — a troca
// de "página" é a troca do texto do corpo.

// ---- Tabs ------------------------------------------------------------------------

record TabParts(Int root)

Tabs(List<String> titles, List<String> pages): TabParts {
    var theme = Theme.dark()
    var active = 0
    var body = Label(tabBody(titles, pages, 0))

    var b0 = Button(titles.get(0), () -> {
        active = 0
        body.setText(tabBody(titles, pages, 0))
    })
    var items = listOf(b0)
    if (titles.size > 1) {
        var b1 = Button(titles.get(1), () -> {
            active = 1
            body.setText(tabBody(titles, pages, 1))
        })
        items.add(b1)
    }
    if (titles.size > 2) {
        var b2 = Button(titles.get(2), () -> {
            active = 2
            body.setText(tabBody(titles, pages, 2))
        })
        items.add(b2)
    }
    if (titles.size > 3) {
        var b3 = Button(titles.get(3), () -> {
            active = 3
            body.setText(tabBody(titles, pages, 3))
        })
        items.add(b3)
    }

    Int stripH = Row(items)
    var box = View(Style(theme.surface(), Palette.white, 12, 8))
    box.bind(stripH)
    box.bind(body)
    Int bh = box
    return TabParts(bh)
}

// transição pura: corpo = "▸ título\\n\\nconteúdo".
tabBody(List<String> titles, List<String> pages, Int index): String {
    if (titles.size == 0 || pages.size == 0) {
        return ""
    }
    var i = clamp(index, 0, titles.size - 1)
    var content = ""
    if (i < pages.size) {
        content = pages.get(i)
    }
    return "▸ " + titles.get(i) + "\\n\\n" + content
}

// ---- Accordion ----------------------------------------------------------------------

record AccordionParts(Int root)

Accordion(String title, String content): AccordionParts {
    var theme = Theme.dark()
    var open = true
    var mark = Label(accordionMark(true))
    var body = Label(accordionBody(content, true))
    var btn = Button(title, () -> {
        open = flip(open)
        mark.setText(accordionMark(open))
        body.setText(accordionBody(content, open))
    })
    Int mh = mark
    Int bh2 = btn
    Int head = Row(listOf(mh, bh2))
    var col = Column(listOf(head, body))
    var box = View(Style(theme.surface(), Palette.white, 8, 8))
    box.bind(col)
    Int bh = box
    return AccordionParts(bh)
}

accordionMark(Bool open): String {
    if (open) {
        return "▾"
    }
    return "▸"
}

accordionBody(String content, Bool open): String {
    if (open) {
        return content
    }
    return ""
}

// ---- Pagination -----------------------------------------------------------------------

class PageState {
    static Int page = 1
}

record PagerParts(Int root)

Pagination(Int total): PagerParts {
    var info = Label(pagerLabel(PageState.page, total))
    var prev = Button("‹ prev", () -> {
        PageState.page = prevPage(PageState.page, total)
        info.setText(pagerLabel(PageState.page, total))
    })
    var next = Button("next ›", () -> {
        PageState.page = nextPage(PageState.page, total)
        info.setText(pagerLabel(PageState.page, total))
    })
    Int ph = prev
    Int ih = info
    Int nh = next
    var row = Row(listOf(ph, ih, nh))
    Int rh = row
    return PagerParts(rh)
}

// transições puras: limita em [1, total]; total 0 trava na página 1.
nextPage(Int page, Int total): Int {
    if (total <= 0) {
        return 1
    }
    return clamp(page + 1, 1, total)
}

prevPage(Int page, Int total): Int {
    if (total <= 0) {
        return 1
    }
    return clamp(page - 1, 1, total)
}

pagerLabel(Int page, Int total): String {
    if (total <= 0) {
        return "sem páginas"
    }
    return "página " + padStart(str(page), 3) + " / " + total
}

str(Int v): String {
    return "" + v
}

// ---- Breadcrumbs -------------------------------------------------------------------------

Breadcrumbs(List<String> parts): Int {
    var l = Label(join(parts, "  ›  "))
    l.color = Palette.gray
    Int h = l
    return h
}

// ---- Navbar ---------------------------------------------------------------------------------

class NavState {
    static String route = "home"
}

record NavParts(Int root)

Navbar(List<String> routes): NavParts {
    var status = Label("→ " + NavState.route)

    var b0 = Button(routes.get(0), () -> {
        NavState.route = routes.get(0)
        status.setText("→ " + routes.get(0))
    })
    var items = listOf(b0)
    if (routes.size > 1) {
        var b1 = Button(routes.get(1), () -> {
            NavState.route = routes.get(1)
            status.setText("→ " + routes.get(1))
        })
        items.add(b1)
    }
    if (routes.size > 2) {
        var b2 = Button(routes.get(2), () -> {
            NavState.route = routes.get(2)
            status.setText("→ " + routes.get(2))
        })
        items.add(b2)
    }
    if (routes.size > 3) {
        var b3 = Button(routes.get(3), () -> {
            NavState.route = routes.get(3)
            status.setText("→ " + routes.get(3))
        })
        items.add(b3)
    }

    Int navstrip = Row(items)
    Int div = Divider()
    Int st = status
    var col = Column(listOf(navstrip, div, st))
    Int h = col
    return NavParts(h)
}

navRoute(): String {
    return NavState.route
}

// ---- Search / command palette ------------------------------------------------------------------

class SearchState {
    static String query = ""
    static Int matches = 0
}

record SearchParts(Int root)

SearchBox(List<String> dataset, String placeholder): SearchParts {
    var theme = Theme.dark()
    var inp = Input(placeholder)
    var results = Label("digite para buscar em " + dataset.size + " itens")

    var go = Button("buscar ⌕", () -> {
        SearchState.query = inp.text()
        SearchState.matches = countMatches(dataset, SearchState.query)
        results.setText(searchReport(dataset, SearchState.query))
    })
    var clearBtn = Button("✕", () -> {
        SearchState.query = ""
        inp.setText("")
        results.setText("busca limpa")
    })

    Int inh = inp
    Int gh = go
    Int ch = clearBtn
    Int actions = Row(listOf(gh, ch))
    var col = Column(listOf(inh, actions, results))
    var box = View(Style(theme.surface(), Palette.white, 12, 8))
    box.bind(col)
    Int bh = box
    return SearchParts(bh)
}

// quantos itens contêm a query (case exato; plataforma não tem case-fold).
countMatches(List<String> dataset, String query): Int {
    if (isBlank(query)) {
        return 0
    }
    var n = 0
    var i = 0
    while (i < dataset.size) {
        if (dataset.get(i).contains(query)) {
            n = n + 1
        }
        i = i + 1
    }
    return n
}

searchReport(List<String> dataset, String query): String {
    var n = countMatches(dataset, query)
    if (n == 0) {
        return "nada para \\"" + ellipsis(query, 24) + "\\""
    }
    var out = str(n) + " resultado(s):"
    var shown = 0
    var i = 0
    while (i < dataset.size && shown < 5) {
        if (dataset.get(i).contains(query)) {
            out = out + "\\n• " + ellipsis(dataset.get(i), 40)
            shown = shown + 1
        }
        i = i + 1
    }
    if (n > shown) {
        out = out + "\\n… +" + (n - shown) + " mais"
    }
    return out
}
`,
  },
  {
    id: "06-overlays",
    title: "Overlays",
    desc: "Dialog, Confirm, Drawer, Tooltip, Toast, Alert.",
    file: "src/06-overlays.kf",
    code: `// 06-overlays.kf — dialogs, drawers, tooltips, toasts, alerts e confirms.
//
// Janelas são baratas no kof.ui (uma por handle) e o bind aceita qualquer
// subárvore pronta (handle Int). Um dialog é uma segunda Window mostrando
// conteúdo existente; fechá-la não encerra o app enquanto a principal fica.
//
// Decisões de design:
//   - Dialog/Drawer/Toast se mostram sozinhos ("mostre isto" é a intenção).
//   - Tooltip cria a janela OCULTA na construção; o clique é que mostra.
//   - Sem timer na plataforma: toast tem ✕ em vez de sumir sozinho.

class ConfirmState {
    static Bool answered = false
}

record ConfirmParts(Int root)
record DrawerParts(Int root)
record TooltipParts(Int root)

// ---- Dialog / Modal -------------------------------------------------------------

// recebe uma subárvore PRONTA (handle Int) e a mostra num diálogo.
Dialog(String title, Int content): Int {
    var w = Window(title)
    w.size(460, 320)
    w.theme = Theme.dark()
    var ok = Button("ok", () -> {
        w.close()
    })
    Int cth = content
    Int spc = VSpace(12)
    Int okh = ok
    var layout = Column(listOf(cth, spc, okh))
    w.bind(layout)
    w.show()
    Int wh = w
    return wh
}

MessageDialog(String title, String message): Int {
    var content = Column(listOf(Text(message)))
    Int ch = content
    return Dialog(title, ch)
}

Confirm(String title, String question): ConfirmParts {
    var answer = Label("pendente")
    Int qh = Text(question)
    Int sp8 = VSpace(8)
    Int ah = answer
    var body = Column(listOf(qh, sp8, ah))

    var w = Window(title)
    w.size(420, 240)
    w.theme = Theme.dark()
    var yes = Button("confirmar", () -> {
        ConfirmState.answered = true
        answer.setText("✓ confirmado")
        w.close()
    })
    var no = Button("cancelar", () -> {
        ConfirmState.answered = false
        answer.setText("✕ cancelado")
        w.close()
    })
    Int bodyH = body
    Int yh = yes
    Int nh = no
    Int actions = Row(listOf(yh, nh))
    Int sp12 = VSpace(12)
    w.bind(Column(listOf(bodyH, sp12, actions)))
    w.show()

    Int wh = w
    return ConfirmParts(wh)
}

confirmAnswered(): Bool {
    return ConfirmState.answered
}

// ---- Drawer -----------------------------------------------------------------------

Drawer(String title, Int content): DrawerParts {
    var w = Window(title)
    w.size(280, 640)
    w.theme = Theme.dark()
    Int th = Subheading(title)
    Int dh = Divider()
    var layout = Column(listOf(th, dh, content))
    w.bind(layout)
    w.show()
    Int wh = w
    return DrawerParts(wh)
}

// ---- Tooltip -------------------------------------------------------------------------

// O gatilho fica no fluxo da página; a explicação abre numa janela própria.
Tooltip(String term, String explanation): TooltipParts {
    var theme = Theme.dark()

    var dlg = Window(term)
    dlg.size(380, 200)
    dlg.theme = Theme.dark()
    var okBtn = Button("entendi", () -> {
        dlg.close()
    })
    Int exh = Text(explanation)
    Int spx = VSpace(12)
    Int okx = okBtn
    var dlgLayout = Column(listOf(exh, spx, okx))
    dlg.bind(dlgLayout)

    var btn = Button(term + " ?", () -> {
        dlg.show()
    })
    var tipBadge = Badge("?")
    Int btnh = btn
    Int badgeh = tipBadge
    var trigger = Row(listOf(btnh, badgeh))
    var box = View(Style(theme.surface(), Palette.white, 8, 8))
    box.bind(trigger)

    Int bh = box
    return TooltipParts(bh)
}

// ---- Toast ------------------------------------------------------------------------------

Toast(String message): Int {
    var theme = Theme.dark()
    var msg = Label(message)
    var box = View(Style(theme.primary(), Palette.white, 10, 999))
    box.bind(msg)

    var w = Window("toast")
    w.size(360, 110)
    w.theme = Theme.dark()
    var closeBtn = Button("✕ fechar", () -> {
        w.close()
    })
    Int bxh = box
    Int sp8b = VSpace(8)
    Int cbh = closeBtn
    var layout = Column(listOf(bxh, sp8b, cbh))
    w.bind(layout)
    w.show()
    Int wh = w
    return wh
}

// ---- Alert / Banner -------------------------------------------------------------------------

Alert(String kind, String message): Int {
    var glyph = Label(alertGlyph(kind))
    glyph.color = alertColor(kind)
    var m = Label(message)
    m.color = alertColor(kind)

    var box = View(Style(Color.rgba(255, 255, 255, 16), alertColor(kind), 12, 8))
    box.bind(Row(listOf(glyph, m)))
    Int bh = box
    return bh
}

alertGlyph(String kind): String {
    if (kind == "error") {
        return "✕"
    }
    if (kind == "warn") {
        return "!"
    }
    if (kind == "info") {
        return "i"
    }
    return "✓"
}

alertColor(String kind): Int {
    if (kind == "error") {
        return ErrorColor()
    }
    if (kind == "warn") {
        return Palette.yellow
    }
    if (kind == "info") {
        return Palette.cyan
    }
    return Palette.green
}
`,
  },
  {
    id: "07-data",
    title: "Dados",
    desc: "DataTable, TreeView, ListView, Timeline, StatCard, Avatar, Empty.",
    file: "src/07-data.kf",
    code: `// 07-data.kf — tabela, árvore, lista, timeline, stat card, avatar e vazio.
//
// A plataforma não tem grid de verdade: tabelas e árvores são texto bem
// alinhado (padEnd/padStart do core) com larguras calculadas. A intenção
// permanece — "mostre estes dados tabulares" — e o alinhamento é nosso.

record StatCardParts(Int root)
record AvatarParts(Int root)

// ---- DataTable ---------------------------------------------------------------------

// Cada linha traz as células separadas por ";": "Mel;dev;ativo".
DataTable(String headersCsv, List<String> rows): Int {
    var l = Label(tableText(headersCsv, rows))
    l.color = Palette.white
    Int f = Font("monospace", 13)
    l.setFont(f)
    Int h = l
    return h
}

tableText(String headersCsv, List<String> rows): String {
    var headers = split(headersCsv, ";")
    if (headers.size == 0) {
        return ""
    }
    var widths = columnWidths(headers, rows)

    var out = tableRow(headers, widths)
    out = out + "\\n" + repeat("─", totalWidth(widths))
    var r = 0
    while (r < rows.size) {
        out = out + "\\n" + tableRow(split(rows.get(r), ";"), widths)
        r = r + 1
    }
    return out
}

columnWidths(String headersCsv, List<String> rows): List<Int> {
    var headers = split(headersCsv, ";")
    var w = listOf<Int>()
    var c = 0
    while (c < headers.size) {
        var max = headers.get(c).length
        var r = 0
        while (r < rows.size) {
            var cellLen = cellLength(rows.get(r), c)
            if (cellLen > max) {
                max = cellLen
            }
            r = r + 1
        }
        w.add(max + 2)
        c = c + 1
    }
    return w
}

cellLength(String row, Int col): Int {
    var cells = split(row, ";")
    if (col >= cells.size) {
        return 0
    }
    return cells.get(col).length
}

tableRow(List<String> cells, List<Int> widths): String {
    var out = ""
    var c = 0
    while (c < cells.size && c < widths.size) {
        out = out + padEnd(cells.get(c), widths.get(c))
        c = c + 1
    }
    return out
}

totalWidth(List<Int> widths): Int {
    var t = 0
    var i = 0
    while (i < widths.size) {
        t = t + widths.get(i)
        i = i + 1
    }
    return t
}

// split próprio: a plataforma não tem String.split.
split(String s, String sep): List<String> {
    var parts = listOf<String>()
    var rest = s
    while (rest.contains(sep)) {
        var idx = indexOf(rest, sep)
        parts.add(substringN(rest, 0, idx))
        rest = substringN(rest, idx + sep.length, rest.length)
    }
    parts.add(rest)
    return parts
}

// ---- TreeView -------------------------------------------------------------------------

TreeView(List<String> paths): Int {
    var l = Label(treeText(paths))
    Int h = l
    return h
}

treeText(List<String> paths): String {
    if (paths.size == 0) {
        return "(vazio)"
    }
    var out = treeLine(paths.get(0))
    var i = 1
    while (i < paths.size) {
        out = out + "\\n" + treeLine(paths.get(i))
        i = i + 1
    }
    return out
}

treeLine(String path): String {
    var depth = countChar(path, "/")
    var name = path
    var slash = lastIndexOf(path, "/")
    if (slash >= 0) {
        name = substringN(path, slash + 1, path.length)
    }
    var indent = repeat("  ", depth)
    return indent + "• " + name
}

lastIndexOf(String s, String needle): Int {
    var n = needle.length
    if (n == 0 || n > s.length) {
        return -1
    }
    var i = s.length - n
    while (i >= 0) {
        if (s.substring(i, i + n) == needle) {
            return i
        }
        i = i - 1
    }
    return -1
}

// ---- ListView ------------------------------------------------------------------------------

ListView(List<String> items, Bool numbered): Int {
    var l = Label(listText(items, numbered))
    Int h = l
    return h
}

listText(List<String> items, Bool numbered): String {
    if (items.size == 0) {
        return EmptyState.EMPTY_TEXT
    }
    var out = ""
    var i = 0
    while (i < items.size) {
        var bullet = "• "
        if (numbered) {
            bullet = str(i + 1) + ". "
        }
        if (i > 0) {
            out = out + "\\n"
        }
        out = out + bullet + items.get(i)
        i = i + 1
    }
    return out
}

// ---- Timeline ---------------------------------------------------------------------------------

Timeline(List<String> events): Int {
    var l = Label(timelineText(events))
    Int h = l
    return h
}

timelineText(List<String> events): String {
    if (events.size == 0) {
        return EmptyState.EMPTY_TEXT
    }
    var out = "○ " + events.get(0)
    var i = 1
    while (i < events.size) {
        out = out + "\\n│\\n○ " + events.get(i)
        i = i + 1
    }
    return out
}

// ---- StatCard -----------------------------------------------------------------------------------

StatCard(String label, String value, String trend): StatCardParts {
    var theme = Theme.dark()
    var big = Label(value)
    big.fontSize = 30
    big.bold = true

    var trendColor = Palette.gray
    if (trend.startsWith("+")) {
        trendColor = Palette.green
    }
    if (trend.startsWith("-")) {
        trendColor = ErrorColor()
    }
    var tr = Label(trend)
    tr.color = trendColor
    tr.fontSize = 12

    var box = View(Style(theme.surface(), Palette.white, 14, 10))
    box.bind(Column(listOf(Muted(label), big, tr)))
    Int bh = box
    return StatCardParts(bh)
}

// ---- Avatar ----------------------------------------------------------------------------------------

Avatar(String name): AvatarParts {
    var initials = Label(avatarInitials(name))
    initials.bold = true
    var box = View(Style(avatarColor(name), Palette.white, 8, 999))
    box.bind(initials)
    Int bh = box
    return AvatarParts(bh)
}

avatarInitials(String name): String {
    var trimmed = trimSpaces(name)
    if (trimmed.length == 0) {
        return "?"
    }
    var first = substringN(trimmed, 0, 1)
    var space = indexOf(trimmed, " ")
    if (space < 0) {
        return first
    }
    var second = substringN(trimmed, space + 1, space + 2)
    return first + second
}

avatarColor(String name): Int {
    var options = listOf(Palette.purple, Palette.blue, Palette.green, Palette.orange)
    var idx = clamp(name.length, 0, options.size - 1)
    return options.get(idx)
}

trimSpaces(String s): String {
    var start = 0
    while (start < s.length && s.charAt(start) == ' ') {
        start = start + 1
    }
    var end = s.length
    while (end > start && s.charAt(end - 1) == ' ') {
        end = end - 1
    }
    return s.substring(start, end)
}

// ---- Empty -------------------------------------------------------------------------------------------

class EmptyState {
    static String EMPTY_TEXT = "nada por aqui ainda"
}

Empty(): Int {
    var l = Label(EmptyState.EMPTY_TEXT)
    l.color = Palette.gray
    Int h = l
    return h
}
`,
  },
  {
    id: "08-datetime",
    title: "Data/Hora",
    desc: "Calendar, DatePicker, TimePicker — Sakamoto puro.",
    file: "src/08-datetime.kf",
    code: `// 08-datetime.kf — calendário, date picker e time picker.
//
// Sem biblioteca de datas além de kof.time now(): dia-da-semana é
// calculado com o algoritmo de Sakamoto (puro, testável contra âncoras).
// Relógio ao vivo fica de fora: now() devolve Long e não há conversão
// Long→Int na plataforma (gap UIW020, docs/gaps.md).

record PickerParts(Int root)

// ---- dia da semana (0=domingo .. 6=sábado) ----------------------------------------

dayOfWeek(Int year, Int month, Int day): Int {
    var t = monthOffsets()
    var y = year
    if (month < 3) {
        y = y - 1
    }
    var sum = y + y / 4 - y / 100 + y / 400 + t.get(month - 1) + day
    return sum % 7
}

monthOffsets(): List<Int> {
    var t = listOf<Int>()
    t.add(0)
    t.add(3)
    t.add(2)
    t.add(5)
    t.add(0)
    t.add(3)
    t.add(5)
    t.add(1)
    t.add(4)
    t.add(6)
    t.add(2)
    t.add(4)
    return t
}

isLeapYear(Int year): Bool {
    if (year % 400 == 0) {
        return true
    }
    if (year % 100 == 0) {
        return false
    }
    return year % 4 == 0
}

daysInMonth(Int year, Int month): Int {
    if (month == 2) {
        if (isLeapYear(year)) {
            return 29
        }
        return 28
    }
    if (month == 4 || month == 6 || month == 9 || month == 11) {
        return 30
    }
    return 31
}

// ---- Calendar -------------------------------------------------------------------------

Calendar(Int year, Int month): Int {
    var l = Label(monthGrid(year, month))
    Int h = l
    return h
}

// grade pura: cabeçalho D S T Q Q S S + semanas, domingo primeiro.
monthGrid(Int year, Int month): String {
    var out = monthName(month) + " " + year + "\\n"
    out = out + "D  S  T  Q  Q  S  S\\n"

    var first = dayOfWeek(year, month, 1)
    var total = daysInMonth(year, month)

    var cell = 0
    while (cell < first) {
        out = out + "   "
        cell = cell + 1
    }

    var d = 1
    while (d <= total) {
        var label = padStart(str(d), 2)
        out = out + label
        if (cell % 7 == 6 || d == total) {
            out = out + "\\n"
        } else {
            out = out + " "
        }
        cell = cell + 1
        d = d + 1
    }
    return out
}

monthName(Int month): String {
    if (month == 1) { return "jan" }
    if (month == 2) { return "fev" }
    if (month == 3) { return "mar" }
    if (month == 4) { return "abr" }
    if (month == 5) { return "mai" }
    if (month == 6) { return "jun" }
    if (month == 7) { return "jul" }
    if (month == 8) { return "ago" }
    if (month == 9) { return "set" }
    if (month == 10) { return "out" }
    if (month == 11) { return "nov" }
    return "dez"
}

// ---- DatePicker ---------------------------------------------------------------------------

class DateState {
    static Int year = 2026
    static Int month = 8
    static Int day = 24
}

// transições puras de mês (testáveis).
prevMonth(Int m): Int {
    if (m == 1) {
        return 12
    }
    return m - 1
}

nextMonth(Int m): Int {
    if (m == 12) {
        return 1
    }
    return m + 1
}

DatePicker(): PickerParts {
    var theme = Theme.dark()
    var view = Label(monthGrid(DateState.year, DateState.month))

    var prevM = Button("‹", () -> {
        DateState.month = prevMonth(DateState.month)
        if (DateState.month == 12) {
            DateState.year = DateState.year - 1
        }
        view.setText(monthGrid(DateState.year, DateState.month))
    })
    var nextM = Button("›", () -> {
        DateState.month = nextMonth(DateState.month)
        if (DateState.month == 1) {
            DateState.year = DateState.year + 1
        }
        view.setText(monthGrid(DateState.year, DateState.month))
    })

    Int pmh = prevM
    Int nmh = nextM
    Int strip = Row(listOf(pmh, nmh))
    var col = Column(listOf(strip, view))
    var box = View(Style(theme.surface(), Palette.white, 12, 8))
    box.bind(col)
    Int bh = box
    return PickerParts(bh)
}

// ---- TimePicker ------------------------------------------------------------------------------

class TimeState {
    static Int hour = 9
    static Int minute = 0
}

TimePicker(): PickerParts {
    var theme = Theme.dark()
    var view = Label(timeLabel())

    var upH = Button("+1h", () -> {
        TimeState.hour = wrapNext(TimeState.hour, 24)
        view.setText(timeLabel())
    })
    var upM = Button("+15m", () -> {
        TimeState.minute = wrapNext(TimeState.minute + 14, 60)
        view.setText(timeLabel())
    })

    Int uh = upH
    Int um = upM
    Int actions = Row(listOf(uh, um))
    var col = Column(listOf(view, actions))
    var box = View(Style(theme.surface(), Palette.white, 12, 8))
    box.bind(col)
    Int bh = box
    return PickerParts(bh)
}

timeLabel(): String {
    return padStart(str(TimeState.hour), 2) + ":" + padStart(str(TimeState.minute), 2)
}

`,
  },
  {
    id: "09-charts",
    title: "Gráficos",
    desc: "Sparkline, BarsChart, Donut, Gauge, HBar, progressBar.",
    file: "src/09-charts.kf",
    code: `// 09-charts.kf — gráficos em texto: sparkline, barras, linha, donut e gauge.
//
// Tudo função pura: entra List<Int>/Int, sai String pronta para qualquer
// Label. 100% testável por valor exato em qualquer alvo.

// ---- Sparkline -----------------------------------------------------------------------

// "▁▂▃▄▅▆▇█" — tendência numa linha.
Sparkline(List<Int> values): Int {
    var l = Label(sparkline(values))
    Int h = l
    return h
}

sparkline(List<Int> values): String {
    if (values.size == 0) {
        return ""
    }
    var min = values.get(0)
    var max = values.get(0)
    var i = 1
    while (i < values.size) {
        if (values.get(i) < min) {
            min = values.get(i)
        }
        if (values.get(i) > max) {
            max = values.get(i)
        }
        i = i + 1
    }
    var out = ""
    i = 0
    while (i < values.size) {
        out = out + levelChar(values.get(i), min, max)
        i = i + 1
    }
    return out
}

levelChar(Int v, Int min, Int max): String {
    var levels = listOf("▁", "▂", "▃", "▄", "▅", "▆", "▇", "█")
    if (max == min) {
        return levels.get(4)
    }
    var pos = (v - min) * 7 / (max - min)
    return levels.get(clamp(pos, 0, 7))
}

// ---- Barras horizontais ------------------------------------------------------------------

HBar(Int value, Int max, Int width): String {
    var filled = ratioFill(value, max, width)
    return repeat("█", filled) + repeat("░", width - filled)
}

// proporção pura com clamp (compartilhada por todas as barras).
ratioFill(Int value, Int max, Int width): Int {
    if (max <= 0) {
        return 0
    }
    return clamp(value * width / max, 0, width)
}

progressBar(Int value, Int max): String {
    return HBar(value, max, 20) + " " + value + "/" + max
}

// ---- Gráfico de colunas ----------------------------------------------------------------------

BarsChart(List<String> labels, List<Int> values, Int height): Int {
    var l = Label(barsText(labels, values, height))
    Int h = l
    return h
}

barsText(List<String> labels, List<Int> values, Int height): String {
    if (values.size == 0) {
        return EmptyState.EMPTY_TEXT
    }
    var max = values.get(0)
    var i = 1
    while (i < values.size) {
        if (values.get(i) > max) {
            max = values.get(i)
        }
        i = i + 1
    }

    // de cima para baixo: linha por nível
    var row = height
    var out = ""
    while (row >= 1) {
        var c = 0
        while (c < values.size) {
            var h = ratioFill(values.get(c), max, height)
            if (h >= row) {
                out = out + " █ "
            } else {
                out = out + "   "
            }
            c = c + 1
        }
        if (row > 1) {
            out = out + "\\n"
        }
        row = row - 1
    }

    // rodapé de rótulos
    out = out + "\\n"
    var li = 0
    while (li < labels.size && li < values.size) {
        out = out + " " + substringN(labels.get(li), 0, 1) + " "
        li = li + 1
    }
    return out
}

// ---- Donut / Gauge -------------------------------------------------------------------------------

Donut(Int percent): Int {
    var l = Label(donutText(percent))
    l.fontSize = 20
    l.bold = true
    Int h = l
    return h
}

donutText(Int percent): String {
    var p = clamp(percent, 0, 100)
    var frames = listOf("○", "◔", "◑", "◕", "●")
    var idx = p * 4 / 100
    return frames.get(idx) + " " + p + "%"
}

Gauge(Int value, Int max): Int {
    var l = Label(gaugeText(value, max))
    Int h = l
    return h
}

gaugeText(Int value, Int max): String {
    return "[" + HBar(value, max, 10) + "] " + ratioPercent(value, max) + "%"
}

ratioPercent(Int value, Int max): Int {
    if (max <= 0) {
        return 0
    }
    return clamp(value * 100 / max, 0, 100)
}
`,
  },
  {
    id: "10-io",
    title: "Arquivos",
    desc: "FilePicker com preview via kof.io.",
    file: "src/10-io.kf",
    code: `// 10-io.kf — file picker com preview.
//
// Combina Input (caminho) + botão carregar + preview via kof.io.
// kof.io roda em JVM e Native; no alvo JS é gap da plataforma (o resto do
// componente funciona: a leitura reporta o erro no preview).

class FilePickerState {
    static String loadedPath = ""
}

record FilePickerParts(Int root)

FilePicker(String label): FilePickerParts {
    var theme = Theme.dark()
    var cap = Muted(label)
    var pathInput = Input("caminho/do/arquivo.txt")
    var preview = Label("nenhum arquivo carregado")
    preview.color = Palette.gray

    var load = Button("carregar ⤓", () -> {
        var p = trimSpaces(pathInput.text())
        if (isBlank(p)) {
            preview.setText("✕ informe um caminho")
        } else {
            var target = Path(p)
            if (target.exists()) {
                FilePickerState.loadedPath = p
                preview.setText(filePreview(target.readText()))
            } else {
                preview.setText("✕ não existe: " + ellipsis(p, 40))
            }
        }
    })

    Int loadH = load
    Int aloneRow = Row(listOf(loadH))
    Int capH = cap
    Int pathH = pathInput
    Int divH = Divider()
    Int prevH = preview
    var layout = Column(listOf(capH, pathH, aloneRow, divH, prevH))
    var box = View(Style(theme.surface(), Palette.white, 12, 8))
    box.bind(layout)
    Int bh = box
    return FilePickerParts(bh)
}

filePreview(String content): String {
    if (isBlank(content)) {
        return "(arquivo vazio)"
    }
    var lines = split(content, "\\n")
    var shown = 0
    var out = ""
    while (shown < lines.size && shown < 5) {
        if (shown > 0) {
            out = out + "\\n"
        }
        out = out + "│ " + ellipsis(lines.get(shown), 48)
        shown = shown + 1
    }
    if (lines.size > 5) {
        out = out + "\\n… +" + (lines.size - 5) + " linhas"
    }
    return out
}
`,
  },
];

export const widgetExamples: WidgetExample[] = [
  {
    id: "hello",
    title: "Olá — o menor app",
    desc: "App + Heading + Text + Badge",
    file: "examples/hello.kf",
    code: `// hello.kf — o menor app com kof-ui-widgets
//
//   scripts/run-example.sh hello
//
// ou, na mão:
//   cat src/kof-ui-widgets.kf examples/hello.kf > .build/hello.kf
//   kof run .build/hello.kf --target=js

main() {
    var w = App("Olá")
    w.bind(Column(listOf(
        Heading("Olá, Kof"),
        Text("Este app é feito de intenções, não de mecanismos."),
        Badge("alpha")
    )))
    w.show()
}
`,
  },
  {
    id: "perfil",
    title: "Perfil — formulário + choices",
    desc: "TextField + Checkbox + Toggle + Radio + Rating",
    file: "examples/perfil.kf",
    code: `// perfil.kf — formulário, choices e overlays trabalhando juntos
//
//   scripts/run-example.sh perfil

class PerfilState {
    static String nome = ""
}

main() {
    var w = App("Perfil")

    var campoNome = TextField("Nome", "como te chamam?")
    var emailCheck = Checkbox("mostrar email público")
    var notif = ToggleSwitch("notificações")
    var plano = RadioGroup(listOf("free", "pro", "enterprise"))
    var nota = Rating("experiência até agora")
    Int salvar = Button("salvar", () -> {
        PerfilState.nome = TextFieldState.value
        MessageDialog("perfil", "salvo para: " + PerfilState.nome)
    })

    w.bind(Column(listOf(
        Breadcrumbs(listOf("conta", "perfil")),
        AvatarRow(),
        campoNome.root(),
        emailCheck.root(),
        notif.root(),
        plano.root(),
        nota.root(),
        Alert("info", "alterações só saem quando você salvar"),
        salvar
    )))
    w.show()
}

AvatarRow(): Int {
    Int avatar = Avatar("mel silva").root()
    Int name = Subheading("mel")
    Int handle = Muted("@mel")
    Int ids = Column(listOf(name, handle))
    return Row(listOf(avatar, ids))
}
`,
  },
  {
    id: "tarefas",
    title: "Tarefas — estado interativo",
    desc: "Column/List + Input + Button + lambdas com captura",
    file: "examples/tarefas.kf",
    code: `// tarefas.kf — estado interativo: o padrão da biblioteca
//
// Lambdas capturam cópias; o estado mutável vive em campos estáticos;
// handles TIPADOS criados ANTES da ação são capturados e rebindados.
// As cópias Int servem só para montar listas de layout.
//
//   scripts/run-example.sh tarefas

class Estado {
    static Int total = 0
    static Int feitas = 0
}

main() {
    var w = App("Tarefas")

    var resumo = Text(progressBar(0, 0))
    var lista = Column(listOf<String>())
    var campo = Input("o que precisa ser feito?")
    var cap = Muted("adicionar")

    Int capH = cap
    Int campoH = campo
    Int resumoH = resumo

    var addBtn = Button("+ adicionar", () -> {
        var tarefa = campo.text()
        if (!isBlank(tarefa)) {
            Estado.total = Estado.total + 1
            lista.bind(Text("[ ] " + tarefa))
            resumo.setText(progressBar(Estado.feitas, Estado.total))
        }
    })
    var doneBtn = Button("✓ concluir última", () -> {
        if (Estado.feitas < Estado.total) {
            Estado.feitas = Estado.feitas + 1
            resumo.setText(progressBar(Estado.feitas, Estado.total))
        }
    })

    Int addH = addBtn
    Int doneH = doneBtn
    Int formRow = Row(listOf(campoH, addH))
    Int actions = Row(listOf(addH, doneH))

    w.bind(Column(listOf(
        Heading("Tarefas"),
        resumoH,
        VSpace(8),
        capH,
        formRow,
        actions,
        Divider(),
        lista
    )))
    w.show()
}
`,
  },
  {
    id: "dashboard",
    title: "Dashboard — app completo",
    desc: "StatCard + BarsChart + sparkline + DataTable + Navbar",
    file: "examples/dashboard.kf",
    code: `// dashboard.kf — stat cards, charts, tabela e navegação num app só
//
//   scripts/run-example.sh dashboard

main() {
    var w = App("Dashboard")

    var nav = Navbar(listOf("visão", "vendas", "estoque"))
    Int crumb = Breadcrumbs(listOf("kof", "dashboard", "agosto"))

    var downloads = StatCard("downloads", "12.4k", "+8%")
    var receita = StatCard("receita", "R$ 84k", "+2%")
    var churn = StatCard("churn", "1.9%", "-0.3%")

    var semana = listOf(12, 18, 9, 22, 30, 26, 41)
    var dias = listOf("d", "s", "t", "q", "q", "s", "s")

    Int bars = BarsChart(dias, semana, 5)
    Int trend = Text(sparkline(semana))
    Int trendCap = Muted("últimos 7 dias")
    Int trendRow = Row(listOf(trend, trendCap))
    Int chartCol = Column(listOf(
        Subheading("downloads por dia"),
        bars,
        VSpace(8),
        trendRow
    ))

    Int metaGauge = Gauge(68, 100)
    Int metaDonut = Donut(72)

    Int tabela = DataTable(
        "produto;status;meta",
        listOf("widgets;andamento;80%", "docs;feito;100%", "site;atrasado;45%")
    )

    Int cardsRow = Row(listOf(downloads.root(), receita.root(), churn.root()))
    Int metaRow = Row(listOf(metaGauge, metaDonut))
    Int progresso = Text(progressBar(29, 41))
    w.bind(Column(listOf(
        nav.root(),
        crumb,
        cardsRow,
        chartCol,
        metaRow,
        tabela,
        progresso
    )))
    w.show()
}
`,
  },
  {
    id: "files",
    title: "Arquivos — picker + lista",
    desc: "FilePicker + ListView + TreeView + kof.io",
    file: "examples/files.kf",
    code: `// files.kf — file picker com preview via kof.io (JVM/Native)
//
//   kof run "$(scripts/build.sh examples/files.kf)" --target=jvm
//
// A leitura de arquivos no alvo JS é gap da plataforma — o picker abre,
// mas o carregar reporta o erro no preview.

main() {
    var w = App("Arquivos")

    var picker = FilePicker("abrir arquivo de texto")

    var historico = ListView(listOf("VERSION", "README.md"), true)
    Int tree = TreeView(listOf(
        "src/00-core.kf",
        "src/04-choices.kf",
        "docs/gaps.md",
        "examples/dashboard.kf"
    ))

    w.bind(Column(listOf(
        Heading("Arquivos"),
        picker.root(),
        VSpace(8),
        Subheading("recentes"),
        historico.root(),
        VSpace(8),
        Subheading("projeto"),
        tree
    )))
    w.show()
}
`,
  },
];
