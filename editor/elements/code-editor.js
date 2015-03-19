var Fs = require("fire-fs");
var Path = require('fire-path');
var Remote = require("remote");

var keymaps = [
    "sublime",
    "vim",
    "emacs",
];

var themes = [
    "3024-day"                ,
    "3024-night"              ,
    "ambiance"                ,
    "ambiance-mobile"         ,
    "base16-dark"             ,
    "base16-light"            ,
    "blackboard"              ,
    "cobalt"                  ,
    "eclipse"                 ,
    "elegant"                 ,
    "erlang-dark"             ,
    "lesser-dark"             ,
    "mbo"                     ,
    "mdn-like"                ,
    "midnight"                ,
    "monokai"                 ,
    "neat"                    ,
    "neo"                     ,
    "night"                   ,
    "paraiso-dark"            ,
    "pastel-on-dark"          ,
    "rubyblue"                ,
    "solarized dark"          ,
    "solarized light"         ,
    "the-matrix"              ,
    "tomorrow-night-bright"   ,
    "tomorrow-night-righties" ,
    "twilight"                ,
    "vibrant-ink"             ,
    "xq-dark"                 ,
    "xq-light"                ,
    "zenburn"                 ,
];

var modes = [
    "javascript",
    "htmlmixed",
    "css",
    "xml",
];

Polymer({

    created: function () {
        this.settingsPage = null;
    },

    attached: function () {
        // TODO:

        // this.ipc.on('asset:changed', function ( detail ) {
        //     var uuid = detail.uuid;

        //     // HACK
        //     if ( name === 'code-editor' )
        //         return;

        //     if ( this.uuid === uuid ) {
        //         var result = window.confirm(this.url + " was modified, do you want to reload?");
        //         if (result) {
        //             this.load(this.uuid);
        //         }
        //     }
        // }.bind(this) );

        // this.ipc.on('asset:edit', function ( uuid ) {
        //     if (this.$.mirror.dirty) {
        //         var result = window.confirm(this.url + " was modified,do you want to save?");
        //         if (result) {
        //             this.$.mirror.save();
        //         }
        //     }

        //     this.load(uuid);
        // }.bind(this) );
    },

    ready: function () {
        this.$.keymapSelect.options = keymaps.map(function ( item ) {
            return { name: item, value: item };
        });

        this.$.themeSelect.options = themes.map(function ( item ) {
            return { name: item, value: item };
        });

        this.$.modeSelect.options = modes.map(function ( item ) {
            return { name: item, value: item };
        });

        window.addEventListener('resize', function() {
            this.updateSize();
        }.bind(this));

        window.onbeforeunload = function ( event ) {
            this.saveConfig();

            if ( this.$.mirror.dirty ) {
                var res = this.confirmSave();
                switch ( res ) {
                // save
                case 0:
                    this.$.mirror.save();
                    return true;

                // cancel
                case 1:
                    return false;

                // don't save
                case 2:
                    return true;
                }
            }
        }.bind(this);

        var projectPath = Remote.getGlobal('FIRE_PROJECT_PATH');
        this.settingPath = Path.join( projectPath, 'settings' ) + "/code-editor-settings.json";
        this.updateSize();
    },

    domReady: function () {
        // load config and then load the file
        this.showLoading(true);
        this.loadConfig(function ( err, settings ) {
            if (err) {
                Fire.error(err.message);
                return;
            }

            if ( settings ) {
                Fire.JS.mixin(this.$.mirror,settings);
            }

            this.$.mirror.createEditor();

            // start loading file
            var uuid = this.argv.uuid;
            this.load(uuid);
        }.bind(this));
    },

    ipcOpen: function ( event ) {
        var uuid = event.detail.uuid;

        if (this.$.mirror.dirty) {
            var res = this.confirmSave();
            switch ( res ) {
            // save
            case 0:
                this.$.mirror.save();
                break;

            // cancel
            case 1:
                return;

            // don't save
            case 2:
                break;
            }
        }

        this.load(uuid);
    },

    _loaderTimout: null,
    showLoader: false,
    showLoading: function ( show ) {
        if ( show ) {
            this.showLoader = show;
        }
        else {
            if ( this.showLoader !== show ) {
                if ( this._loaderTimout ) {
                    clearTimeout(this._loaderTimout);
                    this._loaderTimout = null;
                }
                this._loaderTimout = setTimeout( function () {
                    this.showLoader = false;
                }.bind(this), 500);
            }
        }
    },

    load: function ( uuid ) {
        this.uuid = uuid;
        this.url = Fire.AssetDB.uuidToUrl(uuid);

        this.updateTitle();

        var fspath = Fire.AssetDB._fspath(this.url);
        this.$.mirror.fspath = fspath;
        this.$.mirror.uuid = uuid;
        this.$.mirror.detectTextMode();

        this.showLoading(true);
        Fs.readFile(fspath, 'utf8', function ( err, data ) {
            this.$.mirror.dirty = false;
            this.$.mirror.initialLoad = true;
            this.$.mirror.value = data;
            this.$.mirror.setting = this.settingsPage;

            this.showLoading(false);
        }.bind(this));

    },

    saveConfig: function () {
        var settings = {
            theme: this.$.mirror.theme,
            tabSize: this.$.mirror.tabSize,
            keyMap: this.$.mirror.keyMap,
            fontSize: this.$.mirror.fontSize,
            fontFamily: this.$.mirror.fontFamily,
            autoComplete: this.$.mirror.autoComplete,
        };

        var settingsJson = JSON.stringify(settings, null, 2);
        Fs.writeFile(this.settingPath, settingsJson, 'utf8', function ( err ) {
            if ( err ) {
                Fire.error( err.message );
                return;
            }
        }.bind(this));
    },

    loadConfig: function (cb) {
        var exists = Fs.existsSync(this.settingPath);
        if (!exists) {
            if (cb) cb();
            return;
        }

        Fs.readFile(this.settingPath, 'utf8', function ( err, data ) {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                if (cb) cb(e);
            }

            if (cb) cb( null, data );
        });

    },

    confirmSave: function () {
        var dialog = Remote.require('dialog');
        return dialog.showMessageBox( Remote.getCurrentWindow(), {
            type: "warning",
            buttons: ["Save","Cancel","Don't Save"],
            title: "Save Confirm",
            message: Fire.AssetDB.uuidToUrl(this.uuid) + " has changed, do you want to save it?",
            detail: "Your changes will be lost if you close this item without saving."
        } );
    },

    updateTitle: function () {
        var title = document.title;
        if (title !== this.url + (this.$.mirror.dirty ? "*" : "")) {
            document.title = this.url + (this.$.mirror.dirty ? "*" : "");
        }
    },

    updateSize: function () {
        window.requestAnimationFrame ( function () {
            this.$.codeArea.style.height = this.getBoundingClientRect().height-51 + "px";
            this.$.mirror.refresh();
        }.bind(this) );
    },

    saveAction: function () {
        this.$.mirror.save();
    },

    reloadAction: function () {
        this.loadFile();
        this.$.mirror.reloadAction();
    },

    settingsAction: function () {
        if (this.settingsPage === null){
            this.settingsPage = new SettingsPage();
            this.settingsPage.config = this.$.mirror;
            document.body.appendChild(this.settingsPage);
        }

        if (this.settingsPage.hide){
            this.settingsPage.hide = false;
        }
        else {
            this.settingsPage.hide = true;
        }
    },

    autoFormatAction: function () {
        this.$.mirror.autoFormat();
    },

});
