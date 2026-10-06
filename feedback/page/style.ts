/**
 * The page's look. Every colour and the font are custom properties on
 * `.fb-page`, so a game restyles it from its own stylesheet without touching
 * this: `.fb-page { --fb-accent: #8fe; --fb-font: "My Game", sans-serif; }`.
 * `--fb-mark` and `--fb-glow` are the marks' colour, in the page and in the
 * marked frame alike; `--fb-cursor` is the pad's cursor.
 */
export const CSS = `
.fb-page { --fb-font: system-ui, sans-serif; --fb-text: #e6eef6; --fb-dim: #8a9bab; --fb-faint: #5d7184;
  --fb-accent: rgba(242,213,138,.65); --fb-chosen: #fff3d0; --fb-mark: #f2d58a; --fb-glow: rgba(255,210,120,.55);
  --fb-cursor: #9fd2ff; --fb-key: #9fd2ff; --fb-shade: #05080c;
  position:fixed; inset:0; z-index:2147483000; display:none; font-family:var(--fb-font); color:var(--fb-text);
  background:var(--fb-shade); }
.fb-page.fb-open { display:block; }
.fb-page .fb-mark { position:absolute; inset:0; display:none; background:#000; }
.fb-page.fb-marking .fb-mark { display:block; }
.fb-page.fb-marking .fb-tell { display:none; }
.fb-page .fb-mark img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
.fb-page .fb-mark canvas { position:absolute; inset:0; width:100%; height:100%; cursor:crosshair; touch-action:none; }
.fb-page .fb-ctx { position:absolute; top:4.5vh; right:4vw; text-align:right; font-size:15px; letter-spacing:.12em; text-shadow:0 2px 6px #000; line-height:1.5; pointer-events:none; }
.fb-page .fb-ctx .fb-sub { font-size:13px; color:var(--fb-dim); }
.fb-page .fb-bar, .fb-page .fb-hints { position:absolute; left:0; right:0; bottom:0; padding:14px 0 18px; text-align:center; font-size:14px; letter-spacing:.08em; color:var(--fb-dim); background:linear-gradient(transparent, rgba(0,0,0,.78) 40%); }
.fb-page .fb-bar { pointer-events:none; }
.fb-page .fb-bar .fb-t { display:block; font-weight:normal; font-size:19px; letter-spacing:.3em; color:var(--fb-chosen); margin-bottom:8px; }
.fb-page .fb-bar .fb-act { pointer-events:auto; }
.fb-page .fb-frame { position:absolute; left:5vw; top:12vh; width:46vw; }
.fb-page .fb-frame img { display:block; width:100%; aspect-ratio:16/9; object-fit:contain; background:#000; border:1px solid var(--fb-accent); }
.fb-page .fb-cap { margin-top:12px; font-size:13px; color:var(--fb-dim); font-style:italic; }
.fb-page .fb-form { position:absolute; left:55vw; top:9vh; width:40vw; }
.fb-page h2 { margin:0 0 10px; font-weight:normal; font-size:13px; letter-spacing:.3em; color:var(--fb-dim); }
.fb-page .fb-row { margin:4px 0; padding:6px 14px; font-size:14px; letter-spacing:.12em; border:1px solid transparent; cursor:pointer; }
.fb-page .fb-on { border-color:var(--fb-accent); box-shadow:0 0 16px var(--fb-accent); }
.fb-page .fb-kind.fb-chosen { color:var(--fb-chosen); }
.fb-page .fb-kind.fb-chosen::before { content:"\\25C6  "; color:var(--fb-mark); }
.fb-page textarea { display:block; box-sizing:border-box; width:100%; height:92px; margin:14px 0 18px; padding:12px 14px; resize:none; border:1px solid rgba(160,210,255,.25); background:rgba(0,0,0,.35); color:var(--fb-text); font:15px/1.5 var(--fb-font); outline:none; }
.fb-page textarea::placeholder { color:var(--fb-dim); font-style:italic; }
.fb-page textarea.fb-on, .fb-page textarea:focus { border-color:var(--fb-accent); box-shadow:0 0 16px var(--fb-accent); }
.fb-page .fb-part { margin:2px 0; padding:3px 14px; font-size:13px; letter-spacing:.02em; }
.fb-page .fb-part::before { content:"\\2713  "; color:var(--fb-mark); }
.fb-page .fb-part.fb-off { color:var(--fb-faint); text-decoration:line-through; }
.fb-page .fb-part.fb-off::before { content:"\\2013  "; color:var(--fb-faint); }
.fb-page .fb-status { position:absolute; left:0; right:0; bottom:68px; text-align:center; font-size:15px; letter-spacing:.14em; color:var(--fb-chosen); text-shadow:0 2px 6px #000; }
.fb-page .fb-k { display:inline-block; font-family:system-ui, sans-serif; font-weight:600; font-size:12px; padding:1px 7px; border:1px solid var(--fb-key); border-radius:4px; margin:0 4px 0 14px; letter-spacing:0; }
.fb-page .fb-act { cursor:pointer; }
@media (max-aspect-ratio: 1/1) {
  .fb-page .fb-frame { left:5vw; top:4vh; width:90vw; }
  .fb-page .fb-form { left:5vw; top:auto; bottom:110px; width:90vw; }
}
`;
