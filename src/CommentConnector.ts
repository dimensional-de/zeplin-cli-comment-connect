import {
    ComponentConfig, ComponentData, ConnectPlugin, PluginContext, PrismLang
} from "@zeplin/cli";
import path from "path";
import { readFile } from "fs-extra";
import parse, { Comment } from "comment-parser";

class CommentConnector implements ConnectPlugin {
    supportedFileExtensions = [".css", ".scss", ".js", ".ts"];
    snippetLanguages: { [extension: string]: PrismLang } = {}

    snippetPath = path.resolve(process.cwd(), "snippets");

    // eslint-disable-next-line require-await
    async init(pluginContext: PluginContext): Promise<void> {
        if (pluginContext.config) {
            if (typeof pluginContext.config.snippetPath === "string") {
                this.snippetPath = path.resolve(process.cwd(), pluginContext.config.snippetPath as string);
            }
            if (pluginContext.config.snippetLanguages instanceof Object) {
                this.snippetLanguages = Object.assign(this.snippetLanguages, pluginContext.config.snippetLanguages);
            }
        }
        return Promise.resolve();
    }

    async process(context: ComponentConfig): Promise<ComponentData> {
        const file = await readFile(path.resolve(context.path));
        const comments = parse(file.toString(), { trim: false });
        let [componentComment] = comments.filter(
            comment => comment.tags.find(
                tag => tag.tag === "zeplin"
            )
        );
        if (!componentComment && comments.length > 0) {
            componentComment = comments[0] as Comment;
        }
        let description = "";
        let snippet = "";
        let lang = PrismLang.HTML;
        if (componentComment) {
            description = this.reformat(componentComment.description);
            const [snippetNotation] = componentComment.tags.filter(
                tag => tag.tag === "snippet"
            );
            if (snippetNotation) {
                const snippetType = this.reformat(snippetNotation.name).toLowerCase();
                let snippetFile = "";
                if (snippetType.indexOf("<") === 0 || snippetType === "") {
                    snippet = `${snippetNotation.name.trim()} ${snippetNotation.description}`;
                } else if (snippetType === "file") {
                    snippetFile = this.getSnippetFile(snippetNotation.description.trim(), context.path);
                } else if (snippetType.match(/\.*\//)) {
                    snippetFile = this.getSnippetFile(snippetType, context.path);
                }

                if (snippetFile !== "") {
                    try {
                        const snippetFileContent = await readFile(snippetFile);
                        const snippetFileExt = path.extname(snippetFile.trim());
                        snippet = snippetFileContent.toString();
                        lang = this.snippetLanguages[snippetFileExt] || (snippetFileExt.substr(1) as PrismLang);
                    } catch (e) {
                        console.warn(`Can not load snippet file: ${snippetFile}`);
                    }
                } else if (snippetType !== "") {
                    snippet = snippetNotation.description;
                    lang = snippetType as PrismLang;
                }
            }
        }
        return {
            description: description.replace(/([^\n])(\n)(?!\n)/g, "$1 "),
            snippet: this.reformat(snippet),
            lang: lang || PrismLang.HTML
        };
    }

    supports(context: ComponentConfig): boolean {
        const fileExtension = path.extname(context.path);
        return this.supportedFileExtensions.includes(fileExtension);
    }

    private getSnippetFile(snippetFile: string, componentFile: string): string {
        if (snippetFile.substr(0, 1) === "/") {
            return path.resolve(this.snippetPath, snippetFile.substr(1));
        }
        return path.resolve(path.dirname(componentFile), snippetFile);
    }

    private reformat(value: string): string {
        return value.replace(/\r\n/g, "\n").trim();
    }
}

export default CommentConnector;
