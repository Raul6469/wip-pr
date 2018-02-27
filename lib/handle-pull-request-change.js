module.exports = handlePullRequestChange

async function handlePullRequestChange (robot, context) {
  const title = context.payload.pull_request.title
  const labels = await context.github.issues.getIssueLabels({owner: context.payload.repository.owner.login, repo: context.payload.repository.name, number: context.payload.number})
  const isWip = /\b(wip|do not merge)\b/i.test(title) || labels.data.filter(label => (/\b(wip|do not merge)\b/i.test(label.name))).length !== 0
  const status = isWip ? 'failure' : 'success'

  console.log(`Updating PR "${title}" (${context.payload.pull_request.html_url}): ${status}`)

  context.github.repos.createStatus(context.repo({
    sha: context.payload.pull_request.head.sha,
    state: status,
    target_url: 'https://github.com/apps/wip-pr',
    description: isWip ? 'Work in progress' : 'Ready for review',
    context: 'codereview/wip'
  }))

  if (context.payload.action === 'synchronize') {
    context.github.repos.createStatus(context.repo({
      sha: context.payload.before,
      state: 'success',
      target_url: 'https://github.com/apps/wip-pr',
      description: 'A new commit has been pushed',
      context: 'codereview/wip'
    }))
  }
}
