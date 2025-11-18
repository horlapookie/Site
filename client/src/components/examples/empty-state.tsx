import { EmptyState } from '../empty-state'

export default function EmptyStateExample() {
  return (
    <EmptyState onDeploy={() => console.log('Deploy clicked')} />
  )
}
