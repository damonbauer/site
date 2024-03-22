---
title: Blog With Eleventy, Netlify & GitHub
date: 2019-11-03
tags:
    - eleventy
    - netlify
    - github
---

I have blogged on and off for a long time, using Wordpress, Jekyll and a few other random tools. I've never stuck with it (this iteration will probably suffer the same fate, if I'm honest).

I've been feeling the pull to just write stuff down - even if it's not well formed, organized or polished. More of a recording of what I was doing/thinking/learning at the time. Thus, this iteration of a blog was born.

One of the most annoying things of blogging to me is hosting & infrastructure. Things have progressed quite rapidly in the space of [static site generators](https://www.staticgen.com/), so I thought I could make this work. I've landed on a setup that is pretty nice so far & wanted to document it. 

## Eleventy
To build the actual posts & pages, I chose [Eleventy](https://www.11ty.io/), and I cloned the [eleventy-blog-mnml](https://github.com/arpitbatra123/eleventy-blog-mnml) repo because it is _super_ basic, which is what I enjoy. I wanted the least amount of features and friction to start.

[Here's the repo](https://github.com/damonbauer/site) that powers the site you're on right now.

## GitHub
I tried using GitHub Actions for the first time to handle building the site. It's a small sample size, but it works seamlessly & I am impressed with how fast this process goes.

[This is the GitHub action](https://github.com/damonbauer/site/blob/master/.github/workflows/build-deploy.yml) I'm using to build the site using Eleventy & push the built artifact to the `gh-pages` branch of the repo.

```yaml
name: Build & Deploy

on:
  push:
    branches:
      - master

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@master
      
    - name: Build and Deploy
      uses: JamesIves/github-pages-deploy-action@master
      env:
        ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
        BASE_BRANCH: master # The branch the action should deploy from.
        BRANCH: gh-pages # The branch the action should deploy to.
        FOLDER: _site # The folder the action should deploy.
        BUILD_SCRIPT: npm install && npm run build # The build script the action should run prior to deploying.
```

Two things to note:

1. You'll need to [generate a personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line#creating-a-token), and store it in your repo secrets (Settings > Secrets) as `ACCESS_TOKEN`.
2. This uses an already built action, [github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action), to handle pushing the Eleventy built site (which is in the `./_site` folder) to the repo's `gh-pages` branch.

## Netlify
Before this, I'd never used Netlify, but I've heard it is quite an enjoyable developer experience & I now agree.

I created an account and within 5 minutes I had purchased a domain name, got a free SSL certificate, and had a deploy system built to watch the `gh-pages` branch of my repo.

About the only thing I changed was `Settings > Build & Deploy > Continuous Deployment > Deploy Contexts`, where I set `production-branch` to `gh-pages`.

## All Together
The whole system works like this:

1. I make a branch, where I author a new post.
2. Make a PR against `master` and merge the PR.
3. The GitHub action kicks off, which runs Eleventy to build the site into the `./_site` folder & pushes that to the `gh-pages` branch.
4. Netlify sees a change to the `gh-pages` branch and re-deploys the contents of the branch to the domain.
