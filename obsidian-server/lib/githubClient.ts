import { Octokit } from 'octokit'

export interface GitHubClientConfig {
  token: string
  owner: string
  repo: string
}

export class GitHubClient {
  private octokit: Octokit
  private owner: string
  private repo: string

  constructor(config: GitHubClientConfig) {
    this.octokit = new Octokit({ auth: config.token })
    this.owner = config.owner
    this.repo = config.repo
  }

  async triggerDeploy(slugs: string[]): Promise<{ status: string; runId?: number }> {
    if (!this.owner || !this.repo) {
      throw new Error('GitHub repo not configured')
    }

    try {
      const response = await this.octokit.rest.actions.createWorkflowDispatch({
        owner: this.owner,
        repo: this.repo,
        workflow_id: 'deploy.yml',
        ref: 'main',
        inputs: {
          slugs: slugs.join(','),
        },
      })

      if (response.status === 204) {
        return { status: 'started' }
      }
      return { status: 'unknown', runId: undefined }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to trigger workflow: ${msg}`)
    }
  }

  isConfigured(): boolean {
    return !!(this.owner && this.repo)
  }
}
