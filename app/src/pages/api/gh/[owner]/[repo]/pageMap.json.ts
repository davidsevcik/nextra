import { Repo } from '~/lib/github'

export default async function handler(req, res) {
  const { owner, repo: repoName } = req.query
  const repo = new Repo(process.env.GITHUB_TOKEN, owner, repoName)
  const pageMap = await repo.buildPageMap()
  res.json(pageMap)
}
