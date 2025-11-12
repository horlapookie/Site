import { Header } from '../header'

export default function HeaderExample() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-sm text-muted-foreground">Authenticated State</p>
        <Header 
          isAuthenticated={true} 
          coins={10} 
          username="johndoe"
          onSignOut={() => console.log('Sign out clicked')}
        />
      </div>
      <div>
        <p className="mb-4 text-sm text-muted-foreground">Unauthenticated State</p>
        <Header isAuthenticated={false} />
      </div>
    </div>
  )
}
