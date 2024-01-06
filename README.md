# diffnews

Track news changes and post them on the social network

This project uses the boilerplate provided by [node-typescript-boilerplate](https://github.com/jsynowiec/node-typescript-boilerplate)

## Process

1. Populate new articles (static/{bot}/articles)
2. Check for changes and create diffs (static/{bot}/diffs)
3. Publish the diffs and delete them
4. As the publishing can only happen on the own account, when the account is mentioned, check the url and look if we have it tracked
