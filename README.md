# Zeplin CLI Comments Plugin


[Zeplin CLI](https://github.com/zeplin/cli) plugin to generate descriptions and code snippets 
from documentation comments. We use this to for (S)CSS themes.

## Installation 

```sh
npm install --save-dev @dimensional/zeplin-cli-comment-connect
```

## Usage

Run CLI `connect` command using the plugin.

```sh
zeplin connect -p @dimensional/zeplin-cli-comment-connect
```

### Configuration

| Property             | Description                                                                  |
|----------------------|------------------------------------------------------------------------------|
| `snippetPath`        | A base path for external snippets files that start with `/`. The default value is `snippets`.|

Here's a sample configuration file (`.zeplin/components.json`):

```json
{
    "plugins" : [{
        "name": "@dimensional/zeplin-cli-comment-connect",
        "config": {
            "snippetPath": "snippets"
        }
    }]
}
```
 
 ☝️ _Note that after adding the plugin to the configuration file, you don't need to pass it as the `-p` argument to 
 the `connect` command—running `zeplin connect` should be enough._

## Basic Syntax

Add a comment to the component file. 

```CSS
/**
 * A description for the component
 */
.example {
}
```

The plugin looks for the first comment with a "@zeplin" annotation and falls back
to the first comment of the file.

```CSS
/**
 * Ignored
 */

/**
 * A description for the component
 * 
 * @zeplin
 */
.example {
}
```

## Snippets

Use "@snippet" annotation to provide the example snippet. 

### Inline

```CSS
/**
 * Description with inline snippet
 *
 * @snippet <div class="example"></div> 
 */
.example {
}
```

```CSS
/**
 * Description with inline snippet, with language identifier
 *
 * @snippet html
 *   <div class="example"></div> 
 */
.example {
}
```

### Separate File

If the annotation content starts with "/", "./", or "../" it will be treated as
an external file and the language will be mapped from the file extension.

```CSS
/**
 * Description with snippet file
 *
 * @snippet ./example.html 
 */
.example {
}
```

## About Connected Components

[Connected Components](https://blog.zeplin.io/introducing-connected-components-components-in-design-and-code-in-harmony-aa894ed5bd95) in Zeplin lets you access components in your codebase directly on designs in Zeplin, with links to Storybook, GitHub and any other source of documentation based on your workflow. 🧩

[Zeplin CLI](https://github.com/zeplin/cli) uses plugins like this one to analyze component source code and publishes a high-level overview to be displayed in Zeplin.
