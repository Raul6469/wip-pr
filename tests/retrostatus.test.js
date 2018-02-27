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

const successObject = {
  'context': 'codereview/wip',
  'description': 'A new commit has been pushed',
  'owner': 'user',
  'repo': 'testing-things',
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
})
