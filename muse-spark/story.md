# A Short History of Computing

**Logline:** Jolly travels about 180 years of computing by going *through* each era's machine, from the figure wheels of
the Analytical Engine to a laptop on a dusk desk. She closes the lid, and fireworks over the city spell "Muse Spark,
now on Fireworks".
**Axis:** time · **Length:** ~60 s, 9 scenes · **Ending:** the GPU datacenter turns out to be on the laptop in a
quiet room; the payoff is the sky lighting up when she asks.
**Character:** Jolly, Sophia's plush mascot, live in 3D from her own three.js model (github.com/sophiamyang/muse-mascot,
`index.html`), with the model code used unchanged in `character3d.mjs`. Cream look in every scene. No hat, no clothes
and no accessories. Each era restyles her through `characterStyle` / `treat` (tint, silhouette, pixelate), never by
changing the model.

| # | Scene id | Place · medium · palette | Action (verb → prop reaction) | Out: object · push/pull · why it holds the next world | Music · sfx |
|---|---|---|---|---|---|
| 1 | engine | 1843 workshop, the Analytical Engine · Victorian copperplate engraving · sepia ink on cream | turns the brass crank → gears mesh, a punched card advances, a bell rings | the grid of figure wheels · push · the Engine's numbers become the next machine's lamps | music_box · tick, chime |
| 2 | newsreel | 1946 computer room · black-and-white newsreel, soft grain, title card "THE MIGHTY ELECTRONIC BRAIN" | plugs in a patch cable → a vacuum tube flares, the panel lamps cascade | the glowing vacuum tube · push · switching moves from glass tubes into the machine room | brass · click, thump |
| 3 | mainframe | 1969 machine room · mid-century cut paper · mustard, teal, tomato, cream, charcoal | feeds a punched card into the reader → the tape reels spin up, the teletype prints | the card slot · push · we follow the program into the machine, and out onto a home screen | vibes · click, tick |
| 4 | pixel | 1983 dusk landscape that *is* a giant home computer · 8-bit pixel art, teal → amber sky | jumps and bumps the floppy drive → a floppy pops out and flies to a "DISKS" counter | the CRT · push · home computers lived on the TV | chip · beep, pop |
| 5 | web | 1996 personal home page as a world · bevelled grey buttons, serif text, spinning globe, marquee, visitor counter, dial-up dialog | presses "Connect" → the bar fills while the modem chirps, then hops over "ENTER" | the phone in the 2007 showroom · **pull** · the web moved into our pockets | organ · beep, click |
| 6 | phone | 2007 glossy white showroom · generic slab phones on plinths, glass vitrine, reflective floor | steps out of the phone, pushes a frosted glass pane aside → spotlights snap on | a tablet's screen · push · the screen became the computer | marimba · click, chime |
| 7 | whiteboard | 2017 lab whiteboard · black marker, one orange accent, sticky notes | writes "it" in "the cat napped because ___ was tired" and circles it → attention arcs spring to every word, the heaviest to "cat" | the orange circle · push · attention is where the model looks next | piano · tick, chime |
| 8 | datacenter | 2026 GPU cluster · isometric flat vector · copper, graphite, amber | pulls the "TOKENS" lever → a light wave runs across the racks; she rides the token belt | the laptop in the finale · **pull** · all that compute answers on your laptop | pad · thump, tick |
| 9 | finale | Now · warm dusk room, desk, laptop, window over a city · #F4F0EC / #121212 with Glow #F56A2B, Flare #FB2D74, Bloom #7A155C, Plum #F0ACD6 | steps out of the laptop; it types "light up the sky?" → "On it… 3… 2… 1…"; she closes the lid → fireworks over the city settle into "Muse Spark" / "now on Fireworks"; a "fireworks.ai" sign lights up | (end) hold 3 s, fade | full ensemble · beep, chime, thump |

Pushes and pulls: push ×6, pull ×2 (web → phone, datacenter → finale). The two pulls are the reveals: the web was
on a phone all along, and the datacenter was on the laptop in your room.

## Website, per scene

What the visitor clicks for the action (the prop), the two hints, and the spots and caption (written in each scene's
`page` / `spots`; the final wording lives in `scenes/*.js`).

| Scene | Click for the action | act.prompt | out.prompt |
|---|---|---|---|
| engine | the brass crank | turn the crank | look into the wheels |
| newsreel | the patch cable | plug in the cable | climb into the tube |
| mainframe | the card reader | feed in the card | slip through the slot |
| pixel | the floppy drive | bump the drive | dive into the screen |
| web | the Connect button | press Connect | step back out |
| phone | the frosted pane | slide the pane | swipe into the tablet |
| whiteboard | the blank in the sentence | fill in the blank | step into the circle |
| datacenter | the TOKENS lever | pull the lever | step back out |
| finale | the laptop | ask the laptop | (end card) |

**Text on screen:** era badges (1843 · Analytical Engine, 1946 · Electronic computer, 1969 · Mainframes,
1983 · Home computers, 1996 · The web, 2007 · Smartphones, 2017 · Attention, 2026 · GPU clusters,
Now · Muse Spark on Fireworks); the newsreel title card "THE MIGHTY ELECTRONIC BRAIN"; the attention sentence;
the laptop dialogue; the sky words "Muse Spark" / "now on Fireworks"; the "fireworks.ai" sign. All devices,
operating systems and pages are generic and invented.
