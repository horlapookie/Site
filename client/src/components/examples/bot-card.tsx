import { BotCard } from '../bot-card'

export default function BotCardExample() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <BotCard
        id="abc123"
        botNumber="2348028336218"
        status="running"
        deployedAt={new Date('2025-01-10T14:30:00')}
        onViewLogs={() => console.log('View logs')}
        onRestart={() => console.log('Restart')}
        onDelete={() => console.log('Delete')}
      />
      <BotCard
        id="def456"
        botNumber="2349012345678"
        status="deploying"
        deployedAt={new Date('2025-01-12T10:15:00')}
        onViewLogs={() => console.log('View logs')}
        onRestart={() => console.log('Restart')}
        onDelete={() => console.log('Delete')}
      />
      <BotCard
        id="ghi789"
        botNumber="2347098765432"
        status="stopped"
        deployedAt={new Date('2025-01-08T09:00:00')}
        onViewLogs={() => console.log('View logs')}
        onRestart={() => console.log('Restart')}
        onDelete={() => console.log('Delete')}
      />
    </div>
  )
}
