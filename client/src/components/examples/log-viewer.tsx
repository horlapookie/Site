import { LogViewer } from '../log-viewer'

export default function LogViewerExample() {
  return (
    <div className="mx-auto max-w-4xl">
      <LogViewer
        botId="abc123"
        onClose={() => console.log('Close logs')}
      />
    </div>
  )
}
