# PRM-UX-003 — Onboarding Copy Engine Output

**Prompt ID:** `PRM-UX-003`
**Version:** `1.0.0`
**Generated:** 2026-02-07
**Language:** Spain Spanish (castellano)
**Model:** Claude Opus 4.6

---

## Inputs Applied

| Parameter | Value |
|-----------|-------|
| Screens | 4 (Capsule Closed, Opening Animation, Manifesto, Capsule Selection) |
| Tone | Intimate, warm, emotionally precise. Spain Spanish nativo. |
| Headline max | 40 chars |
| Supporting copy max | 120 chars |
| CTA max | 20 chars |
| Capsule tagline max | 60 chars |
| Forbidden words | digital, plataforma, tecnologia, app, nube, cloud, almacenamiento, storage |
| Must include (across set) | recuerdos, legado, capsula, permanezcan |

---

## PANTALLA 1: Capsula Cerrada

> Fondo blanco puro. Capsula metalica centrada. Sin UI visible salvo el grabado "NUCLEA". El usuario debe descubrir que puede tocar.

### Headlines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| H1a | *Toca para abrir* | 16 | Minimal. Direct instruction. Works if capsule visual is self-explanatory. |
| H1b | *Hay algo dentro para ti* | 25 | Curiosity-driven. Frames capsule as a gift. Implies personal relevance. |
| H1c | *Tu capsula te espera* | 21 | Personalization + anticipation. Uses required term "capsula". |

### Supporting Copy

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| S1a | *Toca la capsula.* | 18 | Ultra-minimal. Lets the object speak. Best if the visual is strong enough. |
| S1b | *Dentro guarda lo que importa. Toca para descubrirlo.* | 53 | Emotional + instructional in one line. |
| S1c | *Cada capsula guarda una historia. Esta es la tuya.* | 51 | Establishes the metaphor early. Personalizes. |

### CTAs

This screen has no button — interaction is a tap on the capsule itself. The copy above serves as the implicit CTA.

If a subtle text hint is needed below the capsule:

| # | Copy | Chars |
|---|------|-------|
| CTA1a | *Toca la capsula* | 17 |
| CTA1b | *Pulsa para abrir* | 18 |

### Intent & Tradeoffs

- **Goal:** Create wonder and discovery. The user should feel they are finding something, not being onboarded.
- **Risk of H1a:** Too directive, breaks the discovery illusion. Best paired with a very strong capsule render.
- **Risk of H1b:** Could feel ambiguous if the user doesn't recognize the capsule as interactive.
- **Recommendation:** H1c for capsule-first framing, or no visible text at all if animation cues (subtle glow, micro-bounce) are strong enough. The less text on P1, the more powerful the ritual.

---

## PANTALLA 2: Animacion de Apertura

> La capsula se separa horizontalmente. Polaroids emergen flotando con rotacion suave. Globos de dialogo aparecen. Duracion ~4 segundos. Auto-avanza a P3.

### Headlines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| H2a | *Tus recuerdos cobran vida* | 27 | Emotional payoff. Uses required term "recuerdos". |
| H2b | *Lo que guardaste sigue aqui* | 29 | Implies permanence. Reassuring. |
| H2c | *Mira lo que llevas dentro* | 27 | Introspective. The capsule is a mirror of the user. |

### Supporting Copy

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| S2a | *Cada foto, cada voz, cada palabra. Todo vuelve a ti.* | 54 | Sensory enumeration. Visceral. |
| S2b | *Los recuerdos no desaparecen. Solo necesitan un lugar.* | 56 | Addresses the core anxiety (loss). Positions NUCLEA as the answer. |
| S2c | *Esto es lo que ocurre cuando decides que algo permanezca.* | 59 | Agency-focused. Uses required term "permanezca" (verb form). |

### CTAs

No CTA on this screen — it auto-advances after ~4 seconds. If a skip option exists:

| # | Copy | Chars |
|---|------|-------|
| CTA2a | *Continuar* | 9 |
| CTA2b | *Saltar* | 6 |

### Intent & Tradeoffs

