const { createRobot } = require('probot')
const plugin = require('..')

const wipObject = {
  'context': 'codereview/wip',
  'description': 'Work in progress',
  'owner': 'user',
  'repo': 'testing-things',
  'sha': 'sha',
  'state': 'failure'
}

describe('Checking if the PR is WIP', () => {
  let robot
  let github

  let payload = require('./events/commit')

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn()
      },
      issues: {
        getIssueLabels: jest.fn()
      }
    }

    robot.auth = () => Promise.resolve(github)
  })

  it('Detects wip in PR title', async () => {
    payload.payload.pull_request.title = 'wip pr'

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith(wipObject)
  })

  it('Detects wip in labels', async () => {
    payload.payload.pull_request.title = 'classic title'

    github.issues.getIssueLabels = jest.fn().mockReturnValue(Promise.resolve({
      data: [
        {
          id: 208045946,
          url: 'https://api.github.com/repos/octocat/Hello-World/labels/bug',
          name: 'wip',
          description: 'work in progress',
          color: 'f29513',
          default: true
        }
      ]
    }))

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith(wipObject)
  })
})