---
title: Use node to enhance an npm script
date: 2021-05-24
---

Here's a way that I like to enhance a minimal npm script by using node.

Given this folder structure:

```shell
..
└── projects
    ├── Aces
    │   └── translations
    │       └── en-US.json
    ├── Clubs
    │   └── translations
    │       └── en-US.json
    ├── Hearts
    │   └── translations
    │       └── en-US.json
    └── Spades
        └── translations
            └── en-US.json
```

I've got an npm script that uses the `formatjs` cli to extract translations for each of the folders in the `projects` folder. Here it is, from `package.json`:

```json
{
  "scripts": {
    "i18n:extract": "formatjs extract"
  }
}
```

Now, to run this, numerous flags & options have to be provided. Here's how the `extract` script is executed:

```shell
npm run i18n:extract -- 'projects/Hearts/**/*.ts*' --out-file projects/Hearts/translations/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
```

I'd like to remove the hassle of: 

- remembering the options/flags order 
- having to pass specific folder names
- remembering the `id-interpolation-pattern` flag and value

---

Now, let's take a look at how we can improve this by prompting to ask which project we want to run the script for.

First, we'll update the script in `package.json` to use `node` to execute a custom file:

```json
{
  "scripts": {
    "i18n:extract": "node i18n-extract.js"
  }
}
```

and install 2 `devDependencies`:

```shell
npm i -D execa prompts
```

### Getting a list of project names
Now, we need a way to get a list of the projects in the `projects/` directory. In a new file at the root of the project (let's call it `utilities.js`):

```js
const fs = require('fs');
const path = require('path');
const projectsPath = __dirname + '/projects';

module.exports = {
  projectNames: fs
    .readdirSync(projectsPath)
    .filter((fileOrDir) =>
      fs.statSync(path.join(projectsPath, fileOrDir)).isDirectory()
    ),
};
```

This script exports an object with a key of `projectNames`, which is a node `fs` (filesystem) process that crawls the `projectsPath` directory & filters out everything that is not a directory - leaving us with an array of strings that are the names of the folders in the `projects` directory.


### i18n-extract.js
Within a new `i18n-extract.js` file, we can use our new `utilities` file to prompt the user for the project they want to work with:

```js
const prompts = require('prompts');

const { projectNames } = require('./utilities');

const projectPrompt = prompts([
  {
    type: 'autocomplete',
    name: 'project',
    message: 'Choose project:',
    choices: projectNames.map((choice) => ({ title: choice, value: choice })),
  },
]);

(async () => {
    const { project } = await projectPrompt;
    console.log(`Selected project: ${project}`);
})();
```

At this point, the selected project name is available in the `project` constant. Here's what we've got:

![demo-1](https://user-images.githubusercontent.com/368723/119405924-a3e22800-bca7-11eb-967f-bfef5da85b19.gif)


Now, let's replace the hand typed `formatjs extract` bash command:

```js
(async () => {
    const { project } = await projectPrompt;

    try {
        await execa( // 1
            'formatjs', // 2
            [
                'extract', // 3
                `'projects/${project}/**/*.ts*' --out-file projects/${project}/translations/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'`, // 4
            ],
            { shell: true } // 5 
        ).stdout.pipe(process.stdout); // 6
    } catch (error) {
        console.error('error: ', error);
    }
})();
```

The actual script itself isn't super relevant for this post, but here are some notes:
1. `execa` is used to make executing in a child process nice & easy
2. `formatjs` is the binary to execute. `execa` finds the file automatically (it lives in `./node_modules/.bin`)
3. The values in the array are arguments to pass to the command in #2
4. Interpolates the `project` variable, using the value the user chose in the prompt
5. We need to pass `shell: true` as an option, otherwise the node script won't spawn the correct process
6. `stdout` is piped through, so we can see any status codes or messages 

---

That's pretty much it! Hope it helps. Here's the final `i18n-extract.js` file, altogether:

```js
const prompts = require('prompts');

const { projectNames } = require('./utilities');

const projectPrompt = prompts([
  {
    type: 'autocomplete',
    name: 'project',
    message: 'Choose project:',
    choices: projectNames.map((choice) => ({ title: choice, value: choice })),
  },
]);

(async () => {
    const { project } = await projectPrompt;

    try {
        await execa(
            'formatjs',
            [
                'extract',
                `'projects/${project}/**/*.ts*' --out-file projects/${project}/translations/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'`,
            ],
            { shell: true } 
        ).stdout.pipe(process.stdout);
    } catch (error) {
        console.error('error: ', error);
    }
})();
```
