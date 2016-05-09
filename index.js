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

/*
 {
  "id": "3870308828",
  "type": "CommitCommentEvent",
  "repo": {
   "id": 19282660,
   "name": "webcompat/webcompat-reporter-extensions"
  },
  "payload": {
   "comment": {
    "url": "https://api.github.com/repos/webcompat/webcompat-reporter-extensions/comments/17042407",
    "html_url": "https://github.com/webcompat/webcompat-reporter-extensions/commit/0b24129e858ea4c32f6f22811a4342afab8a4c5e#commitcomment-17042407",
    "id": 17042407,
    "user": {
     "login": "karlcow",
     "id": 505230,
     "avatar_url": "https://avatars.githubusercontent.com/u/505230?v=3",
     "gravatar_id": "",
     "url": "https://api.github.com/users/karlcow",
     "html_url": "https://github.com/karlcow",
     "followers_url": "https://api.github.com/users/karlcow/followers",
     "following_url": "https://api.github.com/users/karlcow/following{/other_user}",
     "gists_url": "https://api.github.com/users/karlcow/gists{/gist_id}",
     "starred_url": "https://api.github.com/users/karlcow/starred{/owner}{/repo}",
     "subscriptions_url": "https://api.github.com/users/karlcow/subscriptions",
     "organizations_url": "https://api.github.com/users/karlcow/orgs",
     "repos_url": "https://api.github.com/users/karlcow/repos",
     "events_url": "https://api.github.com/users/karlcow/events{/privacy}",
     "received_events_url": "https://api.github.com/users/karlcow/received_events",
     "type": "User",
     "site_admin": false
    },
    "position": 8,
    "line": 8,
    "path": "firefox-mobile/bootstrap.js",
    "commit_id": "0b24129e858ea4c32f6f22811a4342afab8a4c5e",
    "created_at": "2016-04-11T02:25:19Z",
    "updated_at": "2016-04-11T02:25:19Z",
    "body": "So ok this needs to be… updated to `https`"
   }
  },
  "public": true,
  "created_at": "2016-04-11T02:25:19Z",
  "org": {
   "id": 6175168,
   "login": "webcompat",
   "gravatar_id": "",
   "url": "https://api.github.com/orgs/webcompat",
   "avatar_url": "https://avatars.githubusercontent.com/u/6175168?"
  }
 },
*/

