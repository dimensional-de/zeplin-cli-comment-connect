import Plugin from "../src/CommentConnector";
import mockConsole from "jest-mock-console";

describe("Connected Components Comment Plugin", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test("reads description", async () => {
        const plugin = new Plugin();

        const componentCode = await plugin.process(
            {
                path: "test/samples/_component.scss",
                zeplinNames: []
            }
        );

        expect(componentCode.description).toEqual(
            "A basic description"
        );
    });

    test("formats multi line description", async () => {
        const plugin = new Plugin();

        const componentCode = await plugin.process(
            {
                path: "test/samples/_componentWithMultiLineDescription.scss",
                zeplinNames: []
            }
        );

        expect(componentCode.description).toEqual(
            "A basic description with a line break\n\nAnd a second paragraph"
        );
    });

    test("reads snippet with implicit language (html)", async () => {
        const plugin = new Plugin();

        const componentCode = await plugin.process(
            {
                path: "test/samples/_componentWithSnippet.scss",
                zeplinNames: []
            }
        );

        expect(componentCode.snippet).toEqual(
            "<div class=\"example\">\n" +
            "  <span>success</span>\n" +
            "</div>"
        );
        expect(componentCode.lang).toEqual("html");
    });

    test("reads snippet with explicit language (xml)", async () => {
        const plugin = new Plugin();

        const componentCode = await plugin.process(
            {
                path: "test/samples/_componentWithXHTMLSnippet.scss",
                zeplinNames: []
            }
        );

        expect(componentCode.snippet).toEqual(
            "<div class=\"example\">\n" +
            "  <span>success</span>\n" +
            "</div>"
        );
        expect(componentCode.lang).toEqual("xml");
    });

    test("reads snippet file", async () => {
        const plugin = new Plugin();

        const componentCode = await plugin.process(
            {
                path: "test/samples/_componentWithSnippetFile.scss",
                zeplinNames: []
            }
        );

        expect(componentCode.snippet).toEqual(
            "<div class=\"example\">\n" +
            "  <span>success</span>\n" +
            "</div>"
        );
        expect(componentCode.lang).toEqual("html");
    });

    test("ignores invalid snippet file", async () => {
        const plugin = new Plugin();

        const restoreConsole = mockConsole();
        const componentCode = await plugin.process(
            {
                path: "test/samples/_componentWithInvalidSnippetFile.scss",
                zeplinNames: []
            }
        );

        expect(console.warn).toHaveBeenCalledWith(
            `Can not load snippet file: ${__dirname}\\_non-existing.html`
        );
        expect(componentCode.snippet).toEqual("");
        expect(componentCode.lang).toEqual("html");
        restoreConsole();
    });
});
