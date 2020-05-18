"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const comment_parser_1 = __importDefault(require("comment-parser"));
class CommentConnector {
    constructor() {
        this.supportedFileExtensions = [".css", ".scss", ".js", ".ts"];
        this.snippetLanguages = {};
        this.snippetPath = path_1.default.resolve(process.cwd(), "snippets");
    }
    // eslint-disable-next-line require-await
    init(pluginContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pluginContext.config) {
                if (typeof pluginContext.config.snippetPath === "string") {
                    this.snippetPath = path_1.default.resolve(process.cwd(), pluginContext.config.snippetPath);
                }
                if (pluginContext.config.snippetLanguages instanceof Object) {
                    this.snippetLanguages = Object.assign(this.snippetLanguages, pluginContext.config.snippetLanguages);
                }
            }
            return Promise.resolve();
        });
    }
    process(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield fs_extra_1.readFile(path_1.default.resolve(context.path));
            const comments = comment_parser_1.default(file.toString(), { trim: false });
            let [componentComment] = comments.filter(comment => comment.tags.find(tag => tag.tag === "zeplin"));
            if (!componentComment && comments.length > 0) {
                componentComment = comments[0];
            }
            let description = "";
            let snippet = "";
            let lang = "html" /* HTML */;
            if (componentComment) {
                description = this.reformat(componentComment.description);
                const [snippetNotation] = componentComment.tags.filter(tag => tag.tag === "snippet");
                if (snippetNotation) {
                    const snippetType = this.reformat(snippetNotation.name).toLowerCase();
                    let snippetFile = "";
                    if (snippetType.indexOf("<") === 0 || snippetType === "") {
                        snippet = `${snippetNotation.name.trim()} ${snippetNotation.description}`;
                    }
                    else if (snippetType === "file") {
                        snippetFile = this.getSnippetFile(snippetNotation.description.trim(), context.path);
                    }
                    else if (snippetType.match(/\.*\//)) {
                        snippetFile = this.getSnippetFile(snippetType, context.path);
                    }
                    if (snippetFile !== "") {
                        try {
                            const snippetFileContent = yield fs_extra_1.readFile(snippetFile);
                            const snippetFileExt = path_1.default.extname(snippetFile.trim());
                            snippet = snippetFileContent.toString();
                            lang = this.snippetLanguages[snippetFileExt] || snippetFileExt.substr(1);
                        }
                        catch (e) {
                            console.warn(`Can not load snippet file: ${snippetFile}`);
                        }
                    }
                    else if (snippetType !== "") {
                        snippet = snippetNotation.description;
                        lang = snippetType;
                    }
                }
            }
            return {
                description: description.replace(/([^\n])(\n)(?!\n)/g, "$1 "),
                snippet: this.reformat(snippet),
                lang: lang || "html" /* HTML */
            };
        });
    }
    supports(context) {
        const fileExtension = path_1.default.extname(context.path);
        return this.supportedFileExtensions.includes(fileExtension);
    }
    getSnippetFile(snippetFile, componentFile) {
        if (snippetFile.substr(0, 1) === "/") {
            return path_1.default.resolve(this.snippetPath, snippetFile.substr(1));
        }
        return path_1.default.resolve(path_1.default.dirname(componentFile), snippetFile);
    }
    reformat(value) {
        return value.replace(/\r\n/g, "\n").trim();
    }
}
exports.default = CommentConnector;
//# sourceMappingURL=CommentConnector.js.map