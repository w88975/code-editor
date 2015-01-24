var FontManager = require('font-manager');

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

Polymer({
    publish: {
        hide: true,
        config: null,
        fonts: null,
    },

    create: function () {

    },

    ready: function () {
        this.span = document.createElement('div');
        this.span.style.width = '100%';
        this.span.style.height = '100%';
        this.span.style.position = 'absolute';
        this.span.style.opacity = 0.5;
        this.span.style.zIndex = 998;
        this.span.style.background = 'black';
        document.body.appendChild(this.span);

        this.$.keymapSelect.options = keymaps.map(function ( item ) {
            return { name: item, value: item };
        });

        this.$.themeSelect.options = themes.map(function ( item ) {
            return { name: item, value: item };
        });

        this.fonts = this.getFonts();
        this.$.fontSelect.options = this.fonts.map(function ( item ) {
            return { name: item.family, value: item.postscriptName };
        });
    },

    hideChanged: function () {
        if (this.hide) {
            this.animate([
                { marginTop: (this.config.getBoundingClientRect().height/2-100)+"px",width: "600px" },
                { marginTop: "-400px",width: "0px"},
                ], {
                    duration: 400
                });
            this.style.marginTop = "-400px";
            this.span.style.display = "none";
        }
        else {
            this.span.style.display = "block";
            this.animate([
                { marginTop: "-400px", width: "0px" },
                { marginTop: (this.config.getBoundingClientRect().height/2-100)+"px",width: "600px"},
                ], {
                    duration: 400
                });
            this.style.marginTop = (this.config.getBoundingClientRect().height/2-100)+"px";
        }
    },

    focusedAction: function (e) {
        for (var i=0; i<e.target.parentNode.children.length; i++) {
            e.target.parentNode.children[i].setAttribute("focused","");
        }
    },

    blurAction: function (e) {
        for (var i=0; i<e.target.parentNode.children.length; i++) {
            e.target.parentNode.children[i].removeAttribute("focused");
        }
    },

    DoneAction: function () {
        this.hide = true;
    },

    getFonts: function () {
        return FontManager.getAvailableFontsSync();
    },

});