/*
  "id": "3961798330",
  "type": "PullRequestReviewCommentEvent",
  "repo": {
   "id": 37366263,
   "name": "maidsafe/rfcs"
  },
  "payload": {
   "action": "created",
   "comment": {
    "url": "https://api.github.com/repos/maidsafe/rfcs/pulls/comments/61745686",
    "id": 61745686,
    "diff_hunk": "@@ -32,22 +32,19 @@ ON receipt of a `Get` request for `ImmutableData` the `DataManager` calculates t\n 1. PmidNodes -> Registers an Optional (if set by user) wallet address on any store of data to it\n 2. App Developer -> App developers will include wallet address in any `Get` request\n 3. Publisher -> As data is stored a wallet address of the owner is stored if this is first time seen on the network (stored in DM account for the data element)\n-4. Core development -> Initially every node will be aware of a hard coded wallet address for core development. This will likely lead to a multisig wallet.\n+4. Core development -> Initially every node will be aware of a hard coded wallet address for core development. This will likely lead to a multi-sign wallet.",
    "path": "agreed/0004-Farm-attempt/0004-Farm-attempt.md",
    "position": 31,
    "original_position": 31,
    "commit_id": "2016510771876dcb9c8bb3ae70fce63660f13a43",
    "original_commit_id": "2016510771876dcb9c8bb3ae70fce63660f13a43",
    "user": {
     "login": "frabrunelle",
     "id": 1114844,
     "avatar_url": "https://avatars.githubusercontent.com/u/1114844?v=3",
     "gravatar_id": "",
     "url": "https://api.github.com/users/frabrunelle",
     "html_url": "https://github.com/frabrunelle",
     "followers_url": "https://api.github.com/users/frabrunelle/followers",
     "following_url": "https://api.github.com/users/frabrunelle/following{/other_user}",
     "gists_url": "https://api.github.com/users/frabrunelle/gists{/gist_id}",
     "starred_url": "https://api.github.com/users/frabrunelle/starred{/owner}{/repo}",
     "subscriptions_url": "https://api.github.com/users/frabrunelle/subscriptions",
     "organizations_url": "https://api.github.com/users/frabrunelle/orgs",
     "repos_url": "https://api.github.com/users/frabrunelle/repos",
     "events_url": "https://api.github.com/users/frabrunelle/events{/privacy}",
     "received_events_url": "https://api.github.com/users/frabrunelle/received_events",
     "type": "User",
     "site_admin": false
    },
    "body": "Yes, \"multisig wallet\" is definitely more common than \"multi-sign\". The other option is to say \"multisignature wallet\".\r\n\r\nhttps://en.wikipedia.org/wiki/Multisignature",
    "created_at": "2016-05-02T14:30:46Z",
    "updated_at": "2016-05-02T14:30:46Z",
    "html_url": "https://github.com/maidsafe/rfcs/pull/119#discussion_r61745686",
    "pull_request_url": "https://api.github.com/repos/maidsafe/rfcs/pulls/119",
    "_links": {
     "self": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/pulls/comments/61745686"
     },
     "html": {
      "href": "https://github.com/maidsafe/rfcs/pull/119#discussion_r61745686"
     },
     "pull_request": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/pulls/119"
     }
    }
   },
   "pull_request": {
    "url": "https://api.github.com/repos/maidsafe/rfcs/pulls/119",
    "id": 68117716,
    "html_url": "https://github.com/maidsafe/rfcs/pull/119",
    "diff_url": "https://github.com/maidsafe/rfcs/pull/119.diff",
    "patch_url": "https://github.com/maidsafe/rfcs/pull/119.patch",
    "issue_url": "https://api.github.com/repos/maidsafe/rfcs/issues/119",
    "number": 119,
    "state": "closed",
    "locked": false,
    "title": "Typos, improved grammar and formatting for agreed and implemented RFCs",
    "user": {
     "login": "ligthyear",
     "id": 40496,
     "avatar_url": "https://avatars.githubusercontent.com/u/40496?v=3",
     "gravatar_id": "",
     "url": "https://api.github.com/users/ligthyear",
     "html_url": "https://github.com/ligthyear",
     "followers_url": "https://api.github.com/users/ligthyear/followers",
     "following_url": "https://api.github.com/users/ligthyear/following{/other_user}",
     "gists_url": "https://api.github.com/users/ligthyear/gists{/gist_id}",
     "starred_url": "https://api.github.com/users/ligthyear/starred{/owner}{/repo}",
     "subscriptions_url": "https://api.github.com/users/ligthyear/subscriptions",
     "organizations_url": "https://api.github.com/users/ligthyear/orgs",
     "repos_url": "https://api.github.com/users/ligthyear/repos",
     "events_url": "https://api.github.com/users/ligthyear/events{/privacy}",
     "received_events_url": "https://api.github.com/users/ligthyear/received_events",
     "type": "User",
     "site_admin": false
    },
    "body": "While trying to catch up on the RFCs, I noticed some contain typos, were hard to read (with an editor) or had some formatting differences (like unneeded wrapping or missing markup). This PR contains these fixes I made to the agreed and implemented RFCs. None of the fixes changes the actual content or meaning of any of RFCs.\n\n<!-- Reviewable:start -->\n---\nThis change is [<img src=\"https://reviewable.io/review_button.svg\" height=\"35\" align=\"absmiddle\" alt=\"Reviewable\"/>](https://reviewable.io/reviews/maidsafe/rfcs/119)\n<!-- Reviewable:end -->\n",
    "created_at": "2016-04-27T20:18:20Z",
    "updated_at": "2016-05-02T14:30:46Z",
    "closed_at": "2016-05-02T13:56:29Z",
    "merged_at": "2016-05-02T13:56:29Z",
    "merge_commit_sha": "e3be48574c3972b1d7e5223ad63f8138c8807edc",
    "assignee": null,
    "milestone": null,
    "commits_url": "https://api.github.com/repos/maidsafe/rfcs/pulls/119/commits",
    "review_comments_url": "https://api.github.com/repos/maidsafe/rfcs/pulls/119/comments",
    "review_comment_url": "https://api.github.com/repos/maidsafe/rfcs/pulls/comments{/number}",
    "comments_url": "https://api.github.com/repos/maidsafe/rfcs/issues/119/comments",
    "statuses_url": "https://api.github.com/repos/maidsafe/rfcs/statuses/2016510771876dcb9c8bb3ae70fce63660f13a43",
    "head": {
     "label": "ligthyear:language-fixes",
     "ref": "language-fixes",
     "sha": "2016510771876dcb9c8bb3ae70fce63660f13a43",
     "user": {
      "login": "ligthyear",
      "id": 40496,
      "avatar_url": "https://avatars.githubusercontent.com/u/40496?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/ligthyear",
      "html_url": "https://github.com/ligthyear",
      "followers_url": "https://api.github.com/users/ligthyear/followers",
      "following_url": "https://api.github.com/users/ligthyear/following{/other_user}",
      "gists_url": "https://api.github.com/users/ligthyear/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/ligthyear/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/ligthyear/subscriptions",
      "organizations_url": "https://api.github.com/users/ligthyear/orgs",
      "repos_url": "https://api.github.com/users/ligthyear/repos",
      "events_url": "https://api.github.com/users/ligthyear/events{/privacy}",
      "received_events_url": "https://api.github.com/users/ligthyear/received_events",
      "type": "User",
      "site_admin": false
     },
     "repo": {
      "id": 56917678,
      "name": "maidsafe-rfcs",
      "full_name": "ligthyear/maidsafe-rfcs",
      "owner": {
       "login": "ligthyear",
       "id": 40496,
       "avatar_url": "https://avatars.githubusercontent.com/u/40496?v=3",
       "gravatar_id": "",
       "url": "https://api.github.com/users/ligthyear",
       "html_url": "https://github.com/ligthyear",
       "followers_url": "https://api.github.com/users/ligthyear/followers",
       "following_url": "https://api.github.com/users/ligthyear/following{/other_user}",
       "gists_url": "https://api.github.com/users/ligthyear/gists{/gist_id}",
       "starred_url": "https://api.github.com/users/ligthyear/starred{/owner}{/repo}",
       "subscriptions_url": "https://api.github.com/users/ligthyear/subscriptions",
       "organizations_url": "https://api.github.com/users/ligthyear/orgs",
       "repos_url": "https://api.github.com/users/ligthyear/repos",
       "events_url": "https://api.github.com/users/ligthyear/events{/privacy}",
       "received_events_url": "https://api.github.com/users/ligthyear/received_events",
       "type": "User",
       "site_admin": false
      },
      "private": false,
      "html_url": "https://github.com/ligthyear/maidsafe-rfcs",
      "description": "Request for Comment (RFC) papers and discussions on Project SAFE core libraries and API's",
      "fork": true,
      "url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs",
      "forks_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/forks",
      "keys_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/teams",
      "hooks_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/hooks",
      "issue_events_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/issues/events{/number}",
      "events_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/events",
      "assignees_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/assignees{/user}",
      "branches_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/branches{/branch}",
      "tags_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/tags",
      "blobs_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/languages",
      "stargazers_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/stargazers",
      "contributors_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/contributors",
      "subscribers_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/subscribers",
      "subscription_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/subscription",
      "commits_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/contents/{+path}",
      "compare_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/merges",
      "archive_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/downloads",
      "issues_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/issues{/number}",
      "pulls_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/labels{/name}",
      "releases_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/releases{/id}",
      "deployments_url": "https://api.github.com/repos/ligthyear/maidsafe-rfcs/deployments",
      "created_at": "2016-04-23T12:17:34Z",
      "updated_at": "2016-04-23T12:17:51Z",
      "pushed_at": "2016-04-27T20:00:56Z",
      "git_url": "git://github.com/ligthyear/maidsafe-rfcs.git",
      "ssh_url": "git@github.com:ligthyear/maidsafe-rfcs.git",
      "clone_url": "https://github.com/ligthyear/maidsafe-rfcs.git",
      "svn_url": "https://github.com/ligthyear/maidsafe-rfcs",
      "homepage": "",
      "size": 2348,
      "stargazers_count": 0,
      "watchers_count": 0,
      "language": "Rust",
      "has_issues": false,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "forks_count": 0,
      "mirror_url": null,
      "open_issues_count": 0,
      "forks": 0,
      "open_issues": 0,
      "watchers": 0,
      "default_branch": "master"
     }
    },
    "base": {
     "label": "maidsafe:master",
     "ref": "master",
     "sha": "3273f133a1c11ff4143799c33ead5d57c2809a61",
     "user": {
      "login": "maidsafe",
      "id": 536423,
      "avatar_url": "https://avatars.githubusercontent.com/u/536423?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/maidsafe",
      "html_url": "https://github.com/maidsafe",
      "followers_url": "https://api.github.com/users/maidsafe/followers",
      "following_url": "https://api.github.com/users/maidsafe/following{/other_user}",
      "gists_url": "https://api.github.com/users/maidsafe/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/maidsafe/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/maidsafe/subscriptions",
      "organizations_url": "https://api.github.com/users/maidsafe/orgs",
      "repos_url": "https://api.github.com/users/maidsafe/repos",
      "events_url": "https://api.github.com/users/maidsafe/events{/privacy}",
      "received_events_url": "https://api.github.com/users/maidsafe/received_events",
      "type": "Organization",
      "site_admin": false
     },
     "repo": {
      "id": 37366263,
      "name": "rfcs",
      "full_name": "maidsafe/rfcs",
      "owner": {
       "login": "maidsafe",
       "id": 536423,
       "avatar_url": "https://avatars.githubusercontent.com/u/536423?v=3",
       "gravatar_id": "",
       "url": "https://api.github.com/users/maidsafe",
       "html_url": "https://github.com/maidsafe",
       "followers_url": "https://api.github.com/users/maidsafe/followers",
       "following_url": "https://api.github.com/users/maidsafe/following{/other_user}",
       "gists_url": "https://api.github.com/users/maidsafe/gists{/gist_id}",
       "starred_url": "https://api.github.com/users/maidsafe/starred{/owner}{/repo}",
       "subscriptions_url": "https://api.github.com/users/maidsafe/subscriptions",
       "organizations_url": "https://api.github.com/users/maidsafe/orgs",
       "repos_url": "https://api.github.com/users/maidsafe/repos",
       "events_url": "https://api.github.com/users/maidsafe/events{/privacy}",
       "received_events_url": "https://api.github.com/users/maidsafe/received_events",
       "type": "Organization",
       "site_admin": false
      },
      "private": false,
      "html_url": "https://github.com/maidsafe/rfcs",
      "description": "Request for Comment (RFC) papers and discussions on Project SAFE core libraries and API's",
      "fork": false,
      "url": "https://api.github.com/repos/maidsafe/rfcs",
      "forks_url": "https://api.github.com/repos/maidsafe/rfcs/forks",
      "keys_url": "https://api.github.com/repos/maidsafe/rfcs/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/maidsafe/rfcs/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/maidsafe/rfcs/teams",
      "hooks_url": "https://api.github.com/repos/maidsafe/rfcs/hooks",
      "issue_events_url": "https://api.github.com/repos/maidsafe/rfcs/issues/events{/number}",
      "events_url": "https://api.github.com/repos/maidsafe/rfcs/events",
      "assignees_url": "https://api.github.com/repos/maidsafe/rfcs/assignees{/user}",
      "branches_url": "https://api.github.com/repos/maidsafe/rfcs/branches{/branch}",
      "tags_url": "https://api.github.com/repos/maidsafe/rfcs/tags",
      "blobs_url": "https://api.github.com/repos/maidsafe/rfcs/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/maidsafe/rfcs/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/maidsafe/rfcs/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/maidsafe/rfcs/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/maidsafe/rfcs/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/maidsafe/rfcs/languages",
      "stargazers_url": "https://api.github.com/repos/maidsafe/rfcs/stargazers",
      "contributors_url": "https://api.github.com/repos/maidsafe/rfcs/contributors",
      "subscribers_url": "https://api.github.com/repos/maidsafe/rfcs/subscribers",
      "subscription_url": "https://api.github.com/repos/maidsafe/rfcs/subscription",
      "commits_url": "https://api.github.com/repos/maidsafe/rfcs/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/maidsafe/rfcs/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/maidsafe/rfcs/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/maidsafe/rfcs/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/maidsafe/rfcs/contents/{+path}",
      "compare_url": "https://api.github.com/repos/maidsafe/rfcs/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/maidsafe/rfcs/merges",
      "archive_url": "https://api.github.com/repos/maidsafe/rfcs/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/maidsafe/rfcs/downloads",
      "issues_url": "https://api.github.com/repos/maidsafe/rfcs/issues{/number}",
      "pulls_url": "https://api.github.com/repos/maidsafe/rfcs/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/maidsafe/rfcs/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/maidsafe/rfcs/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/maidsafe/rfcs/labels{/name}",
      "releases_url": "https://api.github.com/repos/maidsafe/rfcs/releases{/id}",
      "deployments_url": "https://api.github.com/repos/maidsafe/rfcs/deployments",
      "created_at": "2015-06-13T09:50:34Z",
      "updated_at": "2016-04-19T20:25:31Z",
      "pushed_at": "2016-05-02T13:56:30Z",
      "git_url": "git://github.com/maidsafe/rfcs.git",
      "ssh_url": "git@github.com:maidsafe/rfcs.git",
      "clone_url": "https://github.com/maidsafe/rfcs.git",
      "svn_url": "https://github.com/maidsafe/rfcs",
      "homepage": "",
      "size": 2412,
      "stargazers_count": 22,
      "watchers_count": 22,
      "language": "Rust",
      "has_issues": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "forks_count": 29,
      "mirror_url": null,
      "open_issues_count": 29,
      "forks": 29,
      "open_issues": 29,
      "watchers": 22,
      "default_branch": "master"
     }
    },
    "_links": {
     "self": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/pulls/119"
     },
     "html": {
      "href": "https://github.com/maidsafe/rfcs/pull/119"
     },
     "issue": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/issues/119"
     },
     "comments": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/issues/119/comments"
     },
     "review_comments": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/pulls/119/comments"
     },
     "review_comment": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/pulls/comments{/number}"
     },
     "commits": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/pulls/119/commits"
     },
     "statuses": {
      "href": "https://api.github.com/repos/maidsafe/rfcs/statuses/2016510771876dcb9c8bb3ae70fce63660f13a43"
     }
    }
   }
  },
  "public": true,
  "created_at": "2016-05-02T14:30:46Z",
  "org": {
   "id": 536423,
   "login": "maidsafe",
   "gravatar_id": "",
   "url": "https://api.github.com/orgs/maidsafe",
   "avatar_url": "https://avatars.githubusercontent.com/u/536423?"
  }
 },
*/

