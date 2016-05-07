/*
RoLLodeQc utility to fetch user events.

Copyright 2016
Robin Millette <mailto:robin@millette.info>
<http://robin.millette.info>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the
[GNU Affero General Public License](LICENSE.md)
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'

// core
const qs = require('querystring')

// npm
const ghGot = require('gh-got')
const bookworm = require('rollodeqc-gh-bookworm')
const omitBy = require('lodash.omitby')
const omit = require('lodash.omit')
const groupBy = require('lodash.groupby')

const skipUrl = (v, u) => !v || u === 'url' || u.slice(-4) === '_url'

const processForkEvent = (event) => {
  if (event.type !== 'ForkEvent') { return event }
  delete event.payload.forkee.owner
  event.payload.forkee = omitBy(event.payload.forkee, skipUrl)
  event.org = omitBy(event.org, skipUrl)
  return event
}

const processPublicEvent = (event) => {
  if (event.type !== 'PublicEvent') { return event }
  delete event.payload
  return event
}

const processIssueCommentEvent = (event) => {
  if (event.type !== 'IssueCommentEvent') { return event }
  event.payload.issue = omitBy(event.payload.issue, skipUrl)
  event.payload.issue.user = omitBy(event.payload.issue.user, skipUrl)
  event.payload.comment = omitBy(event.payload.comment, skipUrl)
  event.payload.comment.user = omitBy(event.payload.comment.user, skipUrl)
  if (event.payload.issue.labels.length) {
    event.payload.issue.labels = event.payload.issue.labels.map((label) => label.name)
  } else {
    delete event.payload.issue.labels
  }
  return event
}

const processWatchEvent = (event) => {
  if (event.type !== 'WatchEvent') { return event }
  delete event.org
  return event
}

const processIssuesEvent = (event) => {
  if (event.type !== 'IssuesEvent') { return event }
  event.payload.issue = omitBy(event.payload.issue, skipUrl)
  event.payload.issue = omit(event.payload.issue, ['user', 'assignee', 'milestone'])
  event.payload.issue.labels = event.payload.issue.labels.map((label) => label.name)
  return event
}

const processPullRequestEvent = (event) => {
  if (event.type !== 'PullRequestEvent') { return event }
  event.payload.pull_request = omitBy(event.payload.pull_request, skipUrl)
  event.payload.pull_request = omit(event.payload.pull_request, ['user', 'locked', 'head', 'base', '_links', 'number'])
  event.payload.pull_request.merged_by = omitBy(event.payload.pull_request.merged_by, skipUrl)
  return event
}

const processPushEvent = (event) => {
  if (event.type !== 'PushEvent') { return event }
  delete event.payload.size
  delete event.payload.distinct_size
  delete event.payload.head
  delete event.payload.before

  const commitsTmp = event.payload.commits.map((commit) => {
    delete commit.url
    commit.authorkey = `${commit.author.name} <${commit.author.email}>`
    return commit
  })
  const commitsTmp2 = groupBy(commitsTmp, 'authorkey')
  let r
  let a
  const commitsTmp3 = []
  for (r in commitsTmp2) {
    a = commitsTmp2[r][0].author
    commitsTmp2[r].forEach((b) => {
      delete b.author
      delete b.authorkey
      delete b.distinct
    })
    const commitsTmp4 = {}
    commitsTmp2[r].forEach((b) => { commitsTmp4[b.sha] = b.message })
    commitsTmp3.push([a, commitsTmp4])
  }
  event.payload.commits = commitsTmp3
  return event
}

const fetchPage = (options) => ghGot(
  typeof options === 'object'
    ? `users/${options.username}/events?` + qs.stringify(options)
    : options
)

const methods = {
  getItems: (result) => result && result.body,
  updateItems: (result, inner) => {
    inner.body = result.body.concat(inner.body)
    return inner
  }
}

module.exports = (username) => bookworm.bookworm({
  username: username
}, fetchPage, methods)
  .then((x) => x.body)
  .then((events) => events.map((event) => {
    delete event.actor
    delete event.repo.url
    switch (event.type) {
      case 'CreateEvent':
      case 'DeleteEvent':
        return event

      case 'PushEvent':
        return processPushEvent(event)

      case 'PullRequestEvent':
        return processPullRequestEvent(event)

      case 'IssuesEvent':
        return processIssuesEvent(event)

      case 'WatchEvent':
        return processWatchEvent(event)

      case 'IssueCommentEvent':
        return processIssueCommentEvent(event)

      case 'PublicEvent':
        return processPublicEvent(event)

      case 'ForkEvent':
        return processForkEvent(event)

      default:
        console.log('Untreated:', event.type)
        return event
    }
  }))
