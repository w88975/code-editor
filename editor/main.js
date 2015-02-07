﻿
module.exports = {
    load: function (context) {
        context.on('asset:open', function (ext, url) {
            if ( ['.js', '.json', '.xml', '.html', '.css','.styl','.htm'].indexOf(ext.toLowerCase()) !== -1 ) {
                if ( context.openedWindows.length > 0 ) {
                    var firstWindow = context.openedWindows[0];
                    firstWindow.sendToPage( 'asset:edit', url );
                    firstWindow.focus();
                }
                else {
                    context.openWindow('code-editor', {
                        query: {url: url},
                    });
                }
            }
        });
    },
    unload: function (context) {
    },
};
