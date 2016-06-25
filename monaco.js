/// <reference path="node_modules/monaco-editor/monaco.d.ts" />
require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
    var params = window.location.search
        .substring(1)
        .split('&')
        .map(function (param) { return param.split('='); })
        .reduce(function (o1, o2) { o1[o2[0]] = o2[1]; return o1; }, {});
    var id = params.id;
    var config = {};
    if (id) {
        var element = window.parent.document.getElementById(id);
        config.code = extractCode(element, id);
        config.language = element.getAttribute('language');
        config.theme = element.getAttribute('theme');
    }
    var editor = monaco.editor.create(document.getElementById('monaco-container'), {
        value: config.code || "",
        language: config.language || 'typescript',
        theme: config.theme || 'vs-dark'
    });
    function extractCode(element, id) {
        var code;
        var url = element.getAttribute('url');
        if (url) {
            xhr(url)
                .then(function (c) { return editor.setValue(c.responseText); }, function (e) { return editor.setValue("Error loading '" + url + "': " + JSON.stringify(e)); });
            code = "(Loading " + url + "...)";
        }
        else {
            code = element.getAttribute('code');
            if (code) {
                code = code.replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\t/g, '\t');
            }
            else {
                var codeElement = element.querySelectorAll('.monaco-code')[0];
                if (codeElement) {
                    code = codeElement.innerHTML.trim();
                }
                else {
                    console.warn('Monaco Code editor with id of ' + id +
                        ' has no code to display. Either use the "code" attribute on "#' + id +
                        '" or create a child span with class "monaco-code" to provide code for the editor.');
                }
            }
        }
        return code;
    }
    /**
     * Taken from https://github.com/Microsoft/monaco-editor/blob/5cee62a7c0d1007660d79c280963c7989590aae3/website/playground/playground.js#L311
     */
    function xhr(url) {
        var req = null;
        return new monaco.Promise(function (c, e, p) {
            req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req._canceled) {
                    return;
                }
                if (req.readyState === 4) {
                    if ((req.status >= 200 && req.status < 300) || req.status === 1223) {
                        c(req);
                    }
                    else {
                        e(req);
                    }
                    req.onreadystatechange = function () { };
                }
                else {
                    p(req);
                }
            };
            req.open("GET", url, true);
            req.responseType = "";
            req.send(null);
        }, function () {
            req._canceled = true;
            req.abort();
        });
    }
});
