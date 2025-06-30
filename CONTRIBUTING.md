# Contributing to OneNode

Thank you for contributing to OneNode! We're building the AI-native database for modern applications and we'd love to have you contribute! Here's some resources and guidance to help you get started:

[1. Issues](#issues)
[2. Pull Requests](#pull-requests)

## Issues

If you find a bug, please create an Issue and we'll triage it. As part of our **$10 bug bounty program** during public beta, verified bugs earn rewards!

- Please search [existing Issues](https://github.com/onenodehq/onenode/issues) before creating a new one.
- Please include a clear description of the problem along with steps to reproduce it. Exact steps with screenshots and error messages really help here.

## Pull Requests

We actively welcome your Pull Requests! A couple of things to keep in mind before you submit:

- If you're fixing an Issue, make sure someone else hasn't already created a PR fixing the same issue. Likewise, make sure to link your PR to the related Issue(s).
- We will always try to accept the first viable PR that resolves the Issue.
- If you're new, we encourage you to take a look at issues tagged with [good first issue](https://github.com/onenodehq/onenode/labels/good%20first%20issue).
- If you're submitting a new feature, make sure you have opened a [Discussion](https://github.com/onenodehq/onenode/discussions/new/choose) to discuss the new feature before opening a PR. We'd love to accept your hard work, but unfortunately if a feature hasn't gone through a proper design process, your PR will be closed.
- Please use the PR message template and provide detailed context for quicker review. PRs without clear problem statements will be closed.

Prior to submitting your PR, please conduct the following pre-flight checks:

- Run `pytest` locally to ensure all tests pass without having to wait on CI.
- Ensure your code follows PEP 8 Python style guidelines.
- Test your changes manually with the development server using `./run.sh`.

Running these before you create the PR will help reduce back and forth with the team. 