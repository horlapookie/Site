import { ThemeToggle } from '../theme-toggle'
import { ThemeProvider } from '../theme-provider'

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="flex items-center gap-4 p-8">
        <p className="text-sm text-muted-foreground">Toggle theme:</p>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}
