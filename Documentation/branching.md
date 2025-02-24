# Branching Documentation
When working on a project with multiple people a good way to organize the clutter within a repo is having conventions for branching so you can get a good idea of all of the different things people are working on without having to fully dive into the branch. 

## Conventions
Each branch name should contain:
- Story Number (If Applicable)
- Issue Number
- A passive description of the work (uppercase first letters)

## Examples
### Issue w/ Story
Consider user story #5: 
> As a project manager, I want to log in safely and securely to the dashboard using my credentials, so I can access real-time sensor data

With an example task #10:
> Create a log in page with username and password fields

A potential branch name could be
`10-5-CreateLogin`

### Issue w/o Story
Consider issue #13:
> Branch Documentation

Because there is no user story, there is no need to add an extra number at the start. Potential branch names could be: `13-BranchingDoc` or `13-Documentation`

The conventions here are relatively simple: `##-##-description` or `##-description`. 