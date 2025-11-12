import { DeployForm } from '../deploy-form'

export default function DeployFormExample() {
  return (
    <div className="mx-auto max-w-2xl">
      <DeployForm
        onDeploy={(config) => console.log('Deploy with config:', config)}
        isDeploying={false}
      />
    </div>
  )
}
