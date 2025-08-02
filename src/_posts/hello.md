---
layout: post
title:  "Creating your own blog with Ruby for free"
date:   2025-07-03 12:01:16 +0200
categories: articles
---

I had been looking for a way to have my own website to be able to share learnings, showcase projects, and in general just [build in public](https://buildinpublic.com/). I wanted to be able to use something that would get me started fast, that is modern, and ideally free. And thanks to [Andrew Mason](https://andrewm.codes/), I learned about Bridgetown and knew it would be perfect for this.

## Setting up Bridgetown

I’m going to make a few assumptions here. You should already have Git and a GitHub account set up, as well as ruby. Start by installing Bridgetown

```bash
gem install bridgetown -N
```

Generate your new site

```bash
bridgetown new my-awesome-site
cd my-awesome-site
```

Great! Now that you have your website we now need to create a repository on GitHub where we can upload the changes.

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

Now we have to set up GitHub Pages and the workflow to deploy it. There are 2 parts of this. First the part in GitHub. You’ll want to go to your Settings > Pages section in your repository. There you’ll want to set the source to GitHub Actions and publish your site. You can also set up your custom domain if you have one but it’s not necessary

Now on our code we need to add the configuration for Github Pages. Thankfully Bridgetown comes with a helper that allows us to easily setup the GitHub action workflow by running

```bash
bin/bridgetown configure gh-pages
```

The very last step is to set the url value in your `bridgetown.config.yml` file to the name of the url for your site. If it's not a custom domain, it will be something like `username.github.io`

That’s it! You have your own blog with a Github domain hosted completely for free and you can customise it as much as you want