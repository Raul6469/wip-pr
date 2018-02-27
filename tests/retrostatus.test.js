const { createRobot } = require('probot')
const plugin = require('..')

const wipObject = {
  'context': 'codereview/wip',
  'description': 'Work in progress',
  'owner': 'user',
  'repo': 'testing-things',
  'target_url': 'https://github.com/apps/wip-pr',
  'sha': 'sha',
  'state': 'failure'
}

const successObject = {
  'context': 'codereview/wip',
  'description': 'A new commit has been pushed',
  'owner': 'user',
  'repo': 'testing-things',
  'target_url': 'https://github.com/apps/wip-pr',
  'sha': 'shabefore',
  'state': 'success'
}

describe('Retrostatus', () => {
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

  it('While PR is wip, sets the previous commit to success', async () => {
    payload.payload.pull_request.title = 'wip pr'

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith(wipObject)
    expect(github.repos.createStatus).toHaveBeenCalledWith(successObject)
  })

  it('Does not try to set previous commit status when it is not a synchronize event', async () => {
    payload.payload.pull_request.title = 'wip pr'
    payload.payload.action = 'opened'

    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith(wipObject)
    expect(github.repos.createStatus).not.toHaveBeenCalledWith(successObject)
  })
})
