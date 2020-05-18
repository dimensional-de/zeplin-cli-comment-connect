import {ComponentConfig, ComponentData, ConnectPlugin, PluginContext, PrismLang} from "@zeplin/cli";
import path from "path";
import {readFile} from "fs-extra";
import parse, {Comment} from "comment-parser";

class CommentConnector implements ConnectPlugin {
    supportedFileExtensions = [".css", ".scss", ".js", ".ts"];
    snippetLanguages: {[extension: string]: PrismLang} = {
        ".html": PrismLang.HTML
    }

    snippetPath = path.resolve(process.cwd(), 'snippets');

    async init(pluginContext: PluginContext): Promise<void> {
      if ( pluginContext.config && 'snippetPath' in pluginContext.config) {
          this.snippetPath = path.resolve(process.cwd(), pluginContext.config.snippetPath as string);
      }
    }

    async process(context: ComponentConfig): Promise<ComponentData> {
        const file = await readFile(path.resolve(context.path));
        const comments = parse(file.toString(), { trim: false });
        let componentComment = comments.filter(
            (comment) => {
                comment.tags.find(
                    (tag) => tag.tag === 'zeplin'
                )
            }
        )[0];
        if (!componentComment && comments.length > 0) {
            componentComment = comments[0] as Comment;
        }
        let description = "";
        let snippet = "";
        let lang = PrismLang.HTML;
        if (componentComment) {
            description = componentComment.description.trim();
            const snippetNotation = componentComment.tags.filter(
                (tag) => tag.tag === 'snippet'
            )[0];
            if (snippetNotation) {
                const snippetType = snippetNotation.name.trim().toLowerCase();
                let snippetFile = '';
                if (snippetType.indexOf('<') === 0) {
                    snippet = snippetNotation.name.trim() + ' ' + snippetNotation.description;
                } else if (snippetType === 'file') {
                    snippetFile = this.getSnippetFile(snippetNotation.description.trim(), context.path);
                } else if (snippetType.match(/\.*\//)) {
                    snippetFile = this.getSnippetFile(snippetType, context.path);
                }

                if (snippetFile !== '') {
                    try {
                        const snippetFileContent = await readFile(snippetFile);
                        const snippetFileExt = path.extname(snippetNotation.description.trim());
                        snippet = snippetFileContent.toString();
                        lang = this.snippetLanguages[snippetFileExt] || (snippetFileExt.substr(1) as PrismLang);
                    } catch(e) {
                        console.warn('Can not load snippet file: ' + snippetFile);
                    }
                } else if (snippetType !== '') {
                    snippet = snippetNotation.description;
                    lang = snippetType as PrismLang;
                }
            }
        }
        return {
            description: description.replace(/([^\n])(\n)(?!\n)/, '$1 '),
            snippet: snippet.replace("\r\n", "\n").trimRight(),
            lang: lang || PrismLang.HTML
        };
    }

    supports(context: ComponentConfig): boolean {
        const fileExtension = path.extname(context.path);
        return this.supportedFileExtensions.includes(fileExtension);
    }

    private getSnippetFile(snippetFile: string, componentFile: string) {
        if (snippetFile.substr(0, 1) === '/') {
            return path.resolve(this.snippetPath, snippetFile.substr(1));
        }
        return path.resolve(path.dirname(componentFile), snippetFile);
    }
}

export default CommentConnector;
