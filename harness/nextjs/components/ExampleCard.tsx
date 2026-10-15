// The example cook's "real component": a plain card with a title, a line and an action. In your app
// a cook mounts your own component from its source, as this cook mounts this one; delete this file
// with app/dev/visual-cook/example/ when you no longer need the example.

export type CardLayout = 'stacked' | 'full' | 'inline';
export type CardButton = 'solid' | 'outline' | 'text';

export type ExampleCardProps = {
  dark?: boolean;
  layout?: CardLayout;
  button?: CardButton;
  radius?: number;
  padding?: number;
  shadow?: boolean;
  accent?: string;
};

const BUTTON: Record<CardButton, (dark: boolean) => string> = {
  solid: () => 'text-white',
  outline: dark => `border ${dark ? 'border-white/25 text-white' : 'border-black/20 text-black'}`,
  text: dark => `${dark ? 'text-white' : 'text-black'} underline underline-offset-4`,
};

export function ExampleCard({ dark = false, layout = 'stacked', button = 'solid', radius = 12, padding = 24, shadow = true, accent = '#2563eb' }: ExampleCardProps) {
  const action = (
    <button type="button"
      className={`h-9 shrink-0 rounded-[8px] px-4 text-[14px] font-medium cursor-pointer transition-opacity duration-150 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 ${BUTTON[button](dark)} ${layout === 'full' ? 'w-full' : ''}`}
      style={{ background: button === 'solid' ? accent : 'transparent', outlineColor: accent }}>
      Get started
    </button>
  );
  return (
    <article
      className={`flex w-[340px] flex-col gap-4 border ${dark ? 'border-white/10 bg-[#1b1b1d] text-white' : 'border-black/10 bg-white text-black'}`}
      style={{ borderRadius: radius, padding, boxShadow: shadow ? (dark ? '0 12px 32px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.10)') : 'none' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em]">Weekly summary</h3>
          <p className={`m-0 text-[14px] leading-[1.5] ${dark ? 'text-white/65' : 'text-black/60'}`}>A short digest of what changed in your workspace, every Monday morning.</p>
        </div>
        {layout === 'inline' && action}
      </div>
      {layout !== 'inline' && <div className={layout === 'full' ? '' : 'flex'}>{action}</div>}
    </article>
  );
}
