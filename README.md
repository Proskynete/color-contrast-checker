<div id="top">
  <h1>C3 - Color Contrast Checker
   <img src="https://cdn.iconscout.com/icon/free/png-256/typescript-1174965.png" width="25" height="25" />
 </h1>

![Color Contrast Checker](https://github.com/Proskynete/color-contrast-checker/blob/master/public/cover_image.png "How to see color-contrast-checker")

## Status

[![GitHub license](https://img.shields.io/github/license/Proskynete/color-contrast-checker?logo=Github)](https://github.com/Proskynete/color-contrast-checker) [![GitHub issues](https://img.shields.io/github/issues/Proskynete/color-contrast-checker)](https://github.com/Proskynete/color-contrast-checker/issues) [![GitHub forks](https://img.shields.io/github/forks/Proskynete/color-contrast-checker)](https://github.com/Proskynete/color-contrast-checker/network) [![GitHub stars](https://img.shields.io/github/stars/Proskynete/color-contrast-checker)](https://github.com/Proskynete/color-contrast-checker/stargazers) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-green)](#CONTRIBUTING.md)

<br />
<br />

<details>
  <summary>Table of contents</summary>
  <ol>
    <li>
      <a href="#description">👀Description</a>
    </li>
    <li>
      <a href="#setup">⚙️ Setup - local</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#technologies">Technologies</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#how-to-use">🚀 How to use</a></li>
    <li><a href="#questions">❓ Questions</a></li>
  </ol>
</details>

<h2 id="description">👀 Description</h2>

Calculate the contrast ratio of text and background colors.
This project follows the Web Content Accessibility Guidelines (WCAG).

<div align="right"><a href="#top">🔝</a></div>

<h2 id="setup">⚙️ Setup - local</h2>

<h3 id="prerequisites">Prerequisites</h3>

- [node.js](https://nodejs.org) - <small>[nvm](https://github.com/nvm-sh/nvm) is recommended to manage node versions</small>
- [pnpm](https://pnpm.io) - <small>recommended</small>
- [vscode](https://code.visualstudio.com/)
  - [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) <small>(required)</small>
  - [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) <small>(required)</small>
  - [code spell checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) <small>(recommended)</small>
- [git](https://git-scm.com/)

<h3 id="technologies">Technologies</h3>

- [husky](https://typicode.github.io/husky)
- [eslint](https://eslint.org)
- [prettier](https://prettier.io)
- [commitlint](https://commitlint.js.org)
- [lint-staged](https://github.com/okonet/lint-staged)
- [react](https://reactjs.org)
- [tailwindcss](https://tailwindcss.com/)
- [typescript](https://www.typescriptlang.org)
- [vite](https://vitejs.dev/)

<h3 id="installation">Installation</h3>

To install the project, you need to clone the repository and install the dependencies.

```bash
# with ssh
git clone git@github.com:Proskynete/color-contrast-checker.git
# with https
git clone https://github.com/Proskynete/color-contrast-checker.git
# with GitHub CLI
gh repo clone Proskynete/color-contrast-checker
```

Go to the project folder and install the dependencies.

```bash
cd color-contrast-checker
pnpm install
```

Then you need the following script to run the project in [localhost:5173](http://localhost:5173)

```bash
pnpm run dev
```

<div align="right"><a href="#top">🔝</a></div>

<h2 id="setup">🚀 How to use</h2>

Once inside in the [C3](https://c3.eduardoalvarez.dev/) site, we must paste the color of the text which we want to test inside the first input (or we can also select one from the same input).
Then, we will have to do the same process, but now with the background color, within the second input.
Once we have the two colors in the corresponding inputs, the application will tell us if the color contrast is accessible or not.
We also have a section to preview the selected colors and how they look within a site. To do this, we can use the section next to the form. We can see it with dummy text.

![Preview with dummy text](https://github.com/Proskynete/color-contrast-checker/blob/master/public/cover_image.png "Preview with dummy text")

<div align="right"><a href="#top">🔝</a></div>
