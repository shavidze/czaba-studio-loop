import pathlib,sys
root=pathlib.Path(sys.argv[1])
def sub(path, old, new, count=1):
    p=root/path; s=p.read_text()
    assert s.count(old)==count, (path, old[:60], s.count(old)); p.write_text(s.replace(old,new))
B='app/components/ui/Button.tsx'
sub(B,"""type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'buy' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
""","""export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'buy' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'pill';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
""")
sub(B,"""  lg: 'px-6 py-3 text-base gap-2',
};
""","""  lg: 'px-6 py-3 text-base gap-2',
};

const shapeStyles: Record<ButtonShape, string> = {
  default: 'rounded-md',
  pill: 'rounded-full',
};

export interface ButtonClassNameParams {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function buildButtonClassName({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  fullWidth = false,
  isDisabled = false,
  className = '',
}: ButtonClassNameParams): string {
  return [
    'inline-flex items-center justify-center',
    `font-semibold ${shapeStyles[shape]}`,
    'transition-all duration-150',
    'cursor-pointer',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
""")
sub(B,"""      size = 'md',
      isLoading = false,""","""      size = 'md',
      shape = 'default',
      isLoading = false,""")
sub(B,"""        className={[
          'inline-flex items-center justify-center',
          'font-semibold rounded-md',
          'transition-all duration-150',
          'cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className,
        ]
          .filter(Boolean)
          .join(' ')}""","""        className={buildButtonClassName({
          variant,
          size,
          shape,
          fullWidth,
          isDisabled,
          className,
        })}""")
sub('app/components/ui/index.ts',"export { AccentButton, Button, GhostButton, PrimaryButton, SecondaryButton } from './Button';",
"""export type { ButtonClassNameParams, ButtonShape, ButtonSize, ButtonVariant } from './Button';
export {
  AccentButton,
  Button,
  buildButtonClassName,
  GhostButton,
  PrimaryButton,
  SecondaryButton,
} from './Button';""")
F='app/routes/$.tsx'
sub(F,"import { Home, Search } from 'lucide-react';\n","import { Home, Search } from 'lucide-react';\nimport { buildButtonClassName } from '~/components/ui';\n")
sub(F,'<Link to="/" className="btn-primary inline-flex items-center gap-2">','<Link to="/" className={buildButtonClassName({ size: \'lg\', shape: \'pill\' })}>')
sub(F,'<Link to="/store" className="btn-secondary inline-flex items-center gap-2">','<Link\n            to="/store"\n            className="inline-flex min-h-12 items-center gap-2 text-foreground hover:text-brand"\n          >')
for f in ['app/routes/account_.login.tsx','app/routes/search.tsx']:
    sub(f,"import { Link } from '@remix-run/react';\n","import { Link } from '@remix-run/react';\nimport { buildButtonClassName } from '~/components/ui';\n")
    sub(f,'<Link to="/" className="button button-primary">','<Link to="/" className={buildButtonClassName({ size: \'lg\', shape: \'pill\' })}>')
H='app/components/home/HeroSection.tsx'
sub(H,"import { PageContainer } from '../layout';\n","import { buildButtonClassName } from '~/components/ui';\nimport { PageContainer } from '../layout';\n")
sub(H,'''            <Link
              to="/store"
              className="btn-primary group inline-flex items-center gap-2 px-8 py-4"
            >''','''            <Link
              to="/store"
              className={buildButtonClassName({ size: 'lg', shape: 'pill', className: 'group' })}
            >''')
HD='app/components/layout/Header.tsx'
sub(HD,"import { CommandPalette } from '~/components/search';\n","import { CommandPalette } from '~/components/search';\nimport { Button } from '~/components/ui';\n")
sub(HD,'''            <button
              type="button"
              onClick={() => openModal('signin')}
              className="btn-primary cursor-pointer !rounded-sm !hidden lg:!inline-block"
            >
              Sign In
            </button>''','''            <Button
              type="button"
              size="lg"
              shape="pill"
              onClick={() => openModal('signin')}
              className="max-lg:hidden"
            >
              Sign In
            </Button>''')
sub(HD,'''              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openModal('signin');
                }}
                className="btn-primary w-full cursor-pointer"
              >
                Sign In
              </button>''','''              <Button
                type="button"
                size="lg"
                shape="pill"
                fullWidth
                onClick={() => {
                  setIsOpen(false);
                  openModal('signin');
                }}
              >
                Sign In
              </Button>''')
sub(HD,'<div className="hidden lg:block w-[70px] h-[36px] bg-elevated rounded-sm animate-pulse" />','<div className="hidden lg:block w-24 h-12 bg-elevated rounded-full animate-pulse" />')
sub(HD,'<div className="h-[44px] bg-elevated rounded-md animate-pulse" />','<div className="h-12 bg-elevated rounded-full animate-pulse" />')
A='app/components/product/AssetListingPage.tsx'
sub(A,"import { FilterBar } from '~/components/filters';\n","import { FilterBar } from '~/components/filters';\nimport { Button } from '~/components/ui';\n")
sub(A,'''<button onClick={clearAllFilters} className="button button-primary">
              Clear Filters
            </button>''','''<Button type="button" onClick={clearAllFilters}>
              Clear Filters
            </Button>''')
C=root/'app/styles/app.css'
s=C.read_text()
blk1=s[s.index('/* Primary Button (Revenue Actions) */'):s.index('/* Icon Button */')]
s=s.replace(blk1,'',1)
blk2=s[s.index('.button {\n'):s.index('/* ============================================\n   Audio Preview Buttons')]
s=s.replace(blk2,'',1)
C.write_text(s)
print('applied')
