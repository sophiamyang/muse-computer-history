// A Short History of Computing — the muse-computer-history film, remade with portal-film.
// Jolly travels from the Analytical Engine to Muse Spark on Fireworks, through the objects of each era.
// Scenes in scenes/*.js were written by Muse Spark (accounts/fireworks/models/muse-spark-1p2-open on Fireworks);
// Jolly is Sophia's own three.js model, live (character3d.mjs). Leave runtime/ alone.
FILM({
  title: 'A Short History of Computing',
  audio: 'media/score.wav',
  hintDelay: 2.5,
  site: {
    title: 'A Short History of Computing',
    intro: 'Step inside 180 years of computing with Jolly: click the machines to make them go, and the objects to travel through time.',
    endTitle: 'Muse Spark, now on Fireworks',
    endText: 'From brass wheels to a laptop that lights up the sky. Today you just ask.',
    cta: { label: 'Try Muse Spark on Fireworks', href: 'https://fireworks.ai' },
    theme: { bg: '#121212', fg: '#F4F0EC', muted: '#B9B1A8', accent: '#F56A2B', glass: 'rgba(18,18,18,.66)' },
    fonts: {
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650&family=Inter:wght@400;600&display=swap',
      display: '"Fraunces", Georgia, serif', body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    captionSeconds: 9,
  },
  scenes: ['scenes/engine.js', 'scenes/newsreel.js', 'scenes/mainframe.js', 'scenes/pixel.js', 'scenes/web.js',
    'scenes/phone.js', 'scenes/whiteboard.js', 'scenes/datacenter.js', 'scenes/finale.js'],
  character: 'character3d.mjs',
  shots: [
    { scene: 'engine',     out: { type: 'push', portal: 'wheels', prompt: 'look into the wheels' } },
    { scene: 'newsreel',   out: { type: 'push', portal: 'tube',   prompt: 'climb into the tube' } },
    { scene: 'mainframe',  out: { type: 'push', portal: 'slot',   prompt: 'slip through the slot' } },
    { scene: 'pixel',      out: { type: 'push', portal: 'crt',    prompt: 'dive into the screen' } },
    { scene: 'web',        out: { type: 'pull', portal: 'phone',  prompt: 'step back out' } },     // portal owned by 'phone'
    { scene: 'phone',      out: { type: 'push', portal: 'tablet', prompt: 'swipe into the tablet' } },
    { scene: 'whiteboard', out: { type: 'push', portal: 'circle', prompt: 'step into the circle' } },
    { scene: 'datacenter', out: { type: 'pull', portal: 'laptop', prompt: 'step back out' } },     // portal owned by 'finale'
    { scene: 'finale', tail: 3.4 },
  ],
});