const processors = {
  nop: (event) => {
    console.error('UNPROCESSED EVENT TYPE:', event.type)
    return event
  },
  CommitCommentEvent: (event) => event, // FIXME
  PullRequestReviewCommentEvent: (event) => event, // FIXME
  GollumEvent: (event) => {
    delete event.payload.pages.html_url
    return event
  },

  CreateEvent: (event) => event,
  DeleteEvent: (event) => event,
  ForkEvent: (event) => {
    delete event.payload.forkee.owner
    event.payload.forkee = omitBy(event.payload.forkee, skipUrl)
    event.org = omitBy(event.org, skipUrl)
    return event
  },
  PublicEvent: (event) => {
    delete event.payload
    return event
  },
  IssueCommentEvent: (event) => {
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
  },
  WatchEvent: (event) => {
    delete event.org
    return event
  },
  IssuesEvent: (event) => {
    event.payload.issue = omitBy(event.payload.issue, skipUrl)
    event.payload.issue = omit(event.payload.issue, ['user', 'assignee', 'milestone'])
    event.payload.issue.labels = event.payload.issue.labels.map((label) => label.name)
    return event
  },
  PullRequestEvent: (event) => {
    event.payload.pull_request = omitBy(event.payload.pull_request, skipUrl)
    event.payload.pull_request = omit(event.payload.pull_request, ['user', 'locked', 'head', 'base', '_links', 'number'])
    event.payload.pull_request.merged_by = omitBy(event.payload.pull_request.merged_by, skipUrl)
    return event
  },
  PushEvent: (event) => {
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
    let type = event.type
    if (!processors[type]) { type = 'nop' }
    return processors[type](event)
  }))
