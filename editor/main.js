﻿
module.exports = {
    load: function (context) {
        context.on('asset:open', function (ext, url) {
            if ( ['.js', '.json', '.xml', '.html', '.css'].indexOf(ext) !== -1 ) {
                context.openWindow('code-editor', {
                    query: {url: url},
                });
            }
        });
    },
    unload: function (context) {
    },
};