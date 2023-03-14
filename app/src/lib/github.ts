import { Octokit } from 'octokit'

export class Repo {
  private octokit: Octokit['rest'];
  private gitRequestBase: { owner: string, repo: string };

  constructor(readonly auth: string, readonly owner: string, readonly repo: string) {
    this.octokit = new Octokit({ auth }).rest
    this.gitRequestBase = { owner, repo }
  }

  async getFileRaw(path: string): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      ...this.gitRequestBase,
      path,
      mediaType: {
        format: "raw",
      },
    })
    return data as unknown as string
  }

  async getReadmeRaw(): Promise<string> {
    const { data } = await this.octokit.repos.getReadme({
      ...this.gitRequestBase,
      mediaType: {
        format: "raw",
      },
    })
    return data as unknown as string
  }

  async getMainSha(branch = 'main'): Promise<string> {
    try {
      const refResponse = await this.octokit.git.getRef({
        ...this.gitRequestBase,
        ref: `heads/${branch}`,
      })
      return refResponse.data.object.sha

    } catch (e) {
      if (e.status === 404 && branch === 'main')
        return this.getMainSha('master')
      throw e
    }
  }

  async getTree() {
    const treeResponse = await this.octokit.git.getTree({
      ...this.gitRequestBase,
      tree_sha: await this.getMainSha(),
      recursive: "true",
    })
    console.log("TRUNCATED TREE", treeResponse.data.truncated)
    return treeResponse.data.tree
  }

  async buildPageMap(rootPath = '/gh') {
    const tree = await this.getTree()
    const markdownFiles = tree.filter((node) => {
      return !node.path.startsWith(".") && node.path.endsWith(".md");
    });

    const memo = {}
    const baseParts = [rootPath, this.owner, this.repo]

    for (const file of markdownFiles) {
      const parts = file.path.split('/')
      const route = baseParts.concat(parts.slice(0, -1)).join('/')

      if (!memo[route]) {
        memo[route] = {
          kind: 'Folder',
          route,
          name: parts[parts.length - 2] ?? 'root',
          children: [],
        }
      }
      memo[route]['children'].push({
        kind: 'MdxPage',
        name: parts[parts.length - 1],
        route: `${route}/${parts[parts.length - 1]}`,
      })
    }

    console.dir(memo, { depth: null })
    return memo
  }

}
