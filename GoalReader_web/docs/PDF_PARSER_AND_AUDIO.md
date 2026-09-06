# PDF Extraction & Audio Narration Engine 🧠🎙️

This technical guide details the algorithms powering GoalBook's spatial PDF layout detector, sentence segmentation engine, and Web Speech API karaoke synchronizer.

---

## 1. The Multi-Column PDF Problem

PDF documents do not maintain semantic understanding of paragraphs, columns, or reading order. Instead, a PDF is an instruction list of draw operations (`showText at coordinate [x, y]`).

When naive extractors dump text from a two-column scientific paper (such as IEEE, ACM, or arXiv formats), text from the left column is often interleaved with text from the right column:

```plaintext
NAIVE EXTRACTION BUG:
"Deep learning algorithms    | have revolutionized computer"  --> "Deep learning algorithms have revolutionized computer"
"vision by discovering high  | level representations from"    --> "vision by discovering high level representations from"
```

This makes automated speech synthesis and speed reading completely unintelligible.

---

## 2. GoalBook Spatial Gutter Algorithm

Located in [`lib/pdfParser.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/lib/pdfParser.ts):

### Step 1: Geometric Bounding Envelope
For each page, GoalBook extracts all text tokens and records their 2D bounding boxes:
- $x$: Left coordinate
- $y$: Baseline / vertical coordinate
- $w, h$: Width and height
- $\text{right} = x + w$

GoalBook then calculates the horizontal envelope across all text items:
$$\text{minX} = \min_{i} (x_i), \quad \text{maxX} = \max_{i} (\text{right}_i)$$
$$\text{contentWidth} = \text{maxX} - \text{minX}$$

### Step 2: Central Gutter Channel Detection
Standard two-column papers feature a vertical gutter down the middle of the page (typically between 46% and 54% of the printable width):
$$\text{leftColMaxX} = \text{minX} + 0.46 \times \text{contentWidth}$$
$$\text{rightColMinX} = \text{minX} + 0.54 \times \text{contentWidth}$$

### Step 3: Token Partitioning
Tokens are partitioned into three buckets:
1. **Left Column (`col1`)**: Items where $\text{right} \le \text{leftColMaxX}$.
2. **Right Column (`col2`)**: Items where $x \ge \text{rightColMinX}$.
3. **Spanning Headers (`spanning`)**: Items that cross over the gutter boundaries (e.g., paper titles, author lists, abstracts).

### Step 4: Layout Classification
A page is classified as **Two-Column** if:
- $\text{count}(\text{col1}) \ge 3$
- $\text{count}(\text{col2}) \ge 3$
- The number of cross-gutter body items is low relative to the column items.

### Step 5: Spatial Sorting
If two-column layout is confirmed:
1. **Spanning items** are sorted top-to-bottom ($y \text{ descending}$) and emitted first.
2. **Column 1 items** are sorted top-to-bottom ($y \text{ descending}$) and left-to-right ($x \text{ ascending}$).
3. **Column 2 items** are sorted top-to-bottom ($y \text{ descending}$) and left-to-right ($x \text{ ascending}$).

This ensures natural, human-accurate reading flow: `Header / Abstract → Entire Left Column → Entire Right Column`.

---

## 3. Sentence Segmentation

After spatial sorting, raw text blocks must be segmented into clean sentence units.

GoalBook uses a dual-strategy implementation in `splitIntoSentences()`:

1. **Native `Intl.Segmenter`**:
   ```typescript
   const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
   return Array.from(segmenter.segment(text))
     .map((s) => s.segment.trim())
     .filter(Boolean);
   ```
2. **Regex Fallback**:
   If running in an environment without `Intl.Segmenter`, GoalBook uses a lookbehind and lookahead regex that avoids splitting on decimal numbers (e.g. `3.14`) or abbreviations without capital letters:
   ```typescript
   const rawSentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"'([<])/);
   ```

---

## 4. Web Speech API (TTS) Karaoke Engine

Located in [`hooks/useVocalReader.ts`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/hooks/useVocalReader.ts).

### Word-Level Boundary Tracking
Browser `SpeechSynthesisUtterance` provides an `onboundary` event with `charIndex`:

```typescript
utterance.onboundary = (event) => {
  if (event.name === 'word') {
    const charIndex = event.charIndex;
    // Map charIndex to word index within current sentence
    const wordIdx = calculateWordIndexFromCharOffset(sentenceText, charIndex);
    setCurrentWordIndex(wordIdx);
  }
};
```

### Speed Pacing & Rate Calibration
Speech synthesis `rate` is non-linear across operating systems (macOS, Windows, Linux, Android). GoalBook maps words per minute (100–500 WPM) into the browser rate range ($0.7 \times$ to $2.0 \times$):

$$\text{rate} = \operatorname{clamp}\left(0.7, \frac{\text{WPM}}{200}, 2.0\right)$$

### Visual RSVP Fallback Mode
When audio narration is toggled off (`isVoiceEnabled = false`), GoalBook switches to Rapid Serial Visual Presentation (RSVP):
- Computes time slice per word:
  $$\Delta t = \frac{60}{\text{WPM}} \times 1000 \text{ ms}$$
- An interval timer increments `currentWordIndex`.
- When `currentWordIndex >= sentenceWords.length`, it advances `currentSentenceIndex`.
- When `currentSentenceIndex >= pageSentences.length`, it advances `currentPage`.

---

## 5. Teleprompter Auto-Scroll Synchronization

In [`components/KaraokeDisplay.tsx`](file:///home/kartik/Documents/GoalBook/MicroServers/GoalReader_web/components/KaraokeDisplay.tsx):
- Active sentence references a DOM node using a React ref (`activeSentenceRef`).
- As `currentSentenceIndex` changes, smooth programmatic scrolling brings the active sentence directly into the middle 40% of the viewport:
  ```typescript
  activeSentenceRef.current?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  ```
- Previous sentences are styled with `opacity-40 blur-[0.4px] transition-all duration-300`.
- Active sentence is styled with `scale-[1.02] text-amber-300 border-l-4 border-amber-500 pl-4`.
- Future sentences are styled with `opacity-70`.