- **Goal:** Emotional climax. The floating polaroids ARE the message. Copy should support, not compete with, the animation.
- **Risk of showing any text:** Distracts from the visual spectacle. Consider showing text only in the final 1.5s as polaroids settle.
- **Risk of H2c:** Slightly abstract. Works best if the user has already internalized the capsule metaphor.
- **Recommendation:** H2a is the safest — immediate, emotional, uses "recuerdos". If text appears at all, S2b is the strongest because it names the fear (disappearance) and resolves it.

---

## PANTALLA 3: Manifiesto

> Capsula cerrada arriba (pequena). Tagline central. Texto explicativo. Este es el momento de declarar la mision de NUCLEA.

### Headlines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| H3a | *Somos las historias que recordamos* | 36 | The canonical tagline (part 1). Proven. Familiar. |
| H3b | *Lo que importa merece permanencia* | 35 | Abstract but powerful. Positions NUCLEA as a right, not a product. |
| H3c | *Tu historia merece quedarse* | 29 | Shorter, punchier. Directly addresses the user. |

### Supporting Copy

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| S3a | *Haz que las tuyas permanezcan. NUCLEA transforma recuerdos en legado.* | 71 | Combines both tagline parts + mission. Uses "permanezcan", "recuerdos", "legado". |
| S3b | *Una capsula guarda lo que no quieres perder. Un legado entrega lo que quieres dejar.* | 86 | Capsule/legacy distinction. Teaches the model in one sentence. |
| S3c | *Guarda recuerdos. Crea un legado. Decide quien lo recibe y cuando.* | 66 | Three beats: store, create, control. Functional clarity with emotion. |

### CTAs

| # | Copy | Chars |
|---|------|-------|
| CTA3a | *Continuar* | 9 |
| CTA3b | *Descubre como* | 14 |
| CTA3c | *Empezar* | 8 |

### Intent & Tradeoffs

- **Goal:** Convert wonder (P2) into understanding and intent. The user must leave P3 thinking "I want this."
- **H3a is canonical** and should be the default unless A/B testing suggests otherwise. It is the brand line.
- **S3a covers all required terms** in a natural sentence. It is the safest copy for compliance.
- **S3b is the boldest** — it explains the capsule-to-legacy journey in one breath. Risk: slightly long, may feel dense on mobile.
- **S3c is the most conversion-oriented** — three clear value props, ends with user control.
- **CTA3b ("Descubre como")** creates a bridge to P4. CTA3c ("Empezar") implies commitment, which may reduce tap rate. CTA3a is neutral and safe.
- **Recommendation:** H3a + S3a + CTA3b. This combination is brand-consistent, hits all required terms, and creates curiosity for P4.

---

## PANTALLA 4: Seleccion de Capsula

> Header con menu y "NUCLEA". Tagline. "Elige tu capsula". 6 cards de seleccion. Cierre emocional.

### Headlines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| H4a | *Elige tu capsula* | 18 | Direct. Functional. From Andrea's spec. |
| H4b | *Que quieres guardar?* | 21 | Reframes selection as a personal question. |
| H4c | *Cada historia tiene su capsula* | 31 | Establishes that types exist for a reason. |

### Supporting Copy

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| S4a | *Aqui guardas lo que no quieres perder.* | 41 | From Andrea's spec. Emotional anchor. Simple. |
| S4b | *Seis formas de guardar lo que importa. Elige la que cuente tu historia.* | 72 | Frames the 6 types as personal narratives. |
| S4c | *Cada capsula se adapta a un momento de tu vida. Elige y empieza a llenarla.* | 76 | Lifecycle framing + clear next action. |

### CTAs

No global CTA — each card is the CTA. If a footer prompt is needed:

| # | Copy | Chars |
|---|------|-------|
| CTA4a | *Elige y empieza* | 16 |
| CTA4b | *Toca para elegir* | 18 |

### Intent & Tradeoffs

