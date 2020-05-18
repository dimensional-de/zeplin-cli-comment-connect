import { ComponentConfig, ComponentData, ConnectPlugin, PluginContext, PrismLang } from "@zeplin/cli";
declare class CommentConnector implements ConnectPlugin {
    supportedFileExtensions: string[];
    snippetLanguages: {
        [extension: string]: PrismLang;
    };
    snippetPath: string;
    init(pluginContext: PluginContext): Promise<void>;
    process(context: ComponentConfig): Promise<ComponentData>;
    supports(context: ComponentConfig): boolean;
    private getSnippetFile;
}
export default CommentConnector;
