var Fs = require("fire-fs");
var Path = require('fire-path');

Polymer({
    value: "",
    mode: 'htmlmixed',
    theme: 'zenburn',
    tabSize: 4,
    indentUnit: 4,
    keyMap: 'sublime',
    lineNumbers: true,
    jshintError: "",
    lineCount: 0,
    fontSize: 12,
    fontFamily: "DejaVu Sans Mono",
    autoComplete: true,
    setting: null,

    fspath: "",
    uuid: "",
    initialLoad: false,
    dirty: false,

    timeLock: false,
    allowShowHint: false,

    created: function () {
        this.cursor = {
            "line" : 0,
            "ch" : 0
        };
    },

    refresh: function() {
        if ( !this.codeMirror )
            return;

        this.codeMirror.refresh();
    },

    createEditor: function () {
        CodeMirror.commands.save = function () {
            this.save();
        }.bind(this);

        CodeMirror.commands.autoformat = function () {
            this.autoFormat();
        }.bind(this);

        CodeMirror.commands.increaseFontSize = function () {
            this.fontSize = Math.min( this.fontSize+1, 30 );
        }.bind(this);

        CodeMirror.commands.decreaseFontSize = function () {
            this.fontSize = Math.max( this.fontSize-1, 8 );
        }.bind(this);

        CodeMirror.commands.resetFontSize = function () {
            this.fontSize = 12;
        }.bind(this);

        var mac = CodeMirror.keyMap.default == CodeMirror.keyMap.macDefault;

        var autoformat = (mac ? "Cmd" : "Ctrl") + "-O";
        var search = (mac ? "Cmd" : "Ctrl") + "-F";
        var increaseFontSize = (mac ? "Cmd" : "Ctrl") + "-=";
        var decreaseFontSize = (mac ? "Cmd" : "Ctrl") + "--";
        var resetFontSize = (mac ? "Cmd" : "Ctrl") + "-0";
        var extraKeys = {};

        extraKeys[autoformat] = "autoformat";
        extraKeys[increaseFontSize] = "increaseFontSize";
        extraKeys[decreaseFontSize] = "decreaseFontSize";
        extraKeys[resetFontSize] = "resetFontSize";

        this.options = {
            value: this.value,
            mode: this.mode,
            theme: this.theme,
            scroll: false,
            tabSize: this.tabSize,
            lineNumbers: this.lineNumbers,
            autofocus: true,
            foldGutter: true,
            autoCloseTags: true,
            matchBrackets: true,
            styleActiveLine: true,
            autoCloseBrackets: true,
            showCursorWhenSelecting: true,
            keyMap: this.keyMap,
            extraKeys: extraKeys,
            indentUnit: this.indentUnit,
            completeSingle: false,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers","CodeMirror-foldgutter","breakpoints"],
        };

        // codeMirror initialize
        this.codeMirror = CodeMirror(this.shadowRoot,this.options);

        var codeMirrorStyle = this.shadowRoot.querySelectorAll('.CodeMirror')[0].style;
        codeMirrorStyle.fontFamily = this.fontFamily;
        codeMirrorStyle.fontSize = this.fontSize + "px";

        this.codeMirror.on('change',function () {
            if ( this.initialLoad ) {
                this.codeMirror.getDoc().clearHistory();
                this.initialLoad = false;
            }
            else {
                this.dirty = true;
            }
            this.lineCount = this.codeMirror.lineCount();

            if (this.mode === "javascript") {
                if (this.timeLock === false) {
                    this.timeLock = true;
                    var hintTime = setTimeout( function () {
                        this.updateHints();
                    }.bind(this), 500 );
                }
            }

            if (this.allowShowHint === true && this.autoComplete === true){
                var showHint = setTimeout( function () {
                    this.codeMirror.showHint();
                    this.allowShowHint = false;
                }.bind(this), 300 );
            }
        }.bind(this));

        this.codeMirror.on('keydown',function (target,event) {
            // NOTE: 屏蔽组合键触发showhint
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
                return;
            }

            if (event.keyCode >=65 && event.keyCode<=90 ||event.keyCode === 190){
                this.allowShowHint = true;
            }
        }.bind(this));

        this.codeMirror.on('cursorActivity',function () {
            this.cursor = this.codeMirror.getCursor();
        }.bind(this));

        this.lineCount = this.codeMirror.lineCount();
        this.detectTextMode();
    },

    detectTextMode: function () {
        switch (Path.extname(this.fspath).toLowerCase()) {
            case ".js" :
                this.mode = "javascript";
                break;
            case ".html" :
                this.mode = "htmlmixed";
                break;
            case ".htm" :
                this.mode = "htmlmixed";
                break;
            case ".css" :
                this.mode = "css";
                break;
            case ".styl" :
                this.mode = "css";
                break;
            case ".json" :
                this.mode = "css";
                break;
            case ".xml" :
                this.mode = "xml";
                break;
            case ".xaml" :
                this.mode = "xml";
                break;
            default:
                this.mode = "";
                break;
        }

        if (this.mode === "javascript") {
            this.updateHints();
        }
    },

    valueChanged: function() {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setValue(this.value);
    },

    fontFamilyChanged: function () {
        if ( !this.codeMirror )
            return;

        this.shadowRoot.querySelectorAll('.CodeMirror')[0].style.fontFamily = this.fontFamily;
    },

    keyMapChanged: function () {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setOption('keyMap', this.keyMap);
    },

    modeChanged: function() {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setOption('mode', this.mode);
    },

    fontSizeChanged: function () {
        if ( !this.codeMirror )
            return;

        this.shadowRoot.querySelectorAll('.CodeMirror')[0].style.fontSize = this.fontSize + "px";
    },

    themeChanged: function() {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setOption('theme', this.theme);
    },

    indentUnitChanged: function () {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setOption("indentUnit",this.indentUnit);
    },

    tabSizeChanged: function() {
        this.indentUnit = this.tabSize;

        if ( !this.codeMirror )
            return;

        this.codeMirror.setOption('tabSize', this.tabSize);
    },

    lineNumbersChanged: function() {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setOption('lineNumbers', this.lineNumbers);
    },

    dirtyChanged: function () {
        this.fire('dirty-changed');
    },

    reloadAction: function () {
        if ( !this.codeMirror )
            return;

        this.codeMirror.setValue(this.value);
    },

    lineComment: function () {
        if ( !this.codeMirror )
            return;

        var range = { from: this.codeMirror.getCursor(true), to: this.codeMirror.getCursor(false) };
        this.codeMirror.lineComment(range.from, range.to);
    },

    autoFormat: function () {
        if ( !this.codeMirror )
            return;

        switch (this.mode) {
            case "javascript":
                this.codeMirror.setValue(js_beautify(this.codeMirror.getValue(),this.tabSize,''));
                break;

            case "css":
                var options = {
                    indent: '    ',
                };
                this.codeMirror.setValue(cssbeautify(this.codeMirror.getValue(),options));
                break;

            case "htmlmixed":
                this.codeMirror.setValue(style_html(this.codeMirror.getValue(),this.tabSize,' ',80));
                break;
        }
    },

    save: function () {
        if ( !this.codeMirror )
            return;

        Fs.writeFile(this.fspath, this.codeMirror.getValue(), 'utf8', function ( err ) {
            if ( err ) {
                Fire.error( err.message );
                return;
            }

            this.dirty = false;

            //
            Fire.sendToPanel( 'code-editor', 'default', 'asset:changed', {
                uuid: this.uuid
            });
            Fire.sendToAll('asset-db:synced');
        }.bind(this));
    },

    updateHints: function() {
        if ( !this.codeMirror )
            return;

        this.codeMirror.operation(function(){
            JSHINT(this.codeMirror.getValue());
            if (JSHINT.errors.length > 0) {
                var errorMsg = "Jshint: [ line " +
                               JSHINT.errors[0].line +
                               " column " + JSHINT.errors[0].character +
                               " " +  JSHINT.errors[0].reason + " ]"
                               ;
                this.jshintError = errorMsg;
                this.jshint = JSHINT;
            }
            else {
                this.jshintError = "";
            }
            this.timeLock = false;
        }.bind(this));
    },
});