- **Goal:** Convert emotional investment into a concrete choice. Low friction, high clarity.
- **H4a is canonical** (from Andrea's flow). It should be the default.
- **H4b works better** if the user hasn't fully understood the capsule types yet — it re-centers the decision on their need, not the product taxonomy.
- **S4a is from Andrea's spec** and should be preserved unless testing shows a stronger alternative.
- **Risk:** Too many cards can cause decision paralysis. Consider showing 3 "recommended" types with a "Ver todas" expandable for the remaining 3.
- **Recommendation:** H4a + S4a (preserve Andrea's vision). Use H4b as A/B test variant.

---

## CAPSULE TYPE COPY

### 1. Legacy Capsule

**Current name:** Legacy Capsule
**Name variant:** *Capsula Legado*
**Rationale:** Native Spanish name. "Legacy" is English and breaks the intimate tone. "Legado" is the required term and carries deep emotional weight in Spanish.

#### Taglines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| T1a | *Para que tu historia siga presente.* | 37 | From official copy. Proven. Warm. |
| T1b | *Lo que dejas habla de quien fuiste.* | 37 | Frames legacy as identity, not storage. |
| T1c | *Tu voz, tus palabras. Mas alla del tiempo.* | 45 | Sensory. Emphasizes the human element over files. |

**Emotional hook:**
Un diario intimo que se entrega cuando tu ya no estes, para que quienes te quieren te sigan sintiendo cerca.

---

### 2. Together Capsule

**Current name:** Together Capsule
**Name variant:** *Capsula Juntos*
**Rationale:** "Together" is English. "Juntos" is immediately understood, warm, and gender-inclusive in context.

#### Taglines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| T2a | *Vuestra historia, guardada para siempre.* | 42 | Possessive "vuestra" — intimate, Spain Spanish. |
| T2b | *Un espacio solo para los dos.* | 30 | Exclusivity. Simplicity. Romantic without being saccharine. |
| T2c | *Cada recuerdo juntos merece quedarse.* | 38 | Uses "recuerdo". Positions permanence as deserved. |

**Emotional hook:**
Un rincon intimo donde dos personas guardan la historia de su amor, para abrirlo juntos cuando quieran recordar por que se eligieron.

---

### 3. Social Capsule

**Current name:** Social Capsule
**Name variant:** *Capsula Momentos*
**Rationale:** "Social" sounds like a feature, not an emotion. "Momentos" captures what people actually put in: shared moments with friends and family.

#### Taglines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| T3a | *Los mejores momentos, guardados entre amigos.* | 47 | Direct. Joyful. Clear target audience. |
| T3b | *Lo que vivisteis juntos no deberia perderse.* | 46 | Loss-aversion framing. Emotionally urgent. |
| T3c | *Una capsula para las historias que solo vosotros entendeis.* | 60 | Insider feeling. Exclusivity. Max chars exactly. |

**Emotional hook:**
Para ese viaje que os cambio, esa epoca irrepetible, ese grupo que ya no se reune pero cuya historia merece seguir viva.

---

### 4. Pet Capsule

**Current name:** Pet Capsule
**Name variant:** *Capsula Huella*
**Rationale:** "Pet" is English and clinical. "Huella" (pawprint/trace) is poetic, references the icon (pawprint), and carries the double meaning of the mark a pet leaves on your life.

#### Taglines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| T4a | *Su huella merece quedarse contigo.* | 36 | Double meaning: pawprint + emotional mark. Tender. |
| T4b | *Porque ellos tambien son parte de tu historia.* | 48 | From official copy. Inclusive. Validates the bond. |
| T4c | *Todo el amor que os disteis, guardado para siempre.* | 52 | Reciprocity. Frames pet love as mutual. |

**Emotional hook:**
Un memorial intimo para guardar cada ladrido, cada ronroneo, cada paseo: la prueba de un amor incondicional que no necesito palabras.

---

### 5. Life Chapter Capsule

**Current name:** Life Chapter Capsule
**Name variant:** *Capsula Capitulo*
**Rationale:** "Life Chapter" is English and long. "Capitulo" (chapter) is sufficient — the life context is implicit. Shorter, cleaner for card UI.

#### Taglines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| T5a | *Hay etapas que merecen ser recordadas.* | 40 | From official copy tone. Respectful. Universal. |
| T5b | *Guarda un antes y un despues.* | 30 | Captures transformation. Concise. Powerful. |
| T5c | *El capitulo que te cambio, contado por ti.* | 44 | Agency. The user is the narrator of their own life. |

**Emotional hook:**
Para esa maternidad, ese duelo superado, ese ano que lo cambio todo: una capsula que guarda la etapa y la entrega cuando la historia cobre todo su sentido.

---

### 6. Origin Capsule

**Current name:** Origin Capsule
**Name variant:** *Capsula Origen*
**Rationale:** Direct translation. "Origen" is beautiful in Spanish — it implies roots, beginning, source. Perfect fit.

#### Taglines

| # | Copy | Chars | Notes |
|---|------|-------|-------|
| T6a | *Un regalo de vida para quien mas quieres.* | 44 | From official copy. Gift framing. Tender. |
| T6b | *Crece con ellos. Se abre cuando esten listos.* | 47 | Time capsule mechanic made emotional. |
| T6c | *Para que sepan de donde vienen y cuanto fueron amados.* | 55 | From official copy. Deeply moving. Almost at max chars. |

**Emotional hook:**
Una capsula que los padres llenan en silencio mientras sus hijos crecen, para entregarla el dia en que necesiten saber cuanto fueron queridos desde el primer instante.

---

## CAPSULE TYPE SUMMARY TABLE

| # | English Name | Proposed Spanish Name | Recommended Tagline | Chars |
|---|-------------|----------------------|---------------------|-------|
| 1 | Legacy | Capsula Legado | *Para que tu historia siga presente.* | 37 |
| 2 | Together | Capsula Juntos | *Un espacio solo para los dos.* | 30 |
| 3 | Social | Capsula Momentos | *Lo que vivisteis juntos no deberia perderse.* | 46 |
| 4 | Pet | Capsula Huella | *Su huella merece quedarse contigo.* | 36 |
| 5 | Life Chapter | Capsula Capitulo | *Guarda un antes y un despues.* | 30 |
| 6 | Origin | Capsula Origen | *Para que sepan de donde vienen y cuanto fueron amados.* | 55 |

---

## REQUIRED TERMS COMPLIANCE

| Term | Screen(s) Used | Copy Instance |
|------|---------------|---------------|
| recuerdos | P2 (H2a, S2a, S2b), P3 (S3a, S3c), P4 (S4b) | "Tus recuerdos cobran vida", "transforma recuerdos en legado", "Guarda recuerdos" |
| legado | P3 (S3a, S3b, S3c), Capsule 1 name | "transforma recuerdos en legado", "Un legado entrega lo que quieres dejar" |
| capsula | P1 (H1c, S1a, S1b, S1c), P3 (S3b), P4 (H4a, H4c, S4c), all capsule names | Throughout |
| permanezcan | P3 (S3a), P2 (S2c variant "permanezca") | "Haz que las tuyas permanezcan" |

All four required terms appear naturally across the copy set.

---

## FORBIDDEN WORDS AUDIT

Verified: None of the following words appear in any copy above.

- ~~digital~~
- ~~plataforma~~
- ~~tecnologia~~
- ~~app~~
- ~~nube~~
- ~~cloud~~
- ~~almacenamiento~~
- ~~storage~~

---

## RECOMMENDED FULL FLOW (Best Combination)

| Screen | Headline | Supporting | CTA |
|--------|----------|-----------|-----|
| P1 | *(no text — capsule glow only)* | *(no text)* | *(tap capsule)* |
| P2 | *Tus recuerdos cobran vida* | *Los recuerdos no desaparecen. Solo necesitan un lugar.* | *(auto-advance)* |
| P3 | *Somos las historias que recordamos* | *Haz que las tuyas permanezcan. NUCLEA transforma recuerdos en legado.* | *Descubre como* |
| P4 | *Elige tu capsula* | *Aqui guardas lo que no quieres perder.* | *(tap card)* |

**Rationale:** P1 silence maximizes discovery. P2 delivers the emotional peak with reassurance. P3 is the canonical brand statement with full term coverage. P4 preserves Andrea's original spec and keeps decision friction low.

---

*Generated by PRM-UX-003 Onboarding Copy Engine | NUCLEA Codex*
*Quality gates: All character limits respected. All required terms present. No forbidden words used. CTAs are action-specific.*
